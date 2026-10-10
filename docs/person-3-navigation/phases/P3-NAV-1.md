# P3-NAV-1 — Graph route core

Owner: Person 3 — Navigation

Owned paths: `api/venueflow/routing.py`; this phase document

Shared dependencies: [Person 3 brief](../BRIEF.md), [shared contract](../../SHARED_CONTRACT.md), `PathNode` and `PathEdge` fields in `api/venueflow/models.py`

- Status: `not started`
- Goal: Find a valid route through the supplied graph using only explicit edge connectivity.
- Scope: Define a small pure-Python input/output contract and implement shortest-path traversal; filter closed edges; respect bidirectional and one-way edge direction; return ordered node and edge IDs; return explicit results for missing IDs, malformed references, and disconnected destinations. Keep the result's metrics fields present but let P3-NAV-2 define and verify their calculations.
- Acceptance criteria:
  - [ ] A plain-Python fixture returns the expected connected sequence of node IDs and edge IDs.
  - [ ] A cheaper route containing a closed edge is excluded in favor of an available route.
  - [ ] One-way edges are traversable only in their declared direction; bidirectional edges work both ways.
  - [ ] Missing start/destination IDs, dangling edge endpoints, and disconnected destinations produce clear no-route/error results without exceptions escaping.
  - [ ] The module has no Django imports and does not infer edges from coordinates.
- Checks: Run the focused routing check selected for this phase (prefer the project's existing test runner if one exists; otherwise use a documented plain-Python fixture). Check the known, blocked, one-way, missing, dangling, and disconnected cases.
- Dependencies: None.
- Out of scope: ETA calculations, recommendation ranking, geometry drawing, Django/API wiring, GPS snapping, and nearest-node selection.
- Verification record: Not run; implementation has not started.
- Commit: Pending.
- Plan changes: None.
