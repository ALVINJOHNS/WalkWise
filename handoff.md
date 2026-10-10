# Development handoff

Updated: 2026-10-11 03:31 IST

- Completed: **P3-NAV-2 — Route metrics and output contract** is implemented and verified in `api/venueflow/routing.py`.
- Current: P3-NAV-3 is now detailed and remains `not started`. It defines the normalized place input, route-time plus optional wait-minute ranking, stable tie behavior/result shape, and integration mapping boundary. `find_route` is unchanged and provides the candidate travel route/ETA.
- Next: Implement only `docs/person-3-navigation/phases/P3-NAV-3.md` (P3-NAV-3). Keep it pure Python; API/page and model wiring remain integration-owned.
- Checks: Planning consistency review against `routing.py`, `models.py`, the shared contract, Person 3 brief, and phase template; `git diff --check` passed. No application/runtime checks were run for this documentation-only plan. P3-NAV-2 implementation checks are recorded in its phase document.
- Commit: `bcf8191` (`feat: add route distance and duration metrics`). Limitation: seeded `length_m` values are null, so successful non-zero routes need edge lengths populated before reporting metrics; route geometry remains a caller-side lookup by returned edge ID.
