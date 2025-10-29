// src/api/auth.ts
import api from "./http";

export async function login(email: string, password: string): Promise<string> {
  const { data } = await api.post("/auth/login", { email, password });
  // ⚠️ Importante: devolver SOLO el token
  return data.access_token as string;
}

export async function register(email: string, password: string) {
  const { data } = await api.post("/auth/register", { email, password });
  return data; // opcional (no se usa para token)
}

