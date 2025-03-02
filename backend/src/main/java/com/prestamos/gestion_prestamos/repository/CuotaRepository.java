package com.prestamos.gestion_prestamos.repository;

import com.prestamos.gestion_prestamos.model.Cuota;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CuotaRepository extends JpaRepository<Cuota, Long> {

    /**
     * Buscar todas las cuotas de un préstamo.
     */
    List<Cuota> findByPrestamo_IdPrestamo(Long idPrestamo);

    /**
     * Contar cuotas por estado en un préstamo.
     */
    long countByPrestamo_IdPrestamoAndEstado(Long idPrestamo, String estado);

    /**
     * Buscar cuotas por estado en un préstamo.
     */
    List<Cuota> findByPrestamo_IdPrestamoAndEstado(Long idPrestamo, String estado);
}
