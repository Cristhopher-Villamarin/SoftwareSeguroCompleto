package com.prestamos.gestion_prestamos.controller;

import com.prestamos.gestion_prestamos.model.Prestamo;
import com.prestamos.gestion_prestamos.service.PrestamoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/prestamos")
public class PrestamoController {

    @Autowired
    private PrestamoService prestamoService;

    /**
     * Crear un nuevo préstamo (solo usuarios).
     */
    @PreAuthorize("hasRole('USUARIO')")
    @PostMapping
    public ResponseEntity<?> crearPrestamo(@RequestBody Prestamo prestamo) {
        try {
            Prestamo nuevoPrestamo = prestamoService.crearPrestamo(prestamo);
            return ResponseEntity.ok(nuevoPrestamo);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Error inesperado en el servidor."));
        }
    }

    /**
     * Obtener todos los préstamos de un usuario por su cédula (solo admins).
     */
    @PreAuthorize("hasRole('USUARIO') or hasRole('ADMIN')")
    @GetMapping("/usuario/{cedula}")
    public ResponseEntity<?> obtenerPrestamosPorCedula(@PathVariable String cedula) {
        try {
            List<Prestamo> prestamos = prestamoService.obtenerPrestamosPorCedula(cedula);
            return ResponseEntity.ok(prestamos);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Error inesperado en el servidor."));
        }
    }


    /**
     * Obtener un préstamo por su ID.
     */
    @PreAuthorize("hasRole('USUARIO') or hasRole('ADMIN')")
    @GetMapping("/{idPrestamo}")
    public ResponseEntity<?> obtenerPrestamoPorId(@PathVariable Long idPrestamo) {
        try {
            Prestamo prestamo = prestamoService.obtenerPrestamoPorId(idPrestamo);
            return ResponseEntity.ok(prestamo);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Error inesperado en el servidor."));
        }
    }

    /**
     * Obtener préstamos por correo
     */
    @PreAuthorize("hasRole('USUARIO') or hasRole('ADMIN')")
    @GetMapping("/usuario/correo/{correo}")
    public List<Prestamo> obtenerPrestamosPorCorreo(@PathVariable String correo) {
        return prestamoService.obtenerPrestamosPorCorreo(correo);
    }

    /**
     * Cambiar el estado de un préstamo (solo Admin).
     * 🔹 Ahora el nuevo estado se envía en el `body`, no en la URL.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{idPrestamo}/estado")
    public ResponseEntity<?> cambiarEstadoPrestamo(@PathVariable Long idPrestamo, @RequestBody Map<String, String> request) {
        try {
            String nuevoEstado = request.get("nuevoEstado");
            if (nuevoEstado == null || nuevoEstado.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "El campo 'nuevoEstado' es obligatorio."));
            }

            Prestamo prestamoActualizado = prestamoService.cambiarEstadoPrestamo(idPrestamo, nuevoEstado);
            return ResponseEntity.ok(prestamoActualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Error inesperado en el servidor."));
        }
    }

    /**
     * Aprobar un préstamo (solo Admin).
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{idPrestamo}/aprobar")
    public ResponseEntity<?> aprobarPrestamo(@PathVariable Long idPrestamo) {
        try {
            Prestamo prestamoAprobado = prestamoService.aprobarPrestamo(idPrestamo);
            return ResponseEntity.ok(prestamoAprobado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Error inesperado en el servidor."));
        }
    }
}
