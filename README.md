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
- **Working demo:** Local foundation at `http://localhost:5173`; feature behavior is still under development.
- **Technology stack:** React, TypeScript, Vite, Tailwind CSS, FastAPI, PostgreSQL/PostGIS, Redis, Celery, Docker Compose.

### Run the project

Prerequisites: Docker Compose v2, Node.js 22+ and npm (for host frontend development).

### Docker Compose (recommended)

1. Copy `.env.example` to `.env` and adjust local ports/credentials if needed.
2. Start the database, Redis, API, worker, and web dev server: `docker compose up --build`.
3. Open `http://localhost:5173`; API docs are at `http://localhost:8000/docs` and the health check is `http://localhost:8000/api/health`.
4. Stop services with `docker compose down`. Remove local database data with `docker compose down -v`.

PostGIS tables are initialized from `api/migrations/001_initial.sql` when the database volume is first created. For a fresh schema after editing that bootstrap SQL, reset the volume with the command above.

### Run the web app on the host

Start dependencies and API with `docker compose up db redis api worker`, then run `npm install` and `npm run dev` in another terminal. Use `npm run typecheck` and `npm run build` for frontend checks.

### Project status

- Working: Starter UI routes, seeded venue contract, API and database health endpoint, schema bootstrap, Celery worker task registration.
- Not implemented: Venue/event persistence endpoints (return 501), map editing, route calculation, publishing, QR, auth, and production deployment.
- OpenStreetMap and Leaflet have not yet been added; add OSM attribution when the map view is introduced.

For team boundaries and data/API conventions, see [architecture.md](docs/architecture.md). Runtime packages are public libraries; there are no external map tiles or datasets configured yet.

See [AI_USAGE.md](AI_USAGE.md) for AI assistance and [CHANGELOG.md](CHANGELOG.md) for the development record.
