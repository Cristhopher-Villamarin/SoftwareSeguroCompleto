import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

const Amortizacion = () => {
  const [cuotas, setCuotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cuotaSeleccionada, setCuotaSeleccionada] = useState(null);
  const [montoPendiente, setMontoPendiente] = useState(null);

  // ✅ Decodificar el token para obtener el correo del usuario
  const obtenerCorreoDesdeToken = () => {
    const token = localStorage.getItem("token");
    try {
      if (!token) throw new Error("No hay token disponible.");
      const decodedToken = jwtDecode(token);
      if (!decodedToken.sub) throw new Error("El token no contiene el campo 'sub'.");
      return decodedToken.sub; // El correo está en "sub"
    } catch (error) {
      setError("Error al decodificar el token: " + error.message);
      return null;
    }
  };

  // ✅ Obtener las cuotas y el monto pendiente del préstamo activo
  useEffect(() => {
    const fetchData = async () => {
      const correo = obtenerCorreoDesdeToken();
      if (!correo) {
        setLoading(false);
        return;
      }

      try {
        // Obtener los préstamos del usuario
        const prestamoResponse = await fetch(
          `http://localhost:8080/api/prestamos/usuario/correo/${correo}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!prestamoResponse.ok) {
          throw new Error("No se pudo obtener los datos del préstamo.");
        }

        const prestamosData = await prestamoResponse.json();
        if (prestamosData.length === 0) {
          throw new Error("No se encontraron préstamos para este usuario.");
        }

        // Buscar el préstamo con estado "ACTIVO"
        const prestamoActivo = prestamosData.find(
          (p) => p.estadoPrestamo === "ACTIVO"
        );
        if (!prestamoActivo) {
          throw new Error("No tienes un préstamo activo actualmente.");
        }

        // Establecer el monto pendiente del préstamo activo
        setMontoPendiente(prestamoActivo.montoPendiente);

        // Obtener las cuotas del préstamo activo
        const cuotasResponse = await fetch(
          `http://localhost:8080/api/cuotas/prestamo/${prestamoActivo.idPrestamo}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!cuotasResponse.ok) {
          throw new Error("No se pudo obtener las cuotas.");
        }

        const cuotasData = await cuotasResponse.json();
        setCuotas(cuotasData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // No depende de idPrestamoParam, ya que buscamos el activo

  // ✅ Función para pagar una cuota
  const pagarCuota = async (idCuota) => {
    setError("");
    try {
      const response = await fetch(`http://localhost:8080/api/cuotas/${idCuota}/pagar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al pagar la cuota.");
      }

      // Actualizar la tabla marcando la cuota como pagada
      setCuotas((prevCuotas) =>
        prevCuotas.map((cuota) =>
          cuota.idCuota === idCuota
            ? { ...cuota, estado: "Pagada", fechaPago: new Date().toISOString().split("T")[0] }
            : cuota
        )
      );

      // Actualizar el monto pendiente restando el monto de la cuota pagada
      const cuotaPagada = cuotas.find((c) => c.idCuota === idCuota);
      if (cuotaPagada) {
        setMontoPendiente((prev) => Math.max(0, prev - cuotaPagada.montoTotalCuota));
      }

      setCuotaSeleccionada(null);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center">Tabla de Amortización</h2>

      {error && <p className="alert alert-danger text-center">{error}</p>}

      {loading ? (
        <h3 className="text-center">Cargando...</h3>
      ) : (
        <>
          {/* Mostrar el saldo pendiente */}
          {montoPendiente !== null && (
            <div className="text-center mb-3">
              <h5>
                Saldo Pendiente:{" "}
                <span className="fw-bold text-danger">${montoPendiente.toFixed(2)}</span>
              </h5>
            </div>
          )}

          <table className="table table-bordered mt-3">
            <thead className="table-dark">
              <tr>
                <th>Cuota</th>
                <th>Fecha de Pago</th>
                <th>Capital</th>
                <th>Interés</th>
                <th>Valor de la Cuota</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {cuotas.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">No hay cuotas registradas</td>
                </tr>
              ) : (
                cuotas.map((cuota, index) => (
                  <tr key={index}>
                    <td>{cuota.numeroCuota}</td>
                    <td>{cuota.fechaPago || "Pendiente"}</td>
                    <td>${cuota.capitalCuota.toFixed(2)}</td>
                    <td>${cuota.interesCuota.toFixed(2)}</td>
                    <td>${cuota.montoTotalCuota.toFixed(2)}</td>
                    <td>
                      <span
                        className={`badge ${
                          cuota.estado === "Pagada"
                            ? "bg-success"
                            : cuota.estado === "Mora"
                            ? "bg-danger"
                            : "bg-warning"
                        }`}
                      >
                        {cuota.estado}
                      </span>
                    </td>
                    <td>
                      {cuota.estado === "Pendiente" && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => setCuotaSeleccionada(cuota)}
                        >
                          Pagar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </>
      )}

      {/* Modal de Confirmación */}
      {cuotaSeleccionada && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h4>¿Deseas pagar esta cuota?</h4>
            <p>
              Cuota #{cuotaSeleccionada.numeroCuota} - Monto: $
              {cuotaSeleccionada.montoTotalCuota.toFixed(2)}
            </p>
            <button
              className="btn btn-success"
              onClick={() => pagarCuota(cuotaSeleccionada.idCuota)}
            >
              Confirmar
            </button>
            <button className="btn btn-secondary" onClick={() => setCuotaSeleccionada(null)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Amortizacion;