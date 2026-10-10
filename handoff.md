# Development handoff

Updated: 2026-10-11 03:43 IST

- Completed: P1-ORG-3 GPS capture implementation is in progress in the organizer page. Destination fixes store latitude/longitude and available GPS metadata; start/stop/clear records and draws a timestamped outline track into the venue draft.
- Current: Draft GPS data is stored in `Venue.calibration.organizer_draft.geo_outline`; it is not written to `Venue.boundary` because that serializer field is read-only. GPS controls request permission only after the organizer clicks them.
- Next: Verify in a secure-context browser with GPS permission, then verify save/load round-trip when Docker is available. Decide with integration whether to add writable `Venue.boundary`/related geospatial persistence.
- Checks: `node --check api/venueflow/static/venueflow/organizer.js` and `git diff --check` passed.
- Limitation: Docker access is denied, so browser permission, physical GPS, rendered UI, and persistence remain unverified.
