package com.prestamos.gestion_prestamos.service;

import com.prestamos.gestion_prestamos.model.Prestamo;
import com.prestamos.gestion_prestamos.repository.PrestamoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class PrestamoService {

    @Autowired
    private PrestamoRepository prestamoRepository;

    /**
     * Crear un nuevo préstamo solo si el usuario no tiene préstamos activos.
     */
    public Prestamo crearPrestamo(Prestamo prestamo) {
        long prestamosActivos = prestamoRepository.countByUsuario_IdUsuarioAndEstadoPrestamo(prestamo.getUsuario().getIdUsuario(), "ACTIVO");

        if (prestamosActivos > 0) {
            throw new RuntimeException("El usuario ya tiene préstamos activos y no puede solicitar otro.");
        }

        return prestamoRepository.save(prestamo);
    }

    /**
     * Obtener todos los préstamos asociados a un usuario por su cédula.
     */
    public List<Prestamo> obtenerPrestamosPorCedula(String cedula) {
        return prestamoRepository.findByUsuario_Cedula(cedula);
    }

    /**
     * Obtener un préstamo por su ID.
     */
    public Prestamo obtenerPrestamoPorId(Long idPrestamo) {
        return prestamoRepository.findById(idPrestamo)
                .orElseThrow(() -> new RuntimeException("Préstamo no encontrado con ID: " + idPrestamo));
    }

    /**
     * Cambiar el estado de un préstamo.
     */
    public Prestamo cambiarEstadoPrestamo(Long idPrestamo, String nuevoEstado) {
        Prestamo prestamo = prestamoRepository.findById(idPrestamo)
                .orElseThrow(() -> new RuntimeException("Préstamo no encontrado con ID: " + idPrestamo));

        // Validar estados permitidos
        if (!nuevoEstado.equals("ACTIVO") && !nuevoEstado.equals("CANCELADO") && !nuevoEstado.equals("PENDIENTE")) {
            throw new IllegalArgumentException("Estado no válido. Los estados permitidos son 'ACTIVO', 'CANCELADO' o 'PENDIENTE'.");
        }

        prestamo.setEstadoPrestamo(nuevoEstado);
        return prestamoRepository.save(prestamo);
    }

    /**
     * Aprobar un préstamo (cambiar estado a ACTIVO y establecer fecha de aprobación).
     */
    public Prestamo aprobarPrestamo(Long idPrestamo) {
        Prestamo prestamo = prestamoRepository.findById(idPrestamo)
                .orElseThrow(() -> new RuntimeException("Préstamo no encontrado con ID: " + idPrestamo));

        if (!"PENDIENTE".equals(prestamo.getEstadoPrestamo())) {
            throw new RuntimeException("Solo los préstamos en estado PENDIENTE pueden ser aprobados.");
        }

        prestamo.setEstadoPrestamo("ACTIVO");
        prestamo.setFechaAprobacion(LocalDate.now());
        return prestamoRepository.save(prestamo);
    }

    /**
     * Obtener préstamos por estado.
     */
    public List<Prestamo> obtenerPrestamosPorEstado(String estadoPrestamo) {
        return prestamoRepository.findByEstadoPrestamo(estadoPrestamo);
    }
}
