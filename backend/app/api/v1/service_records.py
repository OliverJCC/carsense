# backend/app/api/v1/service_records.py
from typing import List, Optional, Dict, Any
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.security import get_db, get_current_user
from app.db.models import ServiceRecord, Vehicle, User

router = APIRouter(prefix="/service-records", tags=["service-records"])

# -------- CREATE (ya lo tenías) --------
@router.post("/", response_model=Dict[str, Any])
def create_service_record(
    payload: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Espera: { vehicle_id, servicio, fecha:'YYYY-MM-DD', km, notas? }
    """
    vehicle_id = payload.get("vehicle_id")
    if not vehicle_id:
        raise HTTPException(status_code=422, detail="vehicle_id es requerido")

    # Validar pertenencia del vehículo al usuario
    v = db.query(Vehicle).filter(
        Vehicle.id == vehicle_id,
        Vehicle.user_id == current_user.id
    ).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")

    # Normaliza fecha
    fecha_in = payload.get("fecha")
    if isinstance(fecha_in, str):
        try:
            y, m, d = map(int, fecha_in.split("-"))
            fecha = date(y, m, d)
        except Exception:
            raise HTTPException(status_code=422, detail="fecha debe ser YYYY-MM-DD")
    elif isinstance(fecha_in, date):
        fecha = fecha_in
    else:
        raise HTTPException(status_code=422, detail="fecha es requerida")

    rec = ServiceRecord(
        vehicle_id=vehicle_id,
        servicio=payload.get("servicio"),
        fecha=fecha,
        km=payload.get("km"),
        notas=payload.get("notas"),
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)

    return {
        "id": rec.id,
        "vehicle_id": rec.vehicle_id,
        "servicio": rec.servicio,
        "fecha": rec.fecha.isoformat() if rec.fecha else None,
        "km": rec.km,
        "notas": rec.notas,
    }

# -------- LIST: por query ?vehicle_id= --------
@router.get("/", response_model=List[Dict[str, Any]])
def list_service_records(
    vehicle_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    GET /service-records/?vehicle_id=ID  -> lista del vehículo de ese usuario
    GET /service-records/               -> lista todos los del usuario (si no mandas vehicle_id)
    """
    q = db.query(ServiceRecord).join(Vehicle, ServiceRecord.vehicle_id == Vehicle.id)
    q = q.filter(Vehicle.user_id == current_user.id)
    if vehicle_id:
        q = q.filter(ServiceRecord.vehicle_id == vehicle_id)
    q = q.order_by(ServiceRecord.fecha.desc(), ServiceRecord.id.desc())

    rows = q.all()
    return [
        {
            "id": r.id,
            "vehicle_id": r.vehicle_id,
            "servicio": r.servicio,
            "fecha": r.fecha.isoformat() if r.fecha else None,
            "km": r.km,
            "notas": r.notas,
        }
        for r in rows
    ]

# -------- LIST: ruta alternativa /by-vehicle/{id} --------
@router.get("/by-vehicle/{vehicle_id}", response_model=List[Dict[str, Any]])
def list_by_vehicle_path(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = (
        db.query(ServiceRecord)
        .join(Vehicle, ServiceRecord.vehicle_id == Vehicle.id)
        .filter(Vehicle.user_id == current_user.id, ServiceRecord.vehicle_id == vehicle_id)
        .order_by(ServiceRecord.fecha.desc(), ServiceRecord.id.desc())
    )
    rows = q.all()
    return [
        {
            "id": r.id,
            "vehicle_id": r.vehicle_id,
            "servicio": r.servicio,
            "fecha": r.fecha.isoformat() if r.fecha else None,
            "km": r.km,
            "notas": r.notas,
        }
        for r in rows
    ]


