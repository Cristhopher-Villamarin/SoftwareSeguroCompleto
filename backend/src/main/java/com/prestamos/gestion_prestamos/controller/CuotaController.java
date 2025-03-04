package com.prestamos.gestion_prestamos.controller;

import com.prestamos.gestion_prestamos.model.Cuota;
import com.prestamos.gestion_prestamos.service.CuotaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cuotas")
public class CuotaController {

    @Autowired
    private CuotaService cuotaService;

    /**
     * Obtener todas las cuotas de un préstamo.
     */
    @PreAuthorize("hasRole('USUARIO')")
    @GetMapping("/prestamo/{idPrestamo}")
    public ResponseEntity<?> obtenerCuotasPorPrestamo(@PathVariable Long idPrestamo) {
        try {
            List<Cuota> cuotas = cuotaService.obtenerCuotasPorPrestamo(idPrestamo);
            return ResponseEntity.ok(cuotas);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Error inesperado en el servidor."));
        }
    }

    /**
     * Registrar el pago de una cuota específica.
     */
    @PreAuthorize("hasRole('USUARIO')")
    @PostMapping("/{idCuota}/pagar")
    public ResponseEntity<?> pagarCuota(@PathVariable Long idCuota) {
        try {
            cuotaService.registrarPagoCuota(idCuota);
            return ResponseEntity.ok(Map.of("mensaje", "Pago registrado correctamente."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Error inesperado en el servidor."));
        }
    }
}
