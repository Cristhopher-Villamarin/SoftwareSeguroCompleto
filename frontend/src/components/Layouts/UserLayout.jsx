import { Outlet, Navigate } from "react-router-dom";
import SideBarUser from "../SideBar/SideBarUser/SideBarUser"; // Sidebar
import "../../styles/sideBar.css"; // Importar estilos

const UserLayout = () => {
  // Obtener autenticación desde el localStorage
  const token = localStorage.getItem("token");

  // Si el usuario no está autenticado, redirigirlo al login
  if (!token) {
    return <Navigate to="/auth/login" />;
  }

  return (
    <div className="d-flex">
      {/* Sidebar fijo */}
      <SideBarUser />

      {/* Contenedor principal con contenido alineado correctamente */}
      <div className="contenido">
        <Outlet /> {/* Aquí se renderizan las diferentes pantallas */}
      </div>
    </div>
  );
};

export default UserLayout;
