# Shared implementation contract

The user-selected implementation is a single Django application serving server-rendered pages and a Django REST Framework API. PostgreSQL/PostGIS is accessed through Django ORM and GeoDjango model fields. Redis is the Celery broker. There is no separately running frontend server.

## App-level assumptions

- Django owns `/`, `/organizer/`, `/v/<slug>/`, and `/api/**` on one origin.
- Integration owns `api/config/**`, the shared `base.html`, URL wiring, ORM models/migrations, seed command, and common static assets.
- Feature pages live in separate template files and use separate static JavaScript files so teammates can work without colliding.
- Tailwind is compiled to a local static CSS file with `npm run build:css`; Node is used only for that asset build.
- Django REST Framework serializers validate JSON and form requests. Domain APIs use standard DRF JSON errors.

## Venue data shape

Persist venue templates, event-specific layouts, and immutable published versions separately. `api/venueflow/models.py` is the authoritative ORM contract:

- `Venue`: `id`, `slug`, `name`, plan image, optional PostGIS boundary, calibration metadata.
- `MapFeature`: venue, kind/name, normalized `plan_x`/`plan_y`, optional geographic point, properties, and nullable explicit `access_node` link to a `PathNode` in that venue.
- `PathNode`: venue, normalized plan coordinates, optional geographic point.
- `PathEdge`: venue, from/to nodes, distance, direction, accessibility, closure, access rules.
- `Event`: venue, title, dates, publication status.
- `EventItem`: event-specific temporary feature and normalized plan position.
- `MapVersion`: event, revision number, JSON snapshot, publication timestamp.

Keep plan coordinates (`plan_x`, `plan_y`) separate from latitude/longitude geometry. Do not infer walkable edges from proximity. Add schema changes with Django migrations, not application-level raw SQL.

## Feature boundaries

- Organizer page: `templates/venueflow/organizer.html`, `static/venueflow/organizer.js`. Load and save through `/api/venues/` and related DRF endpoints; integration owns shared model/API changes.
- Visitor page: `templates/venueflow/visitor.html`, `static/venueflow/visitor.js`. Read a venue or published version; do not alter snapshots from visitor actions.
- Routing: pure functions in `api/venueflow/routing.py`; consume node/edge records or plain dictionaries and return ordered node/edge IDs, distance, ETA, or a no-route result. The API wrapper is `POST /api/route`.
- Venue/event persistence: `api/venueflow/models.py`, `serializers.py`, `views.py`, `migrations/**`.
- Publishing and shared shell: integration-owned page views, shared base template, and publishing API. Publish creates immutable `MapVersion` snapshots and visitor URLs.

## API conventions

- Health: `GET /api/health` verifies database connectivity.
- Venues/events: DRF routers provide list, detail, create, update, and delete endpoints under `/api/venues/` and `/api/events/`.
- Organizer map draft: `GET` and full-snapshot `PUT /api/venues/{venue_id}/map-draft/` return `{features, nodes, edges}`. A `PUT` replaces all three venue-scoped collections atomically; omitted rows are deleted. Edge endpoints and non-null feature `access_node_id` values must refer to nodes in that snapshot. Editor `x`/`y` map to normalized `plan_x`/`plan_y`; feature category/description/status are represented by `kind`/`properties`, node names by `PathNode.properties.name`, and edge endpoint IDs by their foreign keys. The API retains auxiliary image/GPS calibration data while removing legacy feature/node/edge arrays from `calibration.organizer_draft` during a successful replacement.
- Publish snapshot: `POST /api/events/{event_id}/publish` marks the event published and atomically creates the next immutable `MapVersion` from its venue and current map draft. This API seam does not provide the organizer publish UI, visitor snapshot rendering, or QR flow.
- Route: `POST /api/route` accepts `{venue_id, start_node_id, destination_feature_id}` and routes against the latest published `MapVersion` for a published event at that venue. It resolves the feature's explicit `access_node_id`; draft rows and coordinate proximity are never used. Missing venue/snapshot returns 404; malformed or unknown references return field-specific 400; unreachable routes and selected edges with invalid length return a `200` route result with `ok:false` and a reason.
- Use serializers for input validation. Keep the page and API same-origin; do not add CORS without a deliberate external client requirement.

## Database, assets, and team merges

- Put ORM models in `api/venueflow/models.py` and create numbered migrations with `python manage.py makemigrations venueflow`.
- The Compose `migrate` and `seed` one-shot services run before Django starts.
- Tailwind sources are in `api/venueflow/static_src/input.css`; templates are scanned at build time. Rebuild with `npm run build:css` after adding utility classes.
- Shared base template, models, migrations, URL config, and package scripts need integration-owner coordination. Feature owners should stay in their template/JS module and tell integration when a shared contract change is required.

## Merge rules

- Work in owned paths and do not change another person's page/JS files without coordination.
- Avoid duplicate dependencies; package and lockfile edits remain integration-owned.
- Keep server-rendered page behavior usable without JavaScript where practical; JavaScript adds progressive interactions.
- Do not add secrets to source or `.env.example`.
