package com.prestamos.gestion_prestamos.repository;

import com.prestamos.gestion_prestamos.model.Prestamo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrestamoRepository extends JpaRepository<Prestamo, Long> {

    /**
     * Buscar préstamos por la cédula del usuario.
     */
    @Query("SELECT p FROM Prestamo p WHERE p.usuario.cedula = :cedula")
    List<Prestamo> findByUsuario_Cedula(String cedula);

    /**
     * Contar préstamos activos de un usuario por su ID.
     */
    long countByUsuario_IdUsuarioAndEstadoPrestamo(Long idUsuario, String estadoPrestamo);

    /**
     * Buscar préstamos de un usuario por estado.
     */
    List<Prestamo> findByUsuario_IdUsuarioAndEstadoPrestamo(Long idUsuario, String estadoPrestamo);

    /**
     * Buscar todos los préstamos de un usuario sin importar el estado.
     */
    List<Prestamo> findByUsuario_IdUsuario(Long idUsuario);

    /**
     * Buscar todos los préstamos aprobados (fecha de aprobación no nula).
     */
    List<Prestamo> findByFechaAprobacionIsNotNull();

    /**
     * Buscar todos los préstamos con un estado específico.
     */
    List<Prestamo> findByEstadoPrestamo(String estadoPrestamo);
}
