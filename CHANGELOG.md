# Change log

Record each meaningful project change during the event, newest first. Update this file in the same commit as the change. Use a real timestamp with timezone, for example `YYYY-MM-DDTHH:MM:SS+05:30`.

## Event build log

## 2026-10-11T04:54:00+05:30 — Record GPS stop/pointer checkpoint

- Changed: Added the exact fix commit to the organizer phase evidence and handoff.
- Why: Keep continuation records tied to the committed state.
- Validation: `git diff --check` passed.
- Limitations: Live browser/device verification is pending.


## 2026-10-11T04:53:21+05:30 — Fix GPS stop and show live pointer

- Changed: Fixed the stop click handler, invalidated callbacks from stopped watches, retained every device-reported position, and added a live pointer with an accuracy halo.
- Why: Let organizers stop reliably and see the phone’s reported position move while recording the venue outline.
- Validation: `node --check api/venueflow/static/venueflow/organizer.js` and `git diff --check` passed.
- Limitations: Browser and phone GPS behavior could not be manually verified in this environment; high-accuracy mode is requested but device location conditions determine actual results.


## 2026-10-11T04:53:04+05:30 — Fix GPS stop and add moving position marker

- Changed: Stop control now calls its handler without passing the click event as a status string; stopped/old watches ignore queued callbacks. Added a moving current-location marker and accuracy halo; recorded every browser-reported fix without minimum-distance filtering.
- Why: Ensure tracking can be stopped and make the phone’s reported position visible while it records the perimeter.
- Validation: `node --check api/venueflow/static/venueflow/organizer.js` and `git diff --check` passed.
- Limitations: Device-specific GPS accuracy and cadence, browser stop behavior, and API save/load were not manually verified because the local runtime is unavailable. High-accuracy mode is requested but cannot force device GPS availability.


## 2026-10-11T03:46:00+05:30 — Record GPS implementation checkpoint

- Changed: Recorded the GPS editor fix commit and validation evidence in the organizer phase brief and handoff.
- Why: Keep the active phase and continuation pointer aligned with the committed implementation.
- Validation: `git diff --check` passed.
- Limitations: Browser geolocation and Django persistence are still pending runtime verification.


## 2026-10-11T03:43:16+05:30 — Add GPS destination fixes and outline recording

- Changed: Added user-triggered current-location capture, GPS metadata for selected destinations, live start/stop/clear perimeter tracking, visible GPS trace/status, and draft save/load of timestamped coordinates. Revised P1-ORG-3 to document the requested scope.
- Why: Capture real geolocation coordinates and a walk-recorded venue outline, separate from local floor-plan coordinates.
- Validation: `node --check api/venueflow/static/venueflow/organizer.js` and `git diff --check` passed.
- Limitations: Browser permission, device GPS, and Django save/load were not runtime tested because Docker socket access is denied. Current API stores the outline under `Venue.calibration.organizer_draft`; the read-only boundary serializer prevents writing `Venue.boundary`. Browser geolocation requires permission and a secure context (HTTPS or localhost).


## 2026-10-11T03:33:41+05:30 — Improve organizer canvas and hide API browser links

- Changed: Replaced the blank canvas text with a centered floor-plan drop prompt, prevented hidden image alt text from displaying, added PNG/JPG drag-and-drop loading and hover feedback, and removed user-facing API browser links from organizer, shared navigation, and overview templates.
- Why: Match the requested organizer UI, support dropping a plan directly onto the editor, and keep API routes out of the product navigation.
- Validation: `node --check api/venueflow/static/venueflow/organizer.js`, API-link search in templates, and `git diff --check` passed.
- Limitations: Django/browser rendering could not be checked because Docker socket access is denied. Internal same-origin API calls remain necessary for draft load/save; backend API routes remain available.


## 2026-10-11T03:28:00+05:30 — Record organizer editor checkpoint

- Changed: Added commit SHA and message to the organizer phase record and handoff.
- Why: Keep the phase evidence and next-agent pointer tied to the committed implementation checkpoint.
- Validation: `git diff --check` passed.
- Limitations: Runtime verification remains pending because Docker socket access is denied.

## 2026-10-11T03:27:00+05:30 — Build organizer venue editor

- Changed: Added a server-rendered organizer map editor with PNG/JPG preview, destination details and statuses, movable pins, path points/edges, validation, and venue draft save; updated organizer phase evidence and project status.
- Why: Deliver the organizer authoring workflow defined by P1-ORG-1 and P1-ORG-2 while keeping changes within the organizer-owned template and JavaScript.
- Validation: `node --check api/venueflow/static/venueflow/organizer.js` and `git diff --check` passed. Docker Compose access failed because the local Docker socket returned permission denied, so the rendered page and API save round-trip were not verified.
- Limitations: Current venue API has no related-feature/node/edge endpoints. The editor saves its draft in `Venue.calibration.organizer_draft`; image files are stored as data URLs there and existing ORM feature rows are not loaded. Integration work is needed for scalable image upload and native related-model persistence.


## 2026-10-11T03:21:35+05:30 — Merge main and resolve documentation conflicts

- Changed: Merged `main` into `overview`; reconciled README, handoff, changelog, and AI usage records while retaining the latest Walkwise branding and overview details.
- Why: Incorporate shared project guidance and product overview updates without losing the work on `overview`.
- Validation: `git diff --cached --check`, local Markdown target check, conflict-marker scan, and two-parent merge verification passed.
- Limitations: Application runtime was not retested because this merge only changes documentation and agent guidance.

## 2026-10-11T03:15:33+05:30 — Rename product branding to Walkwise

- Changed: Replaced the previous product branding with Walkwise in the README, shared header/footer, overview, organizer/visitor page titles, architecture heading, and project history; renamed the npm asset package to `walkwise-assets`.
- Why: Use the project name selected by the user consistently across the repository and rendered app.
- Validation: Rendered Django overview returned HTTP 200 with Walkwise title/branding, no old brand, and the stylesheet link. `npm run build:css`, `python3 -m compileall -q api`, JSON parsing of package files, and `git diff --check` passed.
- Limitations: Internal Django module and static paths remain `venueflow` to avoid an unrelated app-label migration.

## 2026-10-11T03:13:55+05:30 — Fix API router startup

- Changed: Registered the venue and event DRF viewsets with explicit router basenames in `api/venueflow/urls.py`; updated phase evidence, README, handoff, and AI usage notes.
- Why: Compose migration exited before applying migrations because DRF could not infer a basename from viewsets that define `get_queryset()` dynamically; the API never started, so the browser had no rendered page or Tailwind asset to load.
- Validation: `docker compose up --build -d` completed migrations and seed. In-container requests returned overview HTTP 200, compiled Tailwind stylesheet HTTP 200 with expected overview/grid rules, and `/api/health` HTTP 200 with database healthy. `python3 -m compileall -q api` and `git diff --check` passed.
- Limitations: The host sandbox cannot access the Docker socket or localhost port directly; equivalent HTTP checks passed from inside the API container. No browser visual QA was performed.

## 2026-10-11T03:06:43+05:30 — Build interactive overview dashboard

- Changed: Replaced the placeholder home screen with a responsive Tailwind overview, server-rendered venue/event/published counts and venue cards, venue search, and non-navigating organizer/visitor/API flow buttons with feedback. Updated the integration acceptance criteria, README, and AI usage record.
- Why: Give the app a polished starting point that explains the intended organizer-to-visitor journey while page wiring is still under development.
- Validation: `npm run build:css`, `python3 -m compileall -q api`, and `git diff --check` passed.
- Limitations: Django-rendered browser behavior could not be checked because host Django database dependencies and Docker runtime are unavailable. Overview flow controls intentionally do not navigate.

## 2026-10-11T02:55:26+05:30 — Merge default branch and resolve documentation conflicts

- Changed: Integrated `main` into the integration branch and reconciled the README, AI usage record, changelog, and handoff while preserving independent changes from both branches.
- Why: Incorporate current shared guidance and project overview updates without discarding the Django foundation work.
- Validation: `git diff --cached --check`, local Markdown target check, conflict-marker scan, and two-parent merge verification passed.
- Limitations: Application runtime was not retested because this documentation merge does not change application code.

## 2026-10-11T02:47:24+05:30 — Require agents to use the declared project stack

- Changed: Added guidance to `AGENTS.md` to install missing required runtimes, tools, and dependencies and continue with the phase's declared stack, with explicit direction against silent substitutions.
- Why: Keep implementation aligned with project technology choices and make genuine installation blockers visible.
- Validation: Reviewed the wording against the existing dependency and tool guidance; `git diff --check` passed.
- Limitations: Documentation-only change; no installation or application runtime behavior was needed or checked.

## 2026-10-11T02:35:05+05:30 — Switch to one Django SSR and DRF service

- Changed: Replaced the Vite/React app and separate web container with Django-rendered landing, organizer, and visitor pages; compiled Tailwind static CSS and progressive JavaScript; kept DRF/ORM/PostGIS API, Redis/Celery worker, migrations, and seed command. Updated feature ownership docs, shared contract, and architecture to template/static/Python paths. Used the supplied OHC example for monolith layering and progressive enhancement; no CareUI assets or code were copied.
- Why: User requested server-rendered pages without a separate frontend service, then supplied a similar Django monolith as an architecture reference.
- Validation: Tailwind installation and `npm run build:css` passed; `docker compose config --quiet`, `python3 -m compileall -q api`, and `git diff --check` passed. `python3 api/manage.py check` could not run because host psycopg is not installed. Docker runtime could not run because the local Docker daemon is unavailable.
- Limitations: Django/PostGIS/Redis/Celery service startup and rendered page/API responses remain unverified. The host also lacks GDAL required by GeoDjango; the API image installs GDAL/GEOS/PROJ system libraries.

## 2026-10-11T02:23:33+05:30 — Add Walkwise full-stack team foundation

- Changed: Added Vite/React/TypeScript/Tailwind app shell and seed, FastAPI health and explicit API stubs, PostgreSQL/PostGIS bootstrap schema, Redis/Celery worker skeleton, Docker Compose services, `.env.example`, architecture/task ownership guide, and updated the integration brief/shared contract/README.
- Why: Give teammates a runnable structure and stable file ownership/interfaces for parallel feature implementation, including the server and worker infrastructure requested for the build.
- Validation: `npm install` passed; `npm run build` passed; Vite dev server returned the app shell over HTTP; `docker compose config --quiet` passed; `python3 -m compileall -q api/app` passed; `git diff --check` passed.
- Limitations: Docker daemon was unavailable, so service images and cross-container health/startup were not verified. Venue/event/routing API handlers intentionally return 501; product features are still placeholders.
## 2026-10-11T02:19:37+05:30 — Describe the WalkWise product in the README

- Changed: Replaced the README project-name and short-description placeholders with the WalkWise concept and added a concise product-direction section.
- Why: Make the repository identify the intended temporary-venue mapping experience before application implementation begins.
- Validation: Compared the wording with `docs/Walkwise_Development_Plan.md`, `docs/SHARED_CONTRACT.md`, and the active integration brief; referenced Markdown targets and `git diff --check` passed.
- Limitations: This documents planned MVP behavior only; no application code, routing, QR flow, saved snapshot, or offline behavior has been implemented or verified.

## 2026-10-11T01:50:33+05:30 — Add phased development and handoff workflow

- Changed: Expanded `AGENTS.md` with a phase-by-phase implement, verify, fix, document, commit, and handoff loop; added `docs/PHASE_TEMPLATE.md`; added stable phase IDs and exit checks to all four participant briefs; linked phase execution guidance from `docs/README.md`; created root `handoff.md`.
- Why: Keep agent context compact across handoffs, make phase boundaries and next-document references explicit, and require verified, documented commits without waiting for routine prompts.
- Validation: Checked relative Markdown targets in all changed docs (passed); `git diff --check` (passed). No application runtime check applies.
- Limitations: Documentation-only workflow guidance; no application phase has started or been runtime-verified.

## 2026-10-11T01:30:58+05:30 — Add six-hour parallel team plan

- Changed: Added four role briefs, shared implementation contract, six-hour schedule and cut order under `docs/`; linked the team plan from `README.md`.
- Why: Adapt the full Hereabouts plan to a four-person, six-hour hackathon build with parallel work and predictable feature ownership.
- Validation: Checked the source plan and repository rules; verified all four briefs use distinct feature paths and the shared venue shape. Markdown links and `git diff --check` checked after editing.
- Limitations: Planning documentation only; no application code, hosting, or demo has been built or verified.

Replace this sentence with entries as you build:

```text
## <actual timestamp> — <short change title>

- Changed: <feature or files changed>
- Why: <reason for the change>
- Validation: <commands or manual checks actually run, with results>
- Limitations: <known issues or "None identified in these checks">
```

## Template setup — 10 October 2026

- Changed: Added the event README, rules, agent guide, change log, AI usage record, submission checklist, Git ignore rules, and pull request checklist.
- Why: Give participants a consistent starting point for event rules, basic coding patterns, documented changes, and regular commits.
- Validation: Checked local Markdown links, event detail consistency, required documents, and diff whitespace before publishing.
- Limitations: Documentation scaffolding only; no participant project, application, or working demo is included. GitHub publication and template status are verified separately after creation.
