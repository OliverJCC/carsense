import api from "./http";
export type ServiceRecord = { id:number; vehicle_id:number; servicio:string; fecha:string; km?:number|null; notas?:string|null; };
export async function listByVehicle(vehicleId:number){ const { data } = await api.get(`/service-records/by-vehicle/${vehicleId}`); return data as ServiceRecord[]; }
export async function createRecord(payload:{vehicle_id:number; servicio:string; fecha:string; km?:number; notas?:string;}){
  const { data } = await api.post("/service-records/", payload); return data as ServiceRecord;
}
