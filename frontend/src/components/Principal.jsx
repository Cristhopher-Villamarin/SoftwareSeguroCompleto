import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css"; // Importamos Bootstrap
// Importamos el CSS adicional

const Principal = () => {
  return (
    <div className="container-fluid d-flex flex-column align-items-center justify-content-center vh-100 bg-success text-white text-center">
      {/* Imagen de portada */}
      <img src="/prestamo.jpg" alt="Sistema de Préstamos" className="img-fluid rounded-circle shadow-lg border border-white mb-4" style={{ width: "250px", height: "250px" }} />


      <h1 className="display-4 fw-bold">Gestión de Préstamos</h1>
      <p className="lead w-75">
        Administra tus préstamos de manera rápida y segura con nuestra plataforma.
      </p>

      <div className="d-flex flex-column gap-3 mt-3">
        <Link to="/auth/login">
          <button className="btn btn-light btn-lg px-5">Iniciar Sesión</button>
        </Link>
        <Link to="/auth/registro">
          <button className="btn btn-dark btn-lg px-5">Registrarse</button>
        </Link>
      </div>
    </div>
  );
};

export default Principal;
