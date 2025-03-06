import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BASE_URLS from "../../../../ApiConfig"; // Import the base URLs

const Prestatarios = () => {
  const navigate = useNavigate();
  const [prestatarios, setPrestatarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [usuarioModal, setUsuarioModal] = useState(null);

  useEffect(() => {
    fetchPrestatarios();
  }, []);

  const fetchPrestatarios = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("No hay token de autenticación. Inicia sesión nuevamente.");
      setLoading(false);
      navigate('/login');
      return;
    }

    try {
      setError("");
      const response = await fetch(`${BASE_URLS.PRESTAMOS}/usuarios-prestamos`, { // Use BASE_URLS.PRESTAMOS
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
      const response = await fetch(`${BASE_URLS.USUARIOS}/desbloquear`, { // Use BASE_URLS.USUARIOS
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
      fetchPrestatarios();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const tienePrestamosAsociados = async (correo) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${BASE_URLS.PRESTAMOS}/usuario/correo/${correo}`, { // Use BASE_URLS.PRESTAMOS
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error al verificar préstamos asociados.");
      }

      const prestamos = await response.json();
      return prestamos.length > 0;
    } catch (error) {
      setError(error.message);
      return true;
    }
  };

  const handleEliminar = async (correo) => {
    const token = localStorage.getItem("token");
    const tienePrestamos = await tienePrestamosAsociados(correo);
    if (tienePrestamos) {
      setMessage("No se puede eliminar el prestatario porque tiene préstamos asociados.");
      return;
    }

    if (!window.confirm("¿Estás seguro de eliminar este prestatario?")) return;

    try {
      const response = await fetch(`${BASE_URLS.USUARIOS}/${correo}`, { // Use BASE_URLS.USUARIOS
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
      fetchPrestatarios();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const fetchUsuarioDetalles = async (correo) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${BASE_URLS.USUARIOS}/${correo}`, { // Use BASE_URLS.USUARIOS
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener los detalles del usuario.");
      }

      const data = await response.json();
      setUsuarioModal(data);
    } catch (error) {
      setError(error.message);
    }
  };

  const closeModal = () => {
    setUsuarioModal(null);
  };

  return (
    <div className="container-fluid py-4">
      <h1 className="text-center mb-4" style={{ color: "#107a54", fontWeight: "bold" }}>
        Prestatarios
      </h1>

      <div className="card shadow">
        <div className="card-header bg-light">
          <h3 className="fw-semibold m-0">Lista de Prestatarios</h3>
        </div>
        <div className="card-body">
          {/* Messages */}
          {error && <p className="text-danger text-center mb-3">{error}</p>}
          {message && (
            <p
              className={`text-center mb-3 ${
                message.includes("exitosamente") ? "text-success" : "text-danger"
              }`}
            >
              {message}
            </p>
          )}

          <div className="table-responsive">
            <table className="table table-hover text-center align-middle">
              <thead style={{ backgroundColor: "#107a54", color: "white" }}>
                <tr>
                  <th>#</th>
                  <th>Nombre Completo</th>
                  <th>Cédula</th>
                  <th>Dirección</th>
                  <th>Email</th>
                  <th>Estado Cuenta</th>
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
                      <td>
                        <span
                          className={`badge ${
                            prestatario.cuentaBloqueada === "Sí" ? "bg-danger" : "bg-success"
                          }`}
                        >
                          {prestatario.cuentaBloqueada}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleEliminar(prestatario.correo)}
                          >
                            <i className="bi bi-trash me-1"></i> Eliminar
                          </button>
                          {prestatario.cuentaBloqueada === "Sí" && (
                            <button
                              className="btn btn-warning btn-sm"
                              onClick={() => handleDesbloquear(prestatario.correo)}
                            >
                              <i className="bi bi-unlock me-1"></i> Desbloquear
                            </button>
                          )}
                          <button
                            className="btn btn-info btn-sm"
                            onClick={() => fetchUsuarioDetalles(prestatario.correo)}
                          >
                            <i className="bi bi-eye me-1"></i> Detalles
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal for User Details */}
      {usuarioModal && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-sm">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Detalles del Usuario</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body">
                <p><strong>Nombre:</strong> {usuarioModal.nombre} {usuarioModal.apellido}</p>
                <p><strong>Cédula:</strong> {usuarioModal.cedula}</p>
                <p><strong>Correo:</strong> {usuarioModal.correo}</p>
                <p><strong>Dirección:</strong> {usuarioModal.direccion}</p>
                <p><strong>Ingresos:</strong> ${usuarioModal.ingresos?.toLocaleString('es-ES', { minimumFractionDigits: 2 }) || "N/A"}</p>
                <p><strong>Historial Crediticio:</strong> {usuarioModal.historialCred || "N/A"}</p>
                <p><strong>Cuenta Bloqueada:</strong> 
                  <span className={`badge ${usuarioModal.cuentaBloqueada ? "bg-danger" : "bg-success"}`}>
                    {usuarioModal.cuentaBloqueada ? "Sí" : "No"}
                  </span>
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prestatarios;