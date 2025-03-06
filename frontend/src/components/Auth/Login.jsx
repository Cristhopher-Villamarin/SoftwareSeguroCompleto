import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import DOMPurify from "dompurify";
import { jwtDecode } from "jwt-decode";
import "../../styles/Login.css";
import BASE_URLS from "../../ApiConfig"; // Import the base URLs

const Login = ({ setIsAuthenticated }) => {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("token");
  }, []);

  const sanitizeInput = (input) => DOMPurify.sanitize(input.trim());

  const formatBlockedMessage = (message) => {
    const dateMatch = message.match(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+)/);
    if (dateMatch) {
      const date = new Date(dateMatch[0]);
      const formattedDate = date.toLocaleString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      return `Cuenta bloqueada. Intente nuevamente después del ${formattedDate}`;
    }
    return message;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!correo || !contrasena) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${BASE_URLS.USUARIOS}/login`, { // Use BASE_URLS.USUARIOS
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correo: sanitizeInput(correo),
          contrasena: sanitizeInput(contrasena),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        const errorMessage = data?.error || "Error en el inicio de sesión.";
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const token = data.token;

      localStorage.setItem("token", token);
      setIsAuthenticated(true);

      const decodedToken = jwtDecode(token);
      const rol = decodedToken.rol;

      navigate(rol === "USUARIO" ? "/user/home" : "/admin/dashboard");
    } catch (err) {
      setError(formatBlockedMessage(err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
              <FaArrowLeft className="back-arrow" onClick={() => navigate("/")} />
              <h2 className="header-title">Inicio de Sesión</h2>
            </div>

            <p className="text-center text-muted">Ingrese sus credenciales para acceder</p>

            {error && <p className="alert alert-danger text-center">{error}</p>}

            {/* Formulario de Login */}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Correo Electrónico</label>
                <input
                  type="email"
                  className="form-control"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  required
                  placeholder="Ingrese su correo"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Contraseña</label>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    required
                    placeholder="Ingrese su contraseña"
                    style={{ paddingRight: "2.5rem" }}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={togglePasswordVisibility}
                    style={{ borderLeft: "none" }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn w-100 btn-custom" disabled={isSubmitting}>
                {isSubmitting ? "Iniciando sesión..." : "INICIAR SESIÓN"}
              </button>
            </form>

            {/* Enlace de Recuperación de Contraseña */}
            <div className="text-center mt-3">
              <p className="mb-0">
                <span
                  className="text-primary fw-bold cursor-pointer"
                  onClick={() => navigate("/auth/recuperar")}
                  style={{ cursor: "pointer" }}
                >
                  ¿Olvidaste tu contraseña?
                </span>
              </p>
            </div>

            {/* Enlace de Registro */}
            <div className="text-center mt-3">
              <p className="mb-0">
                ¿No tienes una cuenta?{" "}
                <span
                  className="text-success fw-bold cursor-pointer"
                  onClick={() => navigate("/auth/registro")}
                  style={{ cursor: "pointer" }}
                >
                  Regístrate aquí
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;