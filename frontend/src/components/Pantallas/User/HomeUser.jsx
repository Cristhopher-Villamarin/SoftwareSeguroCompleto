import React from "react";
import "../../styles/homeuser.css"; // Importamos los estilos
const HomeUser = () => {
  return (
    <div className="container mt-5">
      <h1 className="text-center">Bienvenido al Sistema de Préstamos</h1>
      <p className="text-center">Solicita tu préstamo de manera rápida y segura.</p>
      <div className="d-flex justify-content-center mt-4">
        <button className="btn btn-success btn-lg">Solicitar Préstamo</button>
      </div>
    </div>
  );
};

export default HomeUser;
