import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import BASE_URLS from "../../../ApiConfig"; // Import the base URLs

const Pagos = () => {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  // ✅ Obtener los pagos del préstamo activo
  useEffect(() => {
    const obtenerPagos = async () => {
      setError("");
      const correo = obtenerCorreoDesdeToken();
      if (!correo) {
        setLoading(false);
        return;
      }

      try {
        // Obtener los préstamos del usuario
        const prestamoResponse = await fetch(
          `${BASE_URLS.PRESTAMOS}/usuario/correo/${correo}`, // Use BASE_URLS.PRESTAMOS
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

        // Obtener las cuotas del préstamo activo
        const cuotasResponse = await fetch(
          `${BASE_URLS.CUOTAS}/prestamo/${prestamoActivo.idPrestamo}`, // Use BASE_URLS.CUOTAS
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!cuotasResponse.ok) {
          throw new Error("No se pudo obtener el historial de pagos.");
        }

        const data = await cuotasResponse.json();

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
              <div
                key={index}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
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