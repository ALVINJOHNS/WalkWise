import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://venueflow:venueflow_local@localhost:5432/venueflow")
CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
