package com.prestamos.gestion_prestamos.DTO;

public class LogEntryDTO {
    private String timestamp;
    private String usuario;
    private String accion;

    public LogEntryDTO(String timestamp, String usuario, String accion) {
        this.timestamp = timestamp;
        this.usuario = usuario;
        this.accion = accion;
    }

    // Getters y setters
    public String getTimestamp() { return timestamp; }
    public String getUsuario() { return usuario; }
    public String getAccion() { return accion; }
}