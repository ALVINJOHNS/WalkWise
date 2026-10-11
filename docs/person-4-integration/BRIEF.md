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

- Status: complete
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
- Verification record: 2026-10-11T03:49+05:30 — Started the current integrated app with `docker compose up --build -d`. Default host ports 5432 and 8000 were already in use by another local project, so an ignored `.env` selects 5433 (Postgres), 6380 (Redis), and 8001 (Django); the Compose container ports remain unchanged. Postgres and Redis reported healthy; Django overview, organizer, visitor `/v/kochi-expo/`, `/api/health`, and compiled CSS returned HTTP 200. A temporary organizer draft value saved through the venue PATCH endpoint and read back successfully, then the original calibration value was restored. The app is running locally; visual browser interaction remains unverified.
- Commits: `5930b51` (`feat: build interactive venue overview`), `a6a8e92` (`fix: register explicit DRF router basenames`).
- Plan changes: 2026-10-11 — expanded the original browser-only shell to the user's explicitly requested Docker/PostgreSQL, server, Celery, and Redis foundation. User specified Django REST Framework instead of direct SQL querying and then requested SSR with no separate frontend service. A supplied Django monolith architecture was used as a reference for layering and progressive enhancement; keep the prior DRF requirement, and omit its CareUI, auth, tenancy, and production infrastructure from this hackathon foundation. Use Django ORM migrations, templates, and compiled Tailwind static assets served by the same Django service.
- Next: Read and execute P4-INT-2 (venue and event API persistence) in [phases/P4-INT-2.md](phases/P4-INT-2.md).

- Follow-up verification: 2026-10-11T04:37+05:30 — Explicit DRF router basenames fixed URL checks and enabled Compose startup, migrations, and demo seeding. Database, Redis, and API reported healthy; worker was running. The seeded visitor route returned HTTP 200 with expected venue, place, and path overlay content. Host port is 8001.
- Integration commit: `ee8ac94` (`feat: switch to Django SSR monolith`).
### P4-INT-2 — Venue and event API persistence

- Status: complete
- Scope and acceptance criteria: [phases/P4-INT-2.md](phases/P4-INT-2.md).
- Dependencies: P4-INT-1.
- Next: P4-INT-3.

### P4-INT-3 — Persist organizer map resources

- Status: not started
- Scope and acceptance criteria: [phases/P4-INT-3.md](phases/P4-INT-3.md).
- Dependencies: P4-INT-2 and Person 1 organizer fields.
- Next: P4-INT-4.

### P4-INT-4 — Publish visitor snapshot and QR entry

- Status: not started
- Scope and acceptance criteria: [phases/P4-INT-4.md](phases/P4-INT-4.md).
- Dependencies: P4-INT-3 and Person 2 visitor page.
- Next: P4-INT-5 only after core demo is green.

### P4-INT-5 — Offline shell (stretch gate)

- Status: not started; optional
- Scope and acceptance criteria: [phases/P4-INT-5.md](phases/P4-INT-5.md).
- Dependencies: P4-INT-4.
- Next: submission and demo rehearsal.

### P4-INT-6 — Temporary HTTPS access for mobile demo

- Status: verified
- Scope and acceptance criteria: [phases/P4-INT-6.md](phases/P4-INT-6.md).
- Dependencies: P4-INT-1 runnable local Compose app and an available Docker daemon.
- Next: Resume P1-ORG-10 browser verification after the mobile demo HTTPS path is available.
## Then build

For LAN-only phone demos, allow the host's exact Wi-Fi IP through `DJANGO_ALLOWED_HOSTS`; do not use a wildcard host list. The development server must bind to `0.0.0.0`, and the phone must be on the same LAN. For public HTTPS demo access, follow P4-INT-6; its Quick Tunnel host suffix is enabled only to support the temporary demo tunnel.

1. Integrate organizer and visitor templates/JS from the feature-owned paths in `docs/architecture.md`; avoid editing feature files.
2. Complete P4-INT-3 related-resource persistence before connecting publishing.
3. Complete P4-INT-4 publishing, visitor snapshot, URL, and QR flow.
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
