import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../../../styles/prestamoespecifico.css";

const PrestamoEspecifico = () => {
  const [montoSolicitado, setMontoSolicitado] = useState("");
  const [plazoMeses, setPlazoMeses] = useState("6");
  const [tipoPago, setTipoPago] = useState("FRANCES");
  const [ingresos, setIngresos] = useState("");
  const [historialCred] = useState(Math.floor(Math.random() * (1000 - 800 + 1)) + 800);
  const [detallePrestamo, setDetallePrestamo] = useState(null);
  const [idPrestamo, setIdPrestamo] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loadingFinanzas, setLoadingFinanzas] = useState(false);

  const navigate = useNavigate();
  const tasaInteresAnual = 10.5;
  const token = localStorage.getItem("token");
  const porcentajeMaxCuota = 0.4;

  const obtenerDatosUsuarioDesdeToken = () => {
    try {
      if (!token) throw new Error("No hay token disponible.");
      const decodedToken = jwtDecode(token);
      if (!decodedToken.idUsuario || !decodedToken.sub) {
        throw new Error("El token no contiene idUsuario o sub.");
      }
      return {
        idUsuario: decodedToken.idUsuario,
        correo: decodedToken.sub,
      };
    } catch (error) {
      setError("Error al decodificar el token: " + error.message);
      return null;
    }
  };

  const actualizarFinanzas = async () => {
    if (!ingresos || ingresos <= 0) {
      setError("Por favor, ingrese sus ingresos antes de continuar.");
      return;
    }

    const datosUsuario = obtenerDatosUsuarioDesdeToken();
    if (!datosUsuario) return;

    setLoadingFinanzas(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(`http://localhost:8080/api/usuarios/${datosUsuario.correo}/actualizar-finanzas`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ingresos: parseFloat(ingresos), historialCred }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al actualizar finanzas: ${errorText}`);
      }

      setSuccessMessage("¡Finanzas actualizadas correctamente!");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoadingFinanzas(false);
    }
  };

  const calcularMontoMaximo = () => {
    if (!ingresos || ingresos <= 0) return 0;

    const tasaMensual = tasaInteresAnual / 12 / 100;
    const cuotaMaxima = parseFloat(ingresos) * porcentajeMaxCuota;
    let montoMaximo = 0;

    if (tipoPago === "FRANCES") {
      montoMaximo = (cuotaMaxima * (1 - Math.pow(1 + tasaMensual, -plazoMeses))) / tasaMensual;
    } else if (tipoPago === "ALEMAN") {
      const capitalMensualMax = cuotaMaxima / (1 + tasaMensual * (parseInt(plazoMeses) + 1) / 2);
      montoMaximo = capitalMensualMax * parseInt(plazoMeses);
    }

    return montoMaximo.toFixed(2);
  };

  const calcularPrestamo = () => {
    setError("");
    setSuccessMessage("");
    setDetallePrestamo(null);

    if (!montoSolicitado || montoSolicitado < 300) {
      setError("El monto mínimo solicitado debe ser de $300.");
      return;
    }

    if (!ingresos || ingresos <= 0) {
      setError("Debes ingresar y actualizar tus ingresos antes de calcular el préstamo.");
      return;
    }

    const montoMaximo = calcularMontoMaximo();
    if (parseFloat(montoSolicitado) > montoMaximo) {
      setError(
        `El monto solicitado ($${montoSolicitado}) excede el máximo permitido de $${montoMaximo} según tus ingresos y plazo.`
      );
      return;
    }

    const tasaMensual = tasaInteresAnual / 12 / 100;
    let montoTotal = 0;
    let cuotaMensual = 0;

    if (tipoPago === "FRANCES") {
      cuotaMensual = (montoSolicitado * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -plazoMeses));
      montoTotal = cuotaMensual * plazoMeses;
    } else if (tipoPago === "ALEMAN") {
      const capitalMensual = montoSolicitado / plazoMeses;
      let saldoPendiente = montoSolicitado;
      montoTotal = 0;

      for (let i = 0; i < plazoMeses; i++) {
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

  const crearPrestamo = async () => {
    setError("");
    setSuccessMessage("");

    if (!detallePrestamo) {
      setError("Debes calcular el préstamo antes de solicitarlo.");
      return;
    }

    const datosUsuario = obtenerDatosUsuarioDesdeToken();
    if (!datosUsuario) return;

    try {
      const response = await fetch("http://localhost:8080/api/prestamos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          montoSolicitado: parseFloat(montoSolicitado),
          plazoMeses: parseInt(plazoMeses, 10),
          tipoPago,
          tasaInteres: tasaInteresAnual,
          estadoPrestamo: "PENDIENTE",
          usuario: { idUsuario: datosUsuario.idUsuario },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al registrar el préstamo: ${errorText}`);
      }

      const data = await response.json();
      setIdPrestamo(data.idPrestamo);
      localStorage.setItem("idPrestamo", data.idPrestamo);

      setSuccessMessage(
        `¡Solicitud de préstamo registrada con éxito! ID: ${data.idPrestamo}. Estado: PENDIENTE. Un administrador revisará tu solicitud.`
      );

      setMontoSolicitado("");
      setPlazoMeses("6");
      setTipoPago("FRANCES");
      setDetallePrestamo(null);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row formulario-container">
        <div className="col-md-6 formulario">
          <h2 className="text-center">Solicitar Préstamo</h2>

          {successMessage && (
            <p className="alert alert-success text-center">{successMessage}</p>
          )}

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

          {/* 📌 Historial Crediticio */}
          <div className="mb-3">
            <label className="form-label">Historial Crediticio</label>
            <input type="text" className="form-control" value={historialCred} disabled />
          </div>

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
            {ingresos && (
              <small className="form-text text-muted">
                Monto máximo permitido: ${calcularMontoMaximo()}
              </small>
            )}
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

          {/* 📌 Tipo de amortización */}
          <div className="mb-3">
            <label className="form-label">Tipo de Amortización</label>
            <select className="form-select" value={tipoPago} onChange={(e) => setTipoPago(e.target.value)}>
              <option value="FRANCES">Francés (Cuotas constantes)</option>
              <option value="ALEMAN">Alemán (Capital constante)</option>
            </select>
          </div>

          {/* 📌 Botón Calcular Préstamo */}
          <button className="btn btn-info w-100" onClick={calcularPrestamo}>
            Calcular Préstamo
          </button>

          {/* 📌 Botón Solicitar Préstamo */}
          <button className="btn btn-success w-100 mt-3" onClick={crearPrestamo} disabled={!detallePrestamo}>
            Solicitar Préstamo
          </button>
        </div>

        {/* 📌 Previsualización del préstamo */}
        <div className="col-md-6 resultado-container">
          {detallePrestamo && (
            <div className="resultado p-3 border rounded">
              <h2 className="text-center">Detalle del Préstamo</h2>
              <p className="detalle">Monto Solicitado: <strong>${detallePrestamo.montoSolicitado}</strong></p>
              <p className="detalle">Plazo: <strong>{detallePrestamo.plazoMeses} meses</strong></p>
              <p className="detalle">Tasa de Interés: <strong>{detallePrestamo.tasaInteres}%</strong></p>
              <p className="detalle">Monto Total: <strong>${detallePrestamo.montoTotal}</strong></p>
              <p className="detalle">Cuota Mensual Aproximada: <strong>${detallePrestamo.montoTotalCuota}</strong></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrestamoEspecifico;