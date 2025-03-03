import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/prestamoespecifico.css"; // Importamos los estilos

const PrestamoEspecifico = () => {
  const [ingresos, setIngresos] = useState("");
  const [montoSolicitado, setMontoSolicitado] = useState("");
  const [plazoMeses, setPlazoMeses] = useState("6");
  const [tipoPago, setTipoPago] = useState("FRANCES");
  const [detallePrestamo, setDetallePrestamo] = useState(null);

  const navigate = useNavigate();

  // Tasa de interés fija (podría obtenerse del backend)
  const tasaInteresAnual = 15.6; // % anual

  const calcularPrestamo = () => {
    if (!montoSolicitado || !ingresos) {
      alert("Por favor, ingresa todos los datos.");
      return;
    }

    const tasaMensual = tasaInteresAnual / 12 / 100;
    const monto = parseFloat(montoSolicitado);
    const meses = parseInt(plazoMeses, 10);

    let cuotaMensual = 0;
    let totalInteres = 0;
    let totalPagar = 0;

    if (tipoPago === "FRANCES") {
      // Fórmula de cuota fija (sistema Francés)
      cuotaMensual = (monto * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -meses));
      totalPagar = cuotaMensual * meses;
      totalInteres = totalPagar - monto;
    } else {
      // Sistema Alemán (cuotas decrecientes)
      totalInteres = monto * tasaMensual * meses;
      totalPagar = monto + totalInteres;
      cuotaMensual = totalPagar / meses;
    }

    setDetallePrestamo({
      cuotaMensual: cuotaMensual.toFixed(2),
      totalInteres: totalInteres.toFixed(2),
      totalPagar: totalPagar.toFixed(2),
      capital: monto.toFixed(2),
      tasaInteresAnual,
      plazoMeses,
    });
  };

  return (
    <div className="container-fluid">
      {/* Formulario */}
      <div className="formulario">
        <h2 className="text-center">Simula tu Préstamo</h2>

        <div className="mb-3">
          <label className="form-label">Ingresos Mensuales</label>
          <input
            type="number"
            className="form-control"
            value={ingresos}
            onChange={(e) => setIngresos(e.target.value)}
            min="300"
            required
          />
        </div>

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

        <button className="btn btn-success w-100" onClick={calcularPrestamo}>
          Calcular
        </button>
      </div>

      {/* Resultado de la simulación */}
      {detallePrestamo && (
        <div className="resultado">
          <h2 className="text-center">Detalle del Préstamo</h2>
          <p className="detalle">Cuota Mensual: <strong>${detallePrestamo.cuotaMensual}</strong></p>
          <p className="detalle">Plazo: <strong>{detallePrestamo.plazoMeses} meses</strong></p>
          <p className="detalle">Capital: <strong>${detallePrestamo.capital}</strong></p>
          <p className="detalle">Total de Intereses: <strong>${detallePrestamo.totalInteres}</strong></p>
          <p className="detalle">Total a Pagar: <strong>${detallePrestamo.totalPagar}</strong></p>
          <p className="text-muted">Valores referenciales, no representan una oferta formal de préstamo.</p>
        </div>
      )}
    </div>
  );
};

export default PrestamoEspecifico;
