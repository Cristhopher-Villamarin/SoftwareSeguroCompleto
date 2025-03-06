// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const token = localStorage.getItem("token");

  const isTokenValid = () => {
    if (!token) {
      toast.error("Por favor, inicia sesión para continuar.");
      return false;
    }

    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000; // Tiempo en segundos

      // Verificar si el token está expirado
      if (decodedToken.exp < currentTime) {
        localStorage.removeItem("token");
        toast.error("Sesión expirada. Por favor, inicia sesión nuevamente.");
        return false;
      }

      const userRole = decodedToken.rol; // Ajustado a tu campo 'rol'
      if (allowedRoles && !allowedRoles.includes(userRole)) {
        toast.error("No tienes permiso para acceder a esta página.");
        return false;
      }

      return true;
    } catch (error) {
      localStorage.removeItem("token");
      toast.error("Token inválido. Por favor, inicia sesión nuevamente.");
      return false;
    }
  };

  return isTokenValid() ? (
    children
  ) : (
    <Navigate to="/auth/login" state={{ from: location }} replace />
  );
};

export default ProtectedRoute;