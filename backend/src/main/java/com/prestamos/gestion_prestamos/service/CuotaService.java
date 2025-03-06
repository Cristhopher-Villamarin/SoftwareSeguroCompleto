package com.prestamos.gestion_prestamos.service;

import com.prestamos.gestion_prestamos.model.Cuota;
import com.prestamos.gestion_prestamos.model.Prestamo;
import com.prestamos.gestion_prestamos.repository.CuotaRepository;
import com.prestamos.gestion_prestamos.repository.PrestamoRepository;
import com.prestamos.gestion_prestamos.security.ActionLogger; // Importar ActionLogger
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class CuotaService {

    @Autowired
    private CuotaRepository cuotaRepository;

    @Autowired
    private PrestamoRepository prestamoRepository;

    // Método auxiliar para obtener el usuario autenticado del contexto de seguridad
    private String getUsuarioAutenticado() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
            return authentication.getName(); // Devuelve el "sub" del JWT (correo)
        }
        return null;
    }

    /**
     * Obtener todas las cuotas de un préstamo.
     */
    public List<Cuota> obtenerCuotasPorPrestamo(Long idPrestamo) {
        String usuarioAutenticado = getUsuarioAutenticado();
        List<Cuota> cuotas = cuotaRepository.findByPrestamo_IdPrestamo(idPrestamo);
        ActionLogger.logAction(usuarioAutenticado != null ? usuarioAutenticado : "Sistema",
                "Consultó las cuotas del préstamo con ID: " + idPrestamo);
        return cuotas;
    }

    /**
     * Registrar el pago de una cuota.
     * - Si es la última cuota pendiente, cambia el estado del préstamo a "FINALIZADO".
     * - Se reduce el monto pendiente del préstamo.
     */
    public void registrarPagoCuota(Long idCuota) {
        String usuarioAutenticado = getUsuarioAutenticado();
        Cuota cuota = cuotaRepository.findById(idCuota)
                .orElseThrow(() -> {
                    ActionLogger.logAction(usuarioAutenticado != null ? usuarioAutenticado : "Sistema",
                            "Intentó registrar el pago de una cuota no encontrada con ID: " + idCuota);
                    return new RuntimeException("Cuota no encontrada con ID: " + idCuota);
                });

        if ("Pagada".equals(cuota.getEstado())) {
            ActionLogger.logAction(usuarioAutenticado != null ? usuarioAutenticado : "Sistema",
                    "Intentó registrar el pago de una cuota ya pagada con ID: " + idCuota);
            throw new RuntimeException("La cuota ya ha sido pagada.");
        }

        Prestamo prestamo = cuota.getPrestamo();
        if (prestamo == null) {
            ActionLogger.logAction(usuarioAutenticado != null ? usuarioAutenticado : "Sistema",
                    "Intentó registrar el pago de una cuota sin préstamo asociado con ID: " + idCuota);
            throw new RuntimeException("Préstamo no encontrado para la cuota con ID: " + idCuota);
        }

        // Si la cuota estaba en mora, actualizar el interés por mora antes del pago
        if ("Mora".equals(cuota.getEstado())) {
            cuota.actualizarInteresMora();
        }

        // Reducir el monto pendiente del préstamo
        double nuevoMontoPendiente = prestamo.getMontoPendiente() - cuota.getMontoTotalCuota();
        prestamo.setMontoPendiente(Math.max(0, nuevoMontoPendiente));

        // Marcar la cuota como pagada
        cuota.marcarComoPagada();
        cuotaRepository.save(cuota);

        // Verificar si todas las cuotas del préstamo han sido pagadas
        boolean todasPagadas = cuotaRepository.countByPrestamo_IdPrestamoAndEstado(prestamo.getIdPrestamo(), "Pendiente") == 0;

        if (todasPagadas) {
            prestamo.setEstadoPrestamo("FINALIZADO");
            prestamoRepository.save(prestamo);
            ActionLogger.logAction(usuarioAutenticado != null ? usuarioAutenticado : "Sistema",
                    "Registró el pago de la cuota con ID: " + idCuota + " y finalizó el préstamo con ID: " + prestamo.getIdPrestamo());
        } else {
            prestamoRepository.save(prestamo);
            ActionLogger.logAction(usuarioAutenticado != null ? usuarioAutenticado : "Sistema",
                    "Registró el pago de la cuota con ID: " + idCuota + " del préstamo con ID: " + prestamo.getIdPrestamo());
        }
    }

    /**
     * Verificar y actualizar cuotas en mora de un préstamo.
     */
    public void verificarYActualizarMoras(Long idPrestamo) {
        String usuarioAutenticado = getUsuarioAutenticado();
        List<Cuota> cuotas = cuotaRepository.findByPrestamo_IdPrestamo(idPrestamo);
        int cuotasActualizadas = 0;

        for (Cuota cuota : cuotas) {
            if ("PENDIENTE".equals(cuota.getEstado()) && LocalDate.now().isAfter(cuota.getFechaVencimiento())) {
                cuota.verificarMora();
                cuotaRepository.save(cuota);
                cuotasActualizadas++;
            }
        }

        if (cuotasActualizadas > 0) {
            ActionLogger.logAction(usuarioAutenticado != null ? usuarioAutenticado : "Sistema",
                    "Actualizó " + cuotasActualizadas + " cuotas en mora para el préstamo con ID: " + idPrestamo);
        } else {
            ActionLogger.logAction(usuarioAutenticado != null ? usuarioAutenticado : "Sistema",
                    "Verificó cuotas del préstamo con ID: " + idPrestamo + " - No se encontraron cuotas en mora");
        }
    }

    /**
     * Obtener todas las cuotas con sus datos completos, incluyendo el idPrestamo.
     */
    public List<Cuota> obtenerTodasLasCuotas() {
        String usuarioAutenticado = getUsuarioAutenticado();
        List<Cuota> cuotas = cuotaRepository.findAllWithPrestamo();
        ActionLogger.logAction(usuarioAutenticado != null ? usuarioAutenticado : "Sistema",
                "Consultó todas las cuotas registradas");
        return cuotas;
    }
}