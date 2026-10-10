# P3-NAV-1 — Graph route core

Owner: Person 3 — Navigation
Owned paths: `api/venueflow/routing.py`; this phase document
Shared dependencies: [Person 3 brief](../BRIEF.md), [shared contract](../../SHARED_CONTRACT.md), `PathNode` and `PathEdge` fields in `api/venueflow/models.py`

- Status: `verified`
- Goal: Provide a small, deterministic, pure-Python graph function that returns a connected path from a requested start node to destination access node, honoring explicit edge direction and closures.
- User value: A visitor can request a real organizer-defined path, and the caller can distinguish a usable route from invalid input or an unreachable destination.
- Scope:
  - Add `api/venueflow/routing.py` with a documented function taking iterable node and edge records plus `start_node_id` and `destination_node_id`; normalize records at the boundary and avoid Django/model imports.
  - Build adjacency only from explicit edge endpoints. Preserve the source edge ID and ordered endpoint IDs so a later API/visitor layer can resolve geometry from edge records.
  - Support `direction="both"` (traverse either way) and `direction="forward"` (from `from_node` to `to_node`). Reject unsupported direction values as invalid graph data with an explicit failure result; do not silently reinterpret them.
  - Exclude `closed=True` edges before traversal. Missing `closed` defaults false and missing `direction` defaults `both`, matching model defaults.
  - For this topology-only phase, use breadth-first search and minimize edge count. `length_m` is intentionally not a route cost yet: seed edges currently have `length_m=None`, and P3-NAV-2 owns distance validation, route metrics, and any distance/time weighting decision. Do not invent weights or infer lengths from coordinates.
  - Return one stable dictionary shape for success and failure. Success includes `ok`, ordered `node_ids`, ordered `edge_ids`, and placeholder `distance_m` / `duration_s` fields set to `None`; failure includes `ok=False`, empty ID lists, the same metric fields, and a machine-readable `reason` plus concise `message`.
  - Validate input IDs and graph references before traversal: node IDs must be unique; requested endpoints must exist; every edge endpoint must resolve; edge IDs must be unique. Fail explicitly rather than allowing malformed graph data to raise an incidental exception.
- Proposed contract (final names may be refined in implementation, but change this document first if semantics change):
  - `find_route(nodes, edges, start_node_id, destination_node_id) -> dict`
  - Accepted node record: `{"id": str}` (additional model fields ignored).
  - Accepted edge record: `{"id": str, "from_node": str, "to_node": str, "closed"?: bool, "direction"?: "both" | "forward"}`. At the Python boundary, callers must convert Django foreign-key objects to their string IDs.
  - Success example: `{"ok": True, "node_ids": ["entrance", "junction", "hall"], "edge_ids": ["path-west", "path-north"], "distance_m": None, "duration_s": None}`.
  - Failure reasons: `invalid_input`, `invalid_graph`, `unknown_start`, `unknown_destination`, `unreachable`; use stable reasons so an API wrapper can map them later.
- Acceptance criteria:
  - [ ] Module imports and runs using Python standard library only; no Django import, ORM query, I/O, or global state.
  - [ ] A hand-authored connected fixture returns a valid ordered node/edge path with matching adjacency and endpoints.
  - [ ] When a direct route and a longer-by-edge-count alternative exist, the BFS result uses the fewer-edge route; equal-length tie handling is deterministic based on input edge order.
  - [ ] A closed edge is never included; the route uses an available alternative or reports unreachable.
  - [ ] `both` edges work in reverse; `forward` edges work only from `from_node` to `to_node`.
  - [ ] Empty graph, missing/empty endpoint IDs, unknown endpoints, duplicate node/edge IDs, dangling endpoints, unsupported direction, and disconnected destination produce the documented failure shape and reason without an uncaught exception.
  - [ ] Start equals destination returns a successful zero-edge route containing that single node.
  - [ ] Coordinates and geometric proximity have no effect on adjacency or route choice; metrics remain `None` for P3-NAV-2.
- Implementation sequence:
  1. Confirm no existing routing module or test runner has appeared; preserve the declared Django project stack but keep this module framework-independent.
  2. Define input normalization and result constructors with explicit validation order and stable failure reasons.
  3. Build deterministic adjacency, adding reverse adjacency only for `both` edges and skipping closed edges.
  4. Implement BFS with predecessor node/edge tracking, then reconstruct ordered IDs; special-case start equals destination.
  5. Add focused standard-library fixture coverage using the project's existing test conventions if present; otherwise document and run a plain-Python inline fixture without introducing a test framework or dependencies.
  6. Review public signature, failure semantics, import purity, and phase boundaries; report the contract to integration before API wiring.
- Checks: First inspect available project test commands and existing test files. Run the narrowest existing check if suitable; otherwise run a documented plain-Python fixture covering every acceptance case above. Also run `python -m compileall -q api/venueflow/routing.py` and `git diff --check`. No database or Docker service should be needed for this phase.
- Dependencies: None. Uses the shared graph model contract; no database dependency.
- Out of scope: Distance/ETA calculation or edge-length validation, recommendation ranking, geometry drawing, Django/API wiring, visitor-page changes, GPS snapping, and nearest-node selection.
- Verification record: 2026-10-11 03:18 IST — `python -m compileall -q api/venueflow/routing.py` passed. A plain-Python fixture passed connected minimum-hop routing, deterministic tie selection, closed-edge exclusion, bidirectional and forward direction behavior, start-equals-destination, malformed inputs/graphs, and disconnected results. `git diff --check` passed. No repository test files or test runner were present for this module.
- Commit: Pending.
- Plan changes: 2026-10-11 — Expanded this brief into an implementation-ready algorithm and contract plan; clarified hop-count optimization because seeded `length_m` values are null, and made direction, input validation, failure shape, deterministic output, and phase boundaries explicit.
