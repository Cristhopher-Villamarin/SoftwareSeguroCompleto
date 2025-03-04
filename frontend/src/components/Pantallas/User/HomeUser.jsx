import React from "react";
import { useNavigate } from "react-router-dom"; // Importamos useNavigate
import "../../../styles/homeuser.css"; // Importamos los estilos

const HomeUser = () => {
  const navigate = useNavigate(); // Hook de navegación

  return (
    <div className="container-fluid">
      <h1 className="text-center">Bienvenido al Sistema de Préstamos</h1>
      <p className="text-center">Solicita tu préstamo de manera rápida y segura.</p>
      <div className="d-flex justify-content-center mt-4">
        <button className="btn btn-success btn-lg" onClick={() => navigate("/user/prestamos")}>
          Solicitar Préstamo
        </button>
      </div>
    </div>
  );
};

export default HomeUser;
