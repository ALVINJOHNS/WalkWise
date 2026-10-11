# Person 1 — Organizer authoring

## Goal

Build the organizer's usable venue editor as a self-contained feature. A user should be able to put down a map image, add a few walkable graph points/edges and destination pins, change a place status, and save a valid `Venue` draft.

## Owned files

- `api/venueflow/templates/venueflow/organizer.html`, `api/venueflow/static/venueflow/organizer.js`
- P1-ORG-5 also owns `api/venueflow/organizer_ai.py`; coordinate the existing organizer page POST handler in `api/venueflow/pages.py` and optional OpenAI environment wiring in `docker-compose.yml` with integration. No new API URL or user-facing API link is added.
- Do not edit the shared base template, Django models, API URL wiring, Tailwind input, or another feature's template/JS. Coordinate shared contract changes with integration.

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

### P1-ORG-10 — Map-first path drawing and editable curves

- Status: in progress
- Goal: Let organizers place destination/path points on the visible street map, connect points directly from the map, and adjust a connection into a curved path.
- Scope: Make map-point placement and connection mode explicit; make each street-map node selectable for a two-click connection flow; draw existing connections on the map; add a draggable curve handle and straight/curved toggle per connection. Persist the street-map control point through the existing `map-draft` edge `access_rules` field so no schema/API changes are needed. Retain normalized plan coordinates and the existing floor-plan editor.
- Acceptance criteria:
  - [ ] With the street map open, organizer can add destinations and path points at map clicks and see the corresponding draggable/selectable markers.
  - [ ] Connection mode prompts for a start point and endpoint and creates one edge between those stable node IDs.
  - [ ] Existing edges are visible over the map; each can be set straight or curved and its curve handle can be dragged to reshape it.
  - [ ] Edge curve state survives save/reload using the existing map-draft API and does not alter other points or edges.
  - [ ] Floor-plan editing, validation, and existing destination/path-point data remain usable.
- Checks: `node --check api/venueflow/static/venueflow/organizer.js`, `git diff --check`, inspect existing map-draft `access_rules` round-trip behavior, and browser interaction/save-reload if runtime is available.
- Dependencies: P1-ORG-2, P1-ORG-4, P1-ORG-8, P4-INT-3 map-draft persistence.
- Out of scope: Road snapping, multi-segment routing, changing database/API schemas, and inferring paths.
- Verification record: 2026-10-11 06:59 IST — `node --check api/venueflow/static/venueflow/organizer.js` and `git diff --check` passed. Source review confirms edge `access_rules` is accepted and returned by the existing map-draft API, and that the editor now has click-to-connect, draggable path nodes, a straight/curve toggle, and a draggable quadratic-curve control handle. Live map interaction and save/reload could not be checked: Docker Desktop pipe access is denied and localhost socket access is forbidden in this environment.
- Follow-up verification: 2026-10-11 07:09 IST — Live inspection found the open Organizer Studio tab still has the old `Connect selected points` UI, while the container's bind-mounted template/JS contain the new code. Added a script URL version query to bypass any cached JS on the next page load. A read-only request inside the running API confirmed HTTP-served organizer HTML has the new Draw path button and versioned JS URL, and the fetched JS contains the connection and curve handlers. Preserved the open tab because it has an active GPS outline and unsaved changes. Interactive marker/curve save-reload verification remains pending.
- Follow-up verification: 2026-10-11 07:51 IST — Added a distinct, prominent live confirmation beside the path-drawing controls for each created/already-existing connection, and increased street-map path contrast with a white casing beneath the purple line. Bumped the organizer script URL version to refresh cached behavior. `node --check` and `git diff --check` passed; interactive browser verification remains pending.
- Follow-up verification: 2026-10-11 07:55 IST — User reported paths still were not visible. Added a dedicated Leaflet pane for organizer paths at z-index 450 (above map tiles and overlay layers, below markers) and versioned the script URL again. JavaScript syntax and diff whitespace checks passed; interactive rendering remains pending.
- Commit: Pending.
- Plan changes: 2026-10-11 — User clarified the desired location-based workflow: open the map, place destination/path points, connect them, and edit straight or curved path geometry against the map background.

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
- [ ] Destination pins and path points with GPS coordinates appear on the basemap; items without GPS coordinates can be selected and placed by clicking the street map; Add destination/Add path point also create directly at the next street-map click; connecting geolocated path points shows their measured straight-line geographic distance. Switching to floor-plan view keeps the existing local-coordinate editor usable.
  - [ ] Recorded path distance updates as fixes arrive and is computed from geographic coordinates.
- [ ] Map/library/tile failures display useful feedback without crashing GPS capture or organizer editing.
- Checks: JavaScript syntax, diff whitespace, template attribution/search check, and browser map/GPS interaction when runtime is available.
- Dependencies: P1-ORG-3, CDN availability, and internet access for OSM tiles.
- Out of scope: Offline tiles, routing instructions or road/path network snapping, and conversion between geographic and floor-plan coordinates.
- Verification record: 2026-10-11 04:02 IST — `node --check api/venueflow/static/venueflow/organizer.js`, `git diff --check`, and a source check for the Leaflet/OSM integration passed. Browser/phone interaction and runtime save/load remain unverified because Docker access is denied.
- Verification record: 2026-10-11 04:08 IST — After the reported 403, configured Leaflet’s OSM tile `referrerPolicy`; JavaScript syntax and diff whitespace passed, Compose rebuilt and started, organizer returned HTTP 200, and served JavaScript contained the updated policy. Browser-side OSM tile success is not directly verified.
- Verification record: 2026-10-11 04:14 IST — Added map-click placement for local-only destinations/path points and selectable/highlighted Leaflet markers. JavaScript syntax and diff whitespace passed; Compose rebuilt, organizer returned HTTP 200, and served JS contained the placement action. Manual browser interaction remains pending.
- Verification record: 2026-10-11 04:20 IST — Add destination/Add path point now create at the next street-map click and the live GPS marker has a pulsing icon and permanent label. JavaScript syntax and diff whitespace passed; Compose rebuilt, organizer returned HTTP 200, and served JS includes the direct-add handler and live-location label. Manual map-click/GPS interaction remains pending.
- Commit: `fd68ec0` — `feat: add organizer points on street map`.
- Commit: `2627ad9` — `fix: place organizer items on street map`.
- Commit: `3fcdea5` — `feat: add OSM map and GPS distances`.
- Plan changes: 2026-10-11 — User requested Leaflet and OpenStreetMap as the location background with path distance; added this phase after GPS capture.
- Follow-up: Per OSM’s current tile policy, set Leaflet’s `referrerPolicy` to `strict-origin-when-cross-origin` so tile requests identify this web origin even when Django applies a restrictive page default. Recorded in the fix checkpoint below.
- Follow-up commit: `ce7e6f7` — `fix: send referrer with OSM tile requests`.

### P1-ORG-5 — AI floor-plan destination suggestions

- Status: implementation complete; runtime verification pending
- Goal: Let an organizer ask OpenAI to identify likely destinations/components in the chosen floor-plan image, review the suggestions, and add selected ones to the existing editor.
- Scope: Use a server-side OpenAI Responses API call from the existing `/organizer/` page POST handler (no new API URL); take the configured `OPENAI_API_KEY` from the server environment; constrain the result to structured destination data with normalized floor-plan coordinates; show suggestions for explicit review before adding them; preserve manual editing and on-site GPS pinning as separate steps. Add optional OpenAI environment settings to the API service only.
- Acceptance criteria:
  - [ ] Analyze is only enabled for a selected PNG/JPG and invokes no model call until clicked.
  - [ ] API key stays server-side and missing configuration or OpenAI errors produce a useful organizer message.
  - [ ] The result is a reviewable list with name, category, description, approximate normalized plan coordinates, and confidence; no suggestion is silently saved or added.
  - [ ] Organizer can choose suggestions and add them to the existing editor, then edit/save them and later set their GPS location using the existing controls.
  - [ ] The organizer UI exposes no API route/path links and this feature introduces no new API route.
- Checks: Python compile, JavaScript syntax, `git diff --check`, focused service/view tests if existing test infrastructure permits without adding a new framework.
- Dependencies: P1-ORG-1, P1-ORG-3, existing image selection and `organizer_draft` persistence; optional OpenAI key/model configuration.
- Out of scope: AI assigning real GPS coordinates, automatically saving suggestions, inferring/approving walkable edges, or claiming an AI route is accurate. Routing must use organizer-confirmed path points and edges; the existing route API remains integration/navigation scope.
- Verification record: 2026-10-11 04:41 IST — `python3 -m py_compile api/venueflow/organizer_ai.py api/venueflow/pages.py`, `node --check api/venueflow/static/venueflow/organizer.js`, `docker compose config`, and `git diff --check` passed. `docker compose up --build -d` succeeded; local organizer GET returned HTTP 200 with the AI button, and a CSRF-protected POST returned the expected HTTP 503 setup hint because no `.env`/OpenAI key is configured. No live model call or browser interaction was performed.
- Commit: `a13568a` — `feat: add AI floor plan suggestions`; follow-up `5de080a` — `feat: label team tables for AI extraction`.
- Plan changes: 2026-10-11 — Organizer requested an AI-assisted flow after repeated map overlay/pinning issues. Added explicit-review extraction as a bridge from the plan image to editable destinations, while keeping real GPS capture an organizer action. 2026-10-11 follow-up: each visibly labeled Team N table in the sample room plan must be extracted as its own team-table destination with the exact label preserved.

### P1-ORG-6 — AI walkable path proposals

- Status: implementation complete; runtime verification pending
- Goal: Let the organizer review AI-proposed path points and connections extracted from the same floor-plan image, then add selected connections to the existing path graph for on-site GPS verification.
- Scope: Extend the existing structured floor-plan analysis response with candidate path points and candidate edges; render each candidate connection for review; allow importing selected connections and their referenced points into the organizer graph. Retain normalized plan coordinates, keep all candidates out of the saved draft until explicitly added, and label imported graph elements as requiring on-site verification.
- Acceptance criteria:
  - [ ] Analysis returns bounded path-point and connection proposals with normalized plan coordinates and confidence; references are validated before display/import.
  - [ ] Organizer can review/select proposed connections and import those connections and their referenced nodes into the current graph.
  - [ ] Imported path elements remain editable, can receive GPS positions via existing organizer actions, and are not represented as verified directions.
  - [ ] No new API URL or user-visible API path is added.
- Checks: Python compilation, JavaScript syntax, `docker compose config`, `git diff --check`, and local page/CSRF response checks when Docker is available. No live OpenAI call unless a configured key is provided by the organizer.
- Dependencies: P1-ORG-5, existing path-node/edge editor; navigation remains dependent on P3-NAV-1.
- Out of scope: Claiming floor-plan inference as a safe/accessible path, automatic GPS assignment, automatic publication, or route calculation.
- Verification record: 2026-10-11 04:44 IST — `python3 -m py_compile api/venueflow/organizer_ai.py api/venueflow/pages.py`, `node --check api/venueflow/static/venueflow/organizer.js`, `docker compose config`, and `git diff --check` passed. Docker Compose rebuilt and started; local organizer GET returned HTTP 200 with destination/path proposal controls, updated JS returned HTTP 200 with the import handler, and a CSRF-protected POST returned the expected missing-key message. No live model call or interactive browser selection was possible without an API key/browser session.
- Commit: `fa132e8` — `feat: add reviewable AI path proposals`.
- Plan changes: 2026-10-11 — Organizer clarified that the goal includes AI mapping a route from the plan after destinations are found; added a review-first path proposal phase while retaining GPS verification and the existing navigation phase boundary.

### P1-ORG-7 — Animated SVG component review and pin handoff

- Status: `in progress` (ngrok image-analysis request verified; interactive SVG selection still needs a browser check)
- Goal: Turn an uploaded rough floor-plan image into a visible, reviewable component overlay that organizers can select before pinning exact real-world locations.
- Scope: Add estimated normalized component bounds to the existing structured image-analysis result; show an animated in-progress state after the organizer starts analysis; draw safe client-created SVG shapes and labels over the source image; synchronize SVG selection with the review list; retain the existing explicit add-to-editor and on-site GPS pin flow. Correct the existing organizer POST response shape and permit the bounded base64 JSON image request through Django's request-size guard.
- Acceptance criteria:
  - [ ] Organizer starts analysis explicitly and sees an accessible loading animation until success/failure.
  - [ ] Each detected component appears as a distinct, labeled SVG bounding box over the uploaded plan; labels/content are inserted as text, never model-supplied SVG markup.
  - [ ] Clicking or keyboard-activating an SVG component selects it in the review list and toggles the matching review checkbox; list selection also updates the overlay.
  - [ ] Component geometry is labeled as image-derived approximation; adding a destination and setting its exact GPS position remain separate organizer actions.
  - [ ] Analysis returns destinations and proposed path data in the response shape consumed by the existing page; no new API URL or user-visible API path is introduced.
- Checks: Python compilation, JavaScript syntax, Compose config, `git diff --check`, and local page/static/missing-key response checks when the runtime is available. Live AI inference requires a configured key.
- Dependencies: P1-ORG-5, P1-ORG-6, selected-image upload and destination/GPS editor.
- Out of scope: Treating image bounds as precise geometry or GPS, silently importing findings, creating public API URLs, or running analysis before user action.
- Verification record: 2026-10-11 04:59 IST — `python3 -m py_compile api/venueflow/organizer_ai.py api/venueflow/pages.py`, `node --check api/venueflow/static/venueflow/organizer.js`, `docker compose config`, and `git diff --check` passed. Docker Compose rebuilt and started; `/organizer/` and the organizer JS returned HTTP 200 and included the new UI. SVG selection was not manually exercised in a browser.
- Verification record: 2026-10-11 05:06 IST — Identified Django's default 2.5 MiB request-body limit rejecting base64 plan JSON before the organizer's 15 MiB guard. Set `DATA_UPLOAD_MAX_MEMORY_SIZE` to 16 MiB, restarted the API, and confirmed the loaded setting. A 3 MB CSRF-protected body probe reached the organizer view (expected JSON 400 `Unknown organizer action`, not Django's request-size rejection). A separate request through ngrok analyzed the repository-generated Team 1–10 image and returned HTTP 200 with 10 named destinations, 12 path points, and 10 path edges. The model call used the server-configured key without exposing it.
- Commit: `23db024` — `feat: add selectable AI floor plan overlays`; follow-up `7ca2f3c` — `fix: allow floor plan analysis through Django size guard`.
- Plan changes: 2026-10-11 — Organizer described the intended interaction as uploading a rough image, watching AI convert it into a component layout, selecting detections, and later pinning each exact real-world location. This phase makes that review step visible and selectable while keeping GPS capture separate. Follow-up: tunnel logs showed Django's 2.5 MiB request guard rejected base64 image bodies before the view's existing 15 MiB limit; increased the Django guard to 16 MiB and verified an end-to-end tunneled analysis.

### P1-ORG-8 — Independent destination map pins

- Status: `in progress`
- Goal: Make each destination's map position visible and independently editable so selecting or moving one pin does not appear to move another destination.
- Scope: Give every destination a stable per-record numbered pin on floor-plan and street-map views; label street-map pins by destination; allow dragging an individual street-map pin to update only that destination's geolocation; preserve each coordinate through existing venue-draft save/load.
- Acceptance criteria:
  - [ ] Every destination with a plan coordinate gets its own numbered floor-plan pin.
  - [ ] Every destination with a GPS/map coordinate gets its own numbered street-map pin and identifiable destination label.
  - [ ] Moving one street-map pin changes only the matching destination's coordinates; selecting another destination leaves the first pin in place.
  - [ ] Pin changes mark the draft dirty and persist through the existing save/load flow.
  - [ ] Existing click-to-place and GPS capture actions continue to target only the selected destination.
- Checks: JavaScript syntax, `git diff --check`, and local page/browser behavior if available; do not change venue API or geolocation data contracts.
- Dependencies: P1-ORG-1, P1-ORG-3, P1-ORG-4, existing `organizer_draft` persistence.
- Out of scope: GPS snapping, clustering, and changing the physical coordinate stored for any other destination.
- Verification record: 2026-10-11 05:13 IST — `node --check api/venueflow/static/venueflow/organizer.js` and `git diff --check` passed. Restarted the API and verified the ngrok organizer page and JS each returned HTTP 200 with the per-destination pin and drag handler. Individual pin dragging and save/reload behavior were not manually exercised in the browser.
- Commit: `6783821` — `fix: keep destination map pins independent`.
- Plan changes: 2026-10-11 — Organizer reported that placing one destination pin appeared to move the same point when selecting another destination. Added explicit per-destination identity and individual street-map movement to make the existing per-place coordinate model clear and editable.

### P1-ORG-9 — Event-scoped organizer persistence

- Status: `in progress` (implementation complete; interactive save/reload not manually verified)
- Goal: Save and restore the complete organizer draft independently for each event, including its image, destinations and their map/GPS data, path points/edges, and recorded GPS outline.
- Scope: Add an event selector scoped to the selected venue; load that event's saved draft; store drafts under stable event IDs in the venue's existing calibration JSON; preserve legacy venue-level draft loading for existing data; warn before switching away from unsaved changes.
- Acceptance criteria:
  - [x] Organizer can choose an event belonging to the selected venue.
  - [x] Save persists all current organizer draft fields under the selected event ID.
  - [x] Reloading the page loads the selected event draft; switching events reads/writes independent event IDs in the calibration envelope.
  - [x] Existing legacy venue-level drafts remain loadable and can be saved into the selected event.
  - [x] Organizer does not add user-facing API links; same-origin persistence calls remain internal implementation details.
- Checks: JavaScript syntax, `git diff --check`, and inspect the organizer event-load/save flow and existing event/venue serializers. Use a non-destructive manual browser check if runtime is available.
- Dependencies: P1-ORG-1 through P1-ORG-8; existing event and venue list/detail endpoints.
- Out of scope: Model/migration changes or new public API routes; event creation/editing; publishing snapshots.
- Verification record: 2026-10-11 05:18 IST — `node --check api/venueflow/static/venueflow/organizer.js`, `git diff --check`, and source review of event filtering, event-keyed payload, legacy fallback, and current-location restoration passed. No browser interaction or live save/reload was performed, to avoid overwriting the existing venue's real organizer/GPS data.
- Commit: Pending.
- Plan changes: 2026-10-11 — User requested all organizer data to persist per event across refresh. Existing persistence saved one venue-level draft, so this phase scopes drafts by event using existing JSON persistence and event list data.

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
