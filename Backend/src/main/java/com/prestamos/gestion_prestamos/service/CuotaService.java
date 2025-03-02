package com.prestamos.gestion_prestamos.service;

import com.prestamos.gestion_prestamos.model.Cuota;
import com.prestamos.gestion_prestamos.repository.CuotaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class CuotaService {

    @Autowired
    private CuotaRepository cuotaRepository;

    /**
     * Obtener todas las cuotas de un préstamo.
     */
    public List<Cuota> obtenerCuotasPorPrestamo(Long idPrestamo) {
        return cuotaRepository.findByPrestamo_IdPrestamo(idPrestamo);
    }

    /**
     * Registrar el pago de una cuota.
     */
    public void registrarPagoCuota(Long idCuota) {
        Cuota cuota = cuotaRepository.findById(idCuota)
                .orElseThrow(() -> new RuntimeException("Cuota no encontrada con ID: " + idCuota));

        if ("Pagada".equals(cuota.getEstado())) {
            throw new RuntimeException("La cuota ya ha sido pagada.");
        }

        // Si la cuota está vencida, actualizar el interés por mora antes del pago
        if ("Mora".equals(cuota.getEstado())) {
            cuota.actualizarInteresMora();
        }

        // Marcar como pagada
        cuota.marcarComoPagada();
        cuotaRepository.save(cuota);
    }

    /**
     * Verificar y actualizar cuotas en mora de un préstamo.
     */
    public void verificarYActualizarMoras(Long idPrestamo) {
        List<Cuota> cuotas = cuotaRepository.findByPrestamo_IdPrestamo(idPrestamo);
        for (Cuota cuota : cuotas) {
            if ("Pendiente".equals(cuota.getEstado()) && LocalDate.now().isAfter(cuota.getFechaVencimiento())) {
                cuota.verificarMora();
                cuotaRepository.save(cuota);
            }
        }
    }
}
