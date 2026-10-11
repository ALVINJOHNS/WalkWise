# Development handoff

Updated: 2026-10-11 05:37 IST

- Completed: P4-INT-6 feature links and published-snapshot route API (`bef8b55`); P4-INT-3 map-resource persistence (`6737b32`); P2-VIS-1 visitor map (seeded route verified). Organizer OSM/GPS placement and ngrok configuration are present in the integrated branch.
- Current: P4-INT-6 is runtime-verified and committed. The wrapper follows P3-NAV-5; Person 3 review can be coordinated before visitor wiring. Edge geometry remains absent.
- Next: Resume the remaining P4-INT-4 organizer publish UI, visitor resolution/rendering from the published version, and QR flow. Then consider P4-INT-5 only after core demo behavior is green.
- Checks: Migration applied; Django check and migration drift check passed; API round trips passed for feature links, immutable version selection, route success/failures, and request errors. Python compilation, pure helper fixtures, and `git diff --check` passed.
- Limitations: No browser-level publish or visitor snapshot UI exists in this phase; that remains P4-INT-4 work. Organizer UI does not yet expose editing the new access-node field.
