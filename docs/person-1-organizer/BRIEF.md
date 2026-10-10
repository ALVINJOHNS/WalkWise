# Person 1 — Organizer authoring

## Goal

Build the organizer's usable venue editor as a self-contained feature. A user should be able to put down a map image, add a few walkable graph points/edges and destination pins, change a place status, and save a valid `Venue` draft.

## Owned files

- `api/venueflow/templates/venueflow/organizer.html`, `api/venueflow/static/venueflow/organizer.js`
- Do not edit the shared base template, Django models/API, Tailwind input, or another feature's template/JS. Coordinate shared contract changes with integration.

## Build now

1. Create server-rendered organizer templates that work with the Django ORM data contract and seed venue.
2. Support image selection (PNG/JPG) with an image backdrop and normalized local image coordinates.
3. Add/select/move destination pins and edit name, category, description, and open/closed/delayed status.
4. Add walk graph nodes and connect two selected nodes with an edge. Provide a simple visual line/point editor; no automatic tracing.
5. Validate duplicate/blank names, dangling edge node IDs, and places missing names; show messages in the UI.
6. Use a Django form or DRF endpoint to persist edits and show validation feedback. Do not implement publishing.
7. Request geolocation only after a clear user action; save latitude, longitude, accuracy, altitude, heading, speed, and timestamp for destination fixes and a recorded venue-outline track.

## Independent development

Use the seeded database venue while API persistence is being finalized. Keep interactions progressively enhanced with JavaScript and templates usable without it where practical. Keep controls simple and usable on laptop and phone.

## Done when

- A new image can be selected and displayed.
- Three places and a connected three-edge path can be authored or edited.
- Status can be changed and is present in the saved Venue object.
- Invalid/dangling data is reported without crashing.
- Organizer page renders from the Django server and is ready for integration by elapsed hour 2.

## Phases

Use the phase loop in [AGENTS.md](../../AGENTS.md) and record results here with the [phase template](../PHASE_TEMPLATE.md). Keep this feature's owned paths intact.

### P1-ORG-1 — Editor foundation

- Status: in progress (implementation complete; rendered runtime check pending)
- Scope: Organizer template, image selection/backdrop, place pins and basic place fields/status.
- Exit checks: PNG/JPG selection displays; add/select/edit three places; page renders against the seeded ORM venue.
- Next: P1-ORG-2.

### P1-ORG-2 — Walk graph and validation

- Status: in progress (implementation complete; Django/API runtime check pending)
- Scope: Add/connect nodes and edges; validate blank/duplicate names and dangling references; expose save callback and unsaved state.
- Exit checks: Author connected three-edge path; invalid data shows useful messages without crash; saved venue contains edited status; focused Django check passes.
- Next: integration review; do not add calibration or storage.

### P1-ORG-3 — GPS capture and venue outline

- Status: implementation complete; browser verification pending
- Goal: Let an organizer explicitly request a current GPS fix for a destination and record a live GPS perimeter trace.
- Scope: Browser permission request from user-triggered controls; current location capture; start/stop/clear outline recording; visible GPS trace and location/accuracy status; save timestamped geolocation samples in the existing organizer draft JSON.
- Acceptance criteria:
  - [ ] User action invokes geolocation and gives clear success, denial, unsupported, timeout, and insecure-context feedback.
  - [ ] Selected destination stores latitude, longitude, accuracy, altitude, heading, speed, and timestamp when available.
  - [ ] Start/stop records a live track, draws the outline, and persists the captured samples with the venue draft.
- Checks: JavaScript syntax, diff whitespace, and browser geolocation/save round-trip when runtime is available.
- Dependencies: Existing `Venue.calibration.organizer_draft` save/load path.
- Out of scope: Background tracking after leaving the page, automatic snapping or conversion from GPS to floor-plan coordinates.
- Verification record: 2026-10-11 03:43 IST — `node --check api/venueflow/static/venueflow/organizer.js` and `git diff --check` passed. Browser permission, device GPS, and Django save/load remain unverified because Docker socket access is denied.
- Commit: `9035fa8` — `fix: preserve GPS errors and outline state` (builds on GPS UI in `97d8598`).
- Plan changes: 2026-10-11 — User requested explicit GPS location capture and live perimeter recording; revised earlier no-calibration cut to support real coordinates while keeping local plan coordinates separate.

### P1-ORG-4 — Leaflet basemap and GPS path distance

- Status: in progress
- Goal: Display GPS captures over an interactive OpenStreetMap basemap and show their measured path length.
- Scope: Leaflet map initialized from the current/saved GPS fix; OSM standard raster tiles with visible attribution and a cross-origin referrer policy accepted by OSM; selectable street-map/floor-plan view; live GPS pointer, accuracy circle, recorded track, destination pins with GPS locations, and cumulative GPS track distance.
- Acceptance criteria:
  - [ ] Current/saved GPS coordinates center a pannable and zoomable Leaflet map with OSM attribution.
  - [ ] Current GPS pointer and recorded track render at their latitude/longitude on the basemap.
- [ ] Destination pins and path points with GPS coordinates appear on the basemap; items without GPS coordinates can be selected and placed by clicking the street map; connecting geolocated path points shows their measured straight-line geographic distance. Switching to floor-plan view keeps the existing local-coordinate editor usable.
  - [ ] Recorded path distance updates as fixes arrive and is computed from geographic coordinates.
- [ ] Map/library/tile failures display useful feedback without crashing GPS capture or organizer editing.
- Checks: JavaScript syntax, diff whitespace, template attribution/search check, and browser map/GPS interaction when runtime is available.
- Dependencies: P1-ORG-3, CDN availability, and internet access for OSM tiles.
- Out of scope: Offline tiles, routing instructions or road/path network snapping, and conversion between geographic and floor-plan coordinates.
- Verification record: 2026-10-11 04:02 IST — `node --check api/venueflow/static/venueflow/organizer.js`, `git diff --check`, and a source check for the Leaflet/OSM integration passed. Browser/phone interaction and runtime save/load remain unverified because Docker access is denied.
- Verification record: 2026-10-11 04:08 IST — After the reported 403, configured Leaflet’s OSM tile `referrerPolicy`; JavaScript syntax and diff whitespace passed, Compose rebuilt and started, organizer returned HTTP 200, and served JavaScript contained the updated policy. Browser-side OSM tile success is not directly verified.
- Verification record: 2026-10-11 04:14 IST — Added map-click placement for local-only destinations/path points and selectable/highlighted Leaflet markers. JavaScript syntax and diff whitespace passed; Compose rebuilt, organizer returned HTTP 200, and served JS contained the placement action. Manual browser interaction remains pending.
- Commit: `3fcdea5` — `feat: add OSM map and GPS distances`.
- Plan changes: 2026-10-11 — User requested Leaflet and OpenStreetMap as the location background with path distance; added this phase after GPS capture.
- Follow-up: Per OSM’s current tile policy, set Leaflet’s `referrerPolicy` to `strict-origin-when-cross-origin` so tile requests identify this web origin even when Django applies a restrictive page default. Recorded in the fix checkpoint below.
- Follow-up commit: `ce7e6f7` — `fix: send referrer with OSM tile requests`.

## Cut first

Calibration, zones, schedules/hours, undo/redo, mobile walk-and-plot, advanced drag handles, graph auto-layout. Do not spend time polishing editor appearance before save/export works.

## Short Codex prompt

“Implement only the organizer template and JavaScript paths in `docs/person-1-organizer/BRIEF.md`. Follow `docs/SHARED_CONTRACT.md`; use the Django ORM/DRF contract and do not edit other owners' files. Return changed files and the check you ran.”


### Implementation record — 2026-10-11

The organizer page now provides venue selection, a PNG/JPG backdrop preview, destination editing (name, category, description, status), movable map markers, path points, edge creation, validation, and a save action. The current API exposes venue CRUD but not related feature/node/edge endpoints, so the editor stores its `organizer_draft` envelope in the venue's existing `calibration` JSON field. The selected image is saved as a data URL in that draft. This keeps the feature within its owned template/JavaScript paths, but large plans may exceed practical API/database request limits and existing `MapFeature`/`PathNode`/`PathEdge` rows are not loaded into the editor. Integration should provide related-resource APIs or server-rendered bootstrap data before treating this as production persistence.

- Checks run: `node --check api/venueflow/static/venueflow/organizer.js` and `git diff --check` passed.
- Runtime limitation: Docker Compose cannot reach the local Docker socket (`permission denied`); Django page/API rendering and save round-trip were not verified in this environment.
- Commit: `66a59b3` — `feat: build organizer venue editor` (implementation checkpoint; runtime verification pending).


### UI follow-up — 2026-10-11

Updated the empty canvas placeholder so the selected image's alt text cannot show through, added visible PNG/JPG drag-and-drop feedback and loading, and removed API browser links from the organizer, shared navigation, and overview. The editor retains internal same-origin requests for draft load/save. Validation run: `node --check api/venueflow/static/venueflow/organizer.js` and `git diff --check` passed; browser/Django rendering remains unverified because Docker access is denied.


### GPS capture — 2026-10-11

Added user-triggered current-location and outline-recording controls. A destination can save a GPS fix with latitude/longitude, accuracy, altitude, heading, speed, and timestamp. Outline recording uses `watchPosition`, renders the recorded track on the canvas, and saves timestamped fixes in `calibration.organizer_draft.geo_outline`. A secure context is required (HTTPS or localhost in development); the browser asks for permission when an organizer starts a location action. GPS data is intentionally kept separate from plan `x`/`y` coordinates. The existing API serializer exposes `Venue.boundary` as read-only, so recorded GPS outline remains in draft metadata and is not yet written as the ORM geometry boundary.

- Checks run: `node --check api/venueflow/static/venueflow/organizer.js` and `git diff --check` passed.
- Runtime limitation: Browser permission, hardware GPS, and Django save/load behavior could not be verified because Docker socket access is denied.
- Commit: `24bac71` — `fix: stop GPS trace and show live position`.


### GPS follow-up — 2026-10-11

Fixed stop handling so the click event is not used as a status message, invalidated queued location callbacks after stop, and added a moving GPS pointer with an accuracy halo. The recorder now retains each browser-reported fix, including small changes, rather than applying a distance filter. A live pointer follows the latest fix and its halo visualizes the reported accuracy radius. `enableHighAccuracy` remains enabled for phone GPS where supported; actual update cadence and accuracy depend on the device/browser and location conditions.

- Checks run: `node --check api/venueflow/static/venueflow/organizer.js` and `git diff --check` passed.
- Runtime limitation: Stop/start behavior and phone GPS pointer movement were not manually exercised because the browser/Django runtime is unavailable here.
- Commit: `24bac71` — `fix: stop GPS trace and show live position`.
