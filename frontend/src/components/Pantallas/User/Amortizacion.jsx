import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const Amortizacion = () => {
  const { idPrestamo } = useParams();
  const [cuotas, setCuotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cuotaSeleccionada, setCuotaSeleccionada] = useState(null);
  const [montoPendiente, setMontoPendiente] = useState(null); // 🔥 Nuevo estado para el saldo pendiente

  useEffect(() => {
    const obtenerCuotas = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/cuotas/prestamo/${idPrestamo}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        });

        if (!response.ok) {
          throw new Error("No se pudo obtener las cuotas.");
        }

        const data = await response.json();
        setCuotas(data);

        // 🔥 Obtener el monto pendiente del préstamo desde la primera cuota
        if (data.length > 0) {
          setMontoPendiente(data[0].prestamo.montoPendiente);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    obtenerCuotas();
  }, [idPrestamo]);

  // ✅ Función para pagar una cuota
  const pagarCuota = async (idCuota) => {
    setError("");
    try {
      const response = await fetch(`http://localhost:8080/api/cuotas/${idCuota}/pagar`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al pagar la cuota.");
      }

      // ✅ Actualizar la tabla marcando la cuota como pagada
      setCuotas(cuotas.map(cuota =>
        cuota.idCuota === idCuota ? { ...cuota, estado: "Pagada", fechaPago: new Date().toISOString().split('T')[0] } : cuota
      ));

      // 🔥 Actualizar el saldo pendiente restando el monto de la cuota pagada
      const cuotaPagada = cuotas.find(c => c.idCuota === idCuota);
      if (cuotaPagada) {
        setMontoPendiente(prev => Math.max(0, prev - cuotaPagada.montoTotalCuota));
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
          {/* 🔥 Mostrar el saldo pendiente */}
          {montoPendiente !== null && (
            <div className="text-center mb-3">
              <h5>Saldo Pendiente: <span className="fw-bold text-danger">${montoPendiente.toFixed(2)}</span></h5>
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
                      <span className={`badge ${cuota.estado === "Pagada" ? "bg-success" : cuota.estado === "Mora" ? "bg-danger" : "bg-warning"}`}>
                        {cuota.estado}
                      </span>
                    </td>
                    <td>
                      {cuota.estado === "Pendiente" && (
                        <button className="btn btn-primary btn-sm" onClick={() => setCuotaSeleccionada(cuota)}>
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
            <p>Cuota #{cuotaSeleccionada.numeroCuota} - Monto: ${cuotaSeleccionada.montoTotalCuota.toFixed(2)}</p>
            <button className="btn btn-success" onClick={() => pagarCuota(cuotaSeleccionada.idCuota)}>Confirmar</button>
            <button className="btn btn-secondary" onClick={() => setCuotaSeleccionada(null)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Amortizacion;
