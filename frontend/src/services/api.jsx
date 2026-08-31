import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

// 1. Interceptor de PETICIONES: Agrega el token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 2. Interceptor de RESPUESTAS: Captura el error de token expirado (401)
api.interceptors.response.use(
  (response) => response, // Si la petición sale bien, no hace nada extra
  (error) => {
    // Si la API responde con error 401 (Token inválido o expirado)
    if (error.response && error.response.status === 401) {
      // Borramos las credenciales obsoletas
      localStorage.removeItem("access");
      localStorage.removeItem("refresh"); // Si también usas token de refresco

      // Redirigimos al usuario al login para evitar el mensaje flotante
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;