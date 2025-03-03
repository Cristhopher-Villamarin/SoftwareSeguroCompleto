import { Link } from "react-router-dom";
import { FaHome, FaMoneyCheckAlt, FaCalculator, FaCreditCard } from "react-icons/fa";
import "../../../styles/sideBar.css"; // Importamos los estilos

const SideBarUser = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>ESPECITO</h2>
        <p className="role">Usuario</p>
        <span className="text-muted">Solicitud de préstamo</span>
      </div>

      <ul className="sidebar-menu">
        <li>
          <Link to="/user/home">
            <FaHome className="icon" /> Home
          </Link>
        </li>
        <li>
          <Link to="/user/prestamos">
            <FaMoneyCheckAlt className="icon" /> Préstamos
          </Link>
        </li>
        <li>
          <Link to="/user/amortizacion">
            <FaCalculator className="icon" /> Tabla de Amortización
          </Link>
        </li>
        <li>
          <Link to="/user/pagos">
            <FaCreditCard className="icon" /> Pagos
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default SideBarUser;
