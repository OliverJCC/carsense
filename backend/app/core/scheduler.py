from datetime import date, timedelta
from typing import Iterable
from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.db.models import Vehicle, Service, ServiceRecord, Alert

KM_THRESHOLD = 500
DAYS_THRESHOLD = 30

def _compute_next_for_vehicle(db: Session, v: Vehicle, rules: Iterable[Service]):
    today = date.today()
    results = []
    for r in rules:
        last = (
            db.query(ServiceRecord)
            .filter(ServiceRecord.vehicle_id == v.id, ServiceRecord.servicio == r.tipo)
            .order_by(ServiceRecord.fecha.desc(), ServiceRecord.id.desc())
            .first()
        )
        base_date = last.fecha if last and last.fecha else today
        base_km = last.km if (last and last.km is not None) else v.odometro

        due_km = base_km + r.intervalo_km if r.intervalo_km else None
        due_date = base_date + timedelta(days=r.intervalo_meses * 30) if r.intervalo_meses else None

        results.append((r.tipo, due_km, due_date))
    return results

def _upsert_alert(db: Session, vehicle_id: int, servicio: str, fecha_programada):
    # Si ya hay una pendiente para este servicio, no duplicar
    exists = (
        db.query(Alert)
        .filter(Alert.vehicle_id == vehicle_id, Alert.servicio == servicio, Alert.estado == "pendiente")
        .first()
    )
    if exists:
        # Actualiza fecha si cambió
        if fecha_programada and exists.fecha_programada != fecha_programada:
            exists.fecha_programada = fecha_programada
            db.add(exists)
        return

    al = Alert(vehicle_id=vehicle_id, servicio=servicio, fecha_programada=fecha_programada, estado="pendiente")
    db.add(al)

def generate_alerts_job():
    db: Session = SessionLocal()
    try:
        rules = db.query(Service).all()
        vehicles = db.query(Vehicle).all()
        today = date.today()

        for v in vehicles:
            nexts = _compute_next_for_vehicle(db, v, rules)
            for servicio, due_km, due_date in nexts:
                warn_km = (due_km is not None) and (due_km - v.odometro <= KM_THRESHOLD)
                warn_date = (due_date is not None) and ((due_date - today).days <= DAYS_THRESHOLD)
                if warn_km or warn_date:
                    _upsert_alert(db, v.id, servicio, due_date)
        db.commit()
        return {"status": "ok", "alerts_created_or_updated": True}
    finally:
        db.close()

_scheduler: BackgroundScheduler | None = None

def start_scheduler():
    global _scheduler
    if _scheduler is None:
        _scheduler = BackgroundScheduler(timezone="UTC")
        # corre una vez al día
        _scheduler.add_job(generate_alerts_job, "interval", hours=24, id="alerts_daily")
        _scheduler.start()
