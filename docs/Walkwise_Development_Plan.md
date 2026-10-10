## HEREABOUTS

# Development Plan

A complete build guide for an organizer-controlled, offline-first map for temporary event venues.

**Hackathon implementation choice:** this repository uses a single Django server-rendered application with Django REST Framework, Django ORM/PostGIS, Tailwind static assets, Redis, and Celery. There is no SPA or separate frontend service. This is a scope-specific architecture choice; the offline PWA and realtime ideas below remain product direction, not implemented claims.

Hackathon target: deliver a working visitor journey and organizer workflow in 8 hours, then use up to 3 hours for stretch improvements.

| Decision | Build direction |
| --- | --- |
| First market | Temporary events: college fests, fairs and pop-up venues |
| Map authoring | Upload a sketch/image, calibrate it and manually trace the usable layout |
| Visitor access | Scan a venue QR; open a no-install PWA |
| Navigation | Organizer-defined walkable paths, graph routing, GPS display and path snapping |
| Offline promise | Download/cache the venue package while connected; navigate afterward with device GPS |
| Live changes | Status and schedule updates sync when connected; offline visitors use the last saved snapshot |
| Decision help | “What next?” ranks nearby suitable places and events by walking time and timing |
| Stretch | Anonymous aggregate zone analytics only after the core visitor loop works |

## Build objective

A visitor scans a QR code, downloads an event map, sees a GPS position on that map, receives a route along organizer-defined paths, and gets one useful next-step suggestion. The organizer can create a map from an image and manual tracing, publish it, and change a place status. Connected visitors see the change. Offline navigation continues from the saved snapshot; live updates pause and the app says so clearly.

Use the priority labels as scope gates. Finish every P0 acceptance check before building P1 or P2. Choose a small real event area early and maintain one integrated demo path throughout development.

# 1. Product definition

## Problem and promise

At temporary events and large venues, printed maps become stale and rarely answer the immediate questions: Where am I? What is open? What starts soon? Which path should I take? Hereabouts gives organizers control of a lightweight digital venue model and gives visitors a QR-accessible map with location-aware, time-aware guidance.

This is an organizer-maintained venue map, not a general-purpose world map. Organizer-authored paths and place locations are authoritative. GPS locates the visitor relative to the local map; it does not create a map or guarantee survey-grade accuracy.

## Users and success

| User | Need | Hackathon success |
| --- | --- | --- |
| Organizer/operator | Publish and update a temporary venue map quickly | Trace paths, add places/events, set status and publish a QR link |
| Visitor | Find destinations and decide what to do next | Orient, route and navigate without network after download |
| Operations staff | Find exits/help points and see closures | Venue information is visible; no emergency-response guarantee |

## Product principles

- Organizer is the source of truth for paths, details, schedules and temporary statuses.

- Offline means a complete downloaded snapshot; show its last refresh time.

- Navigation follows the organizer graph. Straight-line distance is not presented as a walking route.

- GPS is noisy: show uncertainty, snap conservatively and allow correction at QR anchors.

- No visitor identity is needed. Keep location on-device unless a later feature explicitly asks permission.

- Accessibility depends on organizer tags; unknown route attributes remain unknown.

## Scope priorities

| Priority | Scope |
| --- | --- |
| P0 Core | Venue setup; image/sketch upload and manual tracing; places, paths and graph; publish + QR; visitor PWA; offline package; GPS + snapping; graph route; “What next?”; connected status change if time permits |
| P1 Strong | Realtime status/closure updates; accessible route using edge tags; route instructions; mobile walk-and-plot; announcement banner |
| P2 Stretch | Aggregate zone-entry analytics; visited progress; compass; interest preferences |
| Out of scope | AR, 3D, BLE/Wi-Fi indoor positioning, native apps, accounts/payments, social/group tracking, predicted queues, safety guarantees |

# 2. User flows and acceptance criteria

## Organizer flow

1. Create an event venue with name, slug, active dates, timezone and map extent.

1. Upload a sketch/photo (PNG/JPG is the dependable MVP path) or start from a basemap. Calibrate with known anchors, then preview alignment.

1. Trace the venue outline, zones, landmarks, entrances/exits, help points and walkable path centerlines. Add graph nodes at intersections, entrances, destination access points and meaningful turns.

1. Add places with name, category, description, hours, status, optional image and organizer-entered wait estimate. Add scheduled events linked to a place or zone.

1. Validate connectivity, coordinates, lengths, active dates and event times. Preview visitor routes.

1. Publish an immutable versioned venue package and generate a visitor QR code. Explain that visitors should download it while connected.

1. During the event, change a place status or block an edge. Connected clients receive the update. Offline edits queue locally and sync with conflict visibility.

## Visitor flow

1. Scan/open the event link while connected. Ask for location only after the visitor taps Locate or Navigate.

1. Download the app shell, venue image or required tiles, vector paths, graph, place details, schedules, icons and latest status snapshot. Confirm completion and show package timestamp.

1. Show the GPS dot with an accuracy radius. Weak GPS offers a QR anchor or manual map tap.

1. Choose a place or “What next?” Filter closed/expired choices, estimate graph walking time, compare event timing and interests, then explain the top suggestion.

1. Start a route drawn on graph edges. Continue GPS updates. Recalculate after sustained deviation or a newly received closure.

1. Offline: keep location, route and recommendations working from the saved snapshot. Show “updates paused” and last sync time. Reconcile when connectivity returns.

## Acceptance checks

- Create and publish a venue without editing source code.

- Upload/align an image, trace a connected routable layout and persist it.

- Every routable destination returns a path, distance and approximate walking duration.

- After download, cold reload in airplane mode and still see the map, GPS, route and recommendation.

- Connected visitor sees an organizer’s status change; an offline visitor is not told data is live.

- QR anchor or manual map tap corrects approximate position when GPS is poor.

# 3. Feature inventory

| Feature | Priority | Minimum implementation / done when |
| --- | --- | --- |
| Venue setup | P0 | Event metadata and public slug resolve to the published event |
| Sketch/image upload | P0 | PNG/JPG backdrop; fit/scale/rotate/opacity and saved calibration |
| Manual tracing editor | P0 | Edit path polylines, nodes, zones and place pins; changes persist |
| Graph validation | P0 | Warns about disconnected paths and routable places |
| Place details/status | P0 | Category, description, hours, open/closed/delayed and status reflected for visitors |
| QR visitor entry | P0 | Shareable URL and QR open visitor view without account/install |
| Offline package | P0 | Cache shell, event data, graph and map asset; airplane-mode reload works |
| GPS + snapping | P0 | Dot updates with accuracy; conservative nearest-edge snap; fallback works |
| Graph routing | P0 | Dijkstra/A* obeys blocked edges and returns distance/geometry |
| What next? | P0 | Ranks open places/events and explains why |
| Live updates | P1 | Online visitor promptly sees status/closure change |
| Accessible route | P1 | Filters stairs/steep/narrow tags; explains if none available |
| Walk-and-plot | P1 | Records GPS trace for organizer review/simplification |
| Analytics | P2 | Aggregate zone counts only, with sample size and simulation label if applicable |

# 4. Offline-first PWA architecture

## System shape

Use one responsive web app with organizer and visitor experiences. Published event data is a portable, versioned package. The browser caches the app shell and package; visitor-side GPS display, snapping, recommendations and routing run locally. A small backend stores organizer data and relays updates while connected.

| Layer | Suggested choice | Responsibility |
| --- | --- | --- |
| Client | React + TypeScript + Vite (or existing stack) | Organizer and visitor UI, local calculations |
| Map | Leaflet; image overlay/CRS.Simple for sketch-only; geographic layer when calibrated | Render backdrop, paths, zones, pins and GPS |
| Offline | Service worker via Workbox/Vite PWA; IndexedDB via Dexie | Cache app shell and venue package; queue organizer edits |
| Backend | Supabase Postgres + Storage + Realtime; Firebase if already known | Persist venue and send connected updates |
| Routing/GPS | Local Dijkstra/A* module; browser Geolocation watchPosition | No route-screen network dependency |
| QR/deploy | Client QR library; HTTPS static hosting | No-install entry; secure-context APIs |

## Package contents and lifecycle

- App shell: HTML, JS/CSS, fonts/icons and offline fallback.

- Manifest: venue id/revision, coordinate reference and calibration, map image/required tiles, graph, zones, places, hours, schedules, current status, tags and update timestamp.

- Download and verify every asset before confirming saved. Cache only this event area, not a world basemap.

- Publish immutable revisions. Replace an old package atomically only after the new manifest/assets pass validation.

- Run GPS, snapping, routing, ETA and recommendations on-device. Nothing on the route screen waits for network.

- When online, subscribe to small deltas for status, edge blocks and announcements. Persist deltas with server revision.

- Offline organizer edits are pending, not globally live. Reconcile by revision on reconnect; show conflicting changes.

- Catch storage quota/private-mode failures; permit retry and never claim download completed when it did not.

| Capability | Offline after download? | Limit |
| --- | --- | --- |
| Map, places, schedule, graph | Yes | Must be in the package |
| GPS, route, What next? | Yes | Requires device location services; uses cached status |
| New status/announcements | No | Only latest saved values; show snapshot time |
| First-ever QR visit | Usually no | Must load once while connected or have preloaded app/package |

## State labels

| State | User-facing cue |
| --- | --- |
| Online/current | Live updates on + last sync time |
| Offline/saved | Offline map ready; updates last received at [time] |
| Offline/not saved | Connect once to save this venue |
| GPS weak | Location accuracy is about [x] m; scan a location QR or move outdoors |
| Permission denied | Map still works; choose a starting point or allow location |
| Conflict | Your edit differs from a newer version; review before publishing |

# 5. Calibration, GPS and routing graph

## Coordinate model and sketch calibration

Use WGS84 latitude/longitude for outdoor paths and basemap alignment. For calculations, project into a local metric coordinate system. Keep sketch pixels as an editing coordinate system and store an explicit transform from pixels to local meters/WGS84 in the venue manifest.

1. Upload the top-down sketch and set opacity. For a geographic overlay, identify at least two distinct known coordinates; three non-collinear points are preferable for affine fitting.

1. With one known point plus measured distance and direction, allow only a simplified approximate scale/rotation mode. Label it approximate.

1. Fit a 2D affine transform from image pixels to local meters/coordinates; display anchor residual error and calibration state.

1. Drag, rotate and scale against roads/landmarks; save the transform separately from the original image.

1. Trace paths/pins in calibrated coordinates. Without anchors, support a local-only map and manual/QR position; GPS alignment is unavailable.

GPS cannot align an arbitrary hand sketch by itself. The organizer must supply reference points, or use a local map with manual/QR anchors. A basemap trace is the fastest reliable demo path.

## GPS and path snapping

- Request location after a clear action; watchPosition stores latitude, longitude, accuracy, timestamp and heading when available.

- Project each fix to local meters. Find candidate graph segments within a search radius; project the fix onto each segment.

- Score candidates by perpendicular distance, previous snapped point, heading agreement and route continuity. Snap only when accuracy and candidate confidence are adequate.

- When fixes are poor/ambiguous, show raw accuracy radius instead of teleporting to a path. Smooth display lightly and use hysteresis to avoid jumping between parallel paths.

- After several consecutive off-route fixes, offer recalculation; do not reroute from one noisy fix.

- QR anchor resolves venue + anchor id to known coordinates and resets the local estimate. It is a correction point, not indoor tracking. Manual map tap is another explicitly approximate fallback.

## Routing graph and route behavior

Model the walkable network as G=(V,E). Nodes represent entrances, exits, intersections, destination access points and meaningful turns. Edges represent walkable centerlines. Destinations connect to an access node, so routes cannot cut across zones unless an explicit path allows it.

| Graph field | Use |
| --- | --- |
| Node: id, coordinate, kind, label | Intersection, entry, access point or anchor |
| Edge: id, endpoints, geometry, lengthMeters | Drawable walkable segment |
| Edge: status, revision | Open/blocked and update ordering |
| Edge attributes: stairs, slope, width, surface | Accessible route filtering |
| Edge: speedClass/walkSeconds | ETA; default conservative walking speed (e.g., 1.2 m/s) |

MVP route cost is walking time, derived from edge length and configurable walking speed. Dijkstra is enough for a small event graph; A* may use straight-line distance as a heuristic. Filter blocked edges first. Include partial edge distance from the visitor’s snapped projection to the start node. Return distance, duration, geometry and simple segment/turn instructions. Accessible mode filters incompatible edges; unknown tags stay unknown.

# 6. Organizer sketch editor and publishing

## Editor layout and behavior

- Center map/canvas; layer toggles for backdrop, paths, zones, places and labels.

- Tool rail: select, node, path, zone polygon, place pin and erase/edit; undo/redo if time allows.

- Properties panel: path attributes, place details/status, schedule and accessibility tags. Top actions: Save draft, Validate, Preview visitor, Publish and QR.

- Image controls: opacity, scale, rotation and anchors. Preserve original image; save transform separately.

- Path drawing snaps endpoints to shared nodes. Show nodes during editing; destinations attach to nearest or manually chosen access node.

- Zones are optional polygons for areas and later analytics. Path closures apply immediately to routing after publish/update.

- Mobile walk-and-plot records a GPS trace with pause/resume and markers; the organizer simplifies/reviews it before publication.

- Draft changes are private until Publish. Publishing increments revision; visitor preview uses the exact package that will be published.

## Publish validation

- Venue name, slug, active window, timezone and valid map extent exist.

- Routable places connect to the graph; intersection endpoints share node IDs.

- No zero-length edges, invalid coordinates or malformed polygons.

- Schedules parse in venue local timezone; at least one entrance and help/exit point exist for demo.

- Offline manifest and every referenced map asset download and validate successfully.

# 7. “What next?” recommendations

Keep ranking deterministic and explainable. The first version chooses from venue data; it does not predict crowds or personalize deeply.

- Exclude closed, expired, unavailable or inaccessible candidates.

- Exclude events already started or closing too soon to reach with a small buffer.

- Use graph route time if location and graph are available. Otherwise use straight-line distance and label it approximate.

- Optionally apply interest chips without requiring an account. Show one alternative and “See nearby places.”

Simple score: combine normalized route time (45%), event timing fit (25%), interest mismatch (20%) and organizer priority (10%). Lower is better. If data is sparse, use rules instead of tuning weights. Explain each recommendation: “Food court is open and 4 minutes away” or “Talk starts in 9 minutes; this route takes 3 minutes.” Organizer-entered wait times must be labeled as such.

# 8. Data model, API and privacy

| Entity | Key fields / role |
| --- | --- |
| Venue | id, slug, name, timezone, activeFrom/To, bounds, currentRevision |
| MapAsset | venueId, URL/cache key, kind, dimensions, calibration, checksum |
| Zone | id, venueId, name, polygon, category |
| Place | id, venueId, name, category, description, coordinate, accessNode, hours, status, wait estimate, tags, image |
| GraphNode | id, venueId, coordinate, kind, label |
| GraphEdge | id, venueId, endpoints, geometry, length, status, attributes, revision |
| Event | id, venueId, place/zone, title, start/end, status |
| Announcement | id, venueId, target, message, start/expiry, revision |
| VenueRevision | venueId, revision, publishedAt, manifest, checksum |
| Anchor | id, venueId, coordinate, label, QR token |
| AggregateVisit (stretch) | venue/zone/day bucket/count; no individual trail |

## API boundaries

| Operation | Purpose |
| --- | --- |
| GET public venue manifest/snapshot | Fetch latest published package |
| POST organizer venue | Create draft |
| PUT organizer draft | Save editor state |
| POST publish | Validate and create immutable revision |
| PATCH place status | Change status/wait estimate and emit revisioned event |
| PATCH edge status | Block/open path and emit event |
| GET anchor token | Resolve QR position anchor |

A direct Supabase client can implement these for the hackathon. Public clients read published snapshots; controlled organizer actions write changes; realtime messages carry venue id, revision, entity id and changed fields. Never expose privileged write keys in the browser.

## Privacy, retention and safety wording

- Keep GPS on-device in the core build; no visitor login is needed. Protect organizer writes with authenticated access or a hackathon-only server-side secret.

- Analytics stretch should aggregate before persistence where possible, use coarse zone/day counts, short retention and a minimum sample threshold.

- Do not store individual trails, re-identifiable location histories, or friend dots. Label simulated demo data.

- Show exits/help/medical points as venue information only. Hereabouts supplements staff and signage and does not replace official emergency plans or guarantee safe evacuation.

# 9. Recommended technology choices

| Concern | Default | Fallback |
| --- | --- | --- |
| Frontend | React + TypeScript + Vite | Keep existing stack |
| Map | Leaflet with image overlay / CRS.Simple and geographic mode | MapLibre if team already knows it |
| Backend | Supabase Postgres, Storage, Realtime | Firebase or seeded local JSON for a strictly offline demo |
| Offline | Service worker + Cache Storage + IndexedDB/Dexie | Cache API with one IndexedDB wrapper |
| Routing | Small local TypeScript Dijkstra module | A* only if graph size warrants it |
| Deployment | HTTPS static host + managed backend | Existing service supporting secure context |

Geolocation and service workers need a secure context (HTTPS, except localhost). Deploy early and test on the actual phone. Use realistic demo data; do not build general infrastructure before the QR and offline journey works.

# 10. Eight-hour build order and three-hour stretch

| Time | Milestone/tasks | Exit gate |
| --- | --- | --- |
| 0:00–0:30 | Lock scope, choose small venue, agree schema/screens, assign integration owner | One venue and test path agreed |
| 0:30–1:15 | Create app shell, organizer/visitor routes, seed venue, deploy HTTPS | Blank page opens on demo phone |
| 1:15–2:15 | Image upload, approximate calibration, place pins, draw paths/nodes, save draft | Venue edit reloads |
| 2:15–3:00 | Graph connectivity/length/validation and test route | Known origin-to-POI route computes |
| 3:00–4:00 | Visitor map/details/QR | QR opens usable map |
| 4:00–5:00 | GPS permission, accuracy, projection, conservative snap, manual/QR fallback | Phone location and fallback work |
| 5:00–6:00 | Service worker, cache package, offline indicator, airplane-mode reload | Map and route work offline |
| 6:00–7:00 | Route line/ETA and What next ranking/explanation | Visitor selects and follows a route |
| 7:00–7:30 | Connected status/closure update, freshness state | Online change visible; offline claim truthful |
| 7:30–8:00 | Fix top failures, seed final venue, rehearse twice | Demo passes twice |

## Team split

| Role | Ownership | Integration checkpoint |
| --- | --- | --- |
| Organizer/editor | Image, calibration, places, paths/zones | Hour 3 |
| Visitor/PWA | Screens, offline cache/download, GPS | Hour 5 |
| Spatial/routing | Schema, graph, snapping, route, recommendations | Hour 5 |
| Backend/integration/demo | Persistence, realtime, HTTPS, QR, seed data and pitch | Continuous; deployed shell by Hour 2 |

For fewer people, combine roles and preserve one integration owner. Use a polished realistic seed venue, but make the editor work for at least one new venue.

| Stretch hour | Candidate | Gate |
| --- | --- | --- |
| 8–9 | Accessible route profile using stairs/slope/width tags | Offline demo stays green |
| 9–10 | Aggregate zone-entry counts or visited progress | No precise trails; simulated values labeled |
| 10–11 | Improve walk-and-plot, announcements, route instructions or compass | Choose one or two, retest offline and live update |

Skip AR, beacon work, accounts, payments and predictive analytics. Remove any stretch feature that destabilizes offline navigation.

# 11. Testing checklist

## Functional

- Create venue, upload image, calibrate, trace an intersection and add three places; reload and confirm persistence.

- Publish and scan QR on another device; check venue and revision.

- Route between places; verify geometry follows edges, distance is plausible, blocked edges are avoided and disconnected places show a clear error.

- Change a place to closed; verify recommendation eligibility updates. Check upcoming, ended and too-soon events.

- Test location granted, denied, unavailable and stale; confirm map tap/QR fallback.

## Offline and network

- Download and verify completion/version. Airplane mode, cold reload: app, map image, places, graph, route and recommendation remain usable.

- Navigate with real GPS offline; confirm no route dependency on network.

- Reconnect and verify status/schedule deltas and manifest version update without losing cached map.

- Test interrupted download, storage quota/private mode and service-worker update; never falsely claim saved.

## Spatial and demo

- Inspect calibration at multiple anchors; test poor GPS and parallel paths; ensure no snap jumps.

- Check graph intersections share node IDs, route start/end connectors and closure behavior.

- Test uncalibrated sketch and show manual positioning. Confirm metric distances/ETA.

- Run full script twice on actual phone/browser/network. Keep QR, short URL, preloaded second device and known start/anchor ready.

- If analytics are simulated, label them “demo simulation.”

# 12. Three-minute demo script

| Time | Show and say |
| --- | --- |
| 0:00–0:25 | Problem: “Printed maps cannot tell you a stall moved or a session starts in ten minutes.” |
| 0:25–0:55 | Organizer: upload sketch, trace paths, place stage/food/help points, publish and reveal QR. Organizer owns the venue truth. |
| 0:55–1:20 | Visitor: scan QR, show map, GPS accuracy and places; choose destination and show graph route. |
| 1:20–1:50 | What next: “Robotics demo starts in 12 minutes, 4 minutes away.” Start route along organizer-defined paths. |
| 1:50–2:25 | Offline proof: airplane mode after download; GPS, map and route continue. Say live changes pause offline. |
| 2:25–2:45 | Reconnect or second client: organizer closes a path/place; visitor updates and reroutes. |
| 2:45–3:00 | Close: “Every temporary event can publish its living map by QR and keep guiding visitors offline after download.” |

- Download and visit the map once before airplane mode.

- Prepare a timed activity, three-edge route and one status/closure toggle.

- Use an outdoor GPS start or QR anchor. Have a second device/short URL ready.

# 13. Risks and limitations

| Risk | Mitigation and honest claim |
| --- | --- |
| Sketch lacks geographic anchors | Require calibration or local coordinates with manual/QR position; GPS overlay remains unavailable until calibrated. |
| GPS drifts indoors | Show accuracy, conservative snap and QR correction; no indoor precision guarantee. |
| First scan has no connection | Preload/download while connected; QR itself cannot deliver uncached files offline. |
| Cache/service worker incomplete | Validate package atomically; confirm saved only after full asset checks. |
| Offline data becomes stale | Show snapshot time; live state resumes on reconnect. |
| Organizer data/graph incomplete | Validate connectivity, preview routes, show unknown accessibility tags. |
| Crowd/weak event connectivity | Offline snapshot remains useful; live updates are best-effort while connected. |
| Analytics privacy/sample size | Aggregate only, minimum threshold, short retention and clear labels. |
| Safety interpretation | Show useful locations, but never claim emergency or evacuation guarantees. |

# 14. Explicit out of scope

- AR arrows, 3D twin, BLE/Wi-Fi/beacon positioning and centimeter-level GPS.

- Native mobile apps; QR launches responsive PWA.

- Accounts, payments, social feed/chat, public friend dots or group tracking.

- Predictive queues or crowd density; entered waits are labeled organizer estimates.

- Automated sketch-to-routable-map conversion; hackathon uses upload, calibration and manual tracing.

- Voice turn-by-turn, guaranteed accessibility or emergency/evacuation routing.

- Billing, sponsor marketplace, multi-tenant enterprise suite, advanced analytics and historical replay.

# 15. Roadmap and pitch

| Phase | Focus |
| --- | --- |
| Pilot | Calibration diagnostics, import, undo/redo, offline package diagnostics and organizer feedback |
| Repeatable events | Clone venue templates, scheduled expiry/archive and multiple organizer roles |
| Operations | Announcements, closure workflow, accessibility review and staff layers |
| Insights | Anonymous aggregate traffic, dwell/drop-off estimates and event reports |
| Scale | Permanent/indoor venues, richer layers and integrations where justified |

One-line pitch: “Hereabouts is the live map for places Google Maps does not know yet: organizers draw the paths, visitors follow them from a QR code, and the map still works offline after download.”

The memorable moment is the contrast between connected change and offline navigation: the organizer controls venue truth, while the visitor keeps moving from the saved map when connectivity disappears.
