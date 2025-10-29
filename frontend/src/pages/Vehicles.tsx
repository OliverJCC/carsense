// frontend/src/pages/Vehicles.tsx
import React, { useEffect, useState } from "react";
import { listVehicles, updateVehicle, type Vehicle } from "../api/vehicles";
import { runAlertsNow } from "../api/alerts";
import { createServiceRecord } from "../api/serviceRecords";

export default function VehiclesPage() {
  const [items, setItems] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      setLoading(true);
      setError(null);
      const data = await listVehicles();
      setItems(data);
    } catch (e: any) {
      console.error("listVehicles error:", e);
      setError(e?.message ?? "Error al cargar vehículos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 16 }}>
      <h2>Vehículos</h2>

      {error && (
        <div style={{ color: "white", background: "#c0392b", padding: 8, borderRadius: 6, marginBottom: 12 }}>
          {error}
        </div>
      )}

      {loading ? <p>Cargando…</p> : items.length === 0 ? (
        <p>No hay vehículos todavía.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>ID</th>
                <th style={th}>Marca</th>
                <th style={th}>Modelo</th>
                <th style={th}>Año</th>
                <th style={th}>Odómetro</th>
                <th style={th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((v) => (
                <tr key={v.id}>
                  <td style={td}>{v.id}</td>
                  <td style={td}>{v.marca}</td>
                  <td style={td}>{v.modelo}</td>
                  <td style={td}>{v.anio}</td>
                  <td style={td}>{v.odometro}</td>
                  <td style={td}>
                    <button
                      onClick={async () => {
                        const nuevo = (v.odometro ?? 0) + 1000;
                        await updateVehicle(v.id, { odometro: nuevo });
                        await runAlertsNow();
                        await refresh();
                      }}
                    >
                      +1000 km
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form para registrar servicio al primer vehículo (puedes cambiarlo por v.id dinámico) */}
      {items[0] && (
        <div style={{ marginTop: 24 }}>
          <h3>Agregar registro de servicio al vehículo #{items[0].id}</h3>
          <FormRegistro vehicleId={items[0].id} onDone={async () => { await runAlertsNow(); await refresh(); }} />
        </div>
      )}
    </div>
  );
}

function FormRegistro({ vehicleId, onDone }:{ vehicleId:number; onDone:()=>void }) {
  const [servicio, setServicio] = useState("aceite");
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0,10));
  const [km, setKm] = useState<number>(0);
  const [notas, setNotas] = useState("");

  return (
    <form
      onSubmit={async e => {
        e.preventDefault();
        await createServiceRecord({ vehicle_id: vehicleId, servicio, fecha, km, notas });
        setNotas("");
        setKm(0);
        await onDone();
      }}
      style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}
    >
      <label>Servicio:
        <select value={servicio} onChange={e=>setServicio(e.target.value)} style={input}>
          <option value="aceite">Aceite</option>
          <option value="rotacion_llantas">Rotación de llantas</option>
          <option value="filtro_aire">Filtro de aire</option>
          <option value="freno">Frenos</option>
        </select>
      </label>
      <label>Fecha:
        <input type="date" value={fecha} onChange={e=>setFecha(e.target.value)} style={input} required />
      </label>
      <label>Kilometraje:
        <input type="number" value={km} onChange={e=>setKm(Number(e.target.value))} style={input} placeholder="km" required />
      </label>
      <label>Notas:
        <input value={notas} onChange={e=>setNotas(e.target.value)} style={{...input, minWidth: 240}} placeholder="opcional" />
      </label>
      <button type="submit">Guardar</button>
    </form>
  );
}

const th: React.CSSProperties = { textAlign: "left", borderBottom: "1px solid #ddd", padding: "8px 6px", background: "#f6f8fa" };
const td: React.CSSProperties = { borderBottom: "1px solid #eee", padding: "8px 6px" };
const input: React.CSSProperties = { marginLeft: 6, padding: "6px 8px" };

