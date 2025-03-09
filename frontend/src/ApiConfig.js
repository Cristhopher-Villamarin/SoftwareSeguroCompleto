// src/config/apiConfig.js

// Usa una variable de entorno para definir la URL base, con un valor por defecto para desarrollo local
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

// Define base URLs para cada recurso
const BASE_URLS = {
  USUARIOS: `${API_BASE_URL}/usuarios`,
  PRESTAMOS: `${API_BASE_URL}/prestamos`,
  CUOTAS: `${API_BASE_URL}/cuotas`,
  LOGS: `${API_BASE_URL}/logs`
};

export default BASE_URLS;