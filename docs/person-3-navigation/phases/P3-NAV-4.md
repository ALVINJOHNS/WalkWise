# P3-NAV-4 — Approximate manual start (optional)

Owner: Person 3 — Navigation

Owned paths: `api/venueflow/routing.py`; this phase document

Shared dependencies: [P3-NAV-3](P3-NAV-3.md), [Person 3 brief](../BRIEF.md), [shared contract](../../SHARED_CONTRACT.md), integration confirmation of the visitor's start-point input shape

- Status: `not started; optional`
- Goal: Let the visitor use a manually selected map point as an explicitly approximate start by mapping it to a nearby graph node.
- Scope: Only after P3-NAV-1 through P3-NAV-3 are verified, add a pure helper that chooses the nearest node from supplied comparable plan coordinates, returns the node ID and an explicit approximate label, and reports when no acceptable node is available. This is not GPS processing or GPS snapping.
- Acceptance criteria:
  - [ ] Integration confirms the coordinate representation and caller needs before implementation.
  - [ ] A fixture maps a point to the expected nearest node using a documented distance unit/coordinate scale.
  - [ ] Empty graphs or points beyond any documented maximum distance return an explicit failure.
  - [ ] Output labels the result as approximate.
- Checks: Run focused plain-Python fixtures for nearest node, tie behavior, empty graph, and beyond-limit input.
- Dependencies: P3-NAV-3 and integration confirmation; otherwise skip this optional phase.
- Out of scope: Continuous GPS, location permission, latitude/longitude projection, path snapping, and claims of position accuracy.
- Verification record: Not run; optional phase has not started.
- Commit: Pending.
- Plan changes: None.
