from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import date, datetime
from typing import Any
from app.core.security import get_db
from app.db import models

router = APIRouter(prefix="/service-records", tags=["service_records"])

class ServiceRecordIn(BaseModel):
    vehicle_id: int
    servicio: str
    fecha: Any  # aceptamos str/date/datetime; normalizamos abajo
    km: float | None = None
    notas: str | None = None

def _to_date(d: Any) -> date:
    """Normaliza fecha a datetime.date (admite 'YYYY-MM-DD', 'YYYY/MM/DD', date, datetime)."""
    if isinstance(d, date) and not isinstance(d, datetime):
        return d
    if isinstance(d, datetime):
        return d.date()
    if isinstance(d, str):
        s = d.replace("/", "-").strip()
        return date.fromisoformat(s)
    raise ValueError("fecha inválida; usa 'YYYY-MM-DD'")

@router.post("/", response_model=dict)
def create_service_record(payload: ServiceRecordIn, db: Session = Depends(get_db)):
    veh = db.get(models.Vehicle, payload.vehicle_id)
    if not veh:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")

    try:
        fecha_ok = _to_date(payload.fecha)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Fecha inválida: {e}")

    rec = models.ServiceRecord(
        vehicle_id=payload.vehicle_id,
        servicio=payload.servicio,
        fecha=fecha_ok,
        km=payload.km,
        notas=payload.notas,
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return {
        "id": rec.id,
        "vehicle_id": rec.vehicle_id,
        "servicio": rec.servicio,
        "fecha": rec.fecha,  # FastAPI serializa a "YYYY-MM-DD"
        "km": rec.km,
        "notas": rec.notas,
    }

@router.get("/by-vehicle/{vehicle_id}", response_model=list[dict])
def list_by_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    veh = db.get(models.Vehicle, vehicle_id)
    if not veh:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    stmt = (
        select(models.ServiceRecord)
        .where(models.ServiceRecord.vehicle_id == vehicle_id)
        .order_by(models.ServiceRecord.fecha.desc())
    )
    rows = db.execute(stmt).scalars().all()
    return [
        {
            "id": r.id,
            "vehicle_id": r.vehicle_id,
            "servicio": r.servicio,
            "fecha": r.fecha,
            "km": r.km,
            "notas": r.notas,
        }
        for r in rows
    ]

