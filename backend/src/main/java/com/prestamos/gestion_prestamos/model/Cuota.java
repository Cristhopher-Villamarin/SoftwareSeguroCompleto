package com.prestamos.gestion_prestamos.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Entity
@Table(name = "cuota")
@Getter
@Setter
public class Cuota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idCuota;

    @ManyToOne
    @JoinColumn(name = "id_prestamo", nullable = false)
    @JsonIgnore // Evita referencias circulares en JSON
    private Prestamo prestamo;

    @NotNull(message = "El número de cuota no puede ser nulo")
    @Positive(message = "El número de cuota debe ser positivo")
    private Integer numeroCuota;

    @NotNull(message = "El interés de la cuota no puede ser nulo")
    @PositiveOrZero(message = "El interés de la cuota no puede ser negativo")
    private Double interesCuota;

    @NotNull(message = "El capital de la cuota no puede ser nulo")
    @PositiveOrZero(message = "El capital de la cuota no puede ser negativo")
    private Double capitalCuota;

    @NotNull(message = "El monto total de la cuota no puede ser nulo")
    @Positive(message = "El monto total de la cuota debe ser positivo")
    private Double montoTotalCuota;

    @NotNull(message = "La fecha de vencimiento no puede ser nula")
    private LocalDate fechaVencimiento;

    private LocalDate fechaPago; // Puede ser nula hasta que se pague

    @NotBlank(message = "El estado de la cuota es obligatorio")
    @Pattern(regexp = "Pendiente|Pagada|Mora", message = "El estado debe ser 'Pendiente', 'Pagada' o 'Mora'")
    @Column(nullable = false)
    private String estado; // Puede ser "Pendiente", "Pagada", "Mora"

    @PositiveOrZero(message = "El interés por mora no puede ser negativo")
    @Column(nullable = true)
    private Double interesMora; // Interés por mora (se actualizará si no paga a tiempo)

    // Constructor vacío necesario para JPA
    public Cuota() {}

    // Método para obtener el idPrestamo explícitamente y incluirlo en el JSON
    @JsonProperty("idPrestamo")
    public Long getIdPrestamo() {
        return prestamo != null ? prestamo.getIdPrestamo() : null;
    }

    // Constructor con todos los campos
    public Cuota(Long idCuota, Prestamo prestamo, Integer numeroCuota, Double interesCuota, Double capitalCuota, Double montoTotalCuota, LocalDate fechaVencimiento, String estado, LocalDate fechaPago, Double interesMora) {
        this.idCuota = idCuota;
        this.prestamo = prestamo;
        this.numeroCuota = numeroCuota;
        this.interesCuota = interesCuota;
        this.capitalCuota = capitalCuota;
        this.montoTotalCuota = montoTotalCuota;
        this.fechaVencimiento = fechaVencimiento;
        this.estado = estado != null ? estado : "Pendiente"; // Estado por defecto
        this.fechaPago = fechaPago;
        this.interesMora = interesMora != null ? interesMora : 0.0; // Se inicializa en 0
    }

    /**
     * Método para marcar la cuota como pagada.
     */
    public void marcarComoPagada() {
        if ("Pagada".equals(this.estado)) {
            throw new IllegalStateException("La cuota ya ha sido pagada.");
        }
        this.estado = "Pagada";
        this.fechaPago = LocalDate.now();
        this.interesMora = 0.0; // Se elimina el interés por mora al pagar
    }

    /**
     * Método para verificar si la cuota está en mora y actualizar el interés por mora.
     */
    public void verificarMora() {
        if ("Pendiente".equals(this.estado) && LocalDate.now().isAfter(this.fechaVencimiento)) {
            this.estado = "Mora";
            actualizarInteresMora();
        }
    }

    /**
     * Método para calcular el interés por mora basado en los días de retraso.
     */
    public void actualizarInteresMora() {
        if ("Mora".equals(this.estado)) {
            long diasRetraso = ChronoUnit.DAYS.between(this.fechaVencimiento, LocalDate.now());
            double tasaMoraDiaria = 0.01; // 1% diario sobre el capital pendiente
            this.interesMora = diasRetraso * tasaMoraDiaria * this.capitalCuota;
        }
    }



    public Prestamo getPrestamo() {
        return prestamo;
    }

    public void setPrestamo(Prestamo prestamo) {
        this.prestamo = prestamo;
    }

    public Long getIdCuota() {
        return idCuota;
    }

    public void setIdCuota(Long idCuota) {
        this.idCuota = idCuota;
    }

    public Integer getNumeroCuota() {
        return numeroCuota;
    }

    public void setNumeroCuota(Integer numeroCuota) {
        this.numeroCuota = numeroCuota;
    }

    public Double getInteresCuota() {
        return interesCuota;
    }

    public void setInteresCuota(Double interesCuota) {
        this.interesCuota = interesCuota;
    }

    public Double getCapitalCuota() {
        return capitalCuota;
    }

    public void setCapitalCuota(Double capitalCuota) {
        this.capitalCuota = capitalCuota;
    }

    public Double getMontoTotalCuota() {
        return montoTotalCuota;
    }

    public void setMontoTotalCuota(Double montoTotalCuota) {
        this.montoTotalCuota = montoTotalCuota;
    }

    public LocalDate getFechaVencimiento() {
        return fechaVencimiento;
    }

    public void setFechaVencimiento(LocalDate fechaVencimiento) {
        this.fechaVencimiento = fechaVencimiento;
    }

    public LocalDate getFechaPago() {
        return fechaPago;
    }

    public void setFechaPago(LocalDate fechaPago) {
        this.fechaPago = fechaPago;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public Double getInteresMora() {
        return interesMora;
    }

    public void setInteresMora(Double interesMora) {
        this.interesMora = interesMora;
    }
}
