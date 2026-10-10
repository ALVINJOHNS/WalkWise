# Development handoff

Updated: 2026-10-11 03:36 IST

- Completed: **P3-NAV-3 — Next-place suggestion** is implemented and verified in `api/venueflow/routing.py`; P3-NAV-2 remains the verified route-metrics prerequisite.
- Current: `suggest_next_place(nodes, edges, places, start_node_id)` ranks open, valid, reachable places by route duration plus optional finite `waitMinutes * 60`, preserves exact route metrics and stable input-order ties, and returns selected-place/reason data or an explicit failure. Integration must normalize model-backed place fields; `waitMinutes` has no dedicated model field.
- Next: P3-NAV-4 plan is detailed in `docs/person-3-navigation/phases/P3-NAV-4.md`. It remains optional and gated on integration confirming the visitor input coordinate shape, shared coordinate space, caller output needs, and a maximum-distance policy. If integration cannot confirm these, skip this phase; do not add API/page wiring under navigation.
- Checks: Focused plain-Python fixtures passed ranking, wait penalty, malformed candidate, tie, no-suggestion, zero-route, generator, and unchanged `find_route` cases. `python -m compileall -q api/venueflow/routing.py` and `git diff --check` passed. No repository routing test runner/test files were found.
- Commit: `16b5b89` (`feat: add next-place suggestion ranking`); prerequisite P3-NAV-2 commit `bcf8191`. Limitation: seeded `length_m` values are null, so successful non-zero routes need edge lengths populated before ranking; route geometry remains a caller-side lookup by returned edge ID.
