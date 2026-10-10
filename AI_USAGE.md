# AI usage record

Use Codex during the hackathon and briefly document its actual contribution here. Add a row after each meaningful task or milestone. Keep summaries concise and omit secrets, private data, and full chat transcripts.

## Event build log

On 11 October 2026, Codex fixed the DRF router registration blocker in `api/venueflow/urls.py` by declaring basenames for the dynamically queried venue and event viewsets. This allowed the documented Compose startup, migrations, seed, and visitor route to run. Codex also recorded the completed P2-VIS-1 runtime evidence, clarified the active host port in `README.md`, and opened the page for human inspection. Human review: pending. Validation: Compose startup succeeded; services reported healthy/running; the seeded visitor route returned HTTP 200 with expected venue/place/path markup and was visually inspected; `git diff --check` passed. The seed has no plan image or explicit status values.

On 11 October 2026, Codex refined the visitor map presentation in `api/venueflow/templates/venueflow/visitor.html` and corrected optional status lookup for venues with no status value. It rendered the Django template against representative data and checked the resulting HTML for unresolved template tags and expected map/place/status content. Human review: pending. `git diff --check` passed. The in-app browser blocked the local file preview; full application-route rendering remains pending because host GDAL native libraries are missing. Codex installed packages from `api/requirements.txt` into the configured Python user environment; no project dependency files changed.

On 11 October 2026, Codex implemented P2-VIS-1 in `api/venueflow/templates/venueflow/visitor.html`, rendering the venue plan image or a local fallback, saved path edges, normalized destination pins, and explicit open/closed/delayed or unavailable status. Updated README and phase evidence. Human review: pending. Validation: `git diff --check` passed; Django check and rendered-page verification were unavailable because the configured Python launcher could not resolve Python 3.14 and the bundled Python lacks Django. No shared view/model/API files were changed.

On 11 October 2026, Codex revised `docs/person-2-visitor/BRIEF.md` to split visitor work into three reviewable phases: read-only snapshot map, destination discovery/details, and freshness/manual orientation. The phase criteria preserve the shared contract and visitor file ownership. Human review: pending. Validation: reviewed against the shared contract and phase template; documentation link and whitespace checks passed. No application code or runtime checks apply.

On 11 October 2026, Codex merged the repository default branch into the integration branch, reconciled conflicting project overview, handoff, changelog, and AI-usage records, and retained both branches' distinct updates. Human review: pending. Validation: staged whitespace check, local Markdown target check, conflict-marker scan, and two-parent merge verification passed.

On 11 October 2026, Codex updated `AGENTS.md` to require use of the active phase's declared technology stack, including installing missing required tools and dependencies rather than silently substituting alternatives. Human review: pending. Validation: reviewed consistency with existing dependency guidance and ran `git diff --check` successfully; no application runtime check applies.

On 11 October 2026, Codex reviewed the WalkWise product plan, shared contract, and active integration brief, then added a concise project description and product-direction section to `README.md`. The wording distinguishes the intended QR-accessible, organizer-maintained venue-map MVP from unverified implementation. Human review: pending. Validation: plan/contract consistency review, referenced Markdown target checks, and `git diff --check` passed.

On 11 October 2026, after the user requested Django REST Framework and then server-rendered pages without a separate frontend, Codex replaced the React/Vite shell with Django templates, Tailwind static asset compilation, and progressive JavaScript served by the same Django service. Django ORM/PostGIS, DRF, Celery/Redis, migrations, and a demo seed command are wired in the foundation. The supplied OHC architecture informed the single-monolith layering; no CareUI code/assets or its broader authentication/tenancy/production stack were adopted. Human review: pending. Validation: Tailwind build, Compose config parsing, Python syntax compilation, and diff whitespace checks passed. Django system check could not run because host psycopg is missing; Docker runtime remains unavailable.

On 11 October 2026, Codex implemented the requested VenueFlow foundation: frontend shell and shared fixture, FastAPI API/health endpoint, PostGIS schema bootstrap, Redis/Celery worker, Compose setup, and teammate architecture/ownership documentation. The integration phase brief was revised before implementation to reflect the requested stack. Human review: pending. Validation: frontend install/build and HTTP shell response passed; Compose configuration and Python compilation passed. Full Compose runtime could not be checked because Docker's local daemon was unavailable.

On 11 October 2026, Codex added phase-based execution and minimal handoff guidance to `AGENTS.md`, introduced `docs/PHASE_TEMPLATE.md`, added stable phase IDs and exit checks to the four participant briefs, linked the process from `docs/README.md`, and created `handoff.md`. The goal is small verified increments, documented plan changes, and commit-ready participant phases with just enough continuation context. Human review: pending. Validation: changed-document Markdown targets and `git diff --check` passed; no application code or runtime checks apply.

Codex reviewed `RULES.md` and `docs/Walkwise_Development_Plan.md`, then drafted the six-hour split, shared contract, and four teammate briefs in `docs/`, with a discovery link in `README.md` and records in `CHANGELOG.md`. This is planning assistance only; no app code was implemented. Human review: pending. Validation: checked role ownership/paths and ran the documented Markdown and whitespace checks; no runtime check applies.

| Date and time with timezone | Tool / model, if known | Task | Assistance and affected files | Human review / corrections | Validation and result |
| --- | --- | --- | --- | --- | --- |
| TODO | Codex | TODO | TODO | Pending | TODO |

## Template preparation

On 10 October 2026, Codex prepared this documentation template from the organizer's supplied rules and checked the linked Luma page for the event name and dates. This covered `README.md`, `RULES.md`, `AGENTS.md`, `CHANGELOG.md`, `AI_USAGE.md`, `SUBMISSION.md`, `.gitignore`, and the pull request checklist. Agent validation covered local links, event consistency, required documents, and diff whitespace; organizer review is pending.

This preparation is separate from participant project implementation and participant AI usage during the event.
