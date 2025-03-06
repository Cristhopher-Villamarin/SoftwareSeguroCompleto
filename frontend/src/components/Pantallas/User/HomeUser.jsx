import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import BASE_URLS from "../../../ApiConfig"; // Import the base URLs

const HomeUser = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [usuarioEmail, setUsuarioEmail] = useState("");
  const token = localStorage.getItem("token");

  // Obtener el correo del usuario desde el token
  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken.sub) {
          setUsuarioEmail(decodedToken.sub);
        } else {
          throw new Error("El token no contiene el campo 'sub'.");
        }
      } catch (error) {
        toast.error("Error al decodificar el token: " + error.message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
        });
        navigate("/auth/login");
      }
    } else {
      navigate("/auth/login");
    }
  }, [token, navigate]);

  // Validar si el usuario tiene un préstamo activo
  const validarPrestamoActivo = async () => {
    if (!usuarioEmail) {
      toast.error("No se pudo obtener el correo del usuario.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${BASE_URLS.PRESTAMOS}/usuario/correo/${usuarioEmail}`, // Use BASE_URLS.PRESTAMOS
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al verificar préstamos activos.");
      }

      const prestamosData = await response.json();
      const prestamoActivo = prestamosData.find(
        (p) => p.estadoPrestamo === "ACTIVO"
      );

      if (prestamoActivo) {
        toast.warn(
          "Ya tienes un préstamo activo. No puedes solicitar otro hasta que finalice.",
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "light",
          }
        );
      } else {
        toast.success("No tienes préstamos activos. Puedes solicitar uno nuevo.", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
        });
        setTimeout(() => navigate("/user/prestamo/nuevo"), 2000);
      }
    } catch (error) {
      toast.error(error.message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4 d-flex align-items-center justify-content-center min-vh-100">
      <div className="text-center">
        <h1 className="mb-3" style={{ color: "#107a54", fontWeight: "bold" }}>
          Bienvenido al Sistema de Préstamos
        </h1>
        <p className="text-muted mb-4">
          Solicita tu préstamo de manera rápida y segura.
        </p>
        <button
          className="btn btn-success btn-sm"
          onClick={validarPrestamoActivo}
          disabled={loading}
        >
          {loading ? "Verificando..." : "Solicitar Préstamo"}
        </button>
      </div>
    </div>
  );
};

export default HomeUser;