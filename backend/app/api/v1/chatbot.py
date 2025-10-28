from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/chatbot", tags=["chatbot"])

class QueryIn(BaseModel):
    text: str

@router.post("/query")
def query(q: QueryIn):
    t = q.text.lower()
    if "aceite" in t:
        return {
            "intent": "luz_aceite",
            "steps": [
                "Detente y apaga el motor lo antes posible.",
                "Verifica el nivel de aceite con la varilla.",
                "Si está bajo, rellena con el grado recomendado y revisa fugas.",
                "Agenda cambio de aceite y diagnóstico."
            ],
        }
    return {"intent": "desconocido", "steps": ["Describe con más detalle el síntoma."]}
