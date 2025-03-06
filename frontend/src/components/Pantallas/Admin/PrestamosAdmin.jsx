import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import BASE_URLS from "../../../ApiConfig"; // Import the base URLs

const PrestamosAdmin = () => {
  const [prestamos, setPrestamos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchPrestamos = async () => {
      try {
        const response = await fetch(`${BASE_URLS.PRESTAMOS}/todos`, { // Use BASE_URLS.PRESTAMOS
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Error al cargar los préstamos');
        }

        const data = await response.json();
        setPrestamos(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPrestamos();
  }, [token]);

  const handleAprobarPrestamo = async (idPrestamo) => {
    try {
      const response = await fetch(`${BASE_URLS.PRESTAMOS}/${idPrestamo}/aprobar`, { // Use BASE_URLS.PRESTAMOS
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al aprobar el préstamo');
      }

      const updatedPrestamos = prestamos.map(prestamo => 
        prestamo.idPrestamo === idPrestamo ? { ...prestamo, estadoPrestamo: 'APROBADO' } : prestamo
      );
      setPrestamos(updatedPrestamos);
      alert('Préstamo aprobado exitosamente');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDesaprobarPrestamo = async (idPrestamo) => {
    try {
      const response = await fetch(`${BASE_URLS.PRESTAMOS}/${idPrestamo}/desaprobar`, { // Use BASE_URLS.PRESTAMOS
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al desaprobar el préstamo');
      }

      const updatedPrestamos = prestamos.map(prestamo => 
        prestamo.idPrestamo === idPrestamo ? { ...prestamo, estadoPrestamo: 'DESAPROBADO' } : prestamo
      );
      setPrestamos(updatedPrestamos);
      alert('Préstamo desaprobado exitosamente');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleShowModal = (usuario) => {
    setSelectedUser(usuario);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  if (loading) return <div className="text-center mt-5">Cargando préstamos...</div>;
  if (error) return <div className="text-center mt-5 text-danger">Error: {error}</div>;

  return (
    <div className="container-fluid py-4">
      <h1 className="text-center mb-4" style={{ color: "#107a54", fontWeight: "bold" }}>
        Reporte de Préstamos
      </h1>
      
      <div className="card shadow">
        <div className="card-header bg-light">
          <h3 className="fw-semibold m-0">Transacciones de Préstamos</h3>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover text-center align-middle">
              <thead style={{ backgroundColor: "#107a54", color: "white" }}>
                <tr>
                  <th>#</th>
                  <th>Cliente</th>
                  <th>Monto Total</th>
                  <th>Monto Pendiente</th>
                  <th>Plazo (Meses)</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {prestamos.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-3 text-danger fw-bold">
                      No hay datos de préstamos registrados
                    </td>
                  </tr>
                ) : (
                  prestamos.map((prestamo, index) => (
                    <tr key={prestamo.idPrestamo}>
                      <td>{index + 1}</td>
                      <td>{`${prestamo.usuario.nombre} ${prestamo.usuario.apellido}`}</td>
                      <td>${prestamo.montoTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                      <td>${prestamo.montoPendiente.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                      <td>{prestamo.plazoMeses}</td>
                      <td>{prestamo.tipoPago}</td>
                      <td>
                        <span 
                          className={`badge ${
                            prestamo.estadoPrestamo === 'PENDIENTE' ? 'bg-warning' :
                            prestamo.estadoPrestamo === 'APROBADO' ? 'bg-success' :
                            prestamo.estadoPrestamo === 'DESAPROBADO' ? 'bg-danger' :
                            prestamo.estadoPrestamo === 'FINALIZADO' ? 'bg-secondary' : 'bg-info'
                          }`}
                        >
                          {prestamo.estadoPrestamo}
                        </span>
                      </td>
                      <td>
                        {prestamo.estadoPrestamo === 'PENDIENTE' && (
                          <>
                            <button 
                              className="btn btn-success btn-sm me-2"
                              onClick={() => handleAprobarPrestamo(prestamo.idPrestamo)}
                            >
                              Aprobar
                            </button>
                            <button 
                              className="btn btn-danger btn-sm me-2"
                              onClick={() => handleDesaprobarPrestamo(prestamo.idPrestamo)}
                            >
                              Desaprobar
                            </button>
                          </>
                        )}
                        <button 
                          className="btn btn-info btn-sm"
                          onClick={() => handleShowModal(prestamo.usuario)}
                        >
                          Detalles
                        </button>
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
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Detalles del Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <div>
              <p><strong>Nombre:</strong> {selectedUser.nombre} {selectedUser.apellido}</p>
              <p><strong>Cédula:</strong> {selectedUser.cedula}</p>
              <p><strong>Correo:</strong> {selectedUser.correo}</p>
              <p><strong>Dirección:</strong> {selectedUser.direccion}</p>
              <p><strong>Ingresos:</strong> ${selectedUser.ingresos.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
              <p><strong>Historial Crediticio:</strong> {selectedUser.historialCred}</p>
              <p><strong>Fecha de Nacimiento:</strong> {new Date(selectedUser.fechaNac).toLocaleDateString()}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PrestamosAdmin;