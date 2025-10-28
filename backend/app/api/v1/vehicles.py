from datetime import date, timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_db, get_current_user
from app.db.models import Vehicle, Service, ServiceRecord, User
from app.schemas.vehicles import VehicleCreate, VehicleUpdate, VehicleOut, NextServicesOut, NextServiceItem

router = APIRouter(prefix="/vehicles", tags=["vehicles"])

# Helpers
def _ensure_owner(db: Session, vehicle_id: int, user: User) -> Vehicle:
    v = db.query(Vehicle).filter(Vehicle.id == vehicle_id, Vehicle.user_id == user.id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    return v

@router.get("/", response_model=List[VehicleOut])
def list_vehicles(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    items = db.query(Vehicle).filter(Vehicle.user_id == user.id).all()
    return items

@router.post("/", response_model=VehicleOut, status_code=201)
def create_vehicle(
    data: VehicleCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    v = Vehicle(user_id=user.id, **data.model_dump())
    db.add(v)
    db.commit()
    db.refresh(v)
    return v

@router.put("/{vehicle_id}", response_model=VehicleOut)
def update_vehicle(
    vehicle_id: int,
    data: VehicleUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    v = _ensure_owner(db, vehicle_id, user)
    for k, val in data.model_dump(exclude_unset=True).items():
        setattr(v, k, val)
    db.add(v)
    db.commit()
    db.refresh(v)
    return v

@router.delete("/{vehicle_id}", status_code=204)
def delete_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    v = _ensure_owner(db, vehicle_id, user)
    db.delete(v)
    db.commit()
    return

@router.get("/{vehicle_id}/next-services", response_model=NextServicesOut)
def next_services(
    vehicle_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    v = _ensure_owner(db, vehicle_id, user)
    rules = db.query(Service).all()

    items: List[NextServiceItem] = []
    today = date.today()

    for rule in rules:
        # Buscar el último servicio realizado de este tipo
        last: ServiceRecord | None = (
            db.query(ServiceRecord)
              .filter(ServiceRecord.vehicle_id == v.id, ServiceRecord.servicio == rule.tipo)
              .order_by(ServiceRecord.fecha.desc(), ServiceRecord.id.desc())
              .first()
        )

        # Base temporal y de km
        base_date = last.fecha if last and last.fecha else today
        base_km = last.km if (last and last.km is not None) else v.odometro

        # Calcular próximas metas
        proximo_km = None
        proxima_fecha = None
        razones = []

        if rule.intervalo_km:
            proximo_km = (base_km or 0) + rule.intervalo_km
            razones.append("por_km")

        if rule.intervalo_meses:
            # aproximación: meses * 30 días para simplicidad
            proxima_fecha_calc = base_date + timedelta(days=rule.intervalo_meses * 30)
            proxima_fecha = proxima_fecha_calc.isoformat()
            razones.append("por_tiempo")

        if not razones:
            razones.append("sin_historial")

        items.append(
            NextServiceItem(
                servicio=rule.tipo,
                proximo_km=proximo_km,
                proxima_fecha=proxima_fecha,
                razon=" y ".join(razones),
            )
        )

    return NextServicesOut(vehicle_id=v.id, items=items)
