import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../../../styles/prestamos.css";
import { toast } from "react-toastify";

const Prestamos = () => {
  const [prestamos, setPrestamos] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false); // New state for validation loading
  const navigate = useNavigate();

  // Obtener y decodificar el token
  const token = localStorage.getItem("token");
  let usuarioEmail = "";

  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      usuarioEmail = decodedToken.sub;
    } catch (error) {
      console.error("Error al decodificar el token:", error);
      navigate("/auth/login");
    }
  } else {
    navigate("/auth/login");
  }

  useEffect(() => {
    if (!token || !usuarioEmail) {
      navigate("/auth/login");
      return;
    }
    fetchPrestamos();
  }, [usuarioEmail, navigate]);

  const fetchPrestamos = async () => {
    try {
      setError("");
      setLoading(true);

      const response = await fetch(
        `http://localhost:8080/api/prestamos/usuario/correo/${usuarioEmail}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al obtener los préstamos.");
      }

      const data = await response.json();
      setPrestamos(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Add validation function
  const validarPrestamoActivo = async () => {
    if (!usuarioEmail) {
      toast.error("No se pudo obtener el correo del usuario.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      return;
    }

    setValidating(true);

    try {
      const response = await fetch(
        `http://localhost:8080/api/prestamos/usuario/correo/${usuarioEmail}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al verificar préstamos activos.");
      }

      const prestamosData = await response.json();
      const prestamoActivo = prestamosData.find(
        (p) => p.estadoPrestamo === "ACTIVO"
      );

      if (prestamoActivo) {
        toast.warn(
          "Ya tienes un préstamo activo. No puedes solicitar otro hasta que finalice.",
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "light",
          }
        );
      } else {
        toast.success("No tienes préstamos activos. Puedes solicitar uno nuevo.", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
        });
        setTimeout(() => navigate("/user/prestamo/nuevo"), 2000);
      }
    } catch (error) {
      toast.error(error.message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
    } finally {
      setValidating(false);
    }
  };

  if (loading) return <div className="text-center mt-5">Cargando préstamos...</div>;
  if (error) return <div className="text-center mt-5 text-danger">Error: {error}</div>;

  return (
    <div className="container-fluid py-4">
      <h1 className="text-center mb-4" style={{ color: "#107a54", fontWeight: "bold" }}>
        Mis Préstamos
      </h1>
      <p className="text-center text-muted mb-4">
        Aquí puedes visualizar los préstamos que has solicitado.
      </p>

      <div className="card shadow">
        <div className="card-header bg-light d-flex justify-content-between align-items-center">
          <h3 className="fw-semibold m-0">Lista de Préstamos</h3>
          <button
            className="btn btn-success btn-sm"
            onClick={validarPrestamoActivo}
            disabled={validating}
          >
            {validating ? "Verificando..." : "Solicitar Préstamo"}
          </button>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover text-center align-middle">
              <thead style={{ backgroundColor: "#107a54", color: "white" }}>
                <tr>
                  <th>ID</th>
                  <th>Monto Solicitado</th>
                  <th>Monto Total</th>
                  <th>Plazo (Meses)</th>
                  <th>Tasa de Interés</th>
                  <th>Estado</th>
                  <th>Fecha de Solicitud</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {prestamos.length > 0 ? (
                  prestamos.map((prestamo) => (
                    <tr key={prestamo.idPrestamo}>
                      <td>{prestamo.idPrestamo}</td>
                      <td>
                        ${prestamo.montoSolicitado.toLocaleString("es-ES", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td>
                        {prestamo.montoTotal
                          ? `$${prestamo.montoTotal.toLocaleString("es-ES", {
                              minimumFractionDigits: 2,
                            })}`
                          : "N/A"}
                      </td>
                      <td>{prestamo.plazoMeses}</td>
                      <td>{prestamo.tasaInteres}%</td>
                      <td>
                        <span
                          className={`badge ${
                            prestamo.estadoPrestamo === "ACTIVO"
                              ? "bg-success"
                              : prestamo.estadoPrestamo === "PENDIENTE"
                              ? "bg-warning"
                              : prestamo.estadoPrestamo === "FINALIZADO"
                              ? "bg-secondary"
                              : "bg-danger"
                          }`}
                        >
                          {prestamo.estadoPrestamo}
                        </span>
                      </td>
                      <td>
                        {prestamo.fechaSolicitud
                          ? new Date(prestamo.fechaSolicitud).toLocaleDateString("es-ES")
                          : "N/A"}
                      </td>
                      <td>
                        {prestamo.estadoPrestamo === "ACTIVO" && (
                          <button
                            className="btn btn-info btn-sm"
                            onClick={() =>
                              navigate(`/user/amortizacion/${prestamo.idPrestamo}`)
                            }
                          >
                            Ver Amortización
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="py-3 text-danger fw-bold">
                      No tienes préstamos registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prestamos;