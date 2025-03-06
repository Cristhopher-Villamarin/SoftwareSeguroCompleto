import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Importa autoTable explícitamente

const PagosAdmin = () => {
  const navigate = useNavigate();
  const [cuotas, setCuotas] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [filteredCuotas, setFilteredCuotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError("No estás autenticado. Por favor, inicia sesión.");
        navigate("/auth/login");
        return;
      }

      try {
        const cuotasResponse = await fetch("http://localhost:8080/api/cuotas/todos", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!cuotasResponse.ok) {
          throw new Error("Error al cargar las cuotas");
        }

        const cuotasData = await cuotasResponse.json();

        const prestamosResponse = await fetch("http://localhost:8080/api/prestamos/todos", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!prestamosResponse.ok) {
          throw new Error("Error al cargar los préstamos");
        }

        const prestamosData = await prestamosResponse.json();

        setCuotas(cuotasData);
        setPrestamos(prestamosData);
        setFilteredCuotas(cuotasData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        if (err.message.includes("No estás autenticado")) {
          localStorage.removeItem("token");
          navigate("/auth/login");
        }
      }
    };

    fetchData();
  }, [token, navigate]);

  const getPrestatario = (idPrestamo) => {
    const prestamo = prestamos.find((p) => p.idPrestamo === idPrestamo);
    if (prestamo && prestamo.usuario) {
      return `${prestamo.usuario.nombre} ${prestamo.usuario.apellido}`;
    }
    return "Desconocido";
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query.trim() === "") {
      setFilteredCuotas(cuotas);
    } else {
      const filtered = cuotas.filter((cuota) => {
        const prestamo = prestamos.find((p) => p.idPrestamo === cuota.idPrestamo);
        if (prestamo && prestamo.usuario) {
          const fullName = `${prestamo.usuario.nombre} ${prestamo.usuario.apellido}`.toLowerCase();
          return fullName.includes(query);
        }
        return false;
      });
      setFilteredCuotas(filtered);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Reporte de Pagos", 14, 20);
    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date().toLocaleDateString("es-ES")}`, 14, 30);

    // Preparar los datos para la tabla del PDF
    const tableData = filteredCuotas.map((cuota, index) => [
      (index + 1).toString(),
      getPrestatario(cuota.idPrestamo),
      cuota.numeroCuota.toString(),
      cuota.idPrestamo.toString(),
      cuota.estado,
      `$${cuota.montoTotalCuota.toLocaleString("es-ES", { minimumFractionDigits: 2 })}`,
      new Date(cuota.fechaVencimiento).toLocaleDateString("es-ES"),
      cuota.fechaPago ? new Date(cuota.fechaPago).toLocaleDateString("es-ES") : "No pagada",
    ]);

    // Usar autoTable directamente como función
    autoTable(doc, {
      startY: 40,
      head: [["#", "Prestatario", "Número de Cuota", "ID del Préstamo", "Estado del Pago", "Monto a Pagar", "Fecha de Vencimiento", "Fecha de Pago"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [16, 122, 84] },
      styles: { fontSize: 10 },
    });

    // Descargar el PDF
    doc.save("reporte-pagos.pdf");
  };

  if (loading) return <div className="text-center mt-5">Cargando pagos...</div>;
  if (error) return <div className="text-center mt-5 text-danger">Error: {error}</div>;

  return (
    <div className="container-fluid py-4">
      <h1 className="text-center mb-4" style={{ color: "#107a54", fontWeight: "bold" }}>
        Reporte de Pagos
      </h1>

      <div className="card shadow">
        <div className="card-header bg-light d-flex justify-content-between align-items-center">
          <h3 className="fw-semibold m-0">Transacciones de Préstamos</h3>
          <div className="d-flex align-items-center gap-3">
            <div className="col-md-8">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por nombre y apellido..."
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <button className="btn btn-success btn-sm" onClick={generatePDF}>
              Generar PDF
            </button>
          </div>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover text-center align-middle">
              <thead style={{ backgroundColor: "#107a54", color: "white" }}>
                <tr>
                  <th>#</th>
                  <th>Prestatario</th>
                  <th>Número de Cuota</th>
                  <th>ID del Préstamo</th>
                  <th>Estado del Pago</th>
                  <th>Monto a Pagar</th>
                  <th>Fecha de Vencimiento</th>
                  <th>Fecha de Pago</th>
                </tr>
              </thead>
              <tbody>
                {filteredCuotas.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-3 text-danger fw-bold">
                      No hay datos de pagos registrados
                    </td>
                  </tr>
                ) : (
                  filteredCuotas.map((cuota, index) => (
                    <tr key={cuota.idCuota}>
                      <td>{index + 1}</td>
                      <td>{getPrestatario(cuota.idPrestamo)}</td>
                      <td>{cuota.numeroCuota}</td>
                      <td>{cuota.idPrestamo}</td>
                      <td>
                        <span
                          className={`badge ${
                            cuota.estado === "Pendiente"
                              ? "bg-warning"
                              : cuota.estado === "Pagada"
                              ? "bg-success"
                              : "bg-danger"
                          }`}
                        >
                          {cuota.estado}
                        </span>
                      </td>
                      <td>
                        ${cuota.montoTotalCuota.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                      </td>
                      <td>{new Date(cuota.fechaVencimiento).toLocaleDateString("es-ES")}</td>
                      <td>
                        {cuota.fechaPago
                          ? new Date(cuota.fechaPago).toLocaleDateString("es-ES")
                          : "No pagada"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PagosAdmin;