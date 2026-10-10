# VenueFlow — DevDay Exchange Community Hackathon: Kochi

VenueFlow is a hackathon starter for turning venue plans into reusable event maps and visitor navigation.

**[Event and registration on Luma](https://luma.com/z10nz8gp)** · **[Event rules](RULES.md)** · **[Agent instructions](AGENTS.md)**

## Event details

| Detail | Information |
| --- | --- |
| Venue | JAIN University, Kochi |
| Location | [Open the venue map](https://maps.app.goo.gl/Eme7gR7NDXSNRANu5) |
| Rooms | 2008 and 2009 |
| Check-in | 10 October 2026, 6:00 PM IST |
| Kick-off | 10 October 2026, 6:30 PM IST |
| Wrap-up | 11 October 2026, by 10:00 AM IST |
| Participation | Solo or a team of up to 4 participants |
| Theme | Open — build anything you like |

Keep your approved Luma QR code ready for entry, and bring your laptop and charger. Eligible checked-in participants will receive Codex credits and OpenAI API credits.

## Use this template

Project and workflow context lives in [the team execution plan](docs/README.md), [the shared contract](docs/SHARED_CONTRACT.md), and the four role briefs. Follow [RULES.md](RULES.md) and [AGENTS.md](AGENTS.md) for event and contribution guidance.

## Project overview

For a four-person, six-hour build, use the [team execution plan](docs/README.md), its [shared contract](docs/SHARED_CONTRACT.md), and the four role briefs. The full product plan remains in [docs/Walkwise_Development_Plan.md](docs/Walkwise_Development_Plan.md).

- **Project name:** VenueFlow
- **Short description:** Turn a venue plan into an editable event map with walkable paths and visitor destinations.
- **Team:** TODO — participant names and GitHub handles; maximum 4 members.
- **Working demo:** Local server at `http://localhost:8000`; the responsive overview summarizes venues/events and previews intended flows. Overview flow buttons are presentation-only and do not navigate yet.
- **Technology stack:** Django server-rendered templates, Django REST Framework, Django ORM/GeoDjango, PostgreSQL/PostGIS, Tailwind CSS, Redis, Celery, Docker Compose.

### Run the project

Prerequisites: Docker Compose v2. Node.js 22+ and npm are needed only when rebuilding Tailwind CSS assets.

### Docker Compose (recommended)

1. Copy `.env.example` to `.env` and adjust local ports/credentials if needed.
2. Start the database, migration/seed jobs, Django SSR/API server, Redis, and worker: `docker compose up --build`.
3. Open `http://localhost:8000`; organizer and visitor pages and the browsable API share this Django server. API health is at `http://localhost:8000/api/health`.
4. Stop services with `docker compose down`. Remove local database data with `docker compose down -v`.

The `migrate` service applies Django ORM migrations to initialize PostGIS and create tables. The `seed` service adds an idempotent demo venue. Apply model changes with `docker compose run --rm api python manage.py makemigrations venueflow` then restart with `docker compose up --build`.

### Rebuild Tailwind assets

Templates and the API are served by the same Django process. When changing Tailwind classes, run `npm install` and `npm run build:css` (or rebuild the Docker image). To run Django on the host, install system GDAL/GEOS libraries and Python requirements with `python -m pip install -r api/requirements.txt`, set `POSTGRES_HOST=localhost`, start the Compose database and Redis, run `python api/manage.py migrate` and `python api/manage.py seed_demo`, then `python api/manage.py runserver`.

### Project status

- Implemented: Responsive Django SSR overview, organizer and visitor pages; Tailwind static styles and JS; overview venue search and non-navigating flow feedback; Django REST Framework venue/event CRUD; ORM model/migration scaffold; database health endpoint; Celery worker task registration. Backend runtime remains unverified while Docker is unavailable.
- Not implemented: Map editing, route calculation (returns 501), publishing, QR, auth, and production deployment.
- OpenStreetMap and Leaflet have not yet been added; add OSM attribution when the map view is introduced.

For team boundaries and data/API conventions, see [architecture.md](docs/architecture.md). Runtime packages are public libraries; there are no external map tiles or datasets configured yet.

See [AI_USAGE.md](AI_USAGE.md) for AI assistance and [CHANGELOG.md](CHANGELOG.md) for the development record.
