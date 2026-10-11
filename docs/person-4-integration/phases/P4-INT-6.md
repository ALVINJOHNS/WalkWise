# P4-INT-6 — Temporary HTTPS access for mobile demo

- Status: verified; phone location permission remains device-specific
- Goal: Let a phone open the local Django demo over HTTPS so browser geolocation can be requested.
- Scope: Compose/Django host and CSRF configuration, demo instructions, and a temporary Cloudflare Quick Tunnel to the existing local API service. Keep credentials and changing tunnel URLs out of tracked files. The tunnel is public to anyone who gets its URL; it is intended only for the explicitly requested demo session.
- Acceptance criteria:
  - [x] Django accepts local hosts and the Quick Tunnel hostname suffix, and accepts HTTPS CSRF origins for that suffix.
  - [x] The existing app serves through a temporary HTTPS tunnel.
  - [x] The tunnel URL returns the overview, organizer page, and health endpoint over HTTPS. The browser's secure-context requirement is met; phone GPS prompt/permission remains device-specific and was not tested here.
  - [x] README explains how to start/stop the tunnel, that the URL changes, public reachability, host requirements, and browser location permission.
  - [x] Phase, changelog, AI usage, and handoff record actual commands, checks, URL/start state, and limitations.
- Checks: `docker compose config --quiet`; Django system check; in-container HTTPS-forwarded request to the selected route through the public tunnel; `git diff --check`. Do not claim phone GPS verified unless tested on the phone.
- Dependencies: P4-INT-1 Compose service; Cloudflare Quick Tunnel client; Docker Desktop running.
- Out of scope: Permanent production hosting/domain, authentication, HTTPS certificate installation on the phone, and production hardening.
- Verification record: 2026-10-11 07:32 IST — Recreated services with `docker compose up -d --build`; `docker compose ps` showed API healthy, DB/Redis healthy, worker up. `docker compose exec -T api python manage.py check` passed. `/api/health` returned 200. Quick Tunnel client registered a connection and served `/`, `/organizer/`, and `/api/health` over the generated `https://heath-portable-biodiversity-cube.trycloudflare.com` URL, each returning HTTP 200. `docker compose config --quiet` and `git diff --check` passed. No phone was used, so geolocation permission/prompt is not claimed as verified. The tunnel process remains running in the current terminal session (session 79467); Ctrl+C there stops public access.
- Commit: Pending.
- Plan changes: 2026-10-11 — Added at the user's request to use mobile location for the project demo. User explicitly authorized restarting or recreating containers and asked for HTTPS. A temporary public tunnel was selected because it provides browser-trusted HTTPS on a phone without installing a local CA certificate.
