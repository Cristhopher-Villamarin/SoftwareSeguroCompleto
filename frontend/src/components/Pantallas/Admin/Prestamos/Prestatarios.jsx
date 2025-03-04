import React from "react";
import { useNavigate } from "react-router-dom"; // Importamos useNavigate
import { Link } from "react-router-dom";

const Prestatarios = () => { // 🔹 Nombre del componente en PascalCase
  const navigate = useNavigate(); // Hook de navegación

  return (
    <div className="container-fluid">
      <h1 className="text-center">Prestatarios</h1>
      
      {/* Contenedor para título */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-semibold">Lista de Prestatarios</h3>
      </div>

      {/* Tabla de pagos */}
      <div className="d-flex justify-content-center mt-4">
        <table className="table table-hover text-center">
          <thead style={{ backgroundColor: "#107a54", color: "white" }}>
            <tr>
              <th>ID</th>
              <th>Nombre Completo</th>
              <th>Cedula Cliente</th>
              <th>Direccion</th>
              <th>Email</th>
              <th>Accion</th>
         
            </tr>
          </thead>
          <tbody>
            {/* Aquí se pueden agregar datos dinámicamente */}
            <tr>
              <td colSpan="6" className="py-3 text-danger fw-bold">
                No hay datos de préstamos registrados
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Prestatarios; // 🔹 Exportación corregida
