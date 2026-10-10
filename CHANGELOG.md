# Change log

Record each meaningful project change during the event, newest first. Update this file in the same commit as the change. Use a real timestamp with timezone, for example `YYYY-MM-DDTHH:MM:SS+05:30`.

## Event build log

## 2026-10-11T04:40:00+05:30 — Record AI suggestion phase commit

- Changed: Recorded organizer phase commit `a13568a` in the handoff and P1-ORG-5 evidence.
- Why: Keep the continuation pointer and phase brief tied to the committed implementation.
- Validation: `git diff --check` passed.
- Limitations: Docker rebuild and OpenAI runtime validation remain unavailable for the reasons recorded in the preceding entry.

## 2026-10-11T04:38:00+05:30 — Add AI floor-plan destination suggestions

- Changed: Added a server-side OpenAI Responses API request for the selected PNG/JPG plan; structured results include destination names, categories, descriptions, approximate normalized floor-plan positions, and confidence. Added a review/select/add panel in the organizer and exposed optional `OPENAI_API_KEY` / `OPENAI_MODEL` settings only to the Django container. The request uses the existing organizer page POST handler; no API URL or UI API link was added. Updated the organizer phase, shared contract, README, and AI usage record.
- Why: Let the organizer extract and stage destination candidates from a plan image, then verify exact positions on-site with GPS before constructing confirmed path connections.
- Validation: `python3 -m py_compile api/venueflow/organizer_ai.py api/venueflow/pages.py`, `node --check api/venueflow/static/venueflow/organizer.js`, `docker compose config`, and `git diff --check` passed. `docker compose up --build -d` was blocked because Docker socket access was denied.
- Limitations: No OpenAI API key is configured in this checkout, so no live request was made. Browser/page/CSRF interaction is unverified. Image-derived positions are estimates; the model cannot determine real-world GPS coordinates or trustworthy walkable paths from a floor plan.

## 2026-10-11T04:26:00+05:30 — Record ngrok tunnel configuration checkpoint

- Changed: Recorded commit `374c853` in the handoff.
- Why: Tie the verified tunnel configuration to the current continuation pointer.
- Validation: `git diff --check` passed.
- Limitations: Phone GPS access depends on browser location permission and the tunnel remaining active.

## 2026-10-11T04:24:00+05:30 — Allow the provided ngrok tunnel host

- Changed: Added environment-configurable Django allowed hosts and CSRF trusted origins, configured forwarded HTTPS detection, and included the provided ngrok host in Compose defaults and `.env.example`.
- Why: Let Django accept tunneled requests to the organizer and accept same-origin HTTPS draft saves through ngrok.
- Validation: `python3 -m py_compile api/config/settings.py`, `docker compose config`, and `git diff --check` passed; API container recreated; Django reported the expected allowed-host/CSRF/proxy settings; local and ngrok organizer routes returned HTTP 200.
- Limitations: The hostname is specific to this tunnel; update the environment values when ngrok assigns a different one.

## 2026-10-11T04:21:00+05:30 — Record direct map-add checkpoint

- Changed: Recorded commit `fd68ec0` in the organizer phase and handoff.
- Why: Keep the phase record tied to the directly placeable map items and GPS icon.
- Validation: `git diff --check` passed.
- Limitations: Manual map interaction remains pending.

## 2026-10-11T04:20:00+05:30 — Add items directly on the street map

- Changed: Add destination and Add path point now enter placement mode in street view; the next map click creates the record at that geographic coordinate. Added a pulsing, labeled live GPS map icon.
- Why: Let organizers create geographic items on the OpenStreetMap canvas itself and spot their live position.
- Validation: `node --check api/venueflow/static/venueflow/organizer.js` and `git diff --check` passed; Compose rebuilt, organizer returned HTTP 200, and the served script contained the direct-add handler and live-location label.
- Limitations: Browser interaction remains unverified.

## 2026-10-11T04:15:00+05:30 — Record street-map placement fix checkpoint

- Changed: Recorded commit `2627ad9` in the organizer phase and handoff.
- Why: Tie the phase notes to the delivered map-placement behavior.
- Validation: `git diff --check` passed.
- Limitations: Manual browser interaction remains pending.

## 2026-10-11T04:14:00+05:30 — Place organizer items on the street map

- Changed: Added map-placement controls for selected destinations and path points, click-to-assign geographic coordinates, selectable/highlighted street-map markers, and text explaining why local-only points are absent from the geographic view. Updated organizer phase, README, and handoff.
- Why: Floor-plan `x/y` positions are unrelated to latitude/longitude; organizers need to place or GPS-locate an item before it can appear at a truthful geographic position.
- Validation: `node --check api/venueflow/static/venueflow/organizer.js` and `git diff --check` passed. Compose rebuilt and started; organizer returned HTTP 200 and served JavaScript contained the map-placement behavior.
- Limitations: Interactive browser verification is pending.

## 2026-10-11T04:09:00+05:30 — Record OSM referrer fix checkpoint

- Changed: Recorded fix commit `ce7e6f7` in the organizer phase and handoff.
- Why: Keep the continuation notes tied to the exact OSM 403 fix.
- Validation: `git diff --check` passed.
- Limitations: Browser-visible tile loading remains to be confirmed.

## 2026-10-11T04:08:00+05:30 — Fix OSM tile referrer policy

- Changed: Set Leaflet tile image referrer policy to `strict-origin-when-cross-origin` and documented the OSM 403 cause/fix in the organizer brief.
- Why: The browser was showing OSM “Access blocked” tiles because the cross-origin tile requests need a valid page referrer; this needs no OSM credentials.
- Validation: JavaScript syntax and `git diff --check` passed; `docker compose up --build -d` completed; organizer returned HTTP 200 and served JavaScript contained the referrer policy.
- Limitations: Browser-visible tile loading after the fix remains unverified.

## 2026-10-11T04:03:00+05:30 — Record Leaflet implementation checkpoint

- Changed: Marked P1-ORG-4 implementation complete, added commit `3fcdea5` to its phase record, and updated the handoff pointer.
- Why: Tie phase status and next steps to the committed implementation.
- Validation: `git diff --check` passed.
- Limitations: Browser map/GPS and Django persistence verification remain pending.

## 2026-10-11T04:02:00+05:30 — Add Leaflet street map and GPS path distance

- Changed: Added Leaflet 1.9.4 with integrity-pinned CDN assets and attributed OpenStreetMap tiles; centered the street view on GPS, rendered the live position/accuracy and recorded track, added geolocated destination/path-point markers and per-edge straight-line distances, and retained a separate floor-plan view. Updated organizer phase, README, AI usage, and handoff documentation.
- Why: Let organizers view GPS capture in geographic context and measure the recorded coordinate path.
- Validation: `node --check api/venueflow/static/venueflow/organizer.js`, `git diff --check`, and source searches for map controls/attribution/distance passed.
- Limitations: Requires internet for Leaflet CDN and map tiles. Distance follows captured GPS samples or straight-line endpoint geodesics; no road routing or snapping. Browser map/GPS and save/load round-trip were not runtime-tested.

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
