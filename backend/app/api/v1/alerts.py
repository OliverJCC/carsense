from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.security import get_db, get_current_user
from app.core.scheduler import generate_alerts_job
from app.db.models import Alert, Vehicle, User

router = APIRouter(prefix="/alerts", tags=["alerts"])

def _owned_vehicle_ids(db: Session, user: User):
    return [v.id for v in db.query(Vehicle).filter(Vehicle.user_id == user.id).all()]

@router.get("/")
def list_alerts(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    v_ids = _owned_vehicle_ids(db, user)
    items = db.query(Alert).filter(Alert.vehicle_id.in_(v_ids)).order_by(Alert.created_at.desc()).all()
    return [
        {
            "id": a.id,
            "vehicle_id": a.vehicle_id,
            "servicio": a.servicio,
            "fecha_programada": a.fecha_programada.isoformat() if a.fecha_programada else None,
            "estado": a.estado,
            "created_at": a.created_at.isoformat(),
        }
        for a in items
    ]

@router.post("/ack/{alert_id}")
def acknowledge_alert(alert_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    a = db.query(Alert).filter(Alert.id == alert_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    v = db.query(Vehicle).filter(Vehicle.id == a.vehicle_id, Vehicle.user_id == user.id).first()
    if not v:
        raise HTTPException(status_code=403, detail="No autorizado")
    a.estado = "ack"
    db.add(a)
    db.commit()
    return {"status": "ok", "alert_id": alert_id}

@router.post("/run-now")
def run_now(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    # No diferenciamos roles para el MVP; cualquiera puede dispararlo
    return generate_alerts_job()
