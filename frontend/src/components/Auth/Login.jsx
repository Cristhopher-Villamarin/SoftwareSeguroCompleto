import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaArrowLeft } from "react-icons/fa";
import "../../styles/Login.css"; // Importar estilos personalizados

const Login = () => {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
  
    try {
      const response = await fetch("http://localhost:8080/api/usuarios/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ correo, contrasena }),
      });
  
      const data = await response.json();
      console.log("Respuesta del backend:", data); // 🔥 Agregar esto para depurar
  
      if (response.ok && data.rol) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("rol", data.rol);
  
        if (data.rol === "USUARIO") {
          navigate("/user/home");
        } else if (data.rol === "ADMIN") {
          navigate("/admin/dashboard");
        } else {
          setError("Rol no reconocido.");
        }
      } else {
        setError(data.error || "Error al iniciar sesión.");
      }
    } catch (err) {
      setError("No se pudo conectar con el servidor.");
    }
  };

  return (
    <div className="container-fluid p-0">
  <nav className="navbar navbar-expand-lg" style={{ backgroundColor: "#107a54", padding: "15px" }}>
        <div className="container-fluid">
          {/* Logo + Nombre ESPECITO bien a la izquierda */}
          <div className="d-flex align-items-center ms-3">
            <img src="/logo.png" alt="Logo" className="me-2" style={{ height: "40px" }} />
            <span className="fs-4 fw-bold text-white">ESPECITO</span>
          </div>
        </div>
      </nav>

        <div className="vh-100 d-flex align-items-center justify-content-center  ">
      <div className="col-md-3">
        <div className="card p-4 shadow-lg rounded-4">
          {/* Encabezado con flecha para regresar */}
          <div className="header-container">
          <div className="d-flex align-items-center mb-3">
            <FaArrowLeft className="back-arrow" onClick={() => navigate("/")}  />
            
                
            <h2 className="fw-bold m-0"  style={{ color: "#ffffff" }}>Inicio de Sesión</h2>
            </div>
          </div>

          <p className="text-center text-muted">Ingrese sus credenciales para acceder</p>

          {error && <p className="alert alert-danger text-center">{error}</p>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Correo Electrónico</label>
              <input type="email" className="form-control" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Contraseña</label>
              <input type="password" className="form-control" value={contrasena} onChange={(e) => setContrasena(e.target.value)} required />
            </div>

            <button type="submit" className="btn btn-success w-100 px-4 fw-bold btn-lg">
              INICIAR SESIÓN
            </button>
          </form>

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
