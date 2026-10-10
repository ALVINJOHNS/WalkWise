# Person 4 — App shell, publishing, and demo integration

## Goal

Own the seams and keep a working app available throughout the build. Wire the three feature screens together, persist a venue package locally, publish a stable visitor URL/QR when hosting permits, and rehearse the integrated demo.

## Owned files

- `src/app/**`, `src/shared/**`, app entry/config/package/deploy files, and project integration docs.
- Do not edit the three feature folders. Ask the owner for changes or wire around their documented exports.

## Build first (first 45 minutes)

1. Read repository rules, freeze stack, create the minimal Vite React TypeScript app shell and shared `Venue` type from `docs/SHARED_CONTRACT.md`.
2. Make organizer and visitor routes render placeholders immediately. Commit the runnable shell and make a preview deployment if the team has a ready HTTPS host.
3. Add a realistic, hand-authored seed venue with a map image, connected three-edge graph, three destinations, and one optional blocked-edge/status toggle. Keep its data in one fixture file.
4. Add local load/save for the venue snapshot (localStorage). Use a key scoped to app + venue slug and handle invalid JSON with a visible reset/retry message.

## Then build

1. Wire feature exports from `src/features/organizer`, `visitor`, and `navigation` as they arrive; avoid editing their owned files.
2. Connect organizer `onSave` to local persistence; make published visitor view read the saved snapshot.
3. Add publish action that increments revision/updatedAt, validates essential fields, and produces `/v/<slug>` visitor link.
4. Generate and display a QR code for that URL using a small established dependency. If HTTPS deployment is unavailable, show the short URL and use local QR only for a localhost demo.
5. Show honest snapshot/freshness state. Local browser storage is not cross-device sync; do not claim realtime status updates.
6. Try a service worker/offline app shell only after the end-to-end demo is green and time remains. Verify cold reload in airplane mode before claiming it.

## Independent development

Use your own fixture and placeholder screens; the feature owners must not wait for the shell to build. Keep package/dependency edits centralized here. Send export/import expectations to everyone in the first 15 minutes.

## Done when

- App starts and both routes load from the seed venue.
- Organizer save survives reload in the same browser.
- Publish creates a visitor URL and QR that opens the selected venue.
- Place status changes survive local reload and visitor view reflects them.
- Integrated three-minute demo works twice; offline/live claims match what was actually verified.

## Cut first

Database/auth setup, realtime, multi-device sync, immutable server versions, analytics, hosting polish, service worker if it risks the demo. Keep the shell and local package stable.

## Short Codex prompt

“Implement only the app/integration files assigned in `docs/person-4-integration/BRIEF.md`. Follow `docs/SHARED_CONTRACT.md`, keep dependencies minimal, and do not modify the three feature folders. Prioritize a runnable shell, seed venue, local save/publish, and QR. Report actual checks and limitations.”
