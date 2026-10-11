# Walkwise

**Walkwise helps event teams turn a venue layout into an editable map with destinations and visitor routes.** Organizers can maintain venue information and walkable connections; visitors can explore mapped destinations, check their status, and follow a route where the map has the required location data.

Walkwise is being built for temporary, changing venues such as college festivals, fairs, conferences, and pop-up events. Its goal is to make venue information easier to prepare, update, and use on site.

## Why Walkwise

Visitors at temporary events often have to interpret static floor plans, ask for directions, or guess whether a place is open. Walkwise gives organizers one place to prepare venue information and gives visitors an interactive map to consult. Clear destination status and routes based on organizer-authored connections can reduce confusion and help people find facilities and event locations.

## Features

### Organizer Studio

- Choose a venue and event, then edit that event's saved map draft.
- Load a PNG or JPG floor plan as a backdrop, or work with the interactive street map.
- Add and edit destinations, including names, categories, descriptions, and open, closed, or delayed status.
- Place and move path points; connect them into a walkable graph.
- Set map locations with explicit browser GPS actions. Location permission is requested only after the organizer starts a location action.
- Draw street-map connections and adjust them as straight or curved lines. Curves are organizer-authored geometry and are not snapped to roads or sidewalks.
- Optionally ask AI to suggest destinations, path points, and connections from a floor-plan image. Suggestions are approximate and must be reviewed by the organizer.
- Save and reload drafts for individual events.

### Visitor Map

- Open an event's visitor page and explore destinations on an interactive map when usable location data is available, or view saved plan coordinates on a neutral canvas.
- See destination details and availability status.
- Request the visitor's current location with the **Locate me** action.
- Follow routes through the organizer's explicitly connected, georeferenced path graph when the required data exists.

## Use cases

- A college festival team maps stages, registration, food, restrooms, and help points.
- A conference organizer prepares room and facility locations and updates a destination's status.
- A fair or pop-up team lays out temporary stalls and connects visitor routes.
- An event crew captures on-site locations and adjusts paths as the venue is prepared.

## Benefits

- **For visitors:** find destinations and check their status without relying only on a static image or asking staff for every direction.
- **For organizers:** keep places and connections together in an editable event draft and correct information as plans change.
- **For event teams:** share a consistent map-based view of the venue and its intended walkable connections.

Routing depends on organizer-authored graph links and georeferenced path points; Walkwise does not infer missing connections. AI-generated plan interpretations are suggestions, not verified measurements.

## Technology

Walkwise uses a single Django application for its server-rendered pages and JSON API; it does not run a separate frontend server.

- **Backend and pages:** Python 3.14, Django 6.x, Django REST Framework, Django templates, and progressive JavaScript.
- **Data:** Django ORM / GeoDjango with PostgreSQL and PostGIS for venue, event, destination, and path data.
- **Background jobs:** Celery with Redis as the broker.
- **Styles:** Tailwind CSS compiled into Django static files with Node.js 22 and npm.
- **Map:** Leaflet 1.9.4 and OpenStreetMap tiles, with visible attribution.
- **Local services:** Docker Compose.
- **Optional AI assistance:** OpenAI Responses API for organizer-requested floor-plan analysis.

## Run locally

The recommended setup uses Docker Compose v2. Install Docker Desktop or Docker Engine with the Compose plugin. Node.js 22+ and npm are only needed if you rebuild the Tailwind assets outside the image build.

1. Copy `.env.example` to `.env`. Change local credentials and ports if they conflict with services on your machine. Set `OPENAI_API_KEY` only if you want to use floor-plan analysis; `OPENAI_MODEL` is optional.
2. Start the app and its services:

   ```sh
   docker compose up --build
   ```

   Compose starts PostGIS and Redis, runs database migrations and demo seeding, then starts Django and the Celery worker.
3. Open [http://localhost:8000](http://localhost:8000), or use the port configured by `API_PORT` in `.env`. The overview links to the Organizer Studio. The visitor demo is available at [`/v/kochi-expo/`](http://localhost:8000/v/kochi-expo/).
4. Stop the services with `docker compose down`. To remove the local database volume as well, use `docker compose down -v`.

The API health check is at `/api/health`. Django serves the pages, static files, and API from the same host. Do not open Django template files directly in a browser.

### Optional floor-plan analysis

Set `OPENAI_API_KEY` in `.env`, restart Compose, then choose a PNG/JPG under 10 MB in Organizer Studio and select **Find components with AI**. The selected image is sent for analysis only after that action. Review, edit, and accept any proposed components; their positions are estimates. Never commit `.env` or place a live key in `.env.example`.

### Optional phone GPS demo

Browser geolocation requires HTTPS (or localhost during local development) and the visitor's or organizer's permission. For a temporary phone demo, run `cloudflared tunnel --url http://localhost:8000` in another terminal and open the generated HTTPS address on the phone. The temporary tunnel is public to anyone who has its URL and ends when the process stops. Keep the terminal open during the demo and stop it afterward.

### Rebuild Tailwind CSS

After changing Tailwind classes, run:

```sh
npm install
npm run build:css
```

The Docker image also builds the CSS asset. For Django model changes, create migrations with `docker compose run --rm api python manage.py makemigrations venueflow`, then rebuild/restart the services.

## Current implementation and limitations

Implemented: responsive overview, Organizer Studio, event-scoped draft persistence, destination and path editing, GPS capture controls, optional AI plan suggestions, ORM-backed map-draft API, visitor map, and graph-based client-side route display when required location data is present.

Still incomplete or not fully verified: publishing immutable map snapshots and QR generation; offline packages and service-worker support; production deployment and authentication; a server-side `/api/route` implementation; complete phone GPS/route-following verification against a real georeferenced venue; and durable image hosting. A saved floor-plan selection remains in calibration metadata. Visitor navigation needs georeferenced nodes and explicit destination-to-path-point assignments. Browser location requires permission and a secure context.

OpenStreetMap tiles require internet access and are subject to the [OpenStreetMap tile usage policy](https://operations.osmfoundation.org/policies/tiles/); they are not an offline map source. The local demo uses seeded venue data and is not a production deployment.


| --- | --- |

## Project records

- [Team execution plan](docs/README.md)
- [Shared implementation contract](docs/SHARED_CONTRACT.md)
- [Architecture](docs/architecture.md)
- [Submission details](SUBMISSION.md)
- [AI usage](AI_USAGE.md)
- [Change log](CHANGELOG.md)
- [Event rules](RULES.md)

## Event

Walkwise was built for the DevDay Exchange Community Hackathon: Kochi, held 10–11 October 2026 at JAIN University, Kochi. See the [event page](https://luma.com/z10nz8gp) for event information.
