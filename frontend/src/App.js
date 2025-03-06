import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./components/ProtectedRoute"; // Asegúrate de importar esto
import Principal from "./components/Principal";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Registro";
import UserLayout from "./components/Layouts/UserLayout";
import HomeUser from "./components/Pantallas/User/HomeUser";
import Prestamos from "./components/Pantallas/User/Prestamos";
import PrestamoEspecifico from "./components/Pantallas/User/PrestamoEspecifico";
import Pagos from "./components/Pantallas/User/Pagos";
import Amortizacion from "./components/Pantallas/User/Amortizacion";
import AdminLayout from "./components/Layouts/AdminLayout";
import Prestatarios from "./components/Pantallas/Admin/Prestamos/Prestatarios";
import PagosAdmin from "./components/Pantallas/Admin/PagosAdmin";
import PrestamosAdmin from "./components/Pantallas/Admin/PrestamosAdmin";
import SolicitudesAdmin from "./components/Pantallas/Admin/SolicitudesAdmin";
import RecuperarContraseña from "./components/Auth/RecuperarContraseña";
import RestablecerContraseña from "./components/Auth/RestablecerContraseña";


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar si el usuario ya está autenticado y el token es válido al cargar la app
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp > currentTime) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("token");
          setIsAuthenticated(false);
        }
      } catch (error) {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
      }
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Principal />} />
        <Route
          path="/auth/login"
          element={<Login setIsAuthenticated={setIsAuthenticated} />}
        />
        <Route path="/auth/registro" element={<Register />} />
        <Route path="/auth/recuperar" element={<RecuperarContraseña />} />
        <Route path="/auth/restablecer" element={<RestablecerContraseña />} />

        {/* Rutas protegidas para usuarios */}
        <Route
          path="/user/*"
          element={
            <ProtectedRoute allowedRoles={["USUARIO"]}>
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomeUser />} />
          <Route path="home" element={<HomeUser />} />
          <Route path="prestamos" element={<Prestamos />} />
          <Route path="prestamo/nuevo" element={<PrestamoEspecifico />} />
          <Route path="amortizacion/:idPrestamo" element={<Amortizacion />} />
          <Route path="pagos" element={<Pagos />} />
        </Route>

        {/* Rutas protegidas para administradores */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="prestatarios" element={<Prestatarios />} />
          <Route path="pagosAdmin" element={<PagosAdmin />} />
          <Route path="prestamosAdmin" element={<PrestamosAdmin />} />
          <Route path="solicitudesAdmin" element={<SolicitudesAdmin />} />
        </Route>

        {/* Ruta por defecto para rutas no encontradas */}
        <Route path="*" element={<Principal />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />
    </Router>
  );
}

export default App;