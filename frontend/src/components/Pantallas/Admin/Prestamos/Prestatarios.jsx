import { Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { Logout, DeleteForever, VisibilityOutlined } from "@mui/icons-material";

import "react-toastify/dist/ReactToastify.css"; // ✅ Importar estilos de Toastify


const Prestatarios = ({ }) => {
  return (
    <div className="container-fluid d-flex">
   
      <ToastContainer />

      {/* Contenedor principal */}
      <div className="container my-4 p-4 border bg-white shadow rounded">
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center p-3 bg-danger text-white rounded shadow">
          <div>
            <h3 className="mb-0">Prestatarios</h3>
            <p className="mb-0">Todos los Clientes registrados</p>
          </div>
          <button className="btn btn-outline-light" >
            <Link to="" className="text-white text-decoration-none">
              <Logout />
            </Link>
          </button>
        </div>

        {/* TITLE */}
        <div className="d-flex justify-content-between border-bottom mt-4 pb-2">
          <h3 className="fw-semibold">Lista de Prestatarios</h3>
          <button className="btn btn-danger">
            <Link to="" className="text-white text-decoration-none">
              Añadir Prestatario
            </Link>
          </button>
        </div>

        {/* INFO */}
        <div className="table-responsive mt-4 border shadow rounded">
          <table className="table table-hover text-center">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Nombre Completo</th>
                <th>Contacto</th>
                <th>Dirección</th>
                <th>Email</th>
                <th>Acción</th>
              </tr>
            </thead>
           
          </table>
        </div>
      </div>
    </div>
  );
};

export default Prestatarios;
