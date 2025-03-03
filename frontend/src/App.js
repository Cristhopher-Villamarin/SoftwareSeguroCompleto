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
          <Route path="amortizacion" element={<h1>Tabla de Amortización</h1>} />
          <Route path="pagos" element={<h1>Página de Pagos</h1>} />
        </Route>
        )}
      </Routes>
    </Router>
  );
}

export default App;
