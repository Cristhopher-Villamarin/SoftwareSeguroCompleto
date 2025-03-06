package com.prestamos.gestion_prestamos.service;

import com.prestamos.gestion_prestamos.model.Cuota;
import com.prestamos.gestion_prestamos.model.Prestamo;
import com.prestamos.gestion_prestamos.repository.CuotaRepository;
import com.prestamos.gestion_prestamos.repository.PrestamoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class CuotaService {

    @Autowired
    private CuotaRepository cuotaRepository;

    @Autowired
    private PrestamoRepository prestamoRepository;


    /**
     * Obtener todas las cuotas de un préstamo.
     */
    public List<Cuota> obtenerCuotasPorPrestamo(Long idPrestamo) {
        return cuotaRepository.findByPrestamo_IdPrestamo(idPrestamo);
    }

    /**
     * Registrar el pago de una cuota.
     * - Si es la última cuota pendiente, cambia el estado del préstamo a "FINALIZADO".
     * - Se reduce el monto pendiente del préstamo.
     */
    public void registrarPagoCuota(Long idCuota) {
        Cuota cuota = cuotaRepository.findById(idCuota)
                .orElseThrow(() -> new RuntimeException("Cuota no encontrada con ID: " + idCuota));

        if ("Pagada".equals(cuota.getEstado())) {
            throw new RuntimeException("La cuota ya ha sido pagada.");
        }

        // Si la cuota estaba en mora, actualizar el interés por mora antes del pago
        if ("Mora".equals(cuota.getEstado())) {
            cuota.actualizarInteresMora();
        }

        // Obtener el préstamo asociado a la cuota
        Prestamo prestamo = cuota.getPrestamo();
        if (prestamo == null) {
            throw new RuntimeException("Préstamo no encontrado para la cuota con ID: " + idCuota);
        }

        // Reducir el monto pendiente del préstamo
        double nuevoMontoPendiente = prestamo.getMontoPendiente() - cuota.getMontoTotalCuota();
        prestamo.setMontoPendiente(Math.max(0, nuevoMontoPendiente)); // Evitar valores negativos

        // Marcar la cuota como pagada
        cuota.marcarComoPagada();
        cuotaRepository.save(cuota);

        //Verificar si todas las cuotas del préstamo han sido pagadas
        boolean todasPagadas = cuotaRepository.countByPrestamo_IdPrestamoAndEstado(prestamo.getIdPrestamo(), "Pendiente") == 0;

        if (todasPagadas) {
            prestamo.setEstadoPrestamo("FINALIZADO");
        }

        // Guardar los cambios en el préstamo
        prestamoRepository.save(prestamo);
    }

    /**
     * Verificar y actualizar cuotas en mora de un préstamo.
     */
    public void verificarYActualizarMoras(Long idPrestamo) {
        List<Cuota> cuotas = cuotaRepository.findByPrestamo_IdPrestamo(idPrestamo);
        for (Cuota cuota : cuotas) {
            if ("PENDIENTE".equals(cuota.getEstado()) && LocalDate.now().isAfter(cuota.getFechaVencimiento())) {
                cuota.verificarMora();
                cuotaRepository.save(cuota);
            }
        }
    }

    /**
     * Obtener todas las cuotas con sus datos completos, incluyendo el idPrestamo.
     */
    public List<Cuota> obtenerTodasLasCuotas() {
        return cuotaRepository.findAllWithPrestamo();
    }

}
