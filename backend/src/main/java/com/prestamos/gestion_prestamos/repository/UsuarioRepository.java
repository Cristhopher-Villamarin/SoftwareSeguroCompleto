package com.prestamos.gestion_prestamos.repository;

import com.prestamos.gestion_prestamos.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    /**
     * Buscar usuario por cédula (único).
     */
    Optional<Usuario> findByCedula(String cedula);

    /**
     * Buscar usuario por correo (único).
     */
    Optional<Usuario> findByCorreo(String correo);

    /**
     * Verificar si un usuario con la cédula dada está bloqueado.
     */
    boolean existsByCedulaAndCuentaBloqueada(String cedula, Boolean cuentaBloqueada);

    /**
     * Contar usuarios con un rol específico.
     */
    long countByRol(String rol);

    Optional<Usuario> findByTokenRecuperacion(String tokenRecuperacion);

}
