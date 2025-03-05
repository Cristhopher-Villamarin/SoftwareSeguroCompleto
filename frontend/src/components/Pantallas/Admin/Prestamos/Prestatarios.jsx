import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const Prestatarios = () => {
  const navigate = useNavigate();
  const [prestatarios, setPrestatarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchPrestatarios();
  }, []);

  const fetchPrestatarios = async () => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      setError("No hay token de autenticación. Inicia sesión nuevamente.");
      setLoading(false);
      return;
    }

    try {
      setError("");
      const response = await fetch("http://localhost:8080/api/prestamos/usuarios-prestamos", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener los prestatarios.");
      }

      const data = await response.json();
      setPrestatarios(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDesbloquear = async (correo) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:8080/api/usuarios/desbloquear", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ correo }),
      });

      if (!response.ok) {
        throw new Error("Error al desbloquear la cuenta.");
      }

      setMessage("Cuenta desbloqueada exitosamente.");
      fetchPrestatarios(); // Recargar la lista de prestatarios
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleEliminar = async (correo) => {
    const token = localStorage.getItem("token");

    if (!window.confirm("¿Estás seguro de eliminar este prestatario?")) return;

    try {
      const response = await fetch(`http://localhost:8080/api/usuarios/${correo}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error al eliminar prestatario.");
      }

      setMessage("Prestatario eliminado exitosamente.");
      fetchPrestatarios(); // Recargar la lista
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="container-fluid">
      <h1 className="text-center">Prestatarios</h1>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-semibold">Lista de Prestatarios</h3>
      
      </div>

      {/* Mostrar mensajes */}
      {error && <p className="text-danger text-center">{error}</p>}
      {message && <p className="text-success text-center">{message}</p>}

      <div className="d-flex justify-content-center mt-4">
        <table className="table table-hover text-center">
          <thead style={{ backgroundColor: "#107a54", color: "white" }}>
            <tr>
              <th>#</th>
              <th>Nombre Completo</th>
              <th>Cédula</th>
              <th>Dirección</th>
              <th>Email</th>
              <th>Cuenta Bloqueada</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="py-3 text-warning fw-bold">
                  Cargando...
                </td>
              </tr>
            ) : prestatarios.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-3 text-danger fw-bold">
                  No hay prestatarios registrados
                </td>
              </tr>
            ) : (
              prestatarios.map((prestatario, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{prestatario.nombreCompleto}</td>
                  <td>{prestatario.cedula}</td>
                  <td>{prestatario.direccion}</td>
                  <td>{prestatario.correo}</td>
                  <td className={prestatario.cuentaBloqueada === "Sí" ? "text-danger fw-bold" : "text-success fw-bold"}>
                    {prestatario.cuentaBloqueada}
                  </td>
                  <td>
                    {/* Botón de eliminar */}
                    <button
                      className="btn btn-danger btn-sm me-2"
                      onClick={() => handleEliminar(prestatario.correo)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>

                    {/* Botón de desbloquear SOLO si la cuenta está bloqueada */}
                    {prestatario.cuentaBloqueada === "Sí" && (
                      <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => handleDesbloquear(prestatario.correo)}
                      >
                        <i className="bi bi-unlock"></i> Desbloquear
                      </button>
                    )}

                    {/* Botón de ver detalles */}
                    <button className="btn btn-primary btn-sm">
                      <Link
                        to={`/prestatario/${prestatario.cedula}`}
                        className="text-white text-decoration-none"
                      >
                        <i className="bi bi-eye"></i>
                      </Link>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Prestatarios;
