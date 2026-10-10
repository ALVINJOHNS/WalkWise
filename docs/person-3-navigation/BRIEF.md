# Person 3 — Routing, ETA, and next suggestion

## Goal

Deliver the local navigation logic that makes the visitor map useful: a graph route around blocked edges, a walking-time estimate, and one understandable “What next?” choice. Keep it framework-light and independent of screens/backend.

## Owned files

- `src/features/navigation/**`
- Do not edit `src/app/**`, `src/shared/**`, package files, or another feature folder. Tell the integration owner the export names and data needs rather than changing shared files.

## Build now

1. Implement a pure shortest-path function over `Venue.nodes` and `Venue.edges`, filtering `blocked` edges.
2. Return ordered node IDs, edge IDs, distance in meters, and approximate seconds; use a documented conservative default walking speed.
3. Return a clear no-route result for missing node IDs, disconnected destinations, or an all-blocked path. Do not silently fall back to straight-line routing.
4. Implement a simple next-place ranker: open places only, shortest route time first, and optional organizer wait penalty if `waitMinutes` exists. Return a short reason string.
5. Expose typed pure functions and, if needed, a tiny standalone demo component showing route selection with the seed venue. Keep the route geometry derivable from edge IDs/points for the visitor overlay.
6. Optional only after above: map-tap start point to nearest node with an explicit approximate label. Do not implement continuous GPS snapping.

## Independent development

Use a local fixture and no UI imports for core logic. Keep the algorithm small (Dijkstra is enough). Tell integration the function signatures early so person 2 can wire the route overlay independently.

## Done when

- A known route uses connected edges and avoids a blocked edge.
- A disconnected route returns an explicit error/result.
- Distance and ETA are finite and plausible for the fixture.
- “What next?” never recommends closed destinations and includes a plain reason.
- The feature compiles and is ready for integration by elapsed hour 2.

## Phases

Use the phase loop in [AGENTS.md](../../AGENTS.md) and record results here with the [phase template](../PHASE_TEMPLATE.md). Keep this feature's owned paths intact.

### P3-NAV-1 — Shortest path and ETA

- Status: not started
- Scope: Pure typed shortest-path function, blocked-edge filtering, explicit invalid/disconnected outcomes, distance and ETA.
- Exit checks: Known route avoids blocked edge; disconnected/missing IDs return explicit result; distance and ETA finite/plausible; focused check passes.
- Next: P3-NAV-2.

### P3-NAV-2 — Next-place suggestion

- Status: not started
- Scope: Rank open places by route time with optional wait penalty; provide short reason; keep route geometry derivable from returned edge IDs.
- Exit checks: Closed places never recommended; reason is clear; focused check passes. Optional map-tap start only after this gate.
- Next: integration review; continuous GPS remains out of scope.

## Cut first

GPS snapping, A*, accessibility profiles, turn instructions, deviation detection, event schedule ranking, route animation. Do not claim GPS precision or accessibility coverage.

## Short Codex prompt

“Implement only `src/features/navigation` for `docs/person-3-navigation/BRIEF.md`. Follow `docs/SHARED_CONTRACT.md`; prioritize pure Dijkstra and recommendation functions with a local fixture, and do not edit other owners' files. Return function signatures, changed files, and the check you ran.”
