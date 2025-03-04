import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/prestamoespecifico.css";

const PrestamoEspecifico = () => {
  const [montoSolicitado, setMontoSolicitado] = useState("");
  const [plazoMeses, setPlazoMeses] = useState("6");
  const [tipoPago, setTipoPago] = useState("FRANCES");
  const [detallePrestamo, setDetallePrestamo] = useState(null);
  const [idPrestamo, setIdPrestamo] = useState(null);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const tasaInteresAnual = 15.6; // % anual

  const crearPrestamo = async () => {
    setError("");

    if (!montoSolicitado) {
      setError("Por favor, ingresa el monto solicitado.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/prestamos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          montoSolicitado: parseFloat(montoSolicitado),
          plazoMeses: parseInt(plazoMeses, 10),
          tipoPago,
          tasaInteres: tasaInteresAnual,
          estadoPrestamo: "PENDIENTE",
          usuario: {
            idUsuario: localStorage.getItem("idUsuario"),
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al registrar el préstamo.");
      }

      const data = await response.json();
      setIdPrestamo(data.idPrestamo);
      setDetallePrestamo({
        montoSolicitado: data.montoSolicitado,
        plazoMeses: data.plazoMeses,
        tasaInteres: data.tasaInteres,
        montoTotal: data.montoTotal.toFixed(2),
        montoPendiente: data.montoPendiente.toFixed(2),
      });

      // ✅ Guardar ID en localStorage
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

        <div className="mb-3">
          <label className="form-label">¿Cómo quieres pagar los intereses?</label>
          <div className="d-flex gap-3">
            <button
              className={`btn ${tipoPago === "FRANCES" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setTipoPago("FRANCES")}
            >
              Método Francés
            </button>
            <button
              className={`btn ${tipoPago === "ALEMAN" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setTipoPago("ALEMAN")}
            >
              Método Alemán
            </button>
          </div>
        </div>

        <button className="btn btn-success w-100" onClick={crearPrestamo}>
          Solicitar Préstamo
        </button>
      </div>

      {detallePrestamo && (
        <div className="resultado">
          <h2 className="text-center">Detalle del Préstamo</h2>
          <p className="detalle">Monto Solicitado: <strong>${detallePrestamo.montoSolicitado}</strong></p>
          <p className="detalle">Plazo: <strong>{detallePrestamo.plazoMeses} meses</strong></p>
          <p className="detalle">Tasa de Interés: <strong>{detallePrestamo.tasaInteres}%</strong></p>
          <p className="detalle">Monto Total: <strong>${detallePrestamo.montoTotal}</strong></p>
          <p className="detalle">Monto Pendiente: <strong>${detallePrestamo.montoPendiente}</strong></p>

          {/* ✅ Enlace solo disponible si el idPrestamo existe */}
          <div className="text-center mt-3">
            <button
              className="btn btn-link text-primary fw-bold"
              onClick={() => navigate(`/user/amortizacion/${idPrestamo}`)}
              disabled={!idPrestamo}
            >
              Visualizar Tabla de Amortización
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrestamoEspecifico;