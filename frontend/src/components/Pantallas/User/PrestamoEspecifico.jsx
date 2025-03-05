import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/prestamoespecifico.css";

const PrestamoEspecifico = () => {
  const [montoSolicitado, setMontoSolicitado] = useState("");
  const [plazoMeses, setPlazoMeses] = useState("6");
  const [tipoPago, setTipoPago] = useState("FRANCES");
  const [ingresos, setIngresos] = useState("");
  const [historialCred] = useState(Math.floor(Math.random() * (1000 - 800 + 1)) + 800); // Simulación de historial crediticio
  const [detallePrestamo, setDetallePrestamo] = useState(null);
  const [idPrestamo, setIdPrestamo] = useState(null);
  const [error, setError] = useState("");
  const [loadingFinanzas, setLoadingFinanzas] = useState(false); // Estado de carga de Finanzas

  const navigate = useNavigate();
  const tasaInteresAnual = 10.5; // Tasa de interés referencial
  const usuarioCorreo = localStorage.getItem("correo");

  // ✅ Función para obtener idUsuario
  const obtenerIdUsuario = async () => {
    const idUsuarioGuardado = localStorage.getItem("idUsuario");
    if (idUsuarioGuardado) return idUsuarioGuardado;

    try {
      const response = await fetch(`http://localhost:8080/api/usuarios/${usuarioCorreo}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("No se pudo obtener el ID del usuario.");
      }

      const data = await response.json();
      localStorage.setItem("idUsuario", data.idUsuario);
      return data.idUsuario;
    } catch (error) {
      setError(error.message);
      return null;
    }
  };

  // ✅ Función para actualizar ingresos e historial crediticio en el backend
  const actualizarFinanzas = async () => {
    if (!ingresos || ingresos <= 0) {
      setError("Por favor, ingrese sus ingresos antes de continuar.");
      return;
    }

    setLoadingFinanzas(true);
    setError("");

    try {
      const response = await fetch(`http://localhost:8080/api/usuarios/${usuarioCorreo}/actualizar-finanzas`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ ingresos: parseFloat(ingresos), historialCred }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar finanzas.");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoadingFinanzas(false);
    }
  };

  // ✅ Simulación del cálculo sin almacenarlo en la BD (copia de la lógica del backend)
  const calcularPrestamo = () => {
    setError("");
    setDetallePrestamo(null);

    if (!montoSolicitado || montoSolicitado < 300) {
      setError("El monto mínimo solicitado debe ser de $300.");
      return;
    }

    const tasaMensual = tasaInteresAnual / 12 / 100;
    let montoTotal = 0;
    let cuotaMensual = 0;

    if (tipoPago === "FRANCES") {
      cuotaMensual = (montoSolicitado * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -plazoMeses));
      montoTotal = cuotaMensual * plazoMeses;
    } else {
      let saldoPendiente = montoSolicitado;
      const capitalMensual = montoSolicitado / plazoMeses;
      montoTotal = 0;

      for (let i = 1; i <= plazoMeses; i++) {
        const interesMensual = saldoPendiente * tasaMensual;
        const cuotaMensualActual = capitalMensual + interesMensual;
        montoTotal += cuotaMensualActual;
        saldoPendiente -= capitalMensual;
      }

      cuotaMensual = montoTotal / plazoMeses;
    }

    setDetallePrestamo({
      montoSolicitado,
      plazoMeses,
      tasaInteres: tasaInteresAnual,
      montoTotalCuota: cuotaMensual.toFixed(2),
      montoTotal: montoTotal.toFixed(2),
    });
  };

  // ✅ Enviar solicitud de préstamo solo si el usuario está de acuerdo con los cálculos
  const crearPrestamo = async () => {
    setError("");

    if (!detallePrestamo) {
      setError("Debes calcular el préstamo antes de solicitarlo.");
      return;
    }

    const idUsuario = await obtenerIdUsuario(); // 🔹 Obtener idUsuario
    console.log("ID del Usuario:", idUsuario);
    
    if (!idUsuario) {
      setError("Error al obtener la información del usuario.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/prestamos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          montoSolicitado: parseFloat(montoSolicitado),
          plazoMeses: parseInt(plazoMeses, 10),
          tipoPago,
          tasaInteres: tasaInteresAnual,
          estadoPrestamo: "PENDIENTE",
          usuario: { idUsuario },
        }),
      });

      if (!response.ok) {
        throw new Error("Error al registrar el préstamo.");
      }

      const data = await response.json();
      setIdPrestamo(data.idPrestamo);
      localStorage.setItem("idPrestamo", data.idPrestamo);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="container-fluid">
      <div className="formulario">
        <h2 className="text-center">Solicitar Préstamo</h2>

        {error && <p className="alert alert-danger text-center">{error}</p>}

        {/* 📌 Ingresos del usuario */}
        <div className="mb-3">
          <label className="form-label">Ingresos Mensuales</label>
          <input
            type="number"
            className="form-control"
            value={ingresos}
            onChange={(e) => setIngresos(e.target.value)}
            min="100"
            required
          />
        </div>

        {/* 📌 Historial Crediticio (Solo lectura) */}
        <div className="mb-3">
          <label className="form-label">Historial Crediticio</label>
          <input type="text" className="form-control" value={historialCred} disabled />
        </div>

        {/* 📌 Botón para actualizar Finanzas */}
        <button className="btn btn-warning w-100" onClick={actualizarFinanzas} disabled={loadingFinanzas}>
          {loadingFinanzas ? "Actualizando..." : "Actualizar Finanzas"}
        </button>

        <hr />

        {/* 📌 Monto Solicitado */}
        <div className="mb-3">
          <label className="form-label">¿Cuánto dinero necesitas?</label>
          <input
            type="number"
            className="form-control"
            value={montoSolicitado}
            onChange={(e) => setMontoSolicitado(e.target.value)}
            min="300"
            required
          />
        </div>

        {/* 📌 Plazo en meses */}
        <div className="mb-3">
          <label className="form-label">¿En cuánto tiempo quieres pagarlo?</label>
          <select className="form-select" value={plazoMeses} onChange={(e) => setPlazoMeses(e.target.value)}>
            <option value="3">3 meses</option>
            <option value="6">6 meses</option>
            <option value="9">9 meses</option>
            <option value="12">12 meses</option>
            <option value="24">24 meses</option>
          </select>
        </div>

        {/* 📌 Botón Calcular Préstamo */}
        <button className="btn btn-info w-100" onClick={calcularPrestamo}>
          Calcular Préstamo
        </button>

        {/* 📌 Mostrar detalles del préstamo si ya se calculó */}
        {detallePrestamo && (
          <div className="resultado mt-3 p-3 border rounded">
            <h2 className="text-center">Detalle del Préstamo</h2>
            <p className="detalle">Monto Solicitado: <strong>${detallePrestamo.montoSolicitado}</strong></p>
            <p className="detalle">Plazo: <strong>{detallePrestamo.plazoMeses} meses</strong></p>
            <p className="detalle">Tasa de Interés: <strong>{detallePrestamo.tasaInteres}%</strong></p>
            <p className="detalle">Monto Total: <strong>${detallePrestamo.montoTotal}</strong></p>
            <p className="detalle">Cuota Mensual Aproximada: <strong>${detallePrestamo.montoTotalCuota}</strong></p>
          </div>
        )}

        {/* 📌 Botón Solicitar Préstamo */}
        <button className="btn btn-success w-100 mt-3" onClick={crearPrestamo} disabled={!detallePrestamo}>
          Solicitar Préstamo
        </button>
      </div>
    </div>
  );
};

export default PrestamoEspecifico;
