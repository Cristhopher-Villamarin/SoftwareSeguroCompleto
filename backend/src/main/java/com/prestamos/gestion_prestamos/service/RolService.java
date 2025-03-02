package com.prestamos.gestion_prestamos.service;

import com.prestamos.gestion_prestamos.model.Rol;
import org.springframework.stereotype.Service;

@Service
public class RolService {

    /**
     * Validar si un rol es válido.
     */
    public boolean esRolValido(String rol) {
        try {
            Rol.valueOf(rol.toUpperCase());
            return true;
        } catch (IllegalArgumentException ex) {
            return false;
        }
    }
}
