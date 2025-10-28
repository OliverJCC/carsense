from typing import Optional, List
from pydantic import BaseModel, Field

class VehicleBase(BaseModel):
    marca: str
    modelo: str
    anio: int
    odometro: float = 0

class VehicleCreate(VehicleBase):
    vin: Optional[str] = None

class VehicleUpdate(BaseModel):
    marca: Optional[str] = None
    modelo: Optional[str] = None
    anio: Optional[int] = None
    odometro: Optional[float] = Field(default=None, ge=0)
    vin: Optional[str] = None

class VehicleOut(VehicleBase):
    id: int
    vin: Optional[str] = None

    class Config:
        from_attributes = True

class NextServiceItem(BaseModel):
    servicio: str
    proximo_km: float | None = None
    proxima_fecha: str | None = None
    razon: str  # "por_km", "por_tiempo" o "sin_historial"

class NextServicesOut(BaseModel):
    vehicle_id: int
    items: List[NextServiceItem]
