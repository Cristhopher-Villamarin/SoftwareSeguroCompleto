// src/config/apiConfig.js

const API_BASE_URL = "http://52.146.36.169:8080/api";

// Define base URLs for each resource
const BASE_URLS = {
  USUARIOS: `${API_BASE_URL}/usuarios`,
  PRESTAMOS: `${API_BASE_URL}/prestamos`,
  CUOTAS: `${API_BASE_URL}/cuotas`,
  LOGS: `${API_BASE_URL}/logs`
};

export default BASE_URLS;