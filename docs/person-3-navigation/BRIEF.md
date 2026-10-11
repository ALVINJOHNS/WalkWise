# Person 3 — Routing, ETA, and next suggestion

## Goal

Deliver local navigation logic that makes the visitor map useful: a route through organizer-defined walkable edges, an approximate walking-time estimate, and one understandable “What next?” choice. Keep the core framework-light and independent from screens and backend code.

## Owned files

- `api/venueflow/routing.py`
- Do not edit Django models, shared page templates, API URLs, or another feature's page/JS. Tell integration the function contract and data needs before wiring.

## Architecture and data contract

- Follow the single Django SSR/DRF application and `PathNode`/`PathEdge` ORM shape in [architecture.md](../architecture.md) and [the shared contract](../SHARED_CONTRACT.md). Routing itself must remain pure Python and must not import Django.
- Consume plain dictionaries or equivalent records. Nodes have `id`; edges have `id`, `from_node`, `to_node`, optional `length_m` (or the documented equivalent), `closed`, and `direction`. Places have `id`, a routable access-node ID, an open/closed status, and optional `waitMinutes`.
- Resolve direction from the edge data explicitly; support the model's bidirectional default and its declared one-way value. Ignore closed edges. Do not infer connections or walkable edges from coordinates/proximity.
- Return ordered node IDs and edge IDs, distance in meters, and approximate duration in seconds. Preserve edge IDs so the visitor overlay can obtain geometry from the venue data.
- Missing inputs, invalid references, or disconnected destinations must produce an explicit no-route result. Never substitute straight-line routing.
- Use a documented conservative default walking speed (1.2 m/s unless the focused implementation documents a reason to adjust it). Keep functions and output dictionaries documented.

## Phase sequence

Use [the phase template](../PHASE_TEMPLATE.md) and follow each phase document as the scope authority. Finish and verify each phase before starting its dependent phase.

1. [P3-NAV-1 — Graph route core](phases/P3-NAV-1.md): pure graph traversal, closed/directed-edge handling, and explicit failure results.
2. [P3-NAV-2 — Route metrics and output contract](phases/P3-NAV-2.md): distance, ETA, ordered IDs, and route geometry lookup contract.
3. [P3-NAV-3 — Next-place suggestion](phases/P3-NAV-3.md): rank open, routable places and explain the selected result.
4. [P3-NAV-5 — Map API contract review and routing handoff](phases/P3-NAV-5.md): reconcile persisted map records with the pure routing inputs and agree the integration wrapper boundary.
5. [P3-NAV-4 — Approximate manual start](phases/P3-NAV-4.md): optional nearest-node mapping, only after the first three phases are verified and integration confirms the needed input shape.

## Independent development

Use small plain-Python fixtures; no Django view imports or database requirement for core checks. Send integration the signatures and input/output dictionaries as soon as P3-NAV-1 has a stable contract. Keep each phase restricted to `api/venueflow/routing.py` plus its own phase document and required project records.

## Overall done when

- A known route uses connected edges and avoids a blocked edge.
- Missing and disconnected endpoints return explicit no-route results.
- Distance and ETA are finite and plausible for a fixture.
- “What next?” never recommends closed or unroutable destinations and includes a plain reason.
- Routing is ready for the integration wrapper without requiring feature-page or model changes.

## Cut first

GPS snapping, A*, accessibility profiles, turn instructions, deviation detection, event-schedule ranking, and route animation. Do not implement continuous GPS snapping or claim GPS precision/accessibility coverage.

## Short Codex prompt

“Implement only the current phase in `docs/person-3-navigation/phases/`. Follow `docs/person-3-navigation/BRIEF.md` and `docs/SHARED_CONTRACT.md`; keep routing pure Python in `api/venueflow/routing.py`, and do not edit other owners' page files. Report signatures, changed files, and checks actually run.”
