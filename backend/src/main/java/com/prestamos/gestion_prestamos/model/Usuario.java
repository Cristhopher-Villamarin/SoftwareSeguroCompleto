package com.prestamos.gestion_prestamos.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuario")
@Getter
@Setter
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idUsuario;

    @Column(name = "fecha_desbloqueo")
    private LocalDateTime fechaDesbloqueo;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 2, max = 50, message = "El nombre debe tener entre 2 y 50 caracteres")
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    @Size(min = 2, max = 50, message = "El apellido debe tener entre 2 y 50 caracteres")
    private String apellido;

    @NotBlank(message = "El número de identificación es obligatorio")
    @Column(unique = true)
    @Pattern(regexp = "^[0-9]+$", message = "El número de identificación solo puede contener números")
    private String cedula;

    @NotNull(message = "La fecha de nacimiento es obligatoria")
    private LocalDate fechaNac;

    @NotBlank(message = "La dirección es obligatoria")
    private String direccion;

    private Double ingresos; // No es obligatorio

    private Integer historialCred; // No es obligatorio

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo electrónico no es válido")
    @Column(unique = true)
    private String correo;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 10, message = "La contraseña debe tener al menos 10 caracteres")
    @JsonProperty("contrasenaHash")
    private String contrasenaHash;

    @NotNull(message = "El rol es obligatorio")
    @Enumerated(EnumType.STRING)
    private Rol rol; // ADMIN, USUARIO

    private Integer intentosFallidos = 0; // No es obligatorio

    private Boolean cuentaBloqueada = false; // No es obligatorio

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime fechaCreacion; // Fecha automática al crear usuario

    public Usuario() {}

    public Usuario(Long idUsuario, String nombre, String apellido, String cedula, LocalDate fechaNac, String direccion, Double ingresos, Integer historialCred, String correo, String contrasenaHash, Rol rol, Integer intentosFallidos, Boolean cuentaBloqueada, LocalDateTime fechaCreacion) {
        this.idUsuario = idUsuario;
        this.nombre = nombre;
        this.apellido = apellido;
        this.cedula = cedula;
        this.fechaNac = fechaNac;
        this.direccion = direccion;
        this.ingresos = ingresos;
        this.historialCred = historialCred;
        this.correo = correo;
        this.contrasenaHash = contrasenaHash;
        this.rol = rol;
        this.intentosFallidos = intentosFallidos;
        this.cuentaBloqueada = cuentaBloqueada;
        this.fechaCreacion = fechaCreacion;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public Long getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }

    public String getApellido() {
        return apellido;
    }

    public void setApellido(String apellido) {
        this.apellido = apellido;
    }

    public String getCedula() {
        return cedula;
    }

    public void setCedula(String cedula) {
        this.cedula = cedula;
    }

    public LocalDate getFechaNac() {
        return fechaNac;
    }

    public void setFechaNac(LocalDate fechaNac) {
        this.fechaNac = fechaNac;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public Double getIngresos() {
        return ingresos;
    }

    public void setIngresos(Double ingresos) {
        this.ingresos = ingresos;
    }

    public Integer getHistorialCred() {
        return historialCred;
    }

    public void setHistorialCred(Integer historialCred) {
        this.historialCred = historialCred;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public Rol getRol() {
        return rol;
    }

    public void setRol(Rol rol) {
        this.rol = rol;
    }

    public String getContrasenaHash() {
        return contrasenaHash;
    }

    public void setContrasenaHash(String contrasenaHash) {
        this.contrasenaHash = contrasenaHash;
    }

    public Integer getIntentosFallidos() {
        return intentosFallidos;
    }

    public void setIntentosFallidos(Integer intentosFallidos) {
        this.intentosFallidos = intentosFallidos;
    }

    public Boolean getCuentaBloqueada() {
        return cuentaBloqueada;
    }

    public void setCuentaBloqueada(Boolean cuentaBloqueada) {
        this.cuentaBloqueada = cuentaBloqueada;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public LocalDateTime getFechaDesbloqueo() {
        return fechaDesbloqueo;
    }

    public void setFechaDesbloqueo(LocalDateTime fechaDesbloqueo) {
        this.fechaDesbloqueo = fechaDesbloqueo;
    }
}
