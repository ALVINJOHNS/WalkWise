# P3-NAV-3 — Next-place suggestion

Owner: Person 3 — Navigation

Owned paths: `api/venueflow/routing.py`; this phase document

Shared dependencies: [P3-NAV-2](P3-NAV-2.md), [Person 3 brief](../BRIEF.md), [shared contract](../../SHARED_CONTRACT.md)

- Status: `not started`
- Goal: Recommend one useful destination using deterministic, explainable rules and the verified route result.
- Scope: Add a pure function that filters to open places with valid graph access, ranks candidates by route time, optionally adds organizer-provided `waitMinutes` as a penalty when present, and returns the selected place plus a short plain-language reason. Skip candidates with no valid route. Do not invent preferences or event timing when absent.
- Acceptance criteria:
  - [ ] Closed places are never returned as recommendations.
  - [ ] Places without a valid access node or route are skipped.
  - [ ] The lowest route-time candidate wins when no wait penalty is supplied.
  - [ ] If `waitMinutes` is present, it affects ranking as a documented additive time penalty; missing values do not penalize.
  - [ ] The chosen place includes a short reason based on values actually used (for example, route time and supplied wait estimate).
  - [ ] Empty eligible candidate sets return an explicit no-suggestion result.
- Checks: Run a small plain-Python fixture covering open/closed candidates, route-time ordering, optional wait penalty, and no eligible candidates.
- Dependencies: P3-NAV-2.
- Out of scope: Interest personalization, schedule ranking, accessibility filters, predicted queues, event recommendations, and page/API wiring.
- Verification record: Not run; implementation has not started.
- Commit: Pending.
- Plan changes: None.
