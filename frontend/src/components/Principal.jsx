import { Link } from "react-router-dom";
import { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // Importamos Bootstrap
import { FaMoneyCheckAlt, FaUsers, FaCreditCard } from "react-icons/fa";

const Principal = () => {

 // 📌 Limpiar el localStorage cuando el usuario entra al login
  useEffect(() => {
    localStorage.removeItem("token"); // Eliminar el token
  }, []);

  return (
    <div className="container-fluid p-0">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg" style={{ backgroundColor: "#107a54", padding: "15px" }}>
        <div className="container-fluid">
          {/* Logo + Nombre ESPECITO bien a la izquierda */}
          <div className="d-flex align-items-center ms-3">
            <img src="/logo.png" alt="Logo" className="me-2" style={{ height: "40px" }} />
            <span className="fs-4 fw-bold text-white">ESPECITO</span>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <div className="container-fluid vh-100 d-flex align-items-center justify-content-between px-5">
        {/* Sección de texto */}
        <div className="col-md-6 text-start pb-5"> {/* Añadido pb-5 para más padding en la parte inferior */}
          <h1 className="display-3 fw-bold text-black">Gestión de Préstamos</h1>
          <p className="fs-4 fw-semibold" style={{ color: "#107a54" }}>
            Administra tus préstamos de manera rápida y segura con nuestra plataforma.
          </p>
          <p className="fs-5 text-secondary">
            Accede a financiamiento en pocos clics y lleva el control de tus préstamos con total transparencia.
          </p>

          {/* Botones */}
          <div className="d-flex gap-3 mt-4">
            <Link to="/auth/login">
              <button className="btn btn-lg px-5" style={{ backgroundColor: "#107a54", color: "white", fontWeight: "bold" }}>
                Iniciar Sesión
              </button>
            </Link>
            <Link to="/auth/registro">
              <button className="btn btn-lg px-5" style={{ backgroundColor: "#107a54", color: "white", fontWeight: "bold" }}>
                Registrarse
              </button>
            </Link>
          </div>
        </div>

        {/* Imagen grande a la derecha */}
        <div className="col-md-6 d-flex justify-content-center">
          <img src="/ingreso.png" alt="Ingreso financiero" className="img-fluid" style={{ maxWidth: "800px", height: "auto" }} />
        </div>
      </div> 

      {/* Sección de Tarjetas */}
      <div className="container mt-5"> {/* Ajusta mt-5 según sea necesario */}
        <div className="row justify-content-center align-items-center gx-5">
          {/* Tarjeta 1: Gestión de Préstamos */}
          <div className="col-md-4">
            <div className="card p-4 text-center shadow-lg hover-card">
              <FaMoneyCheckAlt className="icono-card" />
              <h4 className="fw-bold">Gestión de Préstamos</h4>
              <p>Simula tu crédito, configura montos y visualiza pagos futuros.</p>
            </div>
          </div>

          {/* Tarjeta 2: Gestión de Clientes */}
          <div className="col-md-4">
            <div className="card p-4 text-center shadow-lg hover-card">
              <FaUsers className="icono-card" />
              <h4 className="fw-bold">Gestión de Clientes</h4>
              <p>Consulta perfiles de clientes, evalúa su historial crediticio y aprueba préstamos.</p>
            </div>
          </div>

          {/* Tarjeta 3: Gestión de Pagos */}
          <div className="col-md-4">
            <div className="card p-4 text-center shadow-lg hover-card">
              <FaCreditCard className="icono-card" />
              <h4 className="fw-bold">Gestión de Pagos</h4>
              <p>Automatiza pagos, recibe recordatorios y accede a reportes detallados.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos en CSS */}
      <style>
        {`
          .hover-card {
            border: 1px solid #ddd;
            transition: all 0.3s ease;
            width: 100%;
            max-width: 350px;
            height: 220px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }

          .hover-card:hover {
            background-color: #107a54;
            color: white;
            cursor: pointer;
            transform: translateY(-5px);
          }

          .icono-card {
            font-size: 2rem;
            color: #107a54;
            margin-bottom: 10px;
          }

          .hover-card:hover .icono-card {
            color: white;
          }
        `}
      </style>
    </div>
  );
};

export default Principal;