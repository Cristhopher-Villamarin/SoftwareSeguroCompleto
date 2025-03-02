package com.prestamos.gestion_prestamos.controller;

import com.prestamos.gestion_prestamos.model.Prestamo;
import com.prestamos.gestion_prestamos.service.PrestamoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Obtener todos los préstamos de un usuario por su cédula (solo admins pueden ver de todos los usuarios).
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/usuario/{cedula}")
    public ResponseEntity<List<Prestamo>> obtenerPrestamosPorCedula(@PathVariable String cedula) {
        List<Prestamo> prestamos = prestamoService.obtenerPrestamosPorCedula(cedula);
        return ResponseEntity.ok(prestamos);
    }

    /**
     * Obtener un préstamo específico por su ID.
     */
    @PreAuthorize("hasRole('USUARIO') or hasRole('ADMIN')")
    @GetMapping("/{idPrestamo}")
    public ResponseEntity<?> obtenerPrestamoPorId(@PathVariable Long idPrestamo) {
        try {
            Prestamo prestamo = prestamoService.obtenerPrestamoPorId(idPrestamo);
            return ResponseEntity.ok(prestamo);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Cambiar el estado de un préstamo (solo Admin).
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{idPrestamo}/estado")
    public ResponseEntity<?> cambiarEstadoPrestamo(@PathVariable Long idPrestamo, @RequestParam String nuevoEstado) {
        try {
            Prestamo prestamoActualizado = prestamoService.cambiarEstadoPrestamo(idPrestamo, nuevoEstado);
            return ResponseEntity.ok(prestamoActualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
