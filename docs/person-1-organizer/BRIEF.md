# Person 1 — Organizer authoring

## Goal

Build the organizer's usable venue editor as a self-contained feature. A user should be able to put down a map image, add a few walkable graph points/edges and destination pins, change a place status, and save a valid `Venue` draft.

## Owned files

- `api/venueflow/templates/venueflow/organizer.html`, `api/venueflow/static/venueflow/organizer.js`
- Do not edit the shared base template, Django models/API, Tailwind input, or another feature's template/JS. Coordinate shared contract changes with integration.

## Build now

1. Create server-rendered organizer templates that work with the Django ORM data contract and seed venue.
2. Support image selection (PNG/JPG) with an image backdrop. For the six-hour MVP, skip geographic calibration; use normalized local image coordinates.
3. Add/select/move destination pins and edit name, category, description, and open/closed/delayed status.
4. Add walk graph nodes and connect two selected nodes with an edge. Provide a simple visual line/point editor; no automatic tracing.
5. Validate duplicate/blank names, dangling edge node IDs, and places missing names; show messages in the UI.
6. Use a Django form or DRF endpoint to persist edits and show validation feedback. Do not implement publishing.

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

## Cut first

Calibration, zones, schedules/hours, undo/redo, mobile walk-and-plot, advanced drag handles, graph auto-layout. Do not spend time polishing editor appearance before save/export works.

## Short Codex prompt

“Implement only the organizer template and JavaScript paths in `docs/person-1-organizer/BRIEF.md`. Follow `docs/SHARED_CONTRACT.md`; use the Django ORM/DRF contract and do not edit other owners' files. Return changed files and the check you ran.”


### Implementation record — 2026-10-11

The organizer page now provides venue selection, a PNG/JPG backdrop preview, destination editing (name, category, description, status), movable map markers, path points, edge creation, validation, and a save action. The current API exposes venue CRUD but not related feature/node/edge endpoints, so the editor stores its `organizer_draft` envelope in the venue's existing `calibration` JSON field. The selected image is saved as a data URL in that draft. This keeps the feature within its owned template/JavaScript paths, but large plans may exceed practical API/database request limits and existing `MapFeature`/`PathNode`/`PathEdge` rows are not loaded into the editor. Integration should provide related-resource APIs or server-rendered bootstrap data before treating this as production persistence.

- Checks run: `node --check api/venueflow/static/venueflow/organizer.js` and `git diff --check` passed.
- Runtime limitation: Docker Compose cannot reach the local Docker socket (`permission denied`); Django page/API rendering and save round-trip were not verified in this environment.
- Commit: `66a59b3` — `feat: build organizer venue editor` (implementation checkpoint; runtime verification pending).
