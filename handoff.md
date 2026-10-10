# Development handoff

Updated: 2026-10-11 03:57 IST

- Completed: P4-INT-1 runnable full-stack foundation. Latest implementation commit before integration verification: `97d8598`.
- Current: P4 integration ownership is confirmed for the missing related-resource APIs and publishing/visitor QR flow. Detailed phases are `docs/person-4-integration/phases/P4-INT-3.md` and `P4-INT-4.md`.
- Next: Read `docs/person-4-integration/BRIEF.md`, P4-INT-2 (venue API persistence); then implement P4-INT-3. P4-INT-3 must precede publishing.
- Checks: For the existing local app, Postgres and Redis healthy; overview, organizer, visitor, health API, and compiled CSS returned HTTP 200. Venue draft PATCH/read-back round trip passed and original calibration was restored. For this planning update, reviewed the Person 1 ownership note, shared ORM/API contract, current serializers/views, and organizer load/save mapping; `git diff --check` passed.
- Limitation: Organizer currently saves its `organizer_draft` to venue calibration JSON. Separate `MapFeature`, `PathNode`, and `PathEdge` rows are not loaded/saved by that editor flow. Publishing and visitor URL/QR still need implementation. Browser visual behavior remains unverified.
