import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/prestamos.css";

const Prestamos = () => {
  const [prestamos, setPrestamos] = useState([]); // Estado para almacenar los préstamos
  const navigate = useNavigate();
  const usuarioCedula = localStorage.getItem("cedula"); // Obtener la cédula del usuario almacenada

  // Función para obtener los préstamos del usuario desde el backend
  const fetchPrestamos = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/prestamos/usuario/${usuarioCedula}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`, // Token de autenticación
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener los préstamos.");
      }

      const data = await response.json();
      setPrestamos(data);
    } catch (error) {
      console.error("Error al cargar los préstamos:", error);
    }
  };

  // Cargar los préstamos al montar el componente
  useEffect(() => {
    fetchPrestamos();
  }, []);

  return (
    <div className="container-fuild">
      <h1 className="text-center">Mis Préstamos</h1>
      <p className="text-center">Aquí puedes visualizar los préstamos que has solicitado.</p>

      {/* Botón para solicitar un nuevo préstamo */}
      <div className="d-flex justify-content-center mb-4">
        <button className="btn btn-success btn-lg" onClick={() => navigate("/user/prestamo/nuevo")}>
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
            </tr>
          </thead>
          <tbody>
            {prestamos.length > 0 ? (
              prestamos.map((prestamo) => (
                <tr key={prestamo.idPrestamo}>
                  <td className="text-center">{prestamo.idPrestamo}</td>
                  <td className="text-center">${prestamo.montoSolicitado.toFixed(2)}</td>
                  <td className="text-center">${prestamo.montoTotal ? prestamo.montoTotal.toFixed(2) : "N/A"}</td>
                  <td className="text-center">{prestamo.plazoMeses} meses</td>
                  <td className="text-center">{prestamo.tasaInteres}%</td>
                  <td className={`text-center ${prestamo.estadoPrestamo === "ACTIVO" ? "text-success fw-bold" : prestamo.estadoPrestamo === "PENDIENTE" ? "text-warning fw-bold" : "text-danger fw-bold"}`}>
                    {prestamo.estadoPrestamo}
                  </td>
                  <td className="text-center">{new Date(prestamo.fechaSolicitud).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">No tienes préstamos registrados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Prestamos;
