package com.prestamos.gestion_prestamos.service;

import com.prestamos.gestion_prestamos.model.Rol;
import com.prestamos.gestion_prestamos.model.Usuario;
import com.prestamos.gestion_prestamos.repository.UsuarioRepository;
import com.prestamos.gestion_prestamos.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private JavaMailSender mailSender;

    @Autowired
    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil, JavaMailSender mailSender) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.mailSender = mailSender;
    }

    public Usuario registrarUsuario(Usuario usuario) {
        usuario.setContrasenaHash(passwordEncoder.encode(usuario.getContrasenaHash()));
        usuario.setIntentosFallidos(0);
        usuario.setCuentaBloqueada(false);
        usuario.setRol(Rol.USUARIO);
        usuario.setIngresos(null);
        usuario.setHistorialCred(null);
        usuario.setFechaDesbloqueo(null);

        return usuarioRepository.save(usuario);
    }

    public void solicitarRecuperacion(String correo) {
        Optional<Usuario> usuarioOptional = usuarioRepository.findByCorreo(correo);

        if (usuarioOptional.isPresent()) {
            Usuario usuario = usuarioOptional.get();

            String token = UUID.randomUUID().toString();
            usuario.setTokenRecuperacion(token);
            usuario.setExpiracionTokenRecuperacion(LocalDateTime.now().plusHours(2));
            usuarioRepository.save(usuario);

            enviarCorreoRecuperacion(usuario.getCorreo(), token);
        }

        // Siempre termina sin excepción por seguridad.
    }



    private void enviarCorreoRecuperacion(String correo, String token) {
        SimpleMailMessage mensaje = new SimpleMailMessage();
        mensaje.setFrom("cristhophervillamarin7@gmail.com");
        mensaje.setTo(correo);
        mensaje.setSubject("Recuperación de contraseña");

        String enlace = "http://localhost:3000/auth/restablecer";
        mensaje.setText("Hola, para restablecer tu contraseña, copia el siguiente código de seguridad: " + token+" y haz clic en el siguiente enlace: " + enlace);


        mailSender.send(mensaje);
    }

    public void restablecerContrasena(String token, String nuevaContrasena) {
        Usuario usuario = usuarioRepository.findByTokenRecuperacion(token)
                .orElseThrow(() -> new RuntimeException("El token es inválido o ya ha expirado."));

        if (usuario.getExpiracionTokenRecuperacion().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("El token ha expirado. Solicita uno nuevo.");
        }

        usuario.setContrasenaHash(passwordEncoder.encode(nuevaContrasena));
        usuario.setTokenRecuperacion(null);
        usuario.setExpiracionTokenRecuperacion(null);
        usuarioRepository.save(usuario);
    }

    public Usuario registrarAdmin(Usuario usuario) {
        if (usuarioRepository.findByCorreo(usuario.getCorreo()).isPresent()) {
            throw new RuntimeException("El correo ya está registrado.");
        }

        usuario.setContrasenaHash(passwordEncoder.encode(usuario.getContrasenaHash()));
        usuario.setIntentosFallidos(0);
        usuario.setCuentaBloqueada(false);
        usuario.setRol(Rol.ADMIN);
        usuario.setIngresos(null);
        usuario.setHistorialCred(null);
        usuario.setFechaDesbloqueo(null);

        return usuarioRepository.save(usuario);
    }

    public Optional<Usuario> obtenerUsuarioPorCorreo(String correo) {
        return usuarioRepository.findByCorreo(correo);
    }

    public void incrementarIntentosFallidos(String correo) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con correo: " + correo));

        if (!usuario.getCuentaBloqueada()) {
            usuario.setIntentosFallidos(usuario.getIntentosFallidos() + 1);

            if (usuario.getIntentosFallidos() >= 3) {
                usuario.setCuentaBloqueada(true);
                usuario.setFechaDesbloqueo(LocalDateTime.now().plusMinutes(5)); // Bloqueo por 5 minutos
                usuarioRepository.save(usuario); // Guardamos antes de lanzar la excepción
                throw new RuntimeException("Cuenta bloqueada por múltiples intentos fallidos. Intente de nuevo en 5 minutos.");
            }

            usuarioRepository.save(usuario);
        }
    }

    public Usuario actualizarDatosFinancieros(String correo, Double ingresos, Integer historialCred) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con correo: " + correo));

        usuario.setIngresos(ingresos);
        usuario.setHistorialCred(historialCred);

        return usuarioRepository.save(usuario);
    }

    public void desbloquearCuenta(String correo) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con correo: " + correo));

        usuario.setIntentosFallidos(0);
        usuario.setCuentaBloqueada(false);
        usuario.setFechaDesbloqueo(null);
        usuarioRepository.save(usuario);
    }

    public String autenticarUsuario(String correo, String contrasena) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con correo: " + correo));

        // Verificar si la cuenta está bloqueada y si el tiempo de desbloqueo ha pasado
        if (usuario.getCuentaBloqueada()) {
            if (usuario.getFechaDesbloqueo() != null && usuario.getFechaDesbloqueo().isBefore(LocalDateTime.now())) {
                // Desbloquear automáticamente si ha pasado el tiempo
                usuario.setCuentaBloqueada(false);
                usuario.setIntentosFallidos(0);
                usuario.setFechaDesbloqueo(null);
                usuarioRepository.save(usuario);
            } else {
                throw new RuntimeException("Cuenta bloqueada. Intente nuevamente después de " + usuario.getFechaDesbloqueo());
            }
        }

        if (!passwordEncoder.matches(contrasena, usuario.getContrasenaHash())) {
            incrementarIntentosFallidos(correo);
            throw new RuntimeException("Credenciales incorrectas.");
        }

        // Restablecer intentos fallidos si la autenticación es correcta
        usuario.setIntentosFallidos(0);
        usuarioRepository.save(usuario);

        return jwtUtil.generarToken(
                usuario.getIdUsuario(),
                usuario.getCorreo(),
                usuario.getNombre(),
                usuario.getApellido(),
                usuario.getRol().name(),
                usuario.getCedula()
        );
    }

    public void eliminarUsuario(String correo) {
        Optional<Usuario> usuario = usuarioRepository.findByCorreo(correo);
        if (usuario.isEmpty()) {
            throw new RuntimeException("Usuario no encontrado.");
        }
        usuarioRepository.delete(usuario.get());
    }
}
