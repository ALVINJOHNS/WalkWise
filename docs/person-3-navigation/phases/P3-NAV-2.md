# P3-NAV-2 — Route metrics and output contract

Owner: Person 3 — Navigation

Owned paths: `api/venueflow/routing.py`; this phase document

Shared dependencies: [P3-NAV-1](P3-NAV-1.md), [Person 3 brief](../BRIEF.md), [shared contract](../../SHARED_CONTRACT.md), [PathEdge model](../../../api/venueflow/models.py)

- Status: `verified`
- Goal: Turn P3-NAV-1's topology-only route into a result with trustworthy distance and walking-time metrics while preserving its ordered graph IDs and framework-independent boundary.
- User value: The visitor overlay and future `POST /api/route` wrapper can show a route length and a clearly approximate walking duration, and can distinguish unusable map data from a valid route.
- Scope:
  - Extend the existing `find_route(nodes, edges, start_node_id, destination_node_id)` contract in `api/venueflow/routing.py`; do not add Django/API/page dependencies.
  - Calculate metrics from the exact ordered edge IDs selected by P3-NAV-1. Preserve minimum-hop BFS, edge-order tie behavior, closure/direction behavior, and returned node/edge order; this phase does not change route selection to shortest-distance routing.
  - Read `length_m` from edge records. Accept finite non-negative numeric values; reject booleans, strings, missing values, `None`, negative values, NaN, and infinities for any edge used by the selected path. Do not coerce, infer, interpolate, or replace invalid lengths. Validate only selected route edges so an unrelated malformed edge does not block a valid route.
  - Sum selected lengths in meters and calculate approximate seconds using `duration_s = distance_m / 1.2`. Keep floating-point precision in the API result; display rounding belongs to the consumer.
  - Document that 1.2 meters per second is the conservative default walking speed and that ETA excludes congestion, mobility/accessibility adjustments, and dwell time.
  - Keep the existing result keys on success and failure: `ok`, `node_ids`, `edge_ids`, `distance_m`, and `duration_s`; success metrics are finite numbers, while failures retain empty IDs and `None` metrics plus stable `reason` and `message` fields. A start-equals-destination route is a valid zero-edge route with distance and duration `0.0`.
  - Document the edge-geometry join: consumers map each returned edge ID to the original venue edge record and read its stored geometry; the routing function returns IDs only and must not infer or synthesize geometry.
- Contract decisions:
  - Keep the existing public signature and plain-mapping inputs. Each edge has a unique `id`, `from_node`, `to_node`, and `length_m`; existing optional `closed` and `direction` defaults remain unchanged.
  - Add an explicit failure reason for missing/invalid selected-edge length (recommended stable value: `invalid_length`) with a useful message identifying the affected edge ID. Keep existing P3-NAV-1 failure reasons unchanged.
  - Route topology remains authoritative: a route with fewer edges wins even if another path is physically shorter. Distance and ETA describe the selected route; they are not optimization weights in this phase.
  - Geometry is obtained by ID lookup against the source edge collection/model data at the caller boundary. No geometry field is required by `find_route`.
- Acceptance criteria:
  - [x] A direct one-edge fixture returns expected ordered IDs, exact distance, and `distance_m / 1.2` duration.
  - [x] A multi-edge fixture returns expected BFS node/edge order and the sum and duration for those exact edges.
  - [x] A graph with a shorter-in-meters but higher-hop alternative still chooses the P3-NAV-1 minimum-hop path and reports that path's metrics.
  - [x] Missing, `None`, string, boolean, negative, NaN, and infinite length on a selected edge return an explicit failure with empty IDs and `None` metrics; a bad length on an unused edge does not fail a valid route.
  - [x] All successful metrics are finite and non-negative; start equals destination returns empty edge IDs and zero metrics.
  - [x] Unreachable and existing invalid-input/graph failures preserve the same result shape and reasons defined in P3-NAV-1.
  - [x] The function docstring records the units, speed, approximation caveats, and metric failure semantics; geometry is explicitly joined by returned edge ID by consumers.
  - [x] The module remains pure Python and imports no Django code.
- Implementation sequence:
  1. Re-read the current P3-NAV-1 implementation and confirm model field spelling/type for edge length; keep plan and implementation aligned if the actual field differs from `length_m`.
  2. Add a small private validation/calculation step after BFS reconstructs a successful path. Preserve the chosen edge order and avoid introducing a second graph search.
  3. Resolve each route edge ID to its already validated edge record, validate the selected length without lossy coercion, sum with a stable numeric accumulator, and calculate duration using the documented speed constant.
  4. Return `invalid_length` through the same result constructor on invalid metric data; preserve all existing topology failure behavior and zero-edge semantics.
  5. Expand the phase's focused standard-library fixtures for direct/multi-edge totals, selected-vs-unused invalid lengths, malformed numeric values, zero-edge route, and unchanged BFS behavior. Do not add a test framework or dependency if none exists.
  6. Review docs and API suitability: IDs remain sufficient for a wrapper to fetch source edge geometry; do not place geometry objects in this result.
- Checks: Inspect existing test files/commands first. If no routing runner exists, run documented plain-Python fixtures for every acceptance case, `python -m compileall -q api/venueflow/routing.py`, and `git diff --check`. No database, Django settings, Docker service, or network call is needed.
- Dependencies: P3-NAV-1 verified; source edge record length field confirmed against the model/shared contract.
- Out of scope: Shortest-distance or fastest-route search, turn-by-turn directions, geometry decoding/simplification/rendering, API wiring, display rounding, congestion/accessibility factors, dwell time, and partial-edge start offsets.
- Verification record: 2026-10-11 03:24 IST — `python -m compileall -q api/venueflow/routing.py` passed. Focused inline Python fixtures passed direct and multi-edge metric totals, minimum-hop route choice, invalid selected lengths (`None`, string, bool, negative, NaN, ±infinity, and oversized integer), ignored invalid unused length, zero-edge route, unreachable shape, and stable unknown-start failure. `git diff --check` passed. No repository routing test runner/test files were found; no Django/database runtime was needed.
- Commit: Pending.
- Plan changes: 2026-10-11 — Refined P3-NAV-2 into an implementation-ready plan based on the verified P3-NAV-1 behavior and integration contract. Fixed metric validity, selected-edge scope, result failure shape, speed formula, BFS optimization semantics, geometry join responsibility, and observable fixture coverage before implementation.
