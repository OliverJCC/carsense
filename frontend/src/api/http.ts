// src/api/http.ts
import axios from "axios";

const baseURL = import.meta.env?.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export const api = axios.create({ baseURL });

export function setToken(token?: string | null) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    try { localStorage.setItem("token", token); } catch {}
  } else {
    delete api.defaults.headers.common["Authorization"];
    try { localStorage.removeItem("token"); } catch {}
  }
}

// Cargar token guardado al iniciar
try {
  const saved = localStorage.getItem("token");
  if (saved) api.defaults.headers.common["Authorization"] = `Bearer ${saved}`;
} catch {}

// ⬇⬇⬇ ESTA LÍNEA ES LA CLAVE
export default api;




