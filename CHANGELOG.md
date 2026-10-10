# Change log

Record each meaningful project change during the event, newest first. Update this file in the same commit as the change. Use a real timestamp with timezone, for example `YYYY-MM-DDTHH:MM:SS+05:30`.

## Event build log

## 2026-10-11T04:59:24+05:30 — Add visitor search and destination details

- Changed: Added name search, status filtering, synchronized map/list selection, a selected-place detail card, accessible empty/result states, and no-mutation visitor interactions in the owned visitor template and JavaScript.
- Why: Complete P2-VIS-2 so visitors can find and inspect organizer-provided places.
- Validation: `node --check api/venueflow/static/venueflow/visitor.js` passed; Django template render and output assertions passed; `git diff --check` passed.
- Limitations: Live search/filter and selection interactions were not manually exercised in the app browser.

## 2026-10-11T04:59:24+05:30 — Add freshness and manual orientation

- Changed: Added explicit visitor freshness context from event publication state and venue save time, a locate button that requests GPS only after activation, map/keyboard manual start markers, and a visible route placeholder. Updated the shared context contract.
- Why: Complete P2-VIS-3 while keeping location permission and offline claims explicit and user controlled.
- Validation: `python -m py_compile api/venueflow/pages.py`, `node --check api/venueflow/static/venueflow/visitor.js`, representative template renders for all three freshness states, and `git diff --check` passed.
- Limitations: Actual browser geolocation, manual marker placement, and mobile layout remain unverified in the app browser.

## 2026-10-11T04:37:00+05:30 — Start and verify the visitor map

- Changed: Added explicit DRF router basenames for the venue and event viewsets so Django's URL checks and migration command can run. Completed P2-VIS-1 runtime evidence and clarified how to find the Compose host port in `README.md`.
- Why: The integration router assertion blocked migrations and seeding, which made the seeded visitor URL return 404. The running workspace publishes Django on port 8001.
- Validation: `docker compose up --build -d` succeeded; `docker compose ps` showed healthy API/database/Redis and a running worker. The visitor URL on port 8001 returned HTTP 200 with the venue, sample place, and path overlay; the page was opened and visually inspected. `git diff --check` passed.
- Limitations: The seed has no plan image or explicit status values, so the page shows its saved-coordinate backdrop and “Status unavailable” labels. Search, selection, freshness, and location are later visitor phases.

## 2026-10-11T03:57:00+05:30 — Refine visitor map presentation

- Changed: Refined the visitor page hierarchy, map card, destination list, status badges, and responsive spacing in the owned template. Adjusted status lookup so missing optional status data renders as unavailable.
- Why: Make the visitor snapshot easier to scan on phones and desktop, and address the raw-template confusion by confirming the page is intended to be rendered by Django.
- Validation: Rendered the Django template with a representative venue context; checked the generated HTML contains no unresolved Django tags and includes map/place/status content. Installed packages declared in `api/requirements.txt`. `git diff --check` passed. `python api/manage.py check` is blocked by missing host GDAL native libraries. Browser preview was blocked because the in-app browser disallows local file URLs.
- Limitations: Full application route remains unverified. Opening `visitor.html` directly still shows template source; use the Django route when the app is running.

## 2026-10-11T03:31:40+05:30 — Render visitor map from venue snapshot

- Changed: Replaced the visitor placeholder with a responsive venue map surface that renders the plan image or a local fallback, saved path edges, normalized destination pins, status styling, and a read-only destination/status legend. Updated the README and P2-VIS-1 verification record.
- Why: Implement P2-VIS-1 so the visitor page displays organizer-saved map data independently of the editor.
- Validation: `git diff --check` passed. `python api/manage.py check` could not run because the configured Python launcher cannot resolve its Python 3.14 install and the bundled Python has no Django. A rendered/manual check remains pending.
- Limitations: Django page rendering and seeded database runtime remain unverified; absent feature status is labeled “Status unavailable.”

## 2026-10-11T03:23:43+05:30 — Split visitor work into three implementation phases

- Changed: Expanded the visitor brief into P2-VIS-1 snapshot map rendering, P2-VIS-2 destination discovery/details, and P2-VIS-3 freshness/location/mobile orientation. Added per-phase goals, acceptance criteria, checks, dependencies, ownership boundaries, and verification placeholders.
- Why: Make each visitor increment independently reviewable and clarify that routing, QR, and cache work remain outside the visitor owner's scope.
- Validation: Reviewed phase ordering against `docs/SHARED_CONTRACT.md` and `docs/PHASE_TEMPLATE.md`; documentation links and whitespace checked.
- Limitations: Planning only; no visitor implementation or runtime check was performed.

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

## 2026-10-11T02:23:33+05:30 — Add VenueFlow full-stack team foundation

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

## 2026-10-11T05:20:00+05:30 — Allow local phone access to the visitor demo

- Changed: Made Django `ALLOWED_HOSTS` configurable with `DJANGO_ALLOWED_HOSTS`; exposed it to the API service and documented same-Wi-Fi phone access in `.env.example`, `README.md`, and the integration brief.
- Why: Requests to the app's Wi-Fi IP were rejected with Django `DisallowedHost`, preventing a phone from opening the demo.
- Validation: `docker compose config --quiet` and `git diff --check` passed. Restarted the isolated API with `DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,api,10.10.19.157`; Django returned HTTP 200 and the venue page through `http://10.10.19.157:8000/v/kochi-expo/`.
- Limitations: Phone access is limited to the local network and may require a Windows Firewall allowance.

## 2026-10-11T05:10:00+05:30 — Verify visitor phases in isolated Compose app

- Changed: Added follow-up verification notes to the Person 2 visitor phase brief and updated the current handoff.
- Why: Record runtime evidence after the visitor implementation checkpoint and identify the remaining manual browser checks.
- Validation: `docker compose -p walkwise-verify up --build -d` built the images; after Postgres became healthy, migrations and seed exited 0, the API reported healthy, and `/v/kochi-expo/` returned HTTP 200 with no unresolved Django tags. Browser automation could not initialize; interaction/GPS/mobile checks remain pending.
- Limitations: The default Compose project is blocked by an existing `walkwise-redis-1` container name. An isolated `walkwise-verify` stack remains running on port 8000 for review.

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
