# P4-INT-4 — Publish visitor snapshot and QR entry

- Status: not started
- Goal: Let an organizer publish the persisted venue package and share a visitor URL/QR that opens that venue.
- Scope: Integration-owned models/API/page routing/shared template and publishing code. Use the existing `Event` and `MapVersion` contract; choose or create the venue's demo event through the established API path. Validate the publishable venue data, build a self-contained snapshot from its map features, path nodes, edges, and relevant event data, and create a monotonically increasing immutable version. Expose the latest published snapshot to `/v/<slug>/`; visitor reads must not mutate it. Return/display the absolute visitor URL and render a QR for that URL using a small established dependency. For local-only runs, make the localhost URL explicit and QR usable on the same machine; do not claim remote-device reachability without a stable hosted origin. Keep draft/current and published snapshot/freshness labels accurate.
- Acceptance criteria:
  - [ ] Publish rejects incomplete/invalid venue data with actionable errors and does not create a partial version.
  - [ ] Successful publish creates a new immutable `MapVersion` with a higher version and a snapshot containing the saved features, graph, and event data.
  - [ ] `/v/<slug>/` resolves the selected venue's latest published snapshot and never displays unpublished draft changes.
  - [ ] Organizer UI shows the visitor URL and a QR encoding exactly that URL; opening the URL loads the selected venue.
  - [ ] Repeated publish creates a new revision while earlier snapshots remain unchanged; API errors do not claim publication.
  - [ ] No cross-device/live-sync claim is shown for a localhost-only service.
- Checks: Django migration/system checks and focused publish API tests or inline fixtures for validation, snapshot contents, version increment/immutability, and visitor resolution; manual organizer-to-visitor sequence including QR decode; `git diff --check`.
- Dependencies: P4-INT-3 persisted related resources; P4-INT-2 event and version schema; visitor page from Person 2. Keep feature-owned templates/JS unchanged unless their owner coordinates an adapter change.
- Out of scope: Public hosting/deployment, authentication, realtime updates, service worker/offline guarantees, and analytics.
- Verification record: Pending.
- Commit: Pending.
- Plan changes: 2026-10-11 — Split publishing/visitor entry from related-resource persistence so the organizer's core data round trip can be reviewed before immutable snapshot and QR behavior.
