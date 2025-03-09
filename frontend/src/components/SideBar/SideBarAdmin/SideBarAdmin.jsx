import { Link, useNavigate } from "react-router-dom";
import { FaMoneyCheckAlt, FaCalculator, FaCreditCard, FaSignOutAlt, FaFileAlt } from "react-icons/fa";
import "../../../styles/sideBar.css"; // Importamos los estilos

const SideBarAdmin = () => {
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
          <Link to="/admin/logsAdmin">
            <FaFileAlt className="icon" /> Logs
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

export default SideBarAdmin;
