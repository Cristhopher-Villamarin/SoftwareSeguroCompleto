import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import "../../styles/Login.css";

const RestablecerContraseña = () => {
  const [token, setToken] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // Expresión regular actualizada para incluir "?"
  const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*?])[A-Za-z0-9!@#$%^&*?]{10,}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");

    if (!token || !nuevaContrasena || !confirmarContrasena) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    if (!passwordRegex.test(nuevaContrasena)) {
      setError("La contraseña debe tener al menos 10 caracteres, una mayúscula, un número y un carácter especial (!@#$%^&*?).");
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:8080/api/usuarios/restablecer-contrasena", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, nuevaContrasena }),
      });

      if (!response.ok) {
        throw new Error("Error al restablecer la contraseña. Verifica tu código de seguridad.");
      }

      setMensaje("Contraseña restablecida exitosamente. Ahora puedes iniciar sesión.");
      setTimeout(() => navigate("/auth/login"), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  return (
    <div className="container-fluid p-0">
      <nav className="navbar navbar-expand-lg" style={{ backgroundColor: "#107a54", padding: "15px" }}>
        <div className="container-fluid">
          <div className="d-flex align-items-center ms-3">
            <img src="/logo.png" alt="Logo" className="me-2" style={{ height: "40px" }} />
            <span className="fs-4 fw-bold text-white">ESPECITO</span>
          </div>
        </div>
      </nav>

      <div className="vh-100 d-flex align-items-center justify-content-center">
        <div className="col-md-4">
          <div className="card shadow-lg p-4 rounded-3">
            <div className="header-container">
              <FaArrowLeft className="back-arrow" onClick={() => navigate("/auth/login")} />
              <h2 className="header-title">Restablecer Contraseña</h2>
            </div>

            <p className="text-center text-muted">
              Ingresa el código de seguridad que recibiste en tu correo y tu nueva contraseña.
            </p>
            <p className="text-center text-muted small">
              La contraseña debe tener al menos 10 caracteres, una mayúscula, un número y un carácter especial (!@#$%^&*?).
            </p>

            {mensaje && <div className="alert alert-success text-center">{mensaje}</div>}
            {error && <div className="alert alert-danger text-center">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Código de Seguridad</label>
                <input
                  type="text"
                  className="form-control"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                  placeholder="Copia el código de seguridad aquí"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Nueva Contraseña</label>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    value={nuevaContrasena}
                    onChange={(e) => setNuevaContrasena(e.target.value)}
                    required
                    placeholder="Ingresa tu nueva contraseña"
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

              <div className="mb-3">
                <label className="form-label">Confirmar Nueva Contraseña</label>
                <div className="input-group">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="form-control"
                    value={confirmarContrasena}
                    onChange={(e) => setConfirmarContrasena(e.target.value)}
                    required
                    placeholder="Repite tu nueva contraseña"
                    style={{ paddingRight: "2.5rem" }}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={toggleConfirmPasswordVisibility}
                    style={{ borderLeft: "none" }}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn w-100 btn-custom"
                disabled={isSubmitting}
                style={{ backgroundColor: "#107a54", color: "white" }}
              >
                {isSubmitting ? "Restableciendo..." : "Restablecer Contraseña"}
              </button>
            </form>

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

export default RestablecerContraseña;