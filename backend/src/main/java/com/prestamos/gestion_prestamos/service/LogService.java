package com.prestamos.gestion_prestamos.service;

import com.prestamos.gestion_prestamos.DTO.LogEntryDTO;
import org.springframework.stereotype.Service;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LogService {

    private static final String LOG_FILE_PATH = "logs/actions.log";

    public List<LogEntryDTO> getLogEntries() throws IOException {
        try {
            return Files.readAllLines(Paths.get(LOG_FILE_PATH))
                    .stream()
                    .filter(line -> !line.trim().isEmpty())
                    .map(this::parseLogEntry)
                    .collect(Collectors.toList());
        } catch (IOException e) {
            throw new IOException("Error al leer el archivo de logs: " + e.getMessage());
        }
    }

    public List<LogEntryDTO> getLogEntriesByUser(String usuario) throws IOException {
        try {
            return Files.readAllLines(Paths.get(LOG_FILE_PATH))
                    .stream()
                    .filter(line -> !line.trim().isEmpty() && line.contains("Usuario: " + usuario))
                    .map(this::parseLogEntry)
                    .collect(Collectors.toList());
        } catch (IOException e) {
            throw new IOException("Error al leer el archivo de logs: " + e.getMessage());
        }
    }

    private LogEntryDTO parseLogEntry(String line) {
        try {
            // Formato esperado: [yyyy-MM-dd HH:mm:ss] Usuario: xxx - Acción: yyy
            // Extraer timestamp entre corchetes
            int endTimestamp = line.indexOf(']');
            if (endTimestamp == -1) {
                throw new IllegalArgumentException("Formato de log inválido: falta ']'");
            }
            String timestamp = line.substring(1, endTimestamp); // Quita '[' y toma hasta ']'

            // Extraer la parte después del timestamp
            String remaining = line.substring(endTimestamp + 1).trim();

            // Encontrar la separación entre "Usuario" y "Acción"
            int usuarioIndex = remaining.indexOf("Usuario: ");
            int accionIndex = remaining.indexOf(" - Acción: ");
            if (usuarioIndex != 0 || accionIndex == -1) {
                throw new IllegalArgumentException("Formato de log inválido: estructura incorrecta");
            }

            // Extraer usuario
            String usuario = remaining.substring("Usuario: ".length(), accionIndex).trim();

            // Extraer acción (todo lo que viene después de "Acción: ")
            String accion = remaining.substring(accionIndex + " - Acción: ".length()).trim();

            return new LogEntryDTO(timestamp, usuario, accion);
        } catch (Exception e) {
            return new LogEntryDTO("ERROR", "N/A", "Error parseando log: " + line + " (" + e.getMessage() + ")");
        }
    }
}