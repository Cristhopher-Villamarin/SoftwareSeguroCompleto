import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { Modal, Button } from "react-bootstrap";
import BASE_URLS from "../../../ApiConfig"; // Import the base URLs

const Amortizacion = () => {
  const [cuotas, setCuotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cuotaSeleccionada, setCuotaSeleccionada] = useState(null);
  const [montoPendiente, setMontoPendiente] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const obtenerCorreoDesdeToken = () => {
    const token = localStorage.getItem("token");
    try {
      if (!token) throw new Error("No hay token disponible.");
      const decodedToken = jwtDecode(token);
      if (!decodedToken.sub) throw new Error("El token no contiene el campo 'sub'.");
      return decodedToken.sub;
    } catch (error) {
      setError("Error al decodificar el token: " + error.message);
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const correo = obtenerCorreoDesdeToken();
      if (!correo) {
        setLoading(false);
        return;
      }

      try {
        const prestamoResponse = await fetch(
          `${BASE_URLS.PRESTAMOS}/usuario/correo/${correo}`, // Use BASE_URLS.PRESTAMOS
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!prestamoResponse.ok) {
          throw new Error("No se pudo obtener los datos del préstamo.");
        }

        const prestamosData = await prestamoResponse.json();
        if (prestamosData.length === 0) {
          throw new Error("No se encontraron préstamos para este usuario.");
        }

        const prestamoActivo = prestamosData.find(
          (p) => p.estadoPrestamo === "ACTIVO"
        );
        if (!prestamoActivo) {
          throw new Error("No tienes un préstamo activo actualmente.");
        }

        setMontoPendiente(prestamoActivo.montoPendiente);

        const cuotasResponse = await fetch(
          `${BASE_URLS.CUOTAS}/prestamo/${prestamoActivo.idPrestamo}`, // Use BASE_URLS.CUOTAS
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!cuotasResponse.ok) {
          throw new Error("No se pudo obtener las cuotas.");
        }

        const cuotasData = await cuotasResponse.json();
        setCuotas(cuotasData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const pagarCuota = async (idCuota) => {
    setError("");
    try {
      const response = await fetch(`${BASE_URLS.CUOTAS}/${idCuota}/pagar`, { // Use BASE_URLS.CUOTAS
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al pagar la cuota.");
      }

      setCuotas((prevCuotas) =>
        prevCuotas.map((cuota) =>
          cuota.idCuota === idCuota
            ? { ...cuota, estado: "Pagada", fechaPago: new Date().toISOString().split("T")[0] }
            : cuota
        )
      );

      const cuotaPagada = cuotas.find((c) => c.idCuota === idCuota);
      if (cuotaPagada) {
        setMontoPendiente((prev) => Math.max(0, prev - cuotaPagada.montoTotalCuota));
      }

      setCuotaSeleccionada(null);
      setShowModal(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleShowModal = (cuota) => {
    setCuotaSeleccionada(cuota);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCuotaSeleccionada(null);
  };

  if (loading) return <div className="text-center mt-5">Cargando cuotas...</div>;
  if (error) return <div className="text-center mt-5 text-danger">Error: {error}</div>;

  return (
    <div className="container-fluid py-4">
      <h1 className="text-center mb-4" style={{ color: "#107a54", fontWeight: "bold" }}>
        Tabla de Amortización
      </h1>

      <div className="card shadow">
        <div className="card-header bg-light">
          <h3 className="fw-semibold m-0">Cuotas del Préstamo Activo</h3>
        </div>
        <div className="card-body">
          {/* Mostrar el saldo pendiente */}
          {montoPendiente !== null && (
            <div className="text-center mb-3">
              <h5>
                Saldo Pendiente:{" "}
                <span className="fw-bold text-danger">
                  ${montoPendiente.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                </span>
              </h5>
            </div>
          )}

          <div className="table-responsive">
            <table className="table table-hover text-center align-middle">
              <thead style={{ backgroundColor: "#107a54", color: "white" }}>
                <tr>
                  <th>Cuota</th>
                  <th>Fecha de Pago</th>
                  <th>Capital</th>
                  <th>Interés</th>
                  <th>Valor de la Cuota</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {cuotas.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-3 text-danger fw-bold">
                      No hay cuotas registradas
                    </td>
                  </tr>
                ) : (
                  cuotas.map((cuota, index) => (
                    <tr key={index}>
                      <td>{cuota.numeroCuota}</td>
                      <td>
                        {cuota.fechaPago
                          ? new Date(cuota.fechaPago).toLocaleDateString("es-ES")
                          : "Pendiente"}
                      </td>
                      <td>
                        ${cuota.capitalCuota.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                      </td>
                      <td>
                        ${cuota.interesCuota.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                      </td>
                      <td>
                        ${cuota.montoTotalCuota.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            cuota.estado === "Pagada"
                              ? "bg-success"
                              : cuota.estado === "Mora"
                              ? "bg-danger"
                              : "bg-warning"
                          }`}
                        >
                          {cuota.estado}
                        </span>
                      </td>
                      <td>
                        {cuota.estado === "Pendiente" && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleShowModal(cuota)}
                          >
                            Pagar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación con react-bootstrap */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Pago de Cuota</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {cuotaSeleccionada && (
            <div>
              <p>
                ¿Deseas pagar esta cuota?
              </p>
              <p>
                <strong>Cuota #{cuotaSeleccionada.numeroCuota}</strong> - Monto: $
                {cuotaSeleccionada.montoTotalCuota.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button variant="success" onClick={() => pagarCuota(cuotaSeleccionada.idCuota)}>
            Confirmar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Amortizacion;