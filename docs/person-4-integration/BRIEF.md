# Person 4 — App shell, publishing, and demo integration

## Goal

Own the seams and keep a working app available throughout the build. Wire the three feature screens together, persist a venue package locally, publish a stable visitor URL/QR when hosting permits, and rehearse the integrated demo.

## Owned files

- `src/app/**`, `src/shared/**`, app entry/config/package/deploy files, and project integration docs.
- Do not edit the three feature folders. Ask the owner for changes or wire around their documented exports.

## Build first (first 45 minutes)

1. Freeze the Vite React TypeScript + Tailwind frontend, FastAPI API, Postgres/PostGIS, Redis, and Celery stack.
2. Create Compose services and health checks, environment example, API and worker skeletons, and a runnable frontend shell.
3. Add domain stubs and task split docs so team members can begin parallel work against stable boundaries.
4. Add a realistic, hand-authored seed venue with a connected graph and destinations; preserve local snapshot save/load as a browser adapter.

## Phases

Use the phase loop in [AGENTS.md](../../AGENTS.md) and record results here with the [phase template](../PHASE_TEMPLATE.md). Keep package and shared-contract edits integration-owned.

### P4-INT-1 — Runnable full-stack foundation

- Status: in progress
- Scope: Establish the team foundation requested on 2026-10-11: Vite/React/TypeScript/Tailwind web shell, FastAPI API, PostgreSQL/PostGIS, Redis/Celery worker, Compose services, shared domain contract, seed, and contributor/task-split docs. Add scaffold files only inside feature-owned folders; leave feature behavior to each owner.
- Acceptance criteria:
  - [ ] `docker compose up --build` starts healthy database, Redis, API, and worker services.
  - [ ] Frontend install/dev/build commands are documented and usable.
  - [ ] API health and domain stub endpoints return explicit responses.
  - [ ] Teammates have clear owned paths and interface guidance.
- Dependencies: None.
- Out of scope: Authentication, production deployment, full map editor, routing implementation, GPS calibration, and realtime sync.
- Verification record: 2026-10-11T02:23+05:30 — `npm install` completed; `npm run build` passed; `docker compose config --quiet` passed; `python3 -m compileall -q api/app` passed; `git diff --check` passed; Vite dev server served the app shell with HTTP 200 using the elevated local-server check. `docker compose up --build -d` could not run because the local Docker daemon socket is absent. Full service integration remains unverified.
- Commit: Pending.
- Plan changes: 2026-10-11 — expanded the original browser-only shell to the user's explicitly requested Docker/PostgreSQL, server, Celery, and Redis foundation. The architecture brief supplied with the request recommends a single Next.js API and excludes queues; to preserve the existing Vite React team contract and satisfy the more specific latest request, this starter uses a small FastAPI API plus a Celery worker as a modular development stack.
- Next: P4-INT-2.

### P4-INT-2 — Venue API persistence

- Status: not started
- Scope: Add database schema/migration and venue/event persistence endpoints; keep frontend snapshot adapter as fallback.
- Exit checks: Save survives same-browser reload; invalid storage has useful recovery; focused check passes.
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

1. Wire feature exports from `src/features/organizer`, `visitor`, and `navigation` as they arrive; avoid editing their owned files.
2. Connect organizer `onSave` to local persistence; make published visitor view read the saved snapshot.
3. Add publish action that increments revision/updatedAt, validates essential fields, and produces `/v/<slug>` visitor link.
4. Generate and display a QR code for that URL using a small established dependency. If HTTPS deployment is unavailable, show the short URL and use local QR only for a localhost demo.
5. Show honest snapshot/freshness state. Local browser storage is not cross-device sync; do not claim realtime status updates.
6. Try a service worker/offline app shell only after the end-to-end demo is green and time remains. Verify cold reload in airplane mode before claiming it.

## Independent development

Use your own fixture and placeholder screens; the feature owners must not wait for the shell to build. Keep package/dependency edits centralized here. Send export/import expectations to everyone in the first 15 minutes.

## Done when

- App starts and both routes load from the seed venue.
- Organizer save survives reload in the same browser.
- Publish creates a visitor URL and QR that opens the selected venue.
- Place status changes survive local reload and visitor view reflects them.
- Integrated three-minute demo works twice; offline/live claims match what was actually verified.

## Cut first

Database/auth setup, realtime, multi-device sync, immutable server versions, analytics, hosting polish, service worker if it risks the demo. Keep the shell and local package stable.

## Short Codex prompt

“Implement only the app/integration files assigned in `docs/person-4-integration/BRIEF.md`. Follow `docs/SHARED_CONTRACT.md`, keep dependencies minimal, and do not modify the three feature folders. Prioritize a runnable shell, seed venue, local save/publish, and QR. Report actual checks and limitations.”
