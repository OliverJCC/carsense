import { api, setToken } from "./http";
export async function register(email: string, password: string){
  const { data } = await api.post("/auth/register", { email, password });
  return data;
}
export async function login(email: string, password: string){
  const { data } = await api.post("/auth/login", { email, password });
  setToken(data.access_token);
  return data as { access_token: string; token_type: string };
}
export function logout(){ setToken(null); }
