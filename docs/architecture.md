# Walkwise architecture and teammate handoff

## Shape

This is a small modular application with one Django web service rendering pages and API responses, one relational database, and one background worker. Docker Compose starts the local stack. Template and feature work can proceed independently using the documented contract.

```text
Django SSR templates + Tailwind + static JavaScript
        │ same-origin /api
        ▼
Django REST Framework / ORM ─── PostgreSQL + PostGIS
        │                         │ venue, event, paths, snapshots
        ▼                         └ plan files stay local for demo
Redis broker ── Celery worker
```

PostGIS provides geographic columns through GeoDjango model fields while `plan_x` and `plan_y` retain separate normalized drawing coordinates. Django ORM models/migrations define persistence; use DRF serializers and viewsets for JSON endpoints. The schema separates reusable venues, event-specific items, and published `map_versions`. Route calculation remains an explicit 501 until implemented.

## Start and verify

See the exact commands in the root README. Compose services: `api`, `migrate`, `db`, `redis`, `worker`. The `api` service renders pages and serves the API; the `migrate` one-shot service applies Django ORM migrations. Keep `.env` local and use `.env.example` for safe defaults.

## Ownership and parallel work

| Workstream | Suggested owned paths | Interface / dependency |
| --- | --- | --- |
| Organizer map editor | `api/venueflow/templates/venueflow/organizer.html`, `api/venueflow/static/venueflow/organizer.js` | Render server-side and post validated forms to DRF endpoints; plan coordinates are normalized 0–1. |
| Visitor map and search | `api/venueflow/templates/venueflow/visitor.html`, `api/venueflow/static/venueflow/visitor.js` | Render a published venue snapshot and destinations; do not mutate published snapshots. |
| Path graph and routing | `api/venueflow/routing.py`, `api/venueflow/static/venueflow/visitor.js` | Routing contract is `POST /api/route` and currently returns 501; keep graph logic testable and independent from page rendering. |
| Venue/event APIs and persistence | `api/venueflow/models.py`, `serializers.py`, `views.py`, `migrations/**` | Extend DRF serializers/viewsets; preserve plan coordinates separately from geography. Coordinate migration edits with the integration owner. |
| Publishing, QR, demo | Integration-owned `api/venueflow/views.py`, shared base template, and publishing API module | Consume venue/event contracts; create immutable version snapshots and a visitor URL. Coordinate changes to shared base template with integration owner. |

Page routes are `/`, `/organizer/`, and `/v/<slug>/`; API paths are prefixed `/api/`. Use Django REST Framework serializers for validation and return errors in DRF's standard JSON response format. Domain API stubs must stay explicit about missing implementation.

## Database and task workflow

Use Django's `makemigrations` and `migrate` workflow for ORM schema changes; avoid hand-written SQL queries for application persistence. GeoDjango handles PostGIS field types. The simple layering is models → selectors → serializers/forms → views/pages; no service layer is needed for this starter. Celery tasks belong under `api/venueflow/tasks.py`; configure the worker from Django settings and keep jobs idempotent, passing IDs rather than large map payloads through Redis.

## Sources and limitations

The runtime dependencies are standard public packages: Django, Django REST Framework, Tailwind CSS CLI, GeoDjango, Celery, Redis, and the official PostGIS Docker image. The supplied OHC architecture informed the monolith and layering; its CareUI was not copied. There is no external map tile or geocoding service configured. No authentication, uploaded-object storage, automatic calibration, routing algorithm, or cross-device publication is implemented yet.
