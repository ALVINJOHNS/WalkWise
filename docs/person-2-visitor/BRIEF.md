# Person 2 — Visitor map and offline experience

## Goal

Build the visitor experience for a read-only venue snapshot. Make it easy to find a place, understand its status, and orient on the event map. Keep the screen functional with local seed data before package publishing is ready.

## Owned files

- `api/venueflow/templates/venueflow/visitor.html`, `api/venueflow/static/venueflow/visitor.js`
- Do not edit the shared base template, Django models/API, Tailwind input, or another feature's template/JS. Coordinate shared contract changes with integration.

## Build now

1. Render a visitor template from the published or current venue snapshot and freshness context supplied by the Django view.
2. Render an interactive map with real geospatial coordinates when available, plus the organizer's venue plan and graph where applicable.
3. Add a searchable/filterable destination list and a selected-place detail panel/card.
4. Show clear open, closed, or delayed state and truthful saved/current status supplied by the server.
5. Add a prominent “Locate me” entry point. If GPS is unavailable, offer a useful manual starting-point option; do not request location on page load.
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
- Follow-up verification: 2026-10-11 IST — Isolated Compose app built successfully; migrations and seed exited 0, API became healthy, and `/v/kochi-expo/` returned HTTP 200 with visitor controls and seeded places in rendered HTML and no unresolved `{%` tags. Browser interaction remains unverified because the CUA browser runtime could not initialize.
- Commit: `535489d` — `feat: add visitor discovery and orientation` (implementation; live interaction verification pending).
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
  - [x] A route overlay placeholder is present and does not claim to calculate or display a route before routing integration.
- Checks: Run the focused Django/page check; manually verify each freshness prop state, no location prompt on initial load, the locate fallback, and narrow-width layout.
- Dependencies: P2-VIS-1 and P2-VIS-2; visitor page view supplies explicit publication state and last-saved timestamp. Route placeholder is an integration point only.
- Out of scope: GPS snapping, route computation, spoken directions, QR generation, cache/offline implementation, and external map tiles.
- Verification record: 2026-10-11 IST — `python -m py_compile api/venueflow/pages.py` and `node --check api/venueflow/static/venueflow/visitor.js` passed. Django template rendering for `saved`, `current`, and `paused` props passed with expected labels and no unrendered tags. Code inspection confirms `getCurrentPosition` is registered on the explicit button click only; manual map click and keyboard start markers are wired. `git diff --check` passed. Actual GPS permission/fallback and narrow-screen browser behavior remain unverified.
- Follow-up verification: 2026-10-11 IST — The isolated Compose app built; migration and seed exited 0; Django health check passed; `/v/kochi-expo/` returned HTTP 200 and rendered the Locate me control without unresolved Django tags. Browser automation failed to initialize, so GPS permission/fallback and narrow-screen behavior remain unverified.
- Follow-up fix: 2026-10-11 IST — Changed manual map placement from click-only handling to pointer tap handling with a small movement threshold, preserving map-pin selection and ignoring drags/cancelled touches. `node --check` and live static-asset verification passed after collecting the updated file. Actual phone touch interaction still needs user confirmation.
- Commit: `535489d` — `feat: add visitor discovery and orientation` (implementation; GPS/mobile verification pending).
- Plan changes: 2026-10-11 — Made freshness/location/mobile behavior a separate final visitor phase, keeping navigation integration and QR/cache ownership explicit. Added a narrow visitor-view context exception because the existing Django view supplies no freshness props required by this phase.

### P2-VIS-4 — Interactive map and organizer-path navigation

- Status: `in progress`
- Goal: Replace the static illustration with an interactive, coordinate-aware visitor map that locates the visitor and guides them along paths explicitly authored by the organizer.
- Scope: Use the project's existing Leaflet/OpenStreetMap approach for the outdoor map; render the real venue plan only when one is saved; show georeferenced destination pins, organizer path graph, and current position without decorative/sample map graphics. Let visitors search/select a destination, calculate a route over the authored graph, see the route and next path point, and stop/clear the route. Request GPS only after the visitor activates Locate me. Expose saved graph and geolocation data from the server. Add an explicit organizer-selected `access_node_id` for destinations because the current data contract has no safe place-to-path connection; do not infer it from proximity. Keep visitor visual/CSS/JS changes under a visitor root so they cannot affect other pages. Remove the overview's decorative mock map and summary tiles at the user's request while keeping real venue listing/actions. If map coordinates are missing, explain that the venue has not been georeferenced and offer the saved floor plan only when it exists; never draw a fabricated street-map background or dummy chart.
- Acceptance criteria:
  - [ ] Visitor gets a pannable/zoomable OSM map, or the actual saved floor plan where outdoor georeferencing is absent; no patterned/fake map fallback is displayed.
  - [ ] Locate me asks for permission only on click, updates a visible position marker as the device moves, supports recenter/stop controls, and reports denial/unsupported/accuracy states usefully.
  - [ ] Destinations are selectable from search/list or map markers; selecting a destination offers navigation.
  - [ ] A route starts from the visitor's nearest explicitly georeferenced path node (or an explicitly selected manual start node), follows only organizer-authored open edges, and ends at the destination's explicitly assigned access node.
  - [ ] Route geometry is drawn on the map and the visitor can see the next graph point and remaining distance; closed/disconnected/unmapped routes show clear errors instead of fabricated guidance.
  - [ ] Organizer can assign a destination's access node explicitly and persist it with the existing map-draft API.
  - [x] Visitor-only controls and overlays do not style or cover the overview or organizer pages.
  - [x] Decorative sample maps and summary tiles are removed from the overview and visitor view; real venue data and actions remain.
- Checks: JavaScript syntax and Django checks; focused route fixtures for direction/closures/missing mappings; local page rendering; manual browser verification of pan/zoom, destination selection, GPS/manual start, route draw/stop, error states, and another non-visitor page to confirm styling isolation.
- Dependencies: P2-VIS-1 through P2-VIS-3; P3-NAV-1/P3-NAV-2 graph contract; P4-INT-3 map-draft API. Requires explicit place-to-node mapping in organizer-authored feature properties.
- Out of scope: Offline routing, voice guidance, external commercial Google Maps API, automatic routing inference from coordinates, live sync, and QR/publishing.
- Verification record: 2026-10-11T06:37+05:30 — `node --check` passed for visitor, organizer, and shared page JavaScript; `python -m py_compile` passed for `pages.py` and `serializers.py`; `git diff --check` passed. Opened the visitor route in the app browser and confirmed unpositioned seed places are omitted, the fabricated patterned fallback is gone, and a truthful map-data empty state is shown. Opened overview and organizer routes and confirmed visitor overlay styling does not cover either page; the overview mock illustration, summary tiles, and toast-only buttons are removed and navigation links work. `npm run build:css` could not run because npm is not installed in the shell; Django `manage.py check`/migration checks could not run because Docker Desktop pipe access was denied. The current venue has no GPS coordinates or saved plan, so actual OSM tiles, geolocation permission, destination markers, and route behavior could not be manually verified without authoring real venue data or granting browser location.
- Commit: Pending.
- Plan changes: 2026-10-11T06:16:48+05:30 — User clarified that the visitor experience must behave like an interactive map, show the visitor's location, route to selected destinations along organizer-defined paths, and avoid dummy visualizations. Added this phase and explicit mapping/geodata requirements; existing static coordinate illustration does not satisfy that goal.
- Plan changes: 2026-10-11T06:34:00+05:30 — Expanded the visual cleanup to the overview after inspection found a decorative mock map and redundant summary tiles; preserve its real venue list and actions.

After P2-VIS-4, hand off for integration review. QR and cache remain integration-owned.

## Cut first

GPS snapping, spoken directions, event agenda, interests, compass, analytics, animated UI, external map tiles. Never imply live data or offline readiness based on network status alone.

## Short Codex prompt

“Implement only the visitor template and JavaScript paths in `docs/person-2-visitor/BRIEF.md`. Follow `docs/SHARED_CONTRACT.md`; use ORM-backed page context and do not edit other owners' files. Keep freshness labels truthful. Return changed files and the check you ran.”
