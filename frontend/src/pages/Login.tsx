// src/pages/Login.tsx
import { useState } from "react";
import { login, register } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth"; // <-- nuevo

export default function LoginPage() {
  const [email, setEmail] = useState("demo5@carsense.mx");
  const [password, setPassword] = useState("Demo1234!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const navigate = useNavigate();
  const { login: authLogin } = useAuth(); // <-- nuevo

  async function handleLogin(e:React.FormEvent){
    e.preventDefault(); setLoading(true); setError(null);
    try{
      const tok = await login(email, password);     // tu login() devuelve el token
      authLogin(tok);                               // guarda en contexto+localStorage+axios
      navigate("/dashboard", { replace: true });   // navega sin refrescar
    }catch(err:any){
      setError(err?.response?.data?.detail ?? "Error al iniciar sesión");
    }finally{ setLoading(false); }
  }

  async function handleRegister(){
    setLoading(true); setError(null);
    try{
      await register(email, password);
      const tok = await login(email, password);
      authLogin(tok);
      navigate("/dashboard", { replace: true });
    }catch(err:any){
      setError(err?.response?.data?.detail ?? "Error al registrar");
    }finally{ setLoading(false); }
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">CarSense — Acceso</h1>
      <form onSubmit={handleLogin} className="space-y-3">
        <input className="border p-2 w-full" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="border p-2 w-full" placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">{loading?"...":"Entrar"}</button>
        <button type="button" disabled={loading} onClick={handleRegister} className="ml-2 bg-gray-700 text-white px-4 py-2 rounded">Registrar</button>
      </form>
    </div>
  );
}

