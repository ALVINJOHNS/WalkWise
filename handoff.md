# Development handoff

Updated: 2026-10-11 04:14 IST

- Completed: P1-ORG-4 adds an attributed Leaflet/OpenStreetMap street map with GPS capture, path distance, and manual placement/selection of destination and path-point records.
- Current: Base implementation commit `3fcdea5`; OSM referrer fix `ce7e6f7`; map-placement update pending commit. Local floor-plan coordinates are not automatically translated to geographic locations; select an item and use its street-map placement control.
- Next: Commit map-placement update and verify marker placement and OSM tiles in the user's browser.
- Checks: `node --check api/venueflow/static/venueflow/organizer.js` and `git diff --check` passed. Compose rebuilt and started; organizer returned HTTP 200 and served the updated placement behavior.
- Limitation: Browser-visible tile loading and phone GPS/save-load interaction have not been verified. OSM and Leaflet require internet; distances use GPS samples or straight-line coordinates and do not snap to roads or compute directions.
