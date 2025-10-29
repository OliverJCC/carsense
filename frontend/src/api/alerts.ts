// frontend/src/api/alerts.ts
import api from "./http";

export type Alert = {
  id: number;
  vehicle_id: number;
  servicio: string;
  fecha_programada: string; // YYYY-MM-DD
  estado: "pendiente" | "hecha";
  created_at: string;       // ISO datetime
};

export async function runAlertsNow(): Promise<void> {
  await api.post("/alerts/run-now");
}

export async function listAlerts(): Promise<Alert[]> {
  const { data } = await api.get("/alerts/"); // importante la "/" final
  return data as Alert[];
}

// ✅ NUEVO: marcar alerta como "hecha"
export async function ackAlert(id: number): Promise<Alert> {
  // Si tu backend tiene PUT /alerts/:id
  const { data } = await api.put(`/alerts/${id}`, { estado: "hecha" });
  return data as Alert;
}

// (opcional) borrar alerta
export async function deleteAlert(id: number): Promise<void> {
  await api.delete(`/alerts/${id}`);
}

