# P4-INT-5 — Offline shell (stretch gate)

- Status: not started; optional
- Goal: Keep the visitor app shell available for a cold reload without a network connection, only after the core demo is stable.
- Scope: Service worker/app-shell offline support and required local assets only. Do not claim the venue package is offline-ready unless the package and its assets are also cached and verified.
- Acceptance criteria:
  - [ ] Cold reload in airplane mode succeeds and shows an accurate saved/offline state, or the feature remains explicitly incomplete and disclosed.
- Checks: Install/cold-reload in airplane mode on a real browser/device; record precisely what was cached and what remained unavailable.
- Dependencies: P4-INT-4 end-to-end publish/visitor flow is green.
- Out of scope: Any work that risks the core demo or implies offline routing/GPS before those capabilities are verified.
- Verification record: Pending.
- Commit: Pending.
- Plan changes: 2026-10-11 — Stable phase ID retained while moving the stretch item after the newly split P4-INT-3 and P4-INT-4 core phases.
