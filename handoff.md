# Development handoff

Updated: 2026-10-11 04:04 IST

- Completed: P4-INT-2 venue/event ORM and DRF persistence, committed as `ed5f1a5` (`fix: validate event persistence fields`).
- Current: PostGIS schema/migrations verified on an empty disposable database; seeded venue/event available. Event status is constrained to draft/published, and end time must follow start time.
- Next: Read and execute `docs/person-4-integration/phases/P4-INT-3.md` — persist organizer map resources through `MapFeature`, `PathNode`, and `PathEdge`; then proceed to P4-INT-4 publishing/visitor QR.
- Checks: Django system/migration checks; live Venue/Event CRUD and validation; data read-back after API restart; seed and database health; `git diff --check` — passed. Temporary records/database removed.
- Limitation: Organizer still stores draft entities in calibration JSON; related row APIs/editor load-save are P4-INT-3. Publishing/QR remains P4-INT-4.
