import React, { useEffect, useState } from "react";

const Pagos = () => {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const obtenerPagos = async () => {
      setError("");
      try {
        const response = await fetch(`http://localhost:8080/api/cuotas/prestamo/${localStorage.getItem("idPrestamo")}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        });

        if (!response.ok) {
          throw new Error("No se pudo obtener el historial de pagos.");
        }

        const data = await response.json();

        // Filtrar solo las cuotas pagadas
        const pagosRealizados = data.filter((cuota) => cuota.estado === "Pagada");
        setPagos(pagosRealizados);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    obtenerPagos();
  }, []);

  return (
    <div className="container mt-5">
      <h2 className="text-center">Historial de Pagos</h2>

      {error && <p className="alert alert-danger text-center">{error}</p>}

      {loading ? (
        <h3 className="text-center">Cargando...</h3>
      ) : (
        <div className="list-group">
          {pagos.length > 0 ? (
            pagos.map((pago, index) => (
              <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <h5>Pago de Cuota #{pago.numeroCuota}</h5>
                  <p>{pago.fechaPago ? pago.fechaPago : "Fecha no disponible"}</p>
                </div>
                <span className="badge bg-success">Completado</span>
                <strong>${pago.montoTotalCuota.toFixed(2)}</strong>
              </div>
            ))
          ) : (
            <p className="text-center">No tienes pagos registrados.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Pagos;
