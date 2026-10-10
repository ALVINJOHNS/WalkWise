# Six-hour team build plan

## Phase execution and handoffs

Follow the repository workflow in [AGENTS.md](../AGENTS.md). Each participant brief is split into numbered phases with acceptance criteria and a verification record. Start from the current [handoff](../handoff.md), which names the completed phase and exact next brief/phase. Use [the phase template](PHASE_TEMPLATE.md) when adding or revising phase breakdowns. At each phase boundary, verify behavior, document evidence and limitations, commit that participant's coherent change, and rewrite the handoff for the next agent. Keep the handoff minimal; detailed evidence belongs in the phase doc and `CHANGELOG.md`.

Use these four briefs as the execution plan derived from [Walkwise_Development_Plan.md](Walkwise_Development_Plan.md). They narrow its original eight-hour core to a six-hour, demo-first MVP. Assign one brief to each teammate; keep the folder names stable so ownership and merge boundaries are clear.

## Shared decisions before anyone starts coding

- Build one Django application serving server-rendered pages and a Django REST Framework modular API using Django ORM, PostgreSQL/PostGIS, and a Celery worker using Redis. Tailwind is compiled to Django static files; no separate frontend server is needed.
- Keep one Django app and shared data contract. Each owner works in their assigned template/static Python module; the integration owner owns shared routing, ORM models/migrations, package scripts, and final merge.
- Use the contract in [SHARED_CONTRACT.md](SHARED_CONTRACT.md). Treat it as frozen after the first 15 minutes; discuss any necessary change in chat before editing it.
- Each feature must render with the included seeded venue. Do not wait for another person's API or template.
- MVP persistence uses the Django ORM/PostGIS database. Do not add accounts or realtime sync.
- Keep edits in owned paths, use small commits, and merge each feature as soon as it builds. Integration lead resolves conflicts and maintains the working demo.
- Use one realistic venue, one connected three-edge route, three destinations, and one status change. Complete the core QR-to-map-to-route flow before stretch work.

## Ownership

| Person | Folder | Owns | First merge checkpoint |
| --- | --- | --- | --- |
| 1 — Organizer | [person-1-organizer](person-1-organizer/BRIEF.md) | Django organizer template, image backdrop, path and place authoring | Hour 2 |
| 2 — Visitor | [person-2-visitor](person-2-visitor/BRIEF.md) | SSR visitor map/list/details and search | Hour 2 |
| 3 — Navigation | [person-3-navigation](person-3-navigation/BRIEF.md) | Pure Python graph routing, ETA, location fallback, next-place suggestion | Hour 2 |
| 4 — Integration | [person-4-integration](person-4-integration/BRIEF.md) | App shell, shared contract, local package persistence, publish/QR, seed/deploy/demo | Continuous |

The integration owner starts the Django shell and data contract first, then works independently on publishing and demo setup. The other three can build immediately against the ORM contract and seeded venue.

## Six-hour schedule

| Elapsed | Whole team gate |
| --- | --- |
| 0:00–0:15 | Read rules, assign folders, freeze stack/contract, choose venue and demo route |
| 0:15–1:00 | All four build in parallel; integration owner creates runnable app shell and deploys a blank page if possible |
| 1:00–2:00 | Feature slices become usable with seed data and local adapters; merge each as it builds |
| 2:00–3:00 | Integrate authoring and visitor map; publish seed package and open its visitor URL/QR |
| 3:00–4:00 | Connect routing and recommendation; test known route and destination status behavior |
| 4:00–5:00 | Save venue package and app shell; test cold reload/offline on one real phone if feasible |
| 5:00–5:30 | One status change, fix highest-impact bugs, stop adding features |
| 5:30–6:00 | Rehearse the three-minute demo twice; update docs and submission claims honestly |

## Cut order if time slips

1. Cut analytics, accessibility filters, walk-and-plot, event scheduling, and calibration math.
2. Keep an uncalibrated local sketch map with manual start position if GPS alignment is not ready.
3. Keep core route and ETA; cut sophisticated GPS snapping and use a clear manual map tap fallback.
4. Keep a saved venue snapshot; if service worker offline reload fails, disclose it and demo cached data in the already-open page.
5. Keep QR as a URL to the hosted visitor page. Generate a QR only if the deployment URL is stable.

## Completion definition

The demo is complete when the organizer can edit/publish a venue, a visitor can open its QR URL, see destinations and a route with ETA, and the UI accurately labels whether the package is saved/offline or current. Do not claim cross-device live updates or airplane-mode cold reload unless those were actually verified.

## Using Codex efficiently

Give each person their brief and ask the model to implement only that owned folder, follow the shared contract, keep code direct, and return changed files plus the exact check run. Ask for one narrow change at a time; review the diff before accepting it. Keep model prompts short and do not ask every teammate to redesign architecture.
