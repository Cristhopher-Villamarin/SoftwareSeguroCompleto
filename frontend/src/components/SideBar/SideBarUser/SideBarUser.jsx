import { Link, useNavigate } from "react-router-dom";
import { FaHome, FaMoneyCheckAlt, FaCalculator, FaCreditCard, FaSignOutAlt } from "react-icons/fa";
import "../../../styles/sideBar.css"; // Importamos los estilos

const SideBarUser = () => {
  const navigate = useNavigate();

  // 🔹 Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("token"); // Eliminar token de autenticación
    navigate("/auth/login"); // Redirigir a la página de login
  };

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
          <Link to={`/user/amortizacion/${localStorage.getItem("idPrestamo")}`}>
            <FaCalculator className="icon" /> Tabla de Amortización
          </Link>
        </li>
        <li>
          <Link to="/user/pagos">
            <FaCreditCard className="icon" /> Historial de Pagos
          </Link>
        </li>
      </ul>

      {/* 🔹 Botón de Salir */}
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt className="icon" /> Salir
        </button>
      </div>
    </div>
  );
};

export default SideBarUser;
