package com.prestamos.gestion_prestamos.repository;

import com.prestamos.gestion_prestamos.model.Cuota;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
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

    /**
     * Obtener todas las cuotas con sus datos completos, incluyendo el idPrestamo del préstamo asociado.
     * Usamos una consulta JPQL para forzar la carga de la relación con Prestamo.
     */
    @Query("SELECT c FROM Cuota c JOIN FETCH c.prestamo p")
    List<Cuota> findAllWithPrestamo();
}