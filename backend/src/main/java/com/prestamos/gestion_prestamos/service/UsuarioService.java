package com.prestamos.gestion_prestamos.service;

import com.prestamos.gestion_prestamos.model.Rol;
import com.prestamos.gestion_prestamos.model.Usuario;
import com.prestamos.gestion_prestamos.repository.UsuarioRepository;
import com.prestamos.gestion_prestamos.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil; //  Inyectamos la utilidad de JWT

    @Autowired
    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Registrar un nuevo usuario con contraseña cifrada.
     */
    public Usuario registrarUsuario(Usuario usuario) {
        usuario.setContrasenaHash(passwordEncoder.encode(usuario.getContrasenaHash())); // Cifrar contraseña
        usuario.setIntentosFallidos(0);
        usuario.setCuentaBloqueada(false);
        usuario.setRol(Rol.USUARIO); //  Asignar siempre el rol USUARIO
        usuario.setIngresos(null); //  Dejar estos valores en null para pedirlos después
        usuario.setHistorialCred(null);

        return usuarioRepository.save(usuario);
    }

    /**
     * Registrar un nuevo administrador (solo permitido para usuarios con rol ADMIN).
     */
    public Usuario registrarAdmin(Usuario usuario) {
        if (usuarioRepository.findByCorreo(usuario.getCorreo()).isPresent()) {
            throw new RuntimeException("El correo ya está registrado.");
        }

        usuario.setContrasenaHash(passwordEncoder.encode(usuario.getContrasenaHash()));
        usuario.setIntentosFallidos(0);
        usuario.setCuentaBloqueada(false);
        usuario.setRol(Rol.ADMIN); // 🔥 Asignar rol ADMIN
        usuario.setIngresos(null);
        usuario.setHistorialCred(null);

        return usuarioRepository.save(usuario);
    }

    /**
     * Obtener un usuario por su correo electrónico.
     */
    public Optional<Usuario> obtenerUsuarioPorCorreo(String correo) {
        return usuarioRepository.findByCorreo(correo);
    }

    /**
     * Incrementar intentos fallidos de inicio de sesión y bloquear la cuenta si es necesario.
     */
    public void incrementarIntentosFallidos(String correo) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con correo: " + correo));

        if (!usuario.getCuentaBloqueada()) {
            usuario.setIntentosFallidos(usuario.getIntentosFallidos() + 1);

            if (usuario.getIntentosFallidos() >= 3) {
                usuario.setCuentaBloqueada(true);
                throw new RuntimeException("Cuenta bloqueada por múltiples intentos fallidos.");
            }

            usuarioRepository.save(usuario);
        }
    }

    /**
     * Desbloquear una cuenta de usuario restableciendo los intentos fallidos.
     */
    public void desbloquearCuenta(String correo) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con correo: " + correo));

        usuario.setIntentosFallidos(0);
        usuario.setCuentaBloqueada(false);
        usuarioRepository.save(usuario);
    }

    /**
     * Autenticar un usuario y generar un token JWT.
     */
    public String autenticarUsuario(String correo, String contrasena) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con correo: " + correo));

        if (usuario.getCuentaBloqueada()) {
            throw new RuntimeException("Cuenta bloqueada. Contacte al administrador.");
        }

        if (!passwordEncoder.matches(contrasena, usuario.getContrasenaHash())) {
            incrementarIntentosFallidos(correo);
            throw new RuntimeException("Credenciales incorrectas.");
        }

        // Reiniciar intentos fallidos después de un inicio de sesión exitoso
        usuario.setIntentosFallidos(0);
        usuarioRepository.save(usuario);

        // 🔥 Generar y devolver token JWT
        return jwtUtil.generarToken(usuario.getCorreo());
    }
}
