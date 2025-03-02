package com.prestamos.gestion_prestamos.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "prestamo")
@Getter
@Setter
public class Prestamo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPrestamo;

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @NotNull(message = "El monto solicitado es obligatorio")
    @Positive(message = "El monto solicitado debe ser mayor a 0")
    private Double montoSolicitado; // Monto solicitado por el usuario

    @PositiveOrZero(message = "El monto total no puede ser negativo")
    private Double montoTotal; // Monto total con intereses

    @PositiveOrZero(message = "El monto pendiente no puede ser negativo")
    private Double montoPendiente; // Monto restante por pagar

    @NotNull(message = "El plazo en meses es obligatorio")
    @Min(value = 1, message = "El plazo mínimo es de 1 mes")
    private Integer plazoMeses; // Número de meses del préstamo

    @NotNull(message = "La tasa de interés es obligatoria")
    @DecimalMin(value = "0.0", inclusive = false, message = "La tasa de interés debe ser mayor a 0")
    private Double tasaInteres; // Tasa de interés anual

    @NotBlank(message = "El tipo de pago es obligatorio")
    @Pattern(regexp = "FRANCES|ALEMAN", message = "El tipo de pago debe ser 'FRANCES' o 'ALEMAN'")
    private String tipoPago; // FRANCES, ALEMAN

    @NotBlank(message = "El estado del préstamo es obligatorio")
    @Pattern(regexp = "ACTIVO|CANCELADO|PENDIENTE", message = "El estado del préstamo debe ser 'ACTIVO' o 'CANCELADO' o 'PENDIENTE'")
    private String estadoPrestamo; // ACTIVO, CANCELADO, PEDIENTE

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime fechaSolicitud; // Fecha en la que se solicita el préstamo

    @Column(nullable = true)
    private LocalDate fechaAprobacion; // Fecha de aprobación, inicialmente nula

    public LocalDate getFechaAprobacion() {
        return fechaAprobacion;
    }

    public void setFechaAprobacion(LocalDate fechaAprobacion) {
        this.fechaAprobacion = fechaAprobacion;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public Long getIdPrestamo() {
        return idPrestamo;
    }

    public void setIdPrestamo(Long idPrestamo) {
        this.idPrestamo = idPrestamo;
    }

    public Double getMontoSolicitado() {
        return montoSolicitado;
    }

    public void setMontoSolicitado(Double montoSolicitado) {
        this.montoSolicitado = montoSolicitado;
    }

    public Double getMontoTotal() {
        return montoTotal;
    }

    public void setMontoTotal(Double montoTotal) {
        this.montoTotal = montoTotal;
    }

    public Double getMontoPendiente() {
        return montoPendiente;
    }

    public void setMontoPendiente(Double montoPendiente) {
        this.montoPendiente = montoPendiente;
    }

    public Integer getPlazoMeses() {
        return plazoMeses;
    }

    public void setPlazoMeses(Integer plazoMeses) {
        this.plazoMeses = plazoMeses;
    }

    public Double getTasaInteres() {
        return tasaInteres;
    }

    public void setTasaInteres(Double tasaInteres) {
        this.tasaInteres = tasaInteres;
    }

    public String getTipoPago() {
        return tipoPago;
    }

    public void setTipoPago(String tipoPago) {
        this.tipoPago = tipoPago;
    }

    public String getEstadoPrestamo() {
        return estadoPrestamo;
    }

    public void setEstadoPrestamo(String estadoPrestamo) {
        this.estadoPrestamo = estadoPrestamo;
    }

    public LocalDateTime getFechaSolicitud() {
        return fechaSolicitud;
    }

    public void setFechaSolicitud(LocalDateTime fechaSolicitud) {
        this.fechaSolicitud = fechaSolicitud;
    }
}
