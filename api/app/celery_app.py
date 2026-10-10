from celery import Celery

from app.core.config import CELERY_BROKER_URL

celery_app = Celery("venueflow", broker=CELERY_BROKER_URL, include=["app.tasks.health"])
celery_app.conf.update(task_serializer="json", accept_content=["json"], result_serializer="json", timezone="UTC", enable_utc=True)
