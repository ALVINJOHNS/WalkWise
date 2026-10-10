# P4-INT-2 — Venue and event API persistence

- Status: not started
- Goal: Verify and complete the venue/event persistence foundation required by the server-rendered organizer and visitor routes.
- Scope: Integration-owned `api/venueflow/models.py`, serializers, viewsets/selectors, migrations, seed/configuration only where needed, plus phase docs. Implement the declared Venue and Event CRUD through Django ORM and DRF. Confirm the existing schema is represented by migrations and that deployment startup applies them before seed/web. Validate field constraints and ownership relationships through serializers; keep PostGIS geometry handling in the ORM. Venue fields include id, slug, name, plan image URL, optional boundary, and calibration metadata. Events belong to one venue and include title, dates, and draft/published status. Do not add map feature/node/edge APIs here; those belong to P4-INT-3.
- Acceptance criteria:
  - [ ] Venue and Event schema is represented by committed Django migrations; applying migrations to an empty configured database succeeds.
  - [ ] `/api/venues/` and `/api/events/` support the expected list, detail, create, update, and delete operations using ORM-backed DRF serializers.
  - [ ] Event venue references are validated and invalid input returns a useful DRF 4xx response without partial writes.
  - [ ] A created/updated venue and event can be read back after a Django process restart using the same database; no data is held only in memory.
  - [ ] Seeded venue/event remain available and health reports database connectivity accurately.
- Checks: Run the repository's documented Compose migration/seed and Django check commands; focused DRF/API persistence round trip including invalid event venue input; restart web service and read back persisted records; `git diff --check`. Record unavailable dependencies/runtime with exact evidence rather than claiming success.
- Dependencies: P4-INT-1 runnable application foundation and shared contract.
- Out of scope: `MapFeature`/`PathNode`/`PathEdge` API and organizer mapping (P4-INT-3), publication snapshots/QR (P4-INT-4), authentication, realtime, and offline support.
- Verification record: Pending. Existing models, serializers, selectors, and venue/event ModelViewSets are present, but this review found no P4-INT-2 verification evidence. Do not mark complete until the criteria above are checked against the configured runtime.
- Commit: Pending.
- Plan changes: 2026-10-11 — Expanded the brief's high-level P4-INT-2 into a focused schema/API/persistence phase after the handoff identified it as the next step; explicitly reserved related map entities for P4-INT-3.
