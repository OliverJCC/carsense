import api from "./http";
export type Alert = { id:number; vehicle_id:number; servicio:string; fecha_programada?:string|null; estado:"pendiente"|"enviada"|"ack"; created_at:string; };
export async function runAlertsNow(){ const { data } = await api.post("/alerts/run-now"); return data; }
export async function listAlerts(){ const { data } = await api.get("/alerts/"); return data as Alert[]; }
export async function ackAlert(id:number){ const { data } = await api.post(`/alerts/ack/${id}`); return data; }
