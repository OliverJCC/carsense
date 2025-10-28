// src/api/vehicles.ts
import { api } from "./http";

export type Vehicle = {
  id: number;
  marca: string;
  modelo: string;
  anio: number;
  odometro: number;
  vin?: string | null;
};

export async function listVehicles() {
  const { data } = await api.get("/vehicles/");
  return data as Vehicle[];
}

export async function createVehicle(v: Omit<Vehicle, "id">) {
  const { data } = await api.post("/vehicles/", v);
  return data as Vehicle;
}

export async function updateVehicle(id: number, patch: Partial<Omit<Vehicle, "id">>) {
  const { data } = await api.put(`/vehicles/${id}`, patch); // <- backticks
  return data as Vehicle;
}

export type NextServices = {
  vehicle_id: number;
  items: {
    servicio: string;
    proximo_km?: number | null;
    proxima_fecha?: string | null;
    razon: string;
  }[];
};

export async function getNextServices(vehicleId: number) {
  const { data } = await api.get(`/vehicles/${vehicleId}/next-services`); // <- backticks
  return data as NextServices;
}




