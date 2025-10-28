# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importa los routers explícitamente desde sus módulos
from app.api.v1.health import router as health_router
from app.api.v1.auth import router as auth_router
from app.api.v1.vehicles import router as vehicles_router
from app.api.v1.service_records import router as service_records_router
from app.api.v1.alerts import router as alerts_router
from app.api.v1.chatbot import router as chatbot_router

# Scheduler
from app.core.scheduler import start_scheduler

app = FastAPI(title="CarSense")

# CORS para dev
origins = [
    "http://localhost:5173", "http://127.0.0.1:5173",
    "http://localhost:5174", "http://127.0.0.1:5174",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Montar routers bajo /api/v1
app.include_router(health_router,          prefix="/api/v1")
app.include_router(auth_router,            prefix="/api/v1")
app.include_router(vehicles_router,        prefix="/api/v1")
app.include_router(service_records_router, prefix="/api/v1")
app.include_router(alerts_router,          prefix="/api/v1")
app.include_router(chatbot_router,         prefix="/api/v1")

@app.on_event("startup")
def _startup():
    start_scheduler()


