import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaArrowLeft } from "react-icons/fa";
import DOMPurify from "dompurify"; // Para sanitizar entradas y evitar XSS
import "../../styles/Login.css"; // Importar estilos personalizados

const Login = () => {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // Para evitar múltiples envíos
  const navigate = useNavigate();

  // Función para sanitizar inputs y prevenir ataques XSS
  const sanitizeInput = (input) => DOMPurify.sanitize(input.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validaciones previas
    if (!correo || !contrasena) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:8080/api/usuarios/login", {
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
        throw new Error(data?.error || "Error en el inicio de sesión.");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("rol", data.rol);
      localStorage.setItem("idUsuario", data.idUsuario); // ✅ Guardar ID del usuario
      localStorage.setItem("cedula", data.cedula); // ✅ Guardar la cédula del usuario

      // Redirigir según el rol del usuario
      navigate(data.rol === "USUARIO" ? "/user/home" : "/admin/dashboard");
    } catch (err) {
      setError(err.message || "Error en el servidor.");
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
                <input
                  type="password"
                  className="form-control"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  required
                  placeholder="Ingrese su contraseña"
                />
              </div>

              <button type="submit" className="btn w-100 btn-custom" disabled={isSubmitting}>
                {isSubmitting ? "Iniciando sesión..." : "INICIAR SESIÓN"}
              </button>
            </form>

            {/* Enlace de Registro */}
            <div className="text-center mt-3">
              <p className="mb-0">
                ¿No tienes una cuenta?{" "}
                <span className="text-success fw-bold cursor-pointer" onClick={() => navigate("/auth/registro")}>
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
