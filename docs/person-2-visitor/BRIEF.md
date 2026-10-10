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

### P2-VIS-1 — Read-only venue map

- Status: not started
- Scope: Visitor screen props, map/backdrop, graph lines, labeled pins, and place status.
- Exit checks: Seeded venue renders independently; place details/status legible; focused Django/page check passes.
- Next: P2-VIS-2.

### P2-VIS-2 — Find and orient

- Status: not started
- Scope: Search/filter/select, freshness cue driven by props, Locate entry point and manual-start fallback, mobile layout, route-overlay prop slot.
- Exit checks: Search/select works; freshness reflects supplied state; no location prompt on load; narrow layout and fallback usable; focused Django/page check passes.
- Next: integration review; QR and cache remain integration-owned.

## Cut first

GPS snapping, spoken directions, event agenda, interests, compass, analytics, animated UI, external map tiles. Never imply live data or offline readiness based on network status alone.

## Short Codex prompt

“Implement only the visitor template and JavaScript paths in `docs/person-2-visitor/BRIEF.md`. Follow `docs/SHARED_CONTRACT.md`; use ORM-backed page context and do not edit other owners' files. Keep freshness labels truthful. Return changed files and the check you ran.”
