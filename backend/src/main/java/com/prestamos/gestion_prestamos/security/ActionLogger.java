package com.prestamos.gestion_prestamos.security;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class ActionLogger {

    private static final String LOG_FILE_PATH = "logs/actions.log"; // Ruta del archivo de logs
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public static void logAction(String usuario, String accion) {
        String timestamp = LocalDateTime.now().format(DATE_FORMATTER);
        String logEntry = String.format("[%s] Usuario: %s - Acción: %s%n", timestamp, usuario, accion);

        try {
            // Crear directorio si no existe
            Files.createDirectories(Paths.get(LOG_FILE_PATH).getParent());
            // Escribir en el archivo, appending si ya existe
            Files.write(
                    Paths.get(LOG_FILE_PATH),
                    logEntry.getBytes(),
                    StandardOpenOption.CREATE, StandardOpenOption.APPEND
            );
        } catch (IOException e) {
            System.err.println("Error al escribir en el archivo de log: " + e.getMessage());
        }
    }
}
