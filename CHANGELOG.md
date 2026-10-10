# Change log

Record each meaningful project change during the event, newest first. Update this file in the same commit as the change. Use a real timestamp with timezone, for example `YYYY-MM-DDTHH:MM:SS+05:30`.

## Event build log

## 2026-10-11T02:19:37+05:30 — Describe the WalkWise product in the README

- Changed: Replaced the README project-name and short-description placeholders with the WalkWise concept and added a concise product-direction section.
- Why: Make the repository identify the intended temporary-venue mapping experience before application implementation begins.
- Validation: Compared the wording with `docs/Walkwise_Development_Plan.md`, `docs/SHARED_CONTRACT.md`, and the active integration brief; referenced Markdown targets and `git diff --check` passed.
- Limitations: This documents planned MVP behavior only; no application code, routing, QR flow, saved snapshot, or offline behavior has been implemented or verified.

## 2026-10-11T01:50:33+05:30 — Add phased development and handoff workflow

- Changed: Expanded `AGENTS.md` with a phase-by-phase implement, verify, fix, document, commit, and handoff loop; added `docs/PHASE_TEMPLATE.md`; added stable phase IDs and exit checks to all four participant briefs; linked phase execution guidance from `docs/README.md`; created root `handoff.md`.
- Why: Keep agent context compact across handoffs, make phase boundaries and next-document references explicit, and require verified, documented commits without waiting for routine prompts.
- Validation: Checked relative Markdown targets in all changed docs (passed); `git diff --check` (passed). No application runtime check applies.
- Limitations: Documentation-only workflow guidance; no application phase has started or been runtime-verified.

## 2026-10-11T01:30:58+05:30 — Add six-hour parallel team plan

- Changed: Added four role briefs, shared implementation contract, six-hour schedule and cut order under `docs/`; linked the team plan from `README.md`.
- Why: Adapt the full Hereabouts plan to a four-person, six-hour hackathon build with parallel work and predictable feature ownership.
- Validation: Checked the source plan and repository rules; verified all four briefs use distinct feature paths and the shared venue shape. Markdown links and `git diff --check` checked after editing.
- Limitations: Planning documentation only; no application code, hosting, or demo has been built or verified.

Replace this sentence with entries as you build:

```text
## <actual timestamp> — <short change title>

- Changed: <feature or files changed>
- Why: <reason for the change>
- Validation: <commands or manual checks actually run, with results>
- Limitations: <known issues or "None identified in these checks">
```

## Template setup — 10 October 2026

- Changed: Added the event README, rules, agent guide, change log, AI usage record, submission checklist, Git ignore rules, and pull request checklist.
- Why: Give participants a consistent starting point for event rules, basic coding patterns, documented changes, and regular commits.
- Validation: Checked local Markdown links, event detail consistency, required documents, and diff whitespace before publishing.
- Limitations: Documentation scaffolding only; no participant project, application, or working demo is included. GitHub publication and template status are verified separately after creation.
