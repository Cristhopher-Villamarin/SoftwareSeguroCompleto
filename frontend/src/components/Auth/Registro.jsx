import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaArrowLeft } from "react-icons/fa";
import "../../styles/Registro.css"; // Importar estilos personalizados

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
    rol: "USUARIO", 
  });

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    for (const key in formData) {
      if (!formData[key]) {
        setError("Todos los campos son obligatorios.");
        return;
      }
    }
  
    setError("");
    setSuccessMessage("");
  
    try {
      const response = await fetch("http://localhost:8080/api/usuarios/registro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          // 📌 Si la API requiere autenticación, descomenta esto:
          // "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(formData),
      });
  
      let data = null;
      const contentType = response.headers.get("Content-Type");
  
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      }
  
      if (response.status === 403) {
        throw new Error("Acceso denegado. No tienes permisos para registrar usuarios.");
      }
  
      if (!response.ok) {
        throw new Error(data?.mensaje || "Error en el registro.");
      }
  
      setSuccessMessage("Registro exitoso, redirigiendo...");
      setTimeout(() => {
        navigate("/auth/login");
      }, 2000);
  
      setFormData({
        nombre: "",
        apellido: "",
        cedula: "",
        fechaNac: "",
        direccion: "",
        correo: "",
        contrasenaHash: "",
        rol: "USUARIO",
      });
    } catch (error) {
      console.error("Error:", error);
      setError(error.message || "Error en el servidor.");
    }
  };
  
  return (
    <div className="vh-100 d-flex align-items-center justify-content-center bg-gradient">
      <div className="col-md-6">
        <div className="card shadow-lg p-4 rounded-3">
          {/* Encabezado con flecha para regresar al login */}
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
              <input type="text" name="cedula" className="form-control" value={formData.cedula} onChange={handleChange} required pattern="\d{10}" title="Debe contener exactamente 10 dígitos" />
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
              <input type="password" name="contrasenaHash" className="form-control" value={formData.contrasenaHash} onChange={handleChange} required minLength={10} />
            </div>

            <button type="submit" className="btn w-100 btn-custom">
              REGISTRARSE
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Registro;
