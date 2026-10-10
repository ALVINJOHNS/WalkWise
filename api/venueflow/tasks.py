from celery import shared_task


@shared_task(name="venueflow.health.ping")
def ping():
    return "pong"
