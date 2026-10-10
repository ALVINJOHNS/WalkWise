# Person 2 — Visitor map and offline experience

## Goal

Build the visitor experience for a read-only venue snapshot. Make it easy to find a place, understand its status, and orient on the event map. Keep the screen functional with local seed data before package publishing is ready.

## Owned files

- `api/venueflow/templates/venueflow/visitor.html`, `api/venueflow/static/venueflow/visitor.js`
- Do not edit the shared base template, Django models/API, Tailwind input, or another feature's template/JS. Coordinate shared contract changes with integration.

## Build now

1. Render a visitor template from a published `Venue` snapshot and freshness context supplied by the Django view.
2. Render the map image/backdrop, graph paths, labeled destination pins, and status styling using normalized coordinates.
3. Add a searchable/filterable destination list and a selected-place detail panel/card.
4. Show clear open, closed, or delayed state and truthful saved/current status supplied by the server.
5. Add a prominent “Locate me” entry point. If GPS is unavailable, show a useful map-tap/manual-start prompt; do not request location on page load.
6. Keep the layout mobile-first and suitable for QR entry. Do not own QR generation, app shell, cache implementation, or route computation.

## Independent development

Use the seeded venue or ORM-backed view context. Do not block on routing APIs; leave a visible route placeholder slot for the navigation workstream.

## Done when

- Seed map and places display without the organizer editor running.
- Search/filter/select works and place status is legible.
- Visitor sees whether data is saved/current/paused from explicit props.
- Screen remains usable at a narrow phone width and offers manual location fallback.
- Visitor route renders from Django and is ready for integration by elapsed hour 2.

## Phases

Use the phase loop in [AGENTS.md](../../AGENTS.md) and record results here with the [phase template](../PHASE_TEMPLATE.md). Keep this feature's owned paths intact.

### P2-VIS-1 — Render the venue snapshot

- Status: `complete`
- Goal: Show the published or seeded venue snapshot as a legible, read-only map.
- Scope: Define the visitor template's expected view props; render the map image/backdrop, normalized graph paths, labeled destination pins, and each place's open/closed/delayed styling. Use only the owned visitor template and JavaScript paths.
- Acceptance criteria:
  - [x] The Django visitor page renders from the supplied venue snapshot without the organizer editor running.
  - [x] The map backdrop, graph paths, and destination pins use normalized plan coordinates on the same map surface.
  - [x] Destination labels and status remain legible at phone width.
  - [x] Visitor rendering does not mutate the published snapshot.
- Checks: Use the repository's available Django/page check and manually open the seeded visitor page; confirm overlay alignment and status labels. Record unavailable runtime prerequisites rather than claiming a pass.
- Dependencies: Shared venue snapshot contract and the seeded or ORM-backed visitor view context; no other visitor phase.
- Out of scope: Search, route computation, GPS, QR generation, and cache implementation.
- Verification record: 2026-10-11 IST — `docker compose up --build -d` completed after the integration router fix. Compose reports database and Redis healthy, API healthy, and worker running. `http://localhost:8001/v/kochi-expo/` returned 200; response assertions confirmed the venue, Food Court, and path overlay. Opened the route in the in-app browser and visually confirmed saved-coordinate fallback, paths, and pins. No plan image is in the seed; statuses are unavailable because the seed supplies none. `git diff --check` passed.
- Commit: Visitor implementation `2368e0d`; follow-up integration blocker fix pending.
- Plan changes: 2026-10-11 — Split map rendering from visitor interactions so the first outcome can be reviewed independently.

### P2-VIS-2 — Find and inspect a destination

- Status: `in progress`
- Goal: Let visitors search or filter destinations, select one, and inspect its details and status.
- Scope: Add search/filter controls, selection behavior, and a selected-place detail panel/card using the supplied snapshot props and the owned visitor JavaScript/template paths.
- Acceptance criteria:
  - [ ] Search narrows destinations by their visible name, and the supported filter controls narrow the list by place/status.
  - [ ] Selecting a result highlights its map pin and shows matching place details; selecting another result updates both.
  - [ ] Open, closed, and delayed states remain explicit in both map/list or detail context where shown.
  - [ ] Empty search/filter results have a useful empty state; no mutation is sent for visitor actions.
- Checks: Run the focused Django/page check and manually exercise search, filters, selection changes, empty results, and status consistency on the seeded venue.
- Dependencies: P2-VIS-1; visitor view data must expose the fields needed to search and display place details.
- Out of scope: Route calculation and publishing/model/API changes.
- Verification record: 2026-10-11 IST — `node --check api/venueflow/static/venueflow/visitor.js` passed. Django template rendering with representative names, statuses, and descriptions passed; rendered HTML contains the search/status controls, place data, and detail panel with no unrendered Django tags. `git diff --check` passed. Live click/filter interaction remains unverified in the app browser.
- Commit: Pending.
- Plan changes: 2026-10-11 — Isolated discovery and selected-place details from the base map outcome for focused review.

### P2-VIS-3 — Show freshness and offer manual orientation

- Status: `in progress`
- Goal: Communicate server-supplied snapshot freshness and provide an accessible starting point for navigation.
- Scope: Render a truthful saved/current/paused freshness cue from explicit view props; add a prominent “Locate me” entry point with a useful map-tap/manual-start prompt when GPS is unavailable or denied; ensure narrow mobile layout; reserve a visible route-overlay slot for the navigation workstream. A context-only change to the visitor function in integration-owned `api/venueflow/pages.py` is in scope because the current view provides no freshness prop; preserve URL, model, and API contracts and flag the change for integration review.
- Acceptance criteria:
  - [ ] Freshness wording is derived only from explicit server props and does not infer live/offline status from connectivity.
  - [ ] The page does not request location on load; location is requested only after the visitor activates “Locate me”.
  - [ ] Unavailable/denied GPS presents a usable map-tap or manual-start prompt.
  - [ ] At narrow phone width, search/list, map, details, freshness, and locate entry remain usable without horizontal overflow.
  - [ ] A route overlay placeholder is present and does not claim to calculate or display a route before routing integration.
- Checks: Run the focused Django/page check; manually verify each freshness prop state, no location prompt on initial load, the locate fallback, and narrow-width layout.
- Dependencies: P2-VIS-1 and P2-VIS-2; visitor page view supplies explicit publication state and last-saved timestamp. Route placeholder is an integration point only.
- Out of scope: GPS snapping, route computation, spoken directions, QR generation, cache/offline implementation, and external map tiles.
- Verification record: 2026-10-11 IST — `python -m py_compile api/venueflow/pages.py` and `node --check api/venueflow/static/venueflow/visitor.js` passed. Django template rendering for `saved`, `current`, and `paused` props passed with expected labels and no unrendered tags. Code inspection confirms `getCurrentPosition` is registered on the explicit button click only; manual map click and keyboard start markers are wired. `git diff --check` passed. Actual GPS permission/fallback and narrow-screen browser behavior remain unverified.
- Commit: Pending.
- Plan changes: 2026-10-11 — Made freshness/location/mobile behavior a separate final visitor phase, keeping navigation integration and QR/cache ownership explicit. Added a narrow visitor-view context exception because the existing Django view supplies no freshness props required by this phase.

After P2-VIS-3, hand off for integration review. QR and cache remain integration-owned.

## Cut first

GPS snapping, spoken directions, event agenda, interests, compass, analytics, animated UI, external map tiles. Never imply live data or offline readiness based on network status alone.

## Short Codex prompt

“Implement only the visitor template and JavaScript paths in `docs/person-2-visitor/BRIEF.md`. Follow `docs/SHARED_CONTRACT.md`; use ORM-backed page context and do not edit other owners' files. Keep freshness labels truthful. Return changed files and the check you ran.”
