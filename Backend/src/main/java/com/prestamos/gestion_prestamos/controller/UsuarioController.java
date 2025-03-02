package com.prestamos.gestion_prestamos.controller;


import com.prestamos.gestion_prestamos.model.Usuario;
import com.prestamos.gestion_prestamos.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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

    /**
     * Endpoint para obtener información de un usuario por su correo.
     */
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

            // Retorna el token dentro de un JSON válido
            return ResponseEntity.ok(Map.of("token", token));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

}
