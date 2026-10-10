# P3-NAV-2 — Route metrics and output contract

Owner: Person 3 — Navigation

Owned paths: `api/venueflow/routing.py`; this phase document

Shared dependencies: [P3-NAV-1](P3-NAV-1.md), [Person 3 brief](../BRIEF.md), [shared contract](../../SHARED_CONTRACT.md)

- Status: `not started`
- Goal: Make a route result directly useful to the visitor overlay and route API wrapper by reporting distance and approximate duration consistently.
- Scope: Finalize the documented route dictionary; calculate total distance from explicit edge lengths; calculate approximate seconds with the documented conservative default walking speed (1.2 m/s); preserve ordered node/edge IDs from P3-NAV-1; document how consumers join returned edge IDs to source geometry. Keep geometry lookup outside the pure routing function if geometry is not already an input.
- Acceptance criteria:
  - [ ] A known fixture returns the expected node and edge ID order, total distance in meters, and approximate seconds.
  - [ ] Metrics are finite, non-negative, and plausible for the fixture; invalid/missing lengths fail explicitly rather than creating fabricated values.
  - [ ] The default speed and units are documented in the function contract.
  - [ ] No-route results use the same stable shape or a clearly documented separate result shape.
  - [ ] A consumer can resolve returned edge IDs to their source records/geometry without requiring route geometry inference.
- Checks: Run focused route fixtures for both a direct path and a multi-edge path with known lengths; include invalid length and no-route cases.
- Dependencies: P3-NAV-1.
- Out of scope: Turn-by-turn directions, geometry simplification/rendering, Django/API wiring, and partial-edge start offsets.
- Verification record: Not run; implementation has not started.
- Commit: Pending.
- Plan changes: None.
