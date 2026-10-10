from fastapi import APIRouter, HTTPException
import psycopg

from app.core.config import DATABASE_URL

router = APIRouter()


@router.get("/health")
def health() -> dict[str, str]:
    try:
        with psycopg.connect(DATABASE_URL, connect_timeout=2) as connection:
            connection.execute("SELECT 1")
    except psycopg.Error as exc:
        raise HTTPException(status_code=503, detail={"error": "database_unavailable"}) from exc
    return {"status": "ok", "database": "ok"}
