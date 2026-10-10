# Development handoff

Updated: 2026-10-11 04:02 IST

- Completed: P1-ORG-4 adds a Leaflet street map using attributed OpenStreetMap tiles, switches between street and floor-plan views, plots live/saved GPS capture and geolocated destinations/path points, and displays recorded-track and endpoint-to-endpoint geographic distances.
- Current: Implementation and documentation are ready in the working tree; no commit yet. The editor keeps API browser links out of its UI; same-origin requests still load/save the venue draft.
- Next: Review and commit P1-ORG-4, then test map tiles, permission, recording, and save/load in a secure-context browser/phone when runtime is available.
- Checks: `node --check api/venueflow/static/venueflow/organizer.js`, `git diff --check`, and source searches for Leaflet, OSM attribution, view controls, and distance passed.
- Limitation: Browser/phone and Django save/load were not runtime tested because Docker socket access is denied. OSM and Leaflet require internet; distances are based on GPS samples or straight-line coordinates and do not snap to roads or compute directions.
