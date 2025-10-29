// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { listVehicles, getNextServices } from "../api/vehicles";
import { listAlerts, runAlertsNow, ackAlert } from "../api/alerts";
import { listByVehicle, createServiceRecord } from "../api/serviceRecords";

// 👇 Importa tipos como "type" (no valores)
import type { Vehicle } from "../api/vehicles";
import type { Alert as AlertT } from "../api/alerts";

export default function Dashboard() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [next, setNext] = useState<any | null>(null);
  const [alerts, setAlerts] = useState<AlertT[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Helper para capturar y mostrar errores sin romper la UI
  async function safe<T>(fn: () => Promise<T>, label: string): Promise<T | null> {
    try {
      const r = await fn();
      return r;
    } catch (e: any) {
      const msg = e?.response?.data?.detail || e?.message || String(e);
      setErr(`[${label}] ${msg}`);
      console.error(label, e);
      return null;
    }
  }

  async function refreshAll(sel?: number) {
    setErr(null);

    // 1) Vehículos
    const vs = await safe(() => listVehicles(), "listVehicles");
    if (!vs) return;
    setVehicles(vs);

    // 2) Seleccionado
    const id = sel ?? vs[0]?.id ?? null;
    setSelected(id);

    // 3) Próximos servicios, historial (si hay seleccionado)
    if (id) {
      const ns = await safe(() => getNextServices(id), "getNextServices");
      if (ns) setNext(ns);

      const h = await safe(() => listByVehicle(id), "listByVehicle");
      if (h) setHistory(h);
    } else {
      setNext(null);
      setHistory([]);
    }

    // 4) Alertas
    const als = await safe(() => listAlerts(), "listAlerts");
    if (als) setAlerts(als);
  }

  useEffect(() => {
    // Pequeño delay por si el token aún no está en localStorage
    const t = setTimeout(() => { void refreshAll(); }, 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {err && (
        <div className="p-3 rounded border border-red-400 bg-red-50 text-red-700">
          <div className="font-semibold">Error</div>
          <div className="text-sm whitespace-pre-wrap">{err}</div>
        </div>
      )}

      <div className="space-x-2">
        <select
          className="border p-2"
          value={selected ?? ""}
          onChange={async (e) => {
            const id = Number(e.target.value);
            setSelected(id);
            setErr(null);
            const ns = await safe(() => getNextServices(id), "getNextServices");
            if (ns) setNext(ns);
            const h = await safe(() => listByVehicle(id), "listByVehicle");
            if (h) setHistory(h);
          }}
        >
          <option value="">-- selecciona vehículo --</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.marca} {v.modelo} ({v.anio})
            </option>
          ))}
        </select>

        <button
          className="bg-indigo-600 text-white px-3 py-1 rounded"
          onClick={async () => {
            setLoading(true);
            setErr(null);
            await safe(() => runAlertsNow(), "runAlertsNow");
            await refreshAll(selected ?? undefined);
            setLoading(false);
          }}
        >
          {loading ? "..." : "Generar alertas (run-now)"}
        </button>

        <button
          className="bg-emerald-600 text-white px-3 py-1 rounded"
          onClick={async () => {
            if (!selected) return;
            setLoading(true); setErr(null);

            // Odómetro actual del vehículo seleccionado (si está disponible)
            const v = vehicles.find(v => v.id === selected);
            const km = v?.odometro ?? undefined;

            // Crear record de "aceite" para hoy
            const today = new Date().toISOString().slice(0, 10);
            const created = await safe(() => createServiceRecord({
              vehicle_id: selected,
              servicio: "aceite",
              fecha: today,
              km,
              notas: "Registro rápido desde Dashboard",
            }), "createRecord");

            if (created) {
              // Recalcula alertas y refresca todo
              await safe(() => runAlertsNow(), "runAlertsNow");
              await refreshAll(selected);
            }
            setLoading(false);
          }}
        >
          Registrar cambio de aceite (hoy)
        </button>
      </div>

      <section>
        <h2 className="font-semibold mb-2">Próximos servicios</h2>
        {!next ? (
          <div className="text-sm text-gray-600">Selecciona un vehículo.</div>
        ) : (
          <ul className="space-y-2">
            {next.items?.map((it: any, i: number) => (
              <li key={i} className="border rounded p-3">
                <div className="font-medium">{it.servicio}</div>
                <div className="text-sm">Próximo km: {it.proximo_km ?? "-"}</div>
                <div className="text-sm">Próxima fecha: {it.proxima_fecha ?? "-"}</div>
                <div className="text-xs text-gray-500">Regla: {it.razon}</div>
              </li>
            )) ?? <li className="text-sm text-gray-600">Sin datos.</li>}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-semibold mb-2">Alertas</h2>
        {alerts.length === 0 ? (
          <div className="text-sm text-gray-600">Sin alertas.</div>
        ) : (
          <ul className="space-y-2">
            {alerts.map((a) => (
              <li key={a.id} className="border rounded p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {a.servicio} · Veh #{a.vehicle_id}
                  </div>
                  <div className="text-sm">Programada: {a.fecha_programada ?? "-"}</div>
                  <div className="text-xs text-gray-500">
                    Estado: {a.estado} · Creada: {new Date(a.created_at).toLocaleString()}
                  </div>
                </div>
                {a.estado !== "ack" && (
                  <button
                    className="bg-green-600 text-white px-3 py-1 rounded"
                    onClick={async () => {
                      setErr(null);
                      await safe(() => ackAlert(a.id), "ackAlert");
                      const als = await safe(() => listAlerts(), "listAlerts");
                      if (als) setAlerts(als);
                    }}
                  >
                    Marcar como atendida
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-semibold mb-2">Historial</h2>
        {(!selected || history.length === 0) ? (
          <div className="text-sm text-gray-600">
            {selected ? "Sin registros." : "Selecciona un vehículo."}
          </div>
        ) : (
          <div className="overflow-auto border rounded">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-2">Fecha</th>
                  <th className="text-left p-2">Servicio</th>
                  <th className="text-left p-2">KM</th>
                  <th className="text-left p-2">Notas</th>
                </tr>
              </thead>
              <tbody>
                {history.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="p-2">{r.fecha}</td>
                    <td className="p-2">{r.servicio}</td>
                    <td className="p-2">{r.km ?? "-"}</td>
                    <td className="p-2">{r.notas ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

