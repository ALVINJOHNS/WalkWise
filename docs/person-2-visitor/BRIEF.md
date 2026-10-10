# Person 2 — Visitor map and offline experience

## Goal

Build the visitor experience for a read-only venue snapshot. Make it easy to find a place, understand its status, and orient on the event map. Keep the screen functional with local seed data before package publishing is ready.

## Owned files

- `src/features/visitor/**`
- Do not edit `src/app/**`, `src/shared/**`, package files, or another feature folder. Tell the integration owner what props/types you need rather than changing shared files.

## Build now

1. Export a `VisitorScreen` that takes a `Venue` snapshot and saved/current freshness state as props.
2. Render the map image/backdrop, graph paths, labeled destination pins, and status styling using normalized coordinates.
3. Add a searchable/filterable destination list and a selected-place detail panel/card.
4. Show clear open, closed, or delayed state and a simple “map saved” or “updates paused / last saved” cue supplied by props.
5. Add a prominent “Locate me” entry point. If GPS is unavailable, show a useful map-tap/manual-start prompt; do not request location on page load.
6. Keep the layout mobile-first and suitable for QR entry. Do not own QR generation, app shell, cache implementation, or route computation.

## Independent development

Use the contract and a local fixture. You can implement manual start selection as a callback to integration/navigation. Do not block on routing APIs; leave a visible route placeholder slot that accepts a route overlay prop later.

## Done when

- Seed map and places display without the organizer editor running.
- Search/filter/select works and place status is legible.
- Visitor sees whether data is saved/current/paused from explicit props.
- Screen remains usable at a narrow phone width and offers manual location fallback.
- The feature compiles and is ready for integration by elapsed hour 2.

## Cut first

GPS snapping, spoken directions, event agenda, interests, compass, analytics, animated UI, external map tiles. Never imply live data or offline readiness based on network status alone.

## Short Codex prompt

“Implement only `src/features/visitor` for the task in `docs/person-2-visitor/BRIEF.md`. Follow `docs/SHARED_CONTRACT.md`; use local seed data if needed and do not edit other owners' files. Keep offline/freshness labels driven by props. Return changed files and the check you ran.”
