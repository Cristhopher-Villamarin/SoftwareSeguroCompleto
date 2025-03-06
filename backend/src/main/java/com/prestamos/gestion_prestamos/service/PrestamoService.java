package com.prestamos.gestion_prestamos.service;

import com.prestamos.gestion_prestamos.model.Cuota;
import com.prestamos.gestion_prestamos.model.Prestamo;
import com.prestamos.gestion_prestamos.model.Usuario;
import com.prestamos.gestion_prestamos.repository.CuotaRepository;
import com.prestamos.gestion_prestamos.repository.PrestamoRepository;
import com.prestamos.gestion_prestamos.repository.UsuarioRepository;
import com.prestamos.gestion_prestamos.security.ActionLogger; // Importar ActionLogger
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PrestamoService {

    @Autowired
    private PrestamoRepository prestamoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private CuotaRepository cuotaRepository;

    // Método auxiliar para obtener el usuario autenticado del contexto de seguridad
    private String getUsuarioAutenticado() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
            return authentication.getName(); // Devuelve el "sub" del JWT (correo)
        }
        return null;
    }

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

    public Prestamo crearPrestamo(Prestamo prestamo) {
        String usuarioAutenticado = getUsuarioAutenticado();
        String usuarioCorreo = prestamo.getUsuario().getCorreo();

        long prestamosActivos = prestamoRepository.countByUsuario_IdUsuarioAndEstadoPrestamo(prestamo.getUsuario().getIdUsuario(), "ACTIVO");
        if (prestamosActivos > 0) {
            ActionLogger.logAction(usuarioAutenticado != null ? usuarioAutenticado : usuarioCorreo,
                    "Intentó crear un préstamo pero ya tiene préstamos activos");
            throw new RuntimeException("El usuario ya tiene préstamos activos y no puede solicitar otro.");
        }

        double montoTotal;
        if ("FRANCES".equalsIgnoreCase(prestamo.getTipoPago())) {
            montoTotal = calcularMontoTotalFrances(prestamo.getMontoSolicitado(), prestamo.getTasaInteres(), prestamo.getPlazoMeses());
        } else if ("ALEMAN".equalsIgnoreCase(prestamo.getTipoPago())) {
            montoTotal = calcularMontoTotalAleman(prestamo.getMontoSolicitado(), prestamo.getTasaInteres(), prestamo.getPlazoMeses());
        } else {
            ActionLogger.logAction(usuarioAutenticado != null ? usuarioAutenticado : usuarioCorreo,
                    "Intentó crear un préstamo con tipo de pago no válido: " + prestamo.getTipoPago());
            throw new RuntimeException("Tipo de pago no válido: " + prestamo.getTipoPago());
        }

        prestamo.setMontoTotal(montoTotal);
        prestamo.setMontoPendiente(montoTotal);

        Prestamo savedPrestamo = prestamoRepository.save(prestamo);
        ActionLogger.logAction(usuarioAutenticado != null ? usuarioAutenticado : usuarioCorreo,
                "Creó un nuevo préstamo con ID: " + savedPrestamo.getIdPrestamo());
        return savedPrestamo;
    }

    public List<Prestamo> obtenerPrestamosPorCedula(String cedula) {
        String usuarioAutenticado = getUsuarioAutenticado();
        List<Prestamo> prestamos = prestamoRepository.findByUsuario_Cedula(cedula);
        ActionLogger.logAction(usuarioAutenticado != null ? usuarioAutenticado : "Sistema",
                "Consultó los préstamos del usuario con cédula: " + cedula);
        return prestamos;
    }

    public List<Prestamo> obtenerPrestamosPorCorreo(String correo) {
        String usuarioAutenticado = getUsuarioAutenticado();
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> {
                    ActionLogger.logAction(usuarioAutenticado != null ? usuarioAutenticado : "Sistema",
                            "Intentó consultar préstamos de un usuario no encontrado con correo: " + correo);
                    return new RuntimeException("Usuario no encontrado con correo: " + correo);
                });

        List<Prestamo> prestamos = prestamoRepository.findByUsuario_Cedula(usuario.getCedula());
        ActionLogger.logAction(usuarioAutenticado != null ? usuarioAutenticado : "Sistema",
                "Consultó los préstamos del usuario con correo: " + correo);
        return prestamos;
    }

    public Prestamo obtenerPrestamoPorId(Long idPrestamo) {
        String usuarioAutenticado = getUsuarioAutenticado();
        Prestamo prestamo = prestamoRepository.findById(idPrestamo)
                .orElseThrow(() -> {
                    ActionLogger.logAction(usuarioAutenticado != null ? usuarioAutenticado : "Sistema",
                            "Intentó obtener un préstamo no encontrado con ID: " + idPrestamo);
                    return new RuntimeException("Préstamo no encontrado con ID: " + idPrestamo);
                });
        ActionLogger.logAction(usuarioAutenticado != null ? usuarioAutenticado : "Sistema",
                "Consultó el préstamo con ID: " + idPrestamo);
        return prestamo;
    }

    public List<Prestamo> obtenerTodosLosPrestamos() {
        String usuarioAutenticado = getUsuarioAutenticado();
        List<Prestamo> prestamos = prestamoRepository.findAll();
        ActionLogger.logAction(usuarioAutenticado != null ? usuarioAutenticado : "Sistema",
                "Consultó todos los préstamos registrados");
        return prestamos;
    }

    public Prestamo cambiarEstadoPrestamo(Long idPrestamo, String nuevoEstado) {
        String usuarioAutenticado = getUsuarioAutenticado();
        Prestamo prestamo = prestamoRepository.findById(idPrestamo)
                .orElseThrow(() -> {
                    ActionLogger.logAction(usuarioAutenticado != null ? usuarioAutenticado : "Sistema",
                            "Intentó cambiar estado de un préstamo no encontrado con ID: " + idPrestamo);
                    return new RuntimeException("Préstamo no encontrado con ID: " + idPrestamo);
                });

        if (!nuevoEstado.equals("ACTIVO") && !nuevoEstado.equals("CANCELADO") && !nuevoEstado.equals("PENDIENTE")) {
            ActionLogger.logAction(usuarioAutenticado != null ? usuarioAutenticado : "Sistema",
                    "Intentó cambiar estado de préstamo con ID: " + idPrestamo + " a un estado no válido: " + nuevoEstado);
            throw new IllegalArgumentException("Estado no válido. Los estados permitidos son 'ACTIVO', 'CANCELADO' o 'PENDIENTE'.");
        }

        prestamo.setEstadoPrestamo(nuevoEstado);
        Prestamo updatedPrestamo = prestamoRepository.save(prestamo);
        ActionLogger.logAction(usuarioAutenticado != null ? usuarioAutenticado : "Sistema",
                "Cambió el estado del préstamo con ID: " + idPrestamo + " a: " + nuevoEstado);
        return updatedPrestamo;
    }

    public Prestamo aprobarPrestamo(Long idPrestamo) {
        String usuarioAutenticado = getUsuarioAutenticado();
        Prestamo prestamo = prestamoRepository.findById(idPrestamo)
                .orElseThrow(() -> {
                    ActionLogger.logAction(usuarioAutenticado != null ? usuarioAutenticado : "Sistema",
                            "Intentó aprobar un préstamo no encontrado con ID: " + idPrestamo);
                    return new RuntimeException("Préstamo no encontrado con ID: " + idPrestamo);
                });

        if (!"PENDIENTE".equals(prestamo.getEstadoPrestamo())) {
            ActionLogger.logAction(usuarioAutenticado != null ? usuarioAutenticado : "Sistema",
                    "Intentó aprobar un préstamo con ID: " + idPrestamo + " que no está en estado PENDIENTE");
            throw new RuntimeException("Solo los préstamos en estado PENDIENTE pueden ser aprobados.");
        }

        prestamo.setEstadoPrestamo("ACTIVO");
        prestamo.setFechaAprobacion(LocalDate.now());
        prestamo = prestamoRepository.save(prestamo);

        generarTablaAmortizacion(prestamo);
        ActionLogger.logAction(usuarioAutenticado != null ? usuarioAutenticado : "Sistema",
                "Aprobó el préstamo con ID: " + idPrestamo + " y generó tabla de amortización");
        return prestamo;
    }

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

    private List<Cuota> calcularCuotasFrances(Prestamo prestamo) {
        List<Cuota> cuotas = new ArrayList<>();
        double tasaMensual = prestamo.getTasaInteres() / 12 / 100;
        int plazo = prestamo.getPlazoMeses();
        double monto = prestamo.getMontoSolicitado();

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

    public List<Prestamo> obtenerPrestamosPorEstado(String estadoPrestamo) {
        String usuarioAutenticado = getUsuarioAutenticado();
        List<Prestamo> prestamos = prestamoRepository.findByEstadoPrestamo(estadoPrestamo);
        ActionLogger.logAction(usuarioAutenticado != null ? usuarioAutenticado : "Sistema",
                "Consultó préstamos con estado: " + estadoPrestamo);
        return prestamos;
    }

    public List<Map<String, String>> obtenerUsuariosConPrestamos() {
        String usuarioAutenticado = getUsuarioAutenticado();
        List<Usuario> usuarios = prestamoRepository.obtenerUsuariosConPrestamos();

        List<Map<String, String>> resultado = usuarios.stream().map(usuario -> {
            Map<String, String> datos = new HashMap<>();
            datos.put("nombreCompleto", usuario.getNombre() + " " + usuario.getApellido());
            datos.put("cedula", usuario.getCedula());
            datos.put("direccion", usuario.getDireccion());
            datos.put("correo", usuario.getCorreo());
            datos.put("cuentaBloqueada", usuario.getCuentaBloqueada() ? "Sí" : "No");
            return datos;
        }).collect(Collectors.toList());

        ActionLogger.logAction(usuarioAutenticado != null ? usuarioAutenticado : "Sistema",
                "Consultó la lista de usuarios con préstamos");
        return resultado;
    }
}