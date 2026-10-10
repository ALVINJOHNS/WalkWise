# Development handoff

Updated: 2026-10-11 04:02 IST

- Completed: P1-ORG-4 adds a Leaflet street map using attributed OpenStreetMap tiles, switches between street and floor-plan views, plots live/saved GPS capture and geolocated destinations/path points, and displays recorded-track and endpoint-to-endpoint geographic distances.
- Current: P1-ORG-4 implementation was committed as `3fcdea5` (`feat: add OSM map and GPS distances`); OSM referrer fix committed as `ce7e6f7` (`fix: send referrer with OSM tile requests`). The editor keeps API browser links out of its UI; same-origin requests still load/save the venue draft.
- Next: Confirm OSM tiles now load in the user's browser; check permission, recording, and save/load in a secure-context browser/phone.
- Checks: `node --check api/venueflow/static/venueflow/organizer.js`, `git diff --check`; `docker compose up --build -d` completed; organizer returned HTTP 200 and served JS contains the tile referrer policy.
- Limitation: Browser-visible tile loading and phone GPS/save-load interaction have not been verified. OSM and Leaflet require internet; distances use GPS samples or straight-line coordinates and do not snap to roads or compute directions.
