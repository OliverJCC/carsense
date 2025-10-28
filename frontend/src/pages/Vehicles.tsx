// src/pages/Vehicles.tsx
import { useEffect, useState } from "react";
import { createVehicle, listVehicles, updateVehicle } from "../api/vehicles";
import type { Vehicle } from "../api/vehicles";

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [form, setForm] = useState({ marca:"", modelo:"", anio:2020, odometro:0, vin:"" });

  async function refresh(){ setVehicles(await listVehicles()); }
  useEffect(()=>{ void refresh(); },[]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    await createVehicle({ ...form, anio: Number(form.anio), odometro: Number(form.odometro) });
    setForm({ marca:"", modelo:"", anio:2020, odometro:0, vin:"" });
    await refresh();
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Vehículos</h1>

      <form onSubmit={onCreate} className="grid grid-cols-2 gap-2 max-w-2xl">
        <input className="border p-2" placeholder="Marca" value={form.marca} onChange={e=>setForm({...form, marca:e.target.value})} />
        <input className="border p-2" placeholder="Modelo" value={form.modelo} onChange={e=>setForm({...form, modelo:e.target.value})} />
        <input className="border p-2" placeholder="Año" type="number" value={form.anio} onChange={e=>setForm({...form, anio:Number(e.target.value)})} />
        <input className="border p-2" placeholder="Odómetro" type="number" value={form.odometro} onChange={e=>setForm({...form, odometro:Number(e.target.value)})} />
        <input className="border p-2 col-span-2" placeholder="VIN (opcional)" value={form.vin} onChange={e=>setForm({...form, vin:e.target.value})} />
        <button className="bg-blue-600 text-white px-4 py-2 rounded col-span-2">Agregar</button>
      </form>

      <ul className="space-y-2">
        {vehicles.map(v => (
          <li key={v.id} className="border rounded p-3">
            <div className="font-medium">{v.marca} {v.modelo} ({v.anio}) · #{v.id}</div>
            <div className="text-sm">Odómetro: {v.odometro}</div>

            <div className="mt-2 flex gap-2">
              <button
                className="bg-gray-800 text-white px-3 py-1 rounded"
                onClick={async ()=>{
                  await updateVehicle(v.id, { odometro: v.odometro + 100 });
                  await refresh();
                }}
              >
                +100 km
              </button>

              <button
                className="bg-gray-900 text-white px-3 py-1 rounded"
                onClick={async ()=>{
                  await updateVehicle(v.id, { odometro: v.odometro + 1000 });
                  await refresh();
                }}
              >
                +1000 km
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

