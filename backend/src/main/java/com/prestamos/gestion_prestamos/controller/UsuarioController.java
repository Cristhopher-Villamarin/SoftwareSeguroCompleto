package com.prestamos.gestion_prestamos.controller;


import com.prestamos.gestion_prestamos.model.Usuario;
import com.prestamos.gestion_prestamos.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    /**
     * Endpoint para registrar un nuevo usuario.
     */
    @PostMapping("/registro")
    public ResponseEntity<Usuario> registrar(@RequestBody Usuario usuario) {
        Usuario nuevoUsuario = usuarioService.registrarUsuario(usuario);
        return ResponseEntity.ok(nuevoUsuario);
    }

    @PreAuthorize("hasRole('USUARIO') or hasRole('ADMIN')")
    @PutMapping("/{correo}/actualizar-finanzas")
    public ResponseEntity<?> actualizarDatosFinancieros(
            @PathVariable String correo,
            @RequestBody Map<String, Object> request) {

        // Validar que el JSON tenga los campos necesarios
        if (!request.containsKey("ingresos") || !request.containsKey("historialCred")) {
            return ResponseEntity.badRequest().body("Faltan datos en el cuerpo de la petición.");
        }

        Double ingresos = ((Number) request.get("ingresos")).doubleValue(); // Convertir a Double
        Integer historialCred = ((Number) request.get("historialCred")).intValue(); // Convertir a Integer

        Usuario usuarioActualizado = usuarioService.actualizarDatosFinancieros(correo, ingresos, historialCred);
        return ResponseEntity.ok(usuarioActualizado);
    }

    /**
     * Endpoint para registrar un usuario ADMIN (solo permitido para Admins).
     */
    @PostMapping("/registro-admin")
    public ResponseEntity<?> registrarAdmin(@RequestBody Usuario usuario) {
        try {
            Usuario nuevoAdmin = usuarioService.registrarAdmin(usuario);
            return ResponseEntity.ok(nuevoAdmin);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Endpoint para obtener información de un usuario por su correo.
     */
    @PreAuthorize("hasRole('USUARIO') or hasRole('ADMIN')")
    @GetMapping("/{correo}")
    public ResponseEntity<Usuario> obtenerPorCorreo(@PathVariable String correo) {
        Optional<Usuario> usuario = usuarioService.obtenerUsuarioPorCorreo(correo);
        return usuario.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Endpoint para registrar un intento fallido de inicio de sesión.
     */
    @PostMapping("/login-fallido")
    public ResponseEntity<String> registrarIntentoFallido(@RequestParam String correo) {
        try {
            usuarioService.incrementarIntentosFallidos(correo);
            return ResponseEntity.ok("Intento fallido registrado.");
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    /**
     * Endpoint para desbloquear una cuenta de usuario.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/desbloquear")
    public ResponseEntity<String> desbloquearCuenta(@RequestBody Map<String, String> request) {
        String correo = request.get("correo");

        if (correo == null || correo.isEmpty()) {
            return ResponseEntity.badRequest().body("El campo 'correo' es obligatorio.");
        }

        try {
            usuarioService.desbloquearCuenta(correo);
            return ResponseEntity.ok("Cuenta desbloqueada exitosamente.");
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    /**
     * Endpoint para autenticar un usuario (puede integrarse con JWT).
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> autenticar(@RequestBody Map<String, String> request) {
        String correo = request.get("correo");
        String contrasena = request.get("contrasena");

        if (correo == null || contrasena == null || correo.isEmpty() || contrasena.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Correo y contraseña son obligatorios."));
        }

        try {
            String token = usuarioService.autenticarUsuario(correo, contrasena);
            Usuario usuario = usuarioService.obtenerUsuarioPorCorreo(correo).orElseThrow();

            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "rol", usuario.getRol().name() //Asegurar que se devuelva el ROL correctamente
            ));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

}
