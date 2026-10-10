# P4-INT-3 — Persist organizer map resources

- Status: not started
- Goal: Make the organizer editor load and save its authored features and walk graph through the existing ORM rows.
- Scope: Integration-owned Django/DRF models, serializers, views, URLs, migrations, and contract/docs only as needed; coordinate the Person 1 editor mapping at the documented API boundary. Add list/detail and write support for `MapFeature`, `PathNode`, and `PathEdge`, scoped to a venue. Ensure edges can only reference nodes belonging to the same venue. Preserve the editor's IDs and normalized plan coordinates; map destination category/description/status to `MapFeature.properties`, `x`/`y` to `plan_x`/`plan_y`, and `from`/`to` to node foreign keys. Include a clear replacement/save contract so removing an item in the editor removes its persisted row without leaving dangling edges. Keep the venue calibration JSON limited to calibration/geolocation metadata; do not persist the same authored entities there. Define how the selected image is represented without expanding this phase into image hosting.
- Acceptance criteria:
  - [ ] A venue-scoped API response returns all map features, path nodes, and path edges with the fields needed to hydrate the current organizer editor.
  - [ ] Saving an organizer draft creates, updates, and deletes the corresponding ORM rows; edge endpoints are validated against the same venue.
  - [ ] Reloading the organizer shows the same places, coordinates, path nodes, and edges, and does not resurrect deleted entries from `calibration.organizer_draft`.
  - [ ] Existing venue calibration metadata and seeded graph data remain intact; no raw SQL is added.
  - [ ] API errors identify invalid references/fields and do not report a save as successful.
- Checks: Django system/migration checks available in the configured app; focused API round trip with a venue containing multiple features/nodes/edges, including update/delete and invalid cross-venue references; JavaScript syntax check if the editor adapter changes; `git diff --check`.
- Dependencies: P4-INT-2 venue/event ORM and API persistence; shared contract; Person 1 P1-ORG-1/P1-ORG-2 editor fields. Coordinate any required editor-side API adaptation with Person 1 and keep that work in their owned files.
- Out of scope: Publish revisions, visitor URL/QR, image file hosting, auth, live sync, and offline package support.
- Verification record: Pending.
- Commit: Pending.
- Plan changes: 2026-10-11 — Added after review found the organizer draft stored in `Venue.calibration.organizer_draft` while its `MapFeature`, `PathNode`, and `PathEdge` rows were not loaded or saved. Person 1's brief assigns related API support to integration.
