// frontend/src/api/serviceRecords.ts
import api from "./http";

export type ServiceRecord = {
  id: number;
  vehicle_id: number;
  servicio: string;      // 'aceite' | 'rotacion_llantas' | 'filtro_aire' | 'freno'
  fecha: string;         // YYYY-MM-DD (ISO string)
  km: number;
  notas?: string | null;
};

export type ServiceRecordIn = {
  vehicle_id: number;
  servicio: string;
  fecha: string;   // YYYY-MM-DD
  km: number;
  notas?: string;
};

/** Crear registro de servicio */
export async function createServiceRecord(payload: ServiceRecordIn) {
  const { data } = await api.post("/service-records/", payload);
  return data as ServiceRecord;
}

/** Listar registros por vehículo (usa query ?vehicle_id=) */
export async function listByVehicle(vehicleId: number) {
  const { data } = await api.get(`/service-records/?vehicle_id=${vehicleId}`);
  return data as ServiceRecord[];
}

/** Alias de compatibilidad (por si en alguna parte quedó createRecord) */
export const createRecord = createServiceRecord;

/** Export default opcional (no es necesario si usas imports nombrados) */
const serviceRecordsApi = { createServiceRecord, listByVehicle, createRecord };
export default serviceRecordsApi;


