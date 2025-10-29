// src/api/http.ts
import axios from "axios";

const baseURL =
  (import.meta as any).env?.VITE_API_BASE_URL ||
  "http://localhost:8000/api/v1";

const api = axios.create({ baseURL });

// Adjunta SIEMPRE el token actual de localStorage
api.interceptors.request.use((config) => {
  try {
    const t =
      typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
    if (t) {
      (config.headers as any).Authorization = `Bearer ${t}`;
    } else if ((config.headers as any).Authorization) {
      delete (config.headers as any).Authorization;
    }
  } catch {}
  return config;
});

// Utilidad por si la quieres usar desde el Login/AuthContext
export function setToken(t: string | null) {
  if (typeof localStorage === "undefined") return;
  if (t) localStorage.setItem("token", t);
  else localStorage.removeItem("token");
}

// Export nombrado y default (para no romper imports antiguos)
export { api };
export default api;

// Rehidrata tras refresh (opcional)
(() => {
  try {
    const t =
      typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
    if (t) {
      api.defaults.headers.common.Authorization = `Bearer ${t}`;
    }
  } catch {}
})();





