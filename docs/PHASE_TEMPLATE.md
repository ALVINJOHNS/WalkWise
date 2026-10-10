# Phase plan template

Use this structure in each participant or feature brief. Split work into phases that each end in a usable, reviewable increment. Keep the criteria observable and the verification record factual.

## Section: <participant or feature>

Owner: <name/role>  
Owned paths: `<paths>`  
Shared dependencies: <contract or prerequisite>

### <stable ID> — <short outcome>

- Status: `not started` | `in progress` | `verified` | `blocked`
- Goal: <one concrete outcome>
- Scope: <small set of changes included>
- Acceptance criteria:
  - [ ] <observable behavior or artifact>
- Checks: <existing command(s) and any focused manual scenario>
- Dependencies: <phase IDs, or none>
- Out of scope: <only if needed to prevent ambiguity>
- Verification record: <date/time/timezone; commands and results; manual checks and results; unresolved issues>
- Commit: <SHA/message after commit; pending while uncommitted>
- Plan changes: <date, change and reason; otherwise `None`>

### <next stable ID> — <next outcome>

Repeat the fields above. Keep status current. If scope changes, update this plan before implementing and record the reason; revise acceptance criteria and dependencies as needed.
