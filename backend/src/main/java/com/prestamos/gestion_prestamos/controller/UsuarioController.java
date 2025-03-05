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

        if (!request.containsKey("ingresos") || !request.containsKey("historialCred")) {
            return ResponseEntity.badRequest().body("Faltan datos en el cuerpo de la petición.");
        }

        Double ingresos = ((Number) request.get("ingresos")).doubleValue();
        Integer historialCred = ((Number) request.get("historialCred")).intValue();

        Usuario usuarioActualizado = usuarioService.actualizarDatosFinancieros(correo, ingresos, historialCred);
        return ResponseEntity.ok(usuarioActualizado);
    }

    @PostMapping("/registro-admin")
    public ResponseEntity<?> registrarAdmin(@RequestBody Usuario usuario) {
        try {
            Usuario nuevoAdmin = usuarioService.registrarAdmin(usuario);
            return ResponseEntity.ok(nuevoAdmin);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PreAuthorize("hasRole('USUARIO') or hasRole('ADMIN')")
    @GetMapping("/{correo}")
    public ResponseEntity<Usuario> obtenerPorCorreo(@PathVariable String correo) {
        Optional<Usuario> usuario = usuarioService.obtenerUsuarioPorCorreo(correo);
        return usuario.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/login-fallido")
    public ResponseEntity<String> registrarIntentoFallido(@RequestParam String correo) {
        try {
            usuarioService.incrementarIntentosFallidos(correo);
            return ResponseEntity.ok("Intento fallido registrado.");
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/desbloquear")
    public ResponseEntity<String> desbloquearCuenta(@RequestBody Map<String, String> request) {
        String correo = request.get("correo");

        if (correo == null || correo.isEmpty()) {
            return ResponseEntity.badRequest().body("El campo 'correo' es obligatorio.");
        }

        try {
            Usuario usuario = usuarioService.obtenerUsuarioPorCorreo(correo)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado."));

            usuarioService.desbloquearCuenta(correo);
            return ResponseEntity.ok("Cuenta desbloqueada exitosamente.");
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> autenticar(@RequestBody Map<String, String> request) {
        String correo = request.get("correo");
        String contrasena = request.get("contrasena");

        if (correo == null || contrasena == null || correo.isEmpty() || contrasena.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Correo y contraseña son obligatorios."));
        }

        try {
            String token = usuarioService.autenticarUsuario(correo, contrasena);
            return ResponseEntity.ok(Map.of("token", token));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{correo}")
    public ResponseEntity<String> eliminarUsuario(@PathVariable String correo) {
        try {
            usuarioService.eliminarUsuario(correo);
            return ResponseEntity.ok("Usuario eliminado exitosamente.");
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }
}
