import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "local-only-venueflow-key")
DEBUG = os.getenv("DJANGO_DEBUG", "1") == "1"
ALLOWED_HOSTS = [host.strip() for host in os.getenv(
    "DJANGO_ALLOWED_HOSTS",
    "localhost,127.0.0.1,api,roving-whiny-underpay.ngrok-free.dev,.trycloudflare.com",
).split(",") if host.strip()]
CSRF_TRUSTED_ORIGINS = [origin.strip() for origin in os.getenv(
    "DJANGO_CSRF_TRUSTED_ORIGINS",
    "https://roving-whiny-underpay.ngrok-free.dev,https://*.trycloudflare.com",
).split(",") if origin.strip()]
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
# The organizer posts a base64 data URL as JSON (about 4/3 the image size).
# Keep this just above the organizer's 15 MiB body guard so valid 10 MiB plans
# reach that handler and oversized requests receive its JSON error response.
DATA_UPLOAD_MAX_MEMORY_SIZE = 16 * 1024 * 1024

INSTALLED_APPS = [
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.gis",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.postgres",
    "django.contrib.staticfiles",
    "whitenoise.runserver_nostatic",
    "rest_framework",
    "venueflow.apps.VenueflowConfig",
]
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
]
ROOT_URLCONF = "config.urls"
TEMPLATES = [{
    "BACKEND": "django.template.backends.django.DjangoTemplates",
    "DIRS": [], "APP_DIRS": True,
    "OPTIONS": {"context_processors": [
        "django.template.context_processors.request", "django.contrib.auth.context_processors.auth",
        "django.contrib.messages.context_processors.messages",
    ]},
}]
WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"
DATABASES = {"default": {
    "ENGINE": "django.contrib.gis.db.backends.postgis",
    "NAME": os.getenv("POSTGRES_DB", "venueflow"),
    "USER": os.getenv("POSTGRES_USER", "venueflow"),
    "PASSWORD": os.getenv("POSTGRES_PASSWORD", "venueflow_local"),
    "HOST": os.getenv("POSTGRES_HOST", "db"),
    "PORT": os.getenv("POSTGRES_PORT_INTERNAL", "5432"),
}}
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kolkata"
USE_I18N = True
USE_TZ = True
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
REST_FRAMEWORK = {"DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"]}
CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://redis:6379/0")
CELERY_TASK_SERIALIZER = "json"
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_RESULT_SERIALIZER = "json"
