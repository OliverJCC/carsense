from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List

class Settings(BaseSettings):
    APP_NAME: str = "CarSense"
    ENV: str = "dev"
    SECRET_KEY: str = "change-me"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    DATABASE_URL: str = "sqlite:///./carsense.db"
    CORS_ORIGINS: str = "http://localhost:5173"

    class Config:
        env_file = ".env"

@lru_cache
def get_settings() -> Settings:
    return Settings()

def get_cors_origins(settings: Settings) -> List[str]:
    return [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
