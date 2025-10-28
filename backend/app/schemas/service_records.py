from datetime import date
from typing import Optional
from pydantic import BaseModel

class ServiceRecordCreate(BaseModel):
    vehicle_id: int
    servicio: str
    fecha: date
    km: Optional[float] = None
    notas: Optional[str] = None

class ServiceRecordOut(BaseModel):
    id: int
    vehicle_id: int
    servicio: str
    fecha: date
    km: Optional[float] = None
    notas: Optional[str] = None

    class Config:
        from_attributes = True
