package com.prestamos.gestion_prestamos.controller;

import com.prestamos.gestion_prestamos.DTO.LogEntryDTO;
import com.prestamos.gestion_prestamos.service.LogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/logs")
public class LogController {

    @Autowired
    private LogService logService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<?> getAllLogs() {
        try {
            List<LogEntryDTO> logs = logService.getLogEntries();
            return ResponseEntity.ok(logs);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al obtener los logs: " + e.getMessage());
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{usuario}")
    public ResponseEntity<?> getLogsByUser(@PathVariable String usuario) {
        if (usuario == null || usuario.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body("El parámetro 'usuario' no puede estar vacío");
        }
        try {
            List<LogEntryDTO> logs = logService.getLogEntriesByUser(usuario);
            return ResponseEntity.ok(logs);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al obtener los logs del usuario " + usuario + ": " + e.getMessage());
        }
    }
}