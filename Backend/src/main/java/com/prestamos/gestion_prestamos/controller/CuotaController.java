package com.prestamos.gestion_prestamos.controller;

import com.prestamos.gestion_prestamos.model.Cuota;
import com.prestamos.gestion_prestamos.service.CuotaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cuotas")
public class CuotaController {

    @Autowired
    private CuotaService cuotaService;

    /**
     * Obtener todas las cuotas de un préstamo.
     */
    @GetMapping("/prestamo/{idPrestamo}")
    public ResponseEntity<List<Cuota>> obtenerCuotasPorPrestamo(@PathVariable Long idPrestamo) {
        List<Cuota> cuotas = cuotaService.obtenerCuotasPorPrestamo(idPrestamo);
        return ResponseEntity.ok(cuotas);
    }

    /**
     * Registrar el pago de una cuota específica.
     */
    @PostMapping("/{idCuota}/pagar")
    public ResponseEntity<String> pagarCuota(@PathVariable Long idCuota) {
        cuotaService.registrarPagoCuota(idCuota);
        return ResponseEntity.ok("Pago registrado correctamente.");
    }
}
