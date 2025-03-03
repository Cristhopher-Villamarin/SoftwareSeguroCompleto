package com.prestamos.gestion_prestamos.service;

import com.prestamos.gestion_prestamos.model.Cuota;
import com.prestamos.gestion_prestamos.model.Prestamo;
import com.prestamos.gestion_prestamos.repository.CuotaRepository;
import com.prestamos.gestion_prestamos.repository.PrestamoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class PrestamoService {

    @Autowired
    private PrestamoRepository prestamoRepository;

    @Autowired
    private CuotaRepository cuotaRepository;

    private double calcularMontoTotalFrances(double montoSolicitado, double tasaInteresAnual, int plazoMeses) {
        double tasaMensual = tasaInteresAnual / 12 / 100;
        double cuotaMensual = (montoSolicitado * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -plazoMeses));
        return cuotaMensual * plazoMeses;
    }

    private double calcularMontoTotalAleman(double montoSolicitado, double tasaInteresAnual, int plazoMeses) {
        double tasaMensual = tasaInteresAnual / 12 / 100;
        double saldoPendiente = montoSolicitado;
        double montoTotal = 0;
        double capitalMensual = montoSolicitado / plazoMeses;

        for (int i = 1; i <= plazoMeses; i++) {
            double interesMensual = saldoPendiente * tasaMensual;
            double cuotaMensual = capitalMensual + interesMensual;
            montoTotal += cuotaMensual;
            saldoPendiente -= capitalMensual;
        }

        return montoTotal;
    }

    /**
     * Crear un nuevo préstamo solo si el usuario no tiene préstamos activos.
     */
    public Prestamo crearPrestamo(Prestamo prestamo) {
        long prestamosActivos = prestamoRepository.countByUsuario_IdUsuarioAndEstadoPrestamo(prestamo.getUsuario().getIdUsuario(), "ACTIVO");

        if (prestamosActivos > 0) {
            throw new RuntimeException("El usuario ya tiene préstamos activos y no puede solicitar otro.");
        }

        // 🔹 Calcular el monto total según el tipo de pago
        double montoTotal;
        if ("FRANCES".equalsIgnoreCase(prestamo.getTipoPago())) {
            montoTotal = calcularMontoTotalFrances(prestamo.getMontoSolicitado(), prestamo.getTasaInteres(), prestamo.getPlazoMeses());
        } else if ("ALEMAN".equalsIgnoreCase(prestamo.getTipoPago())) {
            montoTotal = calcularMontoTotalAleman(prestamo.getMontoSolicitado(), prestamo.getTasaInteres(), prestamo.getPlazoMeses());
        } else {
            throw new RuntimeException("Tipo de pago no válido: " + prestamo.getTipoPago());
        }

        // Asignar el monto total calculado
        prestamo.setMontoTotal(montoTotal);
        prestamo.setMontoPendiente(montoTotal); // Inicialmente el monto pendiente es el total

        return prestamoRepository.save(prestamo);
    }


    /**
     * Obtener todos los préstamos asociados a un usuario por su cédula.
     */
    public List<Prestamo> obtenerPrestamosPorCedula(String cedula) {
        return prestamoRepository.findByUsuario_Cedula(cedula);
    }

    /**
     * Obtener un préstamo por su ID.
     */
    public Prestamo obtenerPrestamoPorId(Long idPrestamo) {
        return prestamoRepository.findById(idPrestamo)
                .orElseThrow(() -> new RuntimeException("Préstamo no encontrado con ID: " + idPrestamo));
    }

    /**
     * Cambiar el estado de un préstamo.
     */
    public Prestamo cambiarEstadoPrestamo(Long idPrestamo, String nuevoEstado) {
        Prestamo prestamo = prestamoRepository.findById(idPrestamo)
                .orElseThrow(() -> new RuntimeException("Préstamo no encontrado con ID: " + idPrestamo));

        // Validar estados permitidos
        if (!nuevoEstado.equals("ACTIVO") && !nuevoEstado.equals("CANCELADO") && !nuevoEstado.equals("PENDIENTE")) {
            throw new IllegalArgumentException("Estado no válido. Los estados permitidos son 'ACTIVO', 'CANCELADO' o 'PENDIENTE'.");
        }

        prestamo.setEstadoPrestamo(nuevoEstado);
        return prestamoRepository.save(prestamo);
    }

    /**
     * Aprobar un préstamo (cambiar estado a ACTIVO y generar cuotas).
     */
    public Prestamo aprobarPrestamo(Long idPrestamo) {
        Prestamo prestamo = prestamoRepository.findById(idPrestamo)
                .orElseThrow(() -> new RuntimeException("Préstamo no encontrado con ID: " + idPrestamo));

        if (!"PENDIENTE".equals(prestamo.getEstadoPrestamo())) {
            throw new RuntimeException("Solo los préstamos en estado PENDIENTE pueden ser aprobados.");
        }

        prestamo.setEstadoPrestamo("ACTIVO");
        prestamo.setFechaAprobacion(LocalDate.now());
        prestamo = prestamoRepository.save(prestamo);

        // Generar la tabla de amortización y guardar las cuotas en la BD
        generarTablaAmortizacion(prestamo);

        return prestamo;
    }

    /**
     * Genera la tabla de amortización basada en el tipo de pago.
     */
    private void generarTablaAmortizacion(Prestamo prestamo) {
        List<Cuota> cuotas;

        if ("FRANCES".equals(prestamo.getTipoPago())) {
            cuotas = calcularCuotasFrances(prestamo);
        } else if ("ALEMAN".equals(prestamo.getTipoPago())) {
            cuotas = calcularCuotasAleman(prestamo);
        } else {
            throw new RuntimeException("Tipo de pago no válido: " + prestamo.getTipoPago());
        }

        cuotaRepository.saveAll(cuotas);
    }

    /**
     * Método para calcular cuotas con el sistema de amortización francés.
     */
    private List<Cuota> calcularCuotasFrances(Prestamo prestamo) {
        List<Cuota> cuotas = new ArrayList<>();
        double tasaMensual = prestamo.getTasaInteres() / 12 / 100;
        int plazo = prestamo.getPlazoMeses();
        double monto = prestamo.getMontoSolicitado();

        // Fórmula de la cuota fija en el sistema francés
        double cuotaFija = (monto * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -plazo));

        LocalDate fechaVencimiento = prestamo.getFechaAprobacion().plusMonths(1);

        double saldoPendiente = monto;

        for (int i = 1; i <= plazo; i++) {
            double interes = saldoPendiente * tasaMensual;
            double capital = cuotaFija - interes;

            Cuota cuota = new Cuota();
            cuota.setPrestamo(prestamo);
            cuota.setNumeroCuota(i);
            cuota.setInteresCuota(interes);
            cuota.setCapitalCuota(capital);
            cuota.setMontoTotalCuota(cuotaFija);
            cuota.setFechaVencimiento(fechaVencimiento);
            cuota.setEstado("Pendiente");
            cuota.setInteresMora(0.0);

            cuotas.add(cuota);

            saldoPendiente -= capital;
            fechaVencimiento = fechaVencimiento.plusMonths(1);
        }

        return cuotas;
    }

    /**
     * Método para calcular cuotas con el sistema de amortización alemán.
     */
    private List<Cuota> calcularCuotasAleman(Prestamo prestamo) {
        List<Cuota> cuotas = new ArrayList<>();
        double tasaMensual = prestamo.getTasaInteres() / 12 / 100;
        int plazo = prestamo.getPlazoMeses();
        double monto = prestamo.getMontoSolicitado();

        double capitalFijo = monto / plazo;
        LocalDate fechaVencimiento = prestamo.getFechaAprobacion().plusMonths(1);
        double saldoPendiente = monto;

        for (int i = 1; i <= plazo; i++) {
            double interes = saldoPendiente * tasaMensual;
            double cuotaTotal = capitalFijo + interes;

            Cuota cuota = new Cuota();
            cuota.setPrestamo(prestamo);
            cuota.setNumeroCuota(i);
            cuota.setInteresCuota(interes);
            cuota.setCapitalCuota(capitalFijo);
            cuota.setMontoTotalCuota(cuotaTotal);
            cuota.setFechaVencimiento(fechaVencimiento);
            cuota.setEstado("Pendiente");
            cuota.setInteresMora(0.0);

            cuotas.add(cuota);

            saldoPendiente -= capitalFijo;
            fechaVencimiento = fechaVencimiento.plusMonths(1);
        }

        return cuotas;
    }

    /**
     * Obtener préstamos por estado.
     */
    public List<Prestamo> obtenerPrestamosPorEstado(String estadoPrestamo) {
        return prestamoRepository.findByEstadoPrestamo(estadoPrestamo);
    }
}
