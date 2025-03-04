import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/prestamos.css";

const Prestamos = () => {
  const [prestamos, setPrestamos] = useState([]);
  const [error, setError] = useState(""); // Estado para manejar errores
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const usuarioEmail = localStorage.getItem("correo"); // 📌 Obtener el correo del localStorage

  useEffect(() => {
    if (!token || !usuarioEmail) {
      navigate("/auth/login");
      return;
    }
    fetchPrestamos();
  }, [usuarioEmail]); // Ejecutar la carga cuando el correo esté disponible

  // 📌 Obtener los préstamos del usuario por correo
  const fetchPrestamos = async () => {
    try {
      setError(""); // Resetear errores previos

      const response = await fetch(
        `http://localhost:8080/api/prestamos/usuario/correo/${usuarioEmail}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al obtener los préstamos.");
      }

      const data = await response.json();
      setPrestamos(data);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="container-fluid">
      <h1 className="text-center">Mis Préstamos</h1>
      <p className="text-center">Aquí puedes visualizar los préstamos que has solicitado.</p>

      {/* Mostrar mensaje de error si ocurre */}
      {error && <p className="alert alert-danger text-center">{error}</p>}

      {/* Botón para solicitar un nuevo préstamo */}
      <div className="d-flex justify-content-center mb-4">
        <button
          className="btn btn-success btn-lg"
          onClick={() => navigate("/user/prestamo/nuevo")}
        >
          Solicitar Préstamo
        </button>
      </div>

      {/* Tabla de préstamos */}
      <div className="table-responsive">
        <table className="table table-striped table-bordered">
          <thead className="table-dark text-center">
            <tr>
              <th>ID</th>
              <th>Monto Solicitado</th>
              <th>Monto Total</th>
              <th>Plazo (Meses)</th>
              <th>Tasa de Interés</th>
              <th>Estado</th>
              <th>Fecha de Solicitud</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {prestamos.length > 0 ? (
              prestamos.map((prestamo) => (
                <tr key={prestamo.idPrestamo}>
                  <td className="text-center">{prestamo.idPrestamo}</td>
                  <td className="text-center">${prestamo.montoSolicitado.toFixed(2)}</td>
                  <td className="text-center">
                    {prestamo.montoTotal ? `$${prestamo.montoTotal.toFixed(2)}` : "N/A"}
                  </td>
                  <td className="text-center">{prestamo.plazoMeses} meses</td>
                  <td className="text-center">{prestamo.tasaInteres}%</td>
                  <td
                    className={`text-center fw-bold ${
                      prestamo.estadoPrestamo === "ACTIVO"
                        ? "text-success"
                        : prestamo.estadoPrestamo === "PENDIENTE"
                        ? "text-warning"
                        : prestamo.estadoPrestamo === "FINALIZADO"
                        ? "text-primary"
                        : "text-danger"
                    }`}
                  >
                    {prestamo.estadoPrestamo}
                  </td>
                  <td className="text-center">
                    {/* Validar si `fechaSolicitud` es válida */}
                    {prestamo.fechaSolicitud
                      ? new Date(prestamo.fechaSolicitud).toLocaleDateString()
                      : "N/A"}
                  </td>

                  {/* Botón para ver la tabla de amortización */}
                  <td className="text-center">
                    {prestamo.estadoPrestamo === "ACTIVO" && (
                      <button
                        className="btn btn-info btn-sm"
                        onClick={() => navigate(`/user/amortizacion/${prestamo.idPrestamo}`)}
                      >
                        Ver Amortización
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center">No tienes préstamos registrados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Prestamos;
