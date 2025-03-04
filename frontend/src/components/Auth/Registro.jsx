import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaArrowLeft } from "react-icons/fa";
import DOMPurify from "dompurify"; // Librería para sanitizar entradas y evitar XSS
import "../../styles/Registro.css";

function Registro() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    cedula: "",
    fechaNac: "",
    direccion: "",
    correo: "",
    contrasenaHash: "",
  });

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // Para evitar envíos múltiples

  // **Validaciones del formulario**
  const validateForm = () => {
    const { nombre, apellido, cedula, fechaNac, direccion, correo, contrasenaHash } = formData;

    // Validar nombres y apellidos (solo letras y espacios)
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/;
    if (!nameRegex.test(nombre) || !nameRegex.test(apellido)) {
      return "El nombre y el apellido solo deben contener letras y espacios.";
    }

    // Validar cédula (solo 10 dígitos numéricos)
    const cedulaRegex = /^\d{10}$/;
    if (!cedulaRegex.test(cedula)) {
      return "La cédula debe contener exactamente 10 dígitos numéricos.";
    }

    // Validar correo electrónico
    const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!correoRegex.test(correo)) {
      return "Ingrese un correo válido.";
    }

    // Validar contraseña (mínimo 10 caracteres, incluyendo mayúsculas, minúsculas, números y símbolos)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{10,}$/;
    if (!passwordRegex.test(contrasenaHash)) {
      return "La contraseña debe tener al menos 10 caracteres, una mayúscula, una minúscula, un número y un símbolo.";
    }

    return null;
  };

  // **Manejar cambios en los inputs**
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: DOMPurify.sanitize(e.target.value.trim()) });
  };

  // **Manejo del envío del formulario**
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true); // Deshabilitar el botón mientras se envía

    try {
      const response = await fetch("http://localhost:8080/api/usuarios/registro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error || "Error en el registro.");
      }

      setSuccessMessage("Registro exitoso, redirigiendo...");
      setTimeout(() => navigate("/auth/login"), 2000);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-fluid p-0">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg" style={{ backgroundColor: "#107a54", padding: "15px" }}>
        <div className="container-fluid">
          <div className="d-flex align-items-center ms-3">
            <img src="/logo.png" alt="Logo" className="me-2" style={{ height: "40px" }} />
            <span className="fs-4 fw-bold text-white">ESPECITO</span>
          </div>
        </div>
      </nav>

      <div className="vh-100 d-flex align-items-center justify-content-center bg-gradient">
        <div className="col-md-4">
          <div className="card shadow-lg p-4 rounded-3">
            {/* Encabezado con flecha de regreso */}
            <div className="header-container">
              <FaArrowLeft className="back-arrow" onClick={() => navigate("/auth/login")} />
              <h2 className="header-title">Registro de Usuario</h2>
            </div>

            <p className="text-center text-muted">Complete el formulario para gestionar préstamos</p>

            {error && <p className="alert alert-danger text-center">{error}</p>}
            {successMessage && <p className="alert alert-success text-center">{successMessage}</p>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Nombre</label>
                <input type="text" name="nombre" className="form-control" value={formData.nombre} onChange={handleChange} required />
              </div>

              <div className="mb-3">
                <label className="form-label">Apellido</label>
                <input type="text" name="apellido" className="form-control" value={formData.apellido} onChange={handleChange} required />
              </div>

              <div className="mb-3">
                <label className="form-label">Cédula</label>
                <input type="text" name="cedula" className="form-control" value={formData.cedula} onChange={handleChange} required />
              </div>

              <div className="mb-3">
                <label className="form-label">Fecha de Nacimiento</label>
                <input type="date" name="fechaNac" className="form-control" value={formData.fechaNac} onChange={handleChange} required />
              </div>

              <div className="mb-3">
                <label className="form-label">Dirección</label>
                <input type="text" name="direccion" className="form-control" value={formData.direccion} onChange={handleChange} required />
              </div>

              <div className="mb-3">
                <label className="form-label">Correo Electrónico</label>
                <input type="email" name="correo" className="form-control" value={formData.correo} onChange={handleChange} required />
              </div>

              <div className="mb-3">
                <label className="form-label">Contraseña</label>
                <input type="password" name="contrasenaHash" className="form-control" value={formData.contrasenaHash} onChange={handleChange} required />
              </div>

              <button type="submit" className="btn w-100 btn-custom" disabled={isSubmitting}>
                {isSubmitting ? "Registrando..." : "REGISTRARSE"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Registro;
