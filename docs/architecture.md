# VenueFlow architecture and teammate handoff

## Shape

This is a small modular application with one browser app, one HTTP API, one relational database, and one background worker. Docker Compose starts the local stack. The React app remains usable with fixture/local adapters while feature work proceeds independently.

```text
Browser (Vite + React + Tailwind)
        │ HTTP /api
        ▼
FastAPI modular API ───── PostgreSQL + PostGIS
        │                         │ venue, event, paths, snapshots
        ▼                         └ plan files stay local for demo
Redis broker ── Celery worker
```

PostGIS provides geographic columns while `plan_x` and `plan_y` retain separate normalized drawing coordinates. The schema separates reusable venues, event-specific items, and published `map_versions`. Current API feature endpoints return explicit 501 responses until implemented; only health is live.

## Start and verify

See the exact commands in the root README. Compose services: `web`, `api`, `db`, `redis`, `worker`. Database initialization is in `api/migrations/001_initial.sql`; Docker applies this only on an empty data volume. Keep `.env` local and use `.env.example` for safe defaults.

## Ownership and parallel work

| Workstream | Suggested owned paths | Interface / dependency |
| --- | --- | --- |
| Organizer map editor | `src/features/organizer/**` | Export a screen using `Venue` from `src/shared/types.ts`; call `onSave(venue)` or a documented adapter. Plan coordinates are normalized 0–1. |
| Visitor map and search | `src/features/visitor/**` | Read a venue snapshot and render destinations/status; do not mutate published snapshots. |
| Path graph and routing | `src/features/navigation/**`, `api/app/routing/**` | Pure browser graph function can accept the shared `Venue`; API routing contract is `POST /api/route` and currently returns 501. |
| Venue/event APIs and persistence | `api/app/api/**`, `api/app/models/**`, `api/app/schemas/**`, `api/migrations/**` | Implement schema-validated JSON endpoints; preserve plan coordinates separately from geography. Coordinate migration edits with the integration owner. |
| Publishing, QR, demo | Integration-owned `src/app/**`, `src/shared/**` and publishing API module | Consume venue/event contracts; create immutable version snapshots and a visitor URL. Avoid editing other feature folders. |

Frontend routes are `/organizer` and `/v/:slug`; seed fixture is in `src/shared/seedVenue.ts`. API paths are prefixed `/api`. Use FastAPI validation for request schemas and return errors as `{ "detail": { "error": "..." } }`. Domain API stubs must stay explicit about missing implementation.

## Database and task workflow

Use additive numbered SQL files under `api/migrations/` and document any PostGIS-specific SQL there. The initial SQL is a Compose bootstrap, not a production migration runner; on the hackathon demo, reset the local named volume to apply bootstrap changes. Celery tasks belong under `api/app/tasks/`; register tasks in `api/app/celery_app.py`. Keep jobs idempotent and pass IDs rather than large map payloads through Redis.

## Sources and limitations

The runtime dependencies are standard public packages: React, Vite, Tailwind CSS, FastAPI, psycopg, Celery, Redis, and the official PostGIS Docker image. There is no external map tile or geocoding service configured. No authentication, uploaded-object storage, automatic calibration, routing algorithm, or cross-device publication is implemented yet.
