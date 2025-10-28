import { Link, Outlet } from "react-router-dom";
import { logout } from "./api/auth";
export default function App(){
  return (
    <div>
      <nav className="flex items-center gap-4 p-3 border-b">
        <Link to="/">Dashboard</Link>
        <Link to="/vehicles">Vehículos</Link>
        <Link to="/chatbot">Chatbot</Link>
        <button className="ml-auto text-red-600" onClick={()=>{ logout(); location.href="/login"; }}>Salir</button>
      </nav>
      <Outlet/>
    </div>
  );
}
