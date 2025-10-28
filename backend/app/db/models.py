from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Text, Enum, Float, UniqueConstraint
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.db.base import Base

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(32), default="user")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    vehicles = relationship("Vehicle", back_populates="owner")

class Vehicle(Base):
    __tablename__ = "vehicles"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    marca: Mapped[str] = mapped_column(String(100), nullable=False)
    modelo: Mapped[str] = mapped_column(String(100), nullable=False)
    anio: Mapped[int] = mapped_column(Integer, nullable=False)
    odometro: Mapped[float] = mapped_column(Float, default=0.0)
    vin: Mapped[str | None] = mapped_column(String(64), nullable=True)

    owner = relationship("User", back_populates="vehicles")
    service_records = relationship("ServiceRecord", back_populates="vehicle", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="vehicle", cascade="all, delete-orphan")

class Service(Base):
    __tablename__ = "services"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    # reglas genéricas; si en futuro se especializa por marca/modelo, se agregan columnas opcionales
    tipo: Mapped[str] = mapped_column(String(100), index=True)  # ej. "aceite", "freno", "filtro_aire"
    intervalo_km: Mapped[int] = mapped_column(Integer, nullable=True)      # ej. 10000
    intervalo_meses: Mapped[int] = mapped_column(Integer, nullable=True)   # ej. 6
    descripcion: Mapped[str | None] = mapped_column(Text, nullable=True)

    __table_args__ = (UniqueConstraint("tipo", name="uq_services_tipo"),)

class ServiceRecord(Base):
    __tablename__ = "service_records"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id", ondelete="CASCADE"), index=True)
    servicio: Mapped[str] = mapped_column(String(100), index=True)  # texto = Service.tipo
    fecha: Mapped[date] = mapped_column(Date, default=date.today)
    km: Mapped[float | None] = mapped_column(Float, nullable=True)
    notas: Mapped[str | None] = mapped_column(Text, nullable=True)

    vehicle = relationship("Vehicle", back_populates="service_records")

class Alert(Base):
    __tablename__ = "alerts"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id", ondelete="CASCADE"), index=True)
    servicio: Mapped[str] = mapped_column(String(100), index=True)
    fecha_programada: Mapped[date | None] = mapped_column(Date, nullable=True)
    estado: Mapped[str] = mapped_column(String(20), default="pendiente")  # pendiente/enviada/ack
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    vehicle = relationship("Vehicle", back_populates="alerts")
