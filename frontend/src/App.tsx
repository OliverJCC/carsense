// src/App.tsx
import { Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Vehicles from "./pages/Vehicles";
import Login from "./pages/Login";
import AlertsPage from "./pages/Alerts";
import { useAuth } from "./auth";   // <-- nuevo

function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return (
    <button
      onClick={() => { logout(); navigate("/login", { replace: true }); }}
      style={{ marginLeft: "auto", padding: "6px 10px", border: "1px solid #ddd", borderRadius: 6 }}
    >
      Salir
    </button>
  );
}

export default function App() {
  const { isAuthed } = useAuth();   // <-- nuevo

  return (
    <>
      {isAuthed && (
        <nav style={{ display: "flex", gap: 12, padding: 8, borderBottom: "1px solid #eee" }}>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/vehicles">Vehículos</Link>
          <Link to="/alerts">Alertas</Link>
          <LogoutButton />
        </nav>
      )}

      <Routes>
        <Route path="/login" element={isAuthed ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/dashboard" element={isAuthed ? <Dashboard /> : <Navigate to="/login" replace />} />
        <Route path="/vehicles" element={isAuthed ? <Vehicles /> : <Navigate to="/login" replace />} />
        <Route path="/alerts" element={isAuthed ? <AlertsPage /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to={isAuthed ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </>
  );
}




