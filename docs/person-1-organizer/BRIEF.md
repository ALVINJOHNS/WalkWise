# Person 1 — Organizer authoring

## Goal

Build the organizer's usable venue editor as a self-contained feature. A user should be able to put down a map image, add a few walkable graph points/edges and destination pins, change a place status, and save a valid `Venue` draft.

## Owned files

- `src/features/organizer/**`
- Do not edit `src/app/**`, `src/shared/**`, package files, or another feature folder. Tell the integration owner what props/types you need rather than changing shared files.

## Build now

1. Create an `OrganizerScreen` that works with the contract and seed fixture.
2. Support image selection (PNG/JPG) with an image backdrop. For the six-hour MVP, skip geographic calibration; use normalized local image coordinates.
3. Add/select/move destination pins and edit name, category, description, and open/closed/delayed status.
4. Add walk graph nodes and connect two selected nodes with an edge. Provide a simple visual line/point editor; no automatic tracing.
5. Validate duplicate/blank names, dangling edge node IDs, and places missing names; show messages in the UI.
6. Call `onSave(venue)` and show whether the draft has unsaved changes. Do not implement storage or publishing.

## Independent development

Use a local typed fixture in your folder until integration's shared types exist. Build the screen with a fallback fixture so you can run it without navigation or persistence. Keep controls simple and visible on laptop and phone.

## Done when

- A new image can be selected and displayed.
- Three places and a connected three-edge path can be authored or edited.
- Status can be changed and is present in the saved Venue object.
- Invalid/dangling data is reported without crashing.
- The feature compiles and is ready for integration by elapsed hour 2.

## Phases

Use the phase loop in [AGENTS.md](../../AGENTS.md) and record results here with the [phase template](../PHASE_TEMPLATE.md). Keep this feature's owned paths intact.

### P1-ORG-1 — Editor foundation

- Status: not started
- Scope: Organizer screen, local fixture, image selection/backdrop, place pins and basic place fields/status.
- Exit checks: PNG/JPG selection displays; add/select/edit three places; screen compiles against fixture.
- Next: P1-ORG-2.

### P1-ORG-2 — Walk graph and validation

- Status: not started
- Scope: Add/connect nodes and edges; validate blank/duplicate names and dangling references; expose save callback and unsaved state.
- Exit checks: Author connected three-edge path; invalid data shows useful messages without crash; saved Venue contains edited status; focused compile/check passes.
- Next: integration review; do not add calibration or storage.

## Cut first

Calibration, zones, schedules/hours, undo/redo, mobile walk-and-plot, advanced drag handles, graph auto-layout. Do not spend time polishing editor appearance before save/export works.

## Short Codex prompt

“Implement only `src/features/organizer` for the task in `docs/person-1-organizer/BRIEF.md`. Follow `docs/SHARED_CONTRACT.md`; keep it simple, use a local fixture if shared types are not ready, and do not edit other owners' files. Return the changed files and the check you ran.”
