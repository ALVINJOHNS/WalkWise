# AI usage record

Use Codex during the hackathon and briefly document its actual contribution here. Add a row after each meaningful task or milestone. Keep summaries concise and omit secrets, private data, and full chat transcripts.

## Event build log

On 11 October 2026, after the user reported that destinations and path points disappeared in street-map view, Codex added selection-aware Leaflet markers and a click-to-place action for selected items that do not yet have geographic coordinates. Human review: pending. Validation: JavaScript syntax and diff whitespace passed; browser interaction remains unverified.

On 11 October 2026, after the user shared the OpenStreetMap 403 tile, Codex configured Leaflet tile images to send a valid cross-origin `Referer` under OSM’s policy. Human review: pending. Validation: rebuild completed, organizer returned HTTP 200, served JavaScript contained the policy, and JavaScript syntax/diff whitespace checks passed; browser-visible tile loading still needs confirmation.

On 11 October 2026, Codex added a Leaflet 1.9.4 street-map layer using attributed OpenStreetMap tiles, GPS-centered pan/zoom, live recorded trace and position/accuracy overlays, GPS destination/path-point markers, and measured recorded-track and geolocated edge distances. Street-map and floor-plan views remain separate; the editor does not claim road snapping or directions. Human review: pending. Validation: JavaScript syntax, diff whitespace, and source checks passed; browser map/GPS verification was unavailable.

On 11 October 2026, Codex fixed the GPS stop click handler and late callback handling, retained each browser-reported position, and added a moving current-location pointer with an accuracy halo during perimeter recording. Human review: pending. Validation: JavaScript syntax and diff whitespace passed; a phone GPS session was not available for manual verification.


On 11 October 2026, Codex fixed the GPS stop control and late callback handling, added a moving current-position pointer and accuracy halo, and retained each geolocation fix reported during an outline recording. `enableHighAccuracy` is requested; actual accuracy and update cadence depend on the device and environment. Human review: pending. Validation: JavaScript syntax and diff whitespace passed; live phone GPS was not available for manual verification.


On 11 October 2026, Codex added explicit browser geolocation actions for current destination fixes and live venue-outline recording. Captured latitude/longitude and available accuracy, altitude, heading, speed, and timestamp values are stored separately from plan coordinates in the venue draft; the outline is rendered as a GPS trace. The browser requires user permission and a secure context. Human review: pending. Validation: JavaScript syntax and diff whitespace passed; browser permission, physical GPS, and Django persistence could not be exercised because Docker access is denied.


On 11 October 2026, Codex fixed the organizer canvas placeholder leaking image alt text, added PNG/JPG drag-and-drop loading with visual feedback, and removed API browser links from organizer/shared navigation/overview while preserving internal draft persistence requests. Human review: pending. Validation: JavaScript syntax and `git diff --check` passed; Django/browser verification was unavailable because Docker socket access is denied.


On 11 October 2026, Codex implemented the organizer map editor in the owned organizer template and JavaScript: PNG/JPG backdrop preview, destination fields and statuses, movable markers, path nodes/connections, validation, and venue-draft saving. Because the current API has no related map-feature/path endpoints, drafts are stored in the existing venue calibration JSON field. Human review: pending. Validation: JavaScript syntax check and `git diff --check` passed; Docker socket permission denied prevented Django/API runtime verification. Integration limitations are recorded in the organizer brief.


On 11 October 2026, Codex merged `main` into `overview`, reconciled conflicts in the README, changelog, handoff, and AI usage record, and retained the newer Walkwise branding and overview implementation alongside shared project guidance. Human review: pending. Validation: staged whitespace check, local Markdown target check, conflict-marker scan, and two-parent merge verification passed.

On 11 October 2026, Codex updated `AGENTS.md` to require use of the active phase's declared technology stack, including installing missing required tools and dependencies rather than silently substituting alternatives. Human review: pending. Validation: reviewed consistency with existing dependency guidance and ran `git diff --check` successfully; no application runtime check applies.

On 11 October 2026, Codex reviewed the Walkwise product plan, shared contract, and active integration brief, then added a concise project description and product-direction section to `README.md`. The wording distinguishes the intended QR-accessible, organizer-maintained venue-map MVP from unverified implementation. Human review: pending. Validation: plan/contract consistency review, referenced Markdown target checks, and `git diff --check` passed.

On 11 October 2026, Codex updated the product branding to Walkwise across rendered page titles/header/footer, README, architecture heading, historical project references, and npm package metadata. The internal Django module path remains unchanged. Human review: pending. Validation: Django rendered overview check, Tailwind CSS build, Python syntax compilation, package JSON parsing, and `git diff --check` passed.

On 11 October 2026, Codex fixed startup failure reported from Compose by adding explicit DRF router basenames for dynamically queried venue/event viewsets. The migration and seed services then completed, and the overview, compiled Tailwind stylesheet, and health endpoint returned HTTP 200 from inside the API container. Human review: pending. Validation: Compose startup, HTTP response checks, Python syntax compilation, and `git diff --check` passed.

On 11 October 2026, Codex replaced the placeholder landing page with a responsive overview dashboard in `home.html`, added venue/event summary counts in `pages.py`, and implemented venue filtering plus non-navigating flow feedback in shared JavaScript. The Tailwind source includes the dashboard styling and reduced-motion behavior. Human review: pending. Validation: Tailwind CSS build, Python syntax compilation, and `git diff --check` passed. Django-rendered UI behavior remains unverified because the host runtime dependencies and Docker daemon are unavailable.

On 11 October 2026, after the user requested Django REST Framework and then server-rendered pages without a separate frontend, Codex replaced the React/Vite shell with Django templates, Tailwind static asset compilation, and progressive JavaScript served by the same Django service. Django ORM/PostGIS, DRF, Celery/Redis, migrations, and a demo seed command are wired in the foundation. The supplied OHC architecture informed the single-monolith layering; no CareUI code/assets or its broader authentication/tenancy/production stack were adopted. Human review: pending. Validation: Tailwind build, Compose config parsing, Python syntax compilation, and diff whitespace checks passed. Django system check could not run because host psycopg is missing; Docker runtime remains unavailable.

On 11 October 2026, Codex implemented the Walkwise foundation: frontend shell and shared fixture, FastAPI API/health endpoint, PostGIS schema bootstrap, Redis/Celery worker, Compose setup, and teammate architecture/ownership documentation. The integration phase brief was revised before implementation to reflect the requested stack. Human review: pending. Validation: frontend install/build and HTTP shell response passed; Compose configuration and Python compilation passed. Full Compose runtime could not be checked because Docker's local daemon was unavailable.

On 11 October 2026, Codex added phase-based execution and minimal handoff guidance to `AGENTS.md`, introduced `docs/PHASE_TEMPLATE.md`, added stable phase IDs and exit checks to the four participant briefs, linked the process from `docs/README.md`, and created `handoff.md`. The goal is small verified increments, documented plan changes, and commit-ready participant phases with just enough continuation context. Human review: pending. Validation: changed-document Markdown targets and `git diff --check` passed; no application code or runtime checks apply.

Codex reviewed `RULES.md` and `docs/Walkwise_Development_Plan.md`, then drafted the six-hour split, shared contract, and four teammate briefs in `docs/`, with a discovery link in `README.md` and records in `CHANGELOG.md`. This is planning assistance only; no app code was implemented. Human review: pending. Validation: checked role ownership/paths and ran the documented Markdown and whitespace checks; no runtime check applies.

| Date and time with timezone | Tool / model, if known | Task | Assistance and affected files | Human review / corrections | Validation and result |
| --- | --- | --- | --- | --- | --- |
| TODO | Codex | TODO | TODO | Pending | TODO |

## Template preparation

On 10 October 2026, Codex prepared this documentation template from the organizer's supplied rules and checked the linked Luma page for the event name and dates. This covered `README.md`, `RULES.md`, `AGENTS.md`, `CHANGELOG.md`, `AI_USAGE.md`, `SUBMISSION.md`, `.gitignore`, and the pull request checklist. Agent validation covered local links, event consistency, required documents, and diff whitespace; organizer review is pending.

This preparation is separate from participant project implementation and participant AI usage during the event.
