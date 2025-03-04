import { Link } from "react-router-dom";
import { FaHome, FaMoneyCheckAlt, FaCalculator, FaCreditCard } from "react-icons/fa";
import "../../../styles/sideBar.css"; // Importamos los estilos

const SideBarUser = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>ESPECITO</h2>
        <p className="role">Administrador</p>
        <span className="text-muted">Gestión de préstamo</span>
      </div>

      <ul className="sidebar-menu">
        <li>
          <Link to="/admin/prestatarios">
            <FaMoneyCheckAlt className="icon" /> Prestatarios
          </Link>
        </li>
        <li>
          <Link to="/admin/prestamosAdmin">
            <FaCalculator className="icon" /> Prestamos
          </Link>
        </li>
        <li>
          <Link to="/admin/pagosAdmin">
            <FaCreditCard className="icon" /> Pagos
          </Link>
        </li>
        <li>
          <Link to="/admin/solicitudesAdmin">
            <FaCreditCard className="icon" /> Solicitudes
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default SideBarUser;
