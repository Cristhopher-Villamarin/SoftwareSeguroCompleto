import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Principal from "./components/Principal";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Registro";
import SideBarUser from "./components/SideBar/SideBarUser/SideBarUser";
import HomeUser from "./components/Pantallas/User/HomeUser";
import UserLayout from "./components/Layouts/UserLayout";
import Prestamos from "./components/Pantallas/User/Prestamos";
import PrestamoEspecifico from "./components/Pantallas/User/PrestamoEspecifico";
import Pagos from "./components/Pantallas/User/Pagos";
import Amortizacion from "./components/Pantallas/User/Amortizacion";
import SideBarAdmin from "./components/SideBar/SideBarAdmin/SideBarAdmin";
import Prestatarios from "./components/Pantallas/Admin/Prestamos/Prestatarios";
import AdminLayout from "./components/Layouts/AdminLayout"; // ✅ Correcto

import PagosAdmin from "./components/Pantallas/Admin/PagosAdmin";
import PrestamosAdmin from "./components/Pantallas/Admin/PrestamosAdmin";
import SolicitudesAdmin from "./components/Pantallas/Admin/SolicitudesAdmin";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Estado de autenticación

  // Verificar si el usuario ya está autenticado al cargar la app
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* Rutas sin Sidebar */}
        <Route path="/" element={<Principal />} />
        <Route path="/auth/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/auth/registro" element={<Register />} />

        {/* Rutas con Sidebar (Solo visibles si el usuario está autenticado) */}
        {isAuthenticated && (
          <Route path="/user/*" element={<UserLayout />}>
          <Route index element={<HomeUser />} /> {/* Página inicial */}
          <Route path="home" element={<HomeUser />} />
          <Route path="prestamos" element={<Prestamos />} />
          <Route path="prestamo/nuevo" element={<PrestamoEspecifico />} />
          <Route path="amortizacion/:idPrestamo" element={<Amortizacion />} />
          <Route path="pagos" element={<Pagos />} />
        </Route>
        )}
        
        {/* Rutas con Sidebar (Solo visibles si el usuario está autenticado) */}
        {isAuthenticated && (
          <Route path="/admin/*" element={<AdminLayout />}>
          <Route path="prestatarios" element={<Prestatarios/>} />
          <Route path="pagosAdmin" element={<PagosAdmin/>} />
          <Route path="prestamosAdmin" element={<PrestamosAdmin/>} />
          <Route path="solicitudesAdmin" element={<SolicitudesAdmin />} />

        </Route>
        )}
        
        
       
      </Routes>
    </Router>
  );
}

export default App;
