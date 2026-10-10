FROM node:22-alpine AS assets
WORKDIR /workspace
COPY package*.json ./
RUN npm ci
COPY api/venueflow ./api/venueflow
RUN npm run build:css

FROM python:3.14-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
RUN apt-get update && apt-get install -y --no-install-recommends binutils gdal-bin libgdal-dev libgeos-dev libproj-dev && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY api/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY api/ ./
COPY --from=assets /workspace/api/venueflow/static/venueflow/css/app.css /app/venueflow/static/venueflow/css/app.css
EXPOSE 8000
CMD ["sh", "-c", "python manage.py collectstatic --noinput && python manage.py runserver 0.0.0.0:8000"]
