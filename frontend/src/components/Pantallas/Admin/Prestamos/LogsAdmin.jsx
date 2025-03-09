import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Importa autoTable explícitamente
import BASE_URLS from "../../../../ApiConfig"; // Import the base URLs

const LogsAdmin = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchUsuario, setSearchUsuario] = useState("");
  const [searchFecha, setSearchFecha] = useState("");
  const [searchAccion, setSearchAccion] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchLogs = async () => {
      if (!token) {
        setError("No estás autenticado. Por favor, inicia sesión.");
        navigate("/auth/login");
        return;
      }

      try {
        const response = await fetch(`${BASE_URLS.LOGS}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Error al cargar los logs");
        }

        const logsData = await response.json();
        setLogs(logsData);
        setFilteredLogs(logsData);
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

    fetchLogs();
  }, [token, navigate]);

  const handleFilter = () => {
    let filtered = logs;

    if (searchUsuario.trim()) {
      filtered = filtered.filter((log) =>
        log.usuario.toLowerCase().includes(searchUsuario.toLowerCase())
      );
    }

    if (searchFecha.trim()) {
      filtered = filtered.filter((log) =>
        log.timestamp.includes(searchFecha)
      );
    }

    if (searchAccion.trim()) {
      filtered = filtered.filter((log) =>
        log.accion.toLowerCase().includes(searchAccion.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  };

  useEffect(() => {
    handleFilter();
  }, [searchUsuario, searchFecha, searchAccion, logs]);

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Reporte de Logs del Sistema", 14, 20);
    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date().toLocaleDateString("es-ES")}`, 14, 30);

    const tableData = filteredLogs.map((log, index) => [
      (index + 1).toString(),
      log.timestamp,
      log.usuario,
      log.accion,
    ]);

    autoTable(doc, {
      startY: 40,
      head: [["#", "Fecha y Hora", "Usuario", "Acción"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [16, 122, 84] },
      styles: { fontSize: 10 },
    });

    doc.save("reporte-logs.pdf");
  };

  if (loading) return <div className="text-center mt-5">Cargando logs...</div>;
  if (error) return <div className="text-center mt-5 text-danger">Error: {error}</div>;

  return (
    <div className="container-fluid py-4">
      <h1 className="text-center mb-4" style={{ color: "#107a54", fontWeight: "bold" }}>
        Reporte de Logs del Sistema
      </h1>

      <div className="card shadow">
        <div className="card-header bg-light d-flex justify-content-between align-items-center">
          <h3 className="fw-semibold m-0">Registros del Sistema</h3>
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex gap-2">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por usuario..."
                value={searchUsuario}
                onChange={(e) => setSearchUsuario(e.target.value)}
              />
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por fecha (YYYY-MM-DD)..."
                value={searchFecha}
                onChange={(e) => setSearchFecha(e.target.value)}
              />
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por acción..."
                value={searchAccion}
                onChange={(e) => setSearchAccion(e.target.value)}
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
                  <th>Fecha y Hora</th>
                  <th>Usuario</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-3 text-danger fw-bold">
                      No hay logs registrados
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log, index) => (
                    <tr key={`${log.timestamp}-${index}`}>
                      <td>{index + 1}</td>
                      <td>{log.timestamp}</td>
                      <td>{log.usuario}</td>
                      <td>{log.accion}</td>
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

export default LogsAdmin;