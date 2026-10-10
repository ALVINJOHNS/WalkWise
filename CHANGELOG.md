# Change log

Record each meaningful project change during the event, newest first. Update this file in the same commit as the change. Use a real timestamp with timezone, for example `YYYY-MM-DDTHH:MM:SS+05:30`.

## Event build log

## 2026-10-11T03:49+05:30 — Bring up and verify the integrated demo

- Changed: Started the Compose stack using ignored local port overrides (Postgres 5433, Redis 6380, Django 8001), recorded the P4-INT-1 completion evidence, updated the current handoff and local demo URL.
- Why: The default host ports 5432 and 8000 were occupied by another running project; alternate ports made the demo available without disrupting it.
- Affected files: `README.md`, `docs/person-4-integration/BRIEF.md`, `handoff.md`; ignored local `.env`.
- Validation: Compose services started; Postgres and Redis healthy. Overview, organizer, visitor, health API, and compiled CSS returned HTTP 200. Temporary venue draft save/load round-trip passed; seeded calibration was restored.
- Limitations: Browser interaction/visual rendering was not manually checked. Local port overrides are machine-specific and are excluded from Git.
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
## 2026-10-11T03:35:31+05:30 — Detail the optional P3-NAV-4 plan
- Changed: Expanded `docs/person-3-navigation/phases/P3-NAV-4.md` with an integration decision gate, proposed pure helper/result contract, coordinate and distance semantics, validation and deterministic selection rules, focused regression fixtures, and phase closeout steps; updated `handoff.md` with the explicit dependency.
- Why: Make the next optional phase implementable without guessing the visitor's coordinate representation or a safe maximum distance.
- Validation: Compared the plan with the navigation brief, shared contract, and P3-NAV-3 scope; `git diff --check` passed. No application code or runtime checks were needed.
- Limitations: Planning only. Implementation must wait for integration confirmation of input shape and maximum-distance policy.
## 2026-10-11T03:33:43+05:30 — Record P3-NAV-3 commit and handoff
- Changed: Recorded implementation commit `16b5b89` in the P3-NAV-3 phase document and updated `handoff.md` to point to the optional next phase and its integration dependency.
- Why: Keep the phase ledger and next-agent handoff aligned with the committed implementation.
- Validation: `git diff --check` passed; no code changed.
- Limitations: P3-NAV-4 remains optional until integration confirms the visitor start-point input shape.
## 2026-10-11T03:33:09+05:30 — Add next-place suggestion ranking
- Changed: Added pure-Python `suggest_next_place` in `api/venueflow/routing.py` to skip closed/malformed/unreachable candidates, apply finite optional `waitMinutes` penalties in ranking seconds, preserve deterministic input-order ties, and return the selected place, verified route, timing fields, and concise reason. Updated P3-NAV-3 verification and handoff.
- Why: Complete the visitor's explainable “What next?” routing result using only open, reachable places and supplied organizer data.
- Validation: Focused plain-Python suggestion/routing fixtures passed; `python -m compileall -q api/venueflow/routing.py` and `git diff --check` passed.
- Limitations: Integration must normalize model-backed place status/access-node fields and optionally provide `waitMinutes`; no ORM/API/page wiring or dedicated repository routing test runner exists.
## 2026-10-11T03:31:22+05:30 — Detail the Person 3 Phase 3 suggestion plan
- Changed: Expanded `docs/person-3-navigation/phases/P3-NAV-3.md` with the normalized place input, strict eligibility and wait validation, deterministic route-time ranking, result/reason contract, integration boundary, implementation sequence, and focused fixture matrix.
- Why: Make the next-place suggestion independently implementable and reviewable while grounding it in the verified route output and actual model fields.
- Validation: Compared the plan with `routing.py`, `MapFeature`/`EventItem`, the Person 3 brief, shared contract, and phase template; `git diff --check` passed. No application code or runtime checks were needed.
- Limitations: Planning only; implementation and human review remain pending. `waitMinutes` is not a dedicated model field and must be normalized from supplied place properties by integration when available.
## 2026-10-11T03:24:28+05:30 — Add route distance and walking-time metrics
- Changed: Implemented selected-edge length validation, summed route distance, approximate duration at 1.2 m/s, zero-edge metrics, and `invalid_length` failures in `api/venueflow/routing.py`; recorded P3-NAV-2 verification and next-phase handoff.
- Why: Give route consumers consistent distance/time values while preserving the deterministic minimum-hop graph route and source edge IDs.
- Validation: `python -m compileall -q api/venueflow/routing.py`, focused inline fixtures for metric and failure cases, and `git diff --check` passed.
- Limitations: Duration is approximate and excludes congestion, mobility adjustments, and dwell time. The API wrapper and geometry lookup are not wired in this phase.
## 2026-10-11T03:22:00+05:30 — Detail the Person 3 Phase 2 metrics plan
- Changed: Expanded `docs/person-3-navigation/phases/P3-NAV-2.md` with metric validation rules, stable result/failure semantics, duration formula, route-selection boundary, geometry lookup contract, implementation sequence, and focused acceptance fixtures.
- Why: Give the next routing implementation a precise, reviewable contract aligned with P3-NAV-1 and the shared integration contract.
- Validation: Compared the plan with the current routing function, Person 3 brief, shared contract, and phase template; `git diff --check` passed. No code or runtime checks were performed because this change is planning only.
- Limitations: Plan has not yet been implemented or human-reviewed.
## 2026-10-11T03:05:00+05:30 — Split Person 3 navigation into implementation phases
- Changed: Reworked `docs/person-3-navigation/BRIEF.md` into an architecture-aligned phase index and added four focused phase documents for graph routing, route metrics/output, next-place suggestions, and optional approximate manual starts. Updated `handoff.md` to point at P3-NAV-1.
- Why: Let Person 3 implement and review routing incrementally instead of building routing, ETA, recommendations, and manual-start behavior together.
- Validation: Reviewed the phase dependencies against the Django `PathNode`/`PathEdge` model, seed graph, 501 route stub, architecture, shared contract, and full development plan; local Markdown target checks and `git diff --check` passed.
- Limitations: Planning only; routing implementation and runtime behavior remain unverified.
## 2026-10-11T02:23:33+05:30 — Add VenueFlow full-stack team foundation
## 2026-10-11T03:16:12+05:30 — Detail the Person 3 Phase 1 routing plan
- Changed: Expanded `docs/person-3-navigation/phases/P3-NAV-1.md` with the pure-Python function contract, graph validation and failure semantics, deterministic BFS behavior, implementation sequence, acceptance cases, and checks.
- Why: Make the first routing increment directly implementable and reviewable against the actual Django graph model and demo seed.
- Validation: Reviewed `PathNode`/`PathEdge`, seed graph, shared contract, phase template, and routing brief; checked the local Markdown target and `git diff --check`.
- Limitations: Planning only; no routing code or runtime behavior has been implemented or verified.
## 2026-10-11T03:18:12+05:30 — Implement Person 3 graph route core
- Changed: Added the framework-independent `api/venueflow/routing.py` module with input validation, directed/bidirectional adjacency, closed-edge filtering, deterministic BFS, ordered route IDs, and explicit failure results. Marked P3-NAV-1 verified and recorded the function contract and checks.
- Why: Deliver a testable graph route primitive for visitor navigation without coupling graph logic to Django or page code.
- Validation: `python -m compileall -q api/venueflow/routing.py`; plain-Python fixtures for connected minimum-hop route, input-order tie break, closed edges, both directions, same-node route, malformed IDs/graph records, unknown endpoints, and disconnected nodes; `git diff --check` — passed.
- Limitations: Routes minimize edge count; distance and duration remain `None` for P3-NAV-2. No repository test suite was present for this module.

## 2026-10-11T03:57:36+05:30 — Plan Person 4 persistence and publishing follow-up
- Changed: Added focused P4-INT-3 related-resource persistence, P4-INT-4 publish/visitor QR, and P4-INT-5 offline stretch briefs; updated the Person 4 phase index and handoff.
- Why: The organizer currently stores draft entities in venue calibration JSON, while the shared contract has separate feature/node/edge tables; the organizer brief assigns API support to integration and explicitly excludes publishing from Person 1.
- Validation: Compared ownership, ORM schema, current serializers/views, organizer mapping, and phase template; `git diff --check` passed.
- Limitations: Planning only. Related-resource persistence, immutable publishing, visitor snapshot resolution, and QR behavior remain unimplemented.
