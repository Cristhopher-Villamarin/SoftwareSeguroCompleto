import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaArrowLeft } from "react-icons/fa";
import "../../styles/Login.css"; // Reutilizamos los estilos de Login.css
import BASE_URLS from "../../ApiConfig"; // Import the base URLs

const RecuperarContraseña = () => {
  const [correo, setCorreo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");

    if (!correo) {
      setError("Por favor, ingresa tu correo electrónico.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${BASE_URLS.USUARIOS}/solicitar-recuperacion`, { // Use BASE_URLS.USUARIOS
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo }),
      });

      if (!response.ok) {
        throw new Error("Error al solicitar la recuperación. Verifica tu correo.");
      }

      setMensaje("Si el correo está registrado, recibirás instrucciones en tu bandeja de entrada.");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-fluid p-0">
      {/* Navbar superior */}
      <nav className="navbar navbar-expand-lg" style={{ backgroundColor: "#107a54", padding: "15px" }}>
        <div className="container-fluid">
          <div className="d-flex align-items-center ms-3">
            <img src="/logo.png" alt="Logo" className="me-2" style={{ height: "40px" }} />
            <span className="fs-4 fw-bold text-white">ESPECITO</span>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <div className="vh-100 d-flex align-items-center justify-content-center">
        <div className="col-md-4">
          <div className="card shadow-lg p-4 rounded-3">
            {/* Encabezado con flecha de regreso */}
            <div className="header-container">
              <FaArrowLeft className="back-arrow" onClick={() => navigate("/auth/login")} />
              <h2 className="header-title">Recuperar Contraseña</h2>
            </div>

            <p className="text-center text-muted">
              Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
            </p>

            {mensaje && <div className="alert alert-success text-center">{mensaje}</div>}
            {error && <div className="alert alert-danger text-center">{error}</div>}

            {/* Formulario */}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Correo Electrónico</label>
                <input
                  type="email"
                  className="form-control"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  required
                  placeholder="Ejemplo: usuario@gmail.com"
                />
              </div>

              <button
                type="submit"
                className="btn w-100 btn-custom"
                disabled={isSubmitting}
                style={{ backgroundColor: "#107a54", color: "white" }}
              >
                {isSubmitting ? "Enviando..." : "Enviar Correo de Recuperación"}
              </button>
            </form>

            {/* Botón de volver */}
            <div className="text-center mt-3">
              <p className="mb-0">
                <span
                  className="text-primary fw-bold cursor-pointer"
                  onClick={() => navigate("/auth/login")}
                  style={{ cursor: "pointer" }}
                >
                  Volver al inicio de sesión
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecuperarContraseña;