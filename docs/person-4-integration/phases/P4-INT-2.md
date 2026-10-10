# P4-INT-2 — Venue and event API persistence

- Status: verified
- Goal: Verify and complete the venue/event persistence foundation required by the server-rendered organizer and visitor routes.
- Scope: Integration-owned `api/venueflow/models.py`, serializers, viewsets/selectors, migrations, seed/configuration only where needed, plus phase docs. Implement the declared Venue and Event CRUD through Django ORM and DRF. Confirm the existing schema is represented by migrations and that deployment startup applies them before seed/web. Validate field constraints and ownership relationships through serializers; keep PostGIS geometry handling in the ORM. Venue fields include id, slug, name, plan image URL, optional boundary, and calibration metadata. Events belong to one venue and include title, dates, and draft/published status. Do not add map feature/node/edge APIs here; those belong to P4-INT-3.
- Acceptance criteria:
  - [x] Venue and Event schema is represented by Django migrations; both migrations apply successfully to an empty configured database.
  - [x] `/api/venues/` and `/api/events/` support list, detail, create, update, and delete through ORM-backed DRF viewsets.
  - [x] Invalid event venue references, unsupported statuses, and end times not after start times return HTTP 400 without creating records.
  - [x] Created Venue/Event records read back after restarting the Django API container against the same database.
  - [x] Seeded venue/event remain available and health reports database connectivity accurately.
- Checks: Run the repository's documented Compose migration/seed and Django check commands; focused DRF/API persistence round trip including invalid event venue input; restart web service and read back persisted records; `git diff --check`. Record unavailable dependencies/runtime with exact evidence rather than claiming success.
- Dependencies: P4-INT-1 runnable application foundation and shared contract.
- Out of scope: `MapFeature`/`PathNode`/`PathEdge` API and organizer mapping (P4-INT-3), publication snapshots/QR (P4-INT-4), authentication, realtime, and offline support.
- Verification record: 2026-10-11 04:03 IST — `docker compose exec -T api python manage.py check`, `migrate --check`, and `makemigrations --check --dry-run venueflow` passed. Both migrations applied to a disposable empty PostGIS database. Live HTTP checks covered health; Venue list/create/detail/update/delete; Event create/detail/update/delete; and HTTP 400 rejection for invalid venue FK, status, and date ordering. Created records remained readable after restarting the API container; temporary records and disposable DB were removed. `seed_demo` completed and health returned `{"status":"ok","database":"ok"}`. `git diff --check` passed.
- Commit: Pending.
- Plan changes: 2026-10-11 — Expanded the brief's high-level P4-INT-2 into a focused schema/API/persistence phase after the handoff identified it as the next step; explicitly reserved related map entities for P4-INT-3. Added explicit event status choices and end-after-start validation after execution checks found those gaps.
