# Person 4 — App shell, publishing, and demo integration

## Goal

Own the seams and keep a working app available throughout the build. Wire the three feature screens together, persist a venue package locally, publish a stable visitor URL/QR when hosting permits, and rehearse the integrated demo.

## Owned files

- `api/config/**`, shared base/page templates and page routing, deployment files, and project integration docs.
- Do not edit the three feature folders. Ask the owner for changes or wire around their documented exports.

## Build first (first 45 minutes)

1. Freeze Django server-rendered templates + Tailwind static CSS + JavaScript, Django REST Framework API with Django ORM, Postgres/PostGIS, Redis, and Celery stack.
2. Create Compose services and health checks, environment example, API and worker skeletons, and organizer/visitor page routes served by Django.
3. Add domain stubs and task split docs so team members can begin parallel work against stable boundaries.
4. Add a realistic, hand-authored seed venue with a connected graph and destinations; use Django ORM persistence as the primary storage adapter.

## Phases

Use the phase loop in [AGENTS.md](../../AGENTS.md) and record results here with the [phase template](../PHASE_TEMPLATE.md). Keep package and shared-contract edits integration-owned.

### P4-INT-1 — Runnable full-stack foundation

- Status: in progress
- Scope: Establish the team foundation requested on 2026-10-11: Django SSR templates with compiled Tailwind and static JavaScript, Django REST Framework API using Django ORM, PostgreSQL/PostGIS, Redis/Celery worker, Compose services, shared domain contract, seed, and contributor/task-split docs. Use one Django service for pages and API. Add scaffold files only inside feature-owned folders; leave feature behavior to each owner.
- Acceptance criteria:
  - [ ] `docker compose up --build` starts healthy database, Redis, Django web/API, and worker services.
  - [ ] Django renders the responsive overview, organizer, and visitor routes; Tailwind is served as a static asset.
  - [ ] Overview summarizes persisted venue/event counts, supports venue search, and shows organizer, visitor, and API flows without navigating from overview actions.
  - [ ] API health and domain stub endpoints return explicit responses.
  - [ ] Teammates have clear owned paths and interface guidance.
- Dependencies: None.
- Out of scope: Authentication, production deployment, full map editor, routing implementation, GPS calibration, and realtime sync.
- Verification record: 2026-10-11T02:35+05:30 — `npm install` and `npm run build:css` passed; `docker compose config --quiet`, `python3 -m compileall -q api`, `git diff --check`, and a source scan for direct SQL calls passed. `python3 api/manage.py check` could not run because psycopg is not installed on the host; host GDAL is also absent. Docker runtime is unavailable because the local daemon is not running. Original Vite checks from `0805e41` are historical; Vite has been removed.
- Verification record: 2026-10-11T03:06+05:30 — Overview page, server-side venue/event summary counts, venue search, and non-navigating flow feedback added. `npm run build:css`, `python3 -m compileall -q api`, and `git diff --check` passed. Rendered browser behavior remains unverified because Django dependencies and Docker runtime are unavailable on the host.
- Verification record: 2026-10-11T03:13+05:30 — Fixed DRF router startup by adding explicit `venue` and `event` basenames because both viewsets expose dynamic `get_queryset()` methods. `docker compose up --build -d` then migrated and seeded successfully; API and worker started. In-container checks returned overview HTTP 200, CSS HTTP 200 (23,981 bytes; includes overview and Tailwind grid rules), and `/api/health` HTTP 200 with database healthy. `python3 -m compileall -q api` and `git diff --check` passed.
- Commits: `5930b51` (`feat: build interactive venue overview`), `a6a8e92` (`fix: register explicit DRF router basenames`).
- Plan changes: 2026-10-11 — expanded the original browser-only shell to the user's explicitly requested Docker/PostgreSQL, server, Celery, and Redis foundation. User specified Django REST Framework instead of direct SQL querying and then requested SSR with no separate frontend service. A supplied Django monolith architecture was used as a reference for layering and progressive enhancement; keep the prior DRF requirement, and omit its CareUI, auth, tenancy, and production infrastructure from this hackathon foundation. Use Django ORM migrations, templates, and compiled Tailwind static assets served by the same Django service.
- Next: Verify Compose runtime and rendered overview/SSR/API routes, then P4-INT-2.

### P4-INT-2 — Venue API persistence

- Status: not started
- Scope: Add database schema/migration and venue/event persistence endpoints used by SSR organizer/visitor pages.
- Exit checks: Venue/event changes persist across server reload; focused ORM/API check passes.
- Next: P4-INT-3.

### P4-INT-3 — Feature wiring and publish entry

- Status: not started
- Scope: Wire merged screens, connect organizer save to persistence, publish revision and visitor URL/QR; freshness labels remain truthful.
- Exit checks: Status change appears on visitor route after save; URL/QR opens selected venue; integrated demo sequence succeeds.
- Next: P4-INT-4 only after core demo is green.

### P4-INT-4 — Offline shell (stretch gate)

- Status: not started; optional
- Scope: Service worker/app-shell offline support only if time remains and core demo is stable.
- Exit checks: Cold reload in airplane mode succeeds before claiming offline readiness; otherwise record as incomplete and disclose limitation.
- Next: submission and demo rehearsal.

## Then build

1. Integrate organizer and visitor templates/JS from the feature-owned paths in `docs/architecture.md`; avoid editing feature files.
2. Connect organizer forms to DRF persistence; make the visitor view read the selected published snapshot.
3. Add publish action that increments revision/updatedAt, validates essential fields, and produces `/v/<slug>` visitor link.
4. Generate and display a QR code for that URL using a small established dependency. If HTTPS deployment is unavailable, show the short URL and use local QR only for a localhost demo.
5. Show honest snapshot/freshness state. A local database is not cross-device sync; do not claim realtime status updates.
6. Try a service worker/offline app shell only after the end-to-end demo is green and time remains. Verify cold reload in airplane mode before claiming it.

## Independent development

Use the seeded venue and owned Django template/static paths; feature owners must not wait for integration. Keep package/dependency, migrations, and shared base-template edits centralized here. Send API/template expectations to everyone early.

## Done when

- App starts and both routes load from the seed venue.
- Organizer save survives reload in the same browser.
- Publish creates a visitor URL and QR that opens the selected venue.
- Place status changes survive local reload and visitor view reflects them.
- Integrated three-minute demo works twice; offline/live claims match what was actually verified.

## Cut first

Database/auth setup, realtime, multi-device sync, immutable server versions, analytics, hosting polish, service worker if it risks the demo. Keep the shell and local package stable.

## Short Codex prompt

“Implement only the integration-owned Django app/config, shared template, migrations, and Compose files in `docs/person-4-integration/BRIEF.md`. Follow `docs/SHARED_CONTRACT.md`, keep dependencies minimal, and do not modify feature-owned templates or JS. Prioritize SSR, ORM persistence, publish, and QR. Report actual checks and limitations.”
