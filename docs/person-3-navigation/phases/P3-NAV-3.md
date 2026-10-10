# P3-NAV-3 — Next-place suggestion

Owner: Person 3 — Navigation

Owned paths: `api/venueflow/routing.py`; this phase document

Shared dependencies: [P3-NAV-2](P3-NAV-2.md), [Person 3 brief](../BRIEF.md), [shared contract](../../SHARED_CONTRACT.md), [venue/event models](../../../api/venueflow/models.py)

- Status: `verified`
- Goal: Recommend one open, reachable place from a visitor's current graph node using route time and any organizer-supplied wait estimate, with a concise reason that can be shown to the visitor.
- User value: “What next?” returns a practical destination grounded in the published map and available data, and makes clear why that destination ranked first.
- Scope:
  - Add a pure-Python public helper in `api/venueflow/routing.py`; keep `find_route` behavior and its output contract unchanged.
  - Evaluate each candidate independently by calling the verified `find_route` with the visitor start node and the candidate's access node. The route's `duration_s` is the travel-time input; do not recompute or approximate it separately.
  - Accept plain mappings so the integration layer can adapt `MapFeature`/`EventItem` and `PathNode`/`PathEdge` records without routing importing Django.
  - A normalized place record has a non-empty string `id`, a non-empty string `name`, an explicit `open` boolean, an `access_node_id`, and optional `waitMinutes`. At the boundary, integration owns translating model-specific status/properties into this normalized record. A place is eligible only when `open is True`; absent, false, or malformed status is not open.
  - Rank eligible, routable candidates by `duration_s + waitMinutes * 60` when a valid wait estimate is supplied, otherwise by `duration_s`. `waitMinutes` is an additive dwell-time penalty for comparison only; it must not alter the route's `duration_s` or route result.
  - Missing `waitMinutes` means zero penalty. A supplied estimate must be a finite, non-negative numeric value and must reject booleans, strings, NaN, infinities, and negatives. A malformed supplied estimate makes that candidate ineligible rather than silently treating bad organizer data as zero.
  - Return the selected place's identity/name, route result, ranking components, total ranking seconds, and a plain-language reason based only on the values used. For no eligible candidate, return an explicit result with `ok=False`, a stable reason, and no selected place.
  - Keep this helper deterministic and side-effect free. Do not mutate source records or perform I/O, model queries, preference inference, or time-based filtering.
- Contract decisions:
  - Public signature: `suggest_next_place(nodes, edges, places, start_node_id) -> dict`.
  - Inputs are iterables of the same plain node and edge records accepted by `find_route`; `places` contains the normalized records described above. The function must validate top-level iterability and mapping/field types without leaking incidental Python exceptions.
  - Candidate identity is `id`; user-facing label is `name`; graph destination is `access_node_id`; availability is strict boolean `open`. If IDs are duplicated, skip every record with that ID so input ordering cannot silently choose an ambiguous entity. Do not guess whether a status string such as `open`, `available`, or `active` means open.
  - Skip closed/malformed places, invalid access-node candidates, candidates whose `find_route` result is not successful, and candidates with malformed supplied wait estimates. One bad candidate must not prevent a separate valid candidate from being considered.
  - Compare ranking totals as finite seconds. Route failure or invalid/overflowing total must never become a winner. `find_route` retains its existing failure reasons and messages inside candidate diagnostics where useful.
  - Resolve ties deterministically by original input order after exact equality of ranking seconds. Do not add alphabetical or hidden preference ranking. Materialize the shared node/edge iterables once before evaluating multiple places so generator inputs work for every candidate.
  - Keep result shape stable. Recommended shape:
    - Success: `{"ok": True, "place": {"id": str, "name": str}, "route": <find_route result>, "travel_time_s": number, "wait_minutes": number | None, "ranking_time_s": number, "reason": str}`.
    - No suggestion: `{"ok": False, "place": None, "route": None, "travel_time_s": None, "wait_minutes": None, "ranking_time_s": None, "reason": "no_eligible_place", "message": str}`.
    - Do not return every evaluated route or a verbose explanation tree; callers need one result and a concise no-result reason. If candidate diagnostics are useful during development, keep them internal or return only a compact, documented diagnostic field.
  - Reason wording should state the selected travel estimate and, only when supplied, the wait estimate; label travel duration as approximate. Example: “Suggested: about 2 min walking time; organizer wait estimate adds 5 min.” Use rounded display values only in the reason; preserve numeric precision in result fields. Avoid claims about interests, schedules, accessibility, queues, or event urgency.
  - For unusable top-level inputs (non-iterable `nodes`, `edges`, or `places`, or invalid start ID), return a stable failure with `ok=False`, `reason="invalid_input"`, a concise `message`, and the other selection fields set to `None`. For valid top-level inputs with zero valid candidates, use the `no_eligible_place` result above.
  - `waitMinutes` currently has no dedicated model field. Integration must explicitly source and normalize it from organizer-provided event/place properties when available; if absent, pass it as absent. This phase must not add model fields or migrations.
- Acceptance criteria:
- [x] The module stays standard-library-only and `find_route` retains its existing signature, failure behavior, and route-choice semantics.
- [x] Closed candidates, candidates without a valid access node, and candidates with failed routes are never selected; a malformed candidate does not hide a valid alternative.
- [x] Among eligible candidates with no supplied waits, the smallest route `duration_s` wins.
- [x] A finite non-negative supplied wait estimate is converted from minutes to seconds and added only to ranking time; a candidate with a longer wait can lose despite a shorter route, while returned route duration remains unchanged.
- [x] Missing wait data adds zero; malformed supplied wait values are handled exactly as documented and never silently coerced.
- [x] Equal ranking times choose the first candidate in input order consistently.
- [x] The success result exposes selected place ID/name, the exact route result, unrounded travel duration, normalized optional wait, total ranking seconds, and a short reason reflecting only used values.
- [x] An empty list, all closed candidates, or all unreachable/invalid candidates returns the documented explicit no-suggestion shape and reason.
- [x] Start equal to a candidate access node is considered a valid zero-second route and can win.
- [x] The helper does not mutate inputs, infer status/waits, use coordinates, or import Django.
- Implementation sequence:
  1. Re-read `find_route` and its tests/fixtures; preserve the existing route result as the single source of travel-time truth. Inspect the repository for test commands before choosing how to verify.
  2. Follow the candidate error policy and exact public result keys in this document: skip malformed candidate records and all occurrences of duplicate IDs; reserve top-level `invalid_input` for unusable shared inputs such as missing/non-iterable node, edge, or place collections or an invalid start ID.
  3. Add a small private wait validator that rejects bool and non-numeric values, requires finiteness and non-negativity, converts valid minutes to seconds, and guards overflow in the combined ranking total.
  4. Implement `suggest_next_place` as a single pass over places. Validate each candidate, call `find_route`, discard route failures, calculate the ranking value, and replace the winner only when the new value is strictly smaller so input order provides stable tie behavior.
  5. Build the result from the winning candidate and exact route dictionary. Generate the reason from route duration and optional supplied wait; keep formatting local and never mutate route metrics.
  6. Add or run focused plain-Python fixtures for open/closed handling, invalid/missing access, unreachable routes, base-time ordering, wait-adjusted ordering, missing waits, malformed wait variants, ties, zero-route, empty/no-eligible results, stable result shape, and unchanged `find_route` behavior. Avoid a new test framework or dependency.
  7. Review the public docstring and brief consistency. Report to integration that normalized place mapping is required and that `waitMinutes` has no dedicated ORM field; do not wire the API or visitor UI in this phase.
- Checks: Inspect existing test files and project commands first. If no routing test runner exists, run documented standard-library fixtures covering every acceptance case, `python -m compileall -q api/venueflow/routing.py`, and `git diff --check`. No Django settings, database, Docker service, or network access is needed.
- Dependencies: P3-NAV-2 verified; integration must supply the normalized place record shape at a later wiring boundary. No API or page work is a dependency for implementing this pure helper.
- Out of scope: Interest personalization, event schedule ranking, accessibility filters, predicted queues, event recommendations, time-window/expiry calculations, destination selection from coordinates, changes to route algorithm, API/page wiring, database/model/migration changes, geometry lookup/rendering, and GPS snapping.
- Verification record: 2026-10-11 03:33 IST — Focused plain-Python fixtures passed route-time ordering, optional wait-adjusted ranking, unchanged returned route duration, missing and malformed waits (`None`, booleans, string, negative, NaN, ±infinity, oversized integer), input-order ties, duplicate-ID exclusion, closed/malformed/inaccessible/unreachable candidates, empty/no-eligible results, zero-edge routes, invalid top-level inputs, generator inputs, no input mutation, stable route contract, and reason/result values. `python -m compileall -q api/venueflow/routing.py` and `git diff --check` passed. No repository routing test runner or test files were found; no Django/database runtime was needed.
- Commit: `16b5b89` (`feat: add next-place suggestion ranking`).
- Plan changes: 2026-10-11 — Refined the initial phase outline into an implementation-ready contract after reviewing `find_route`, the shared contract, and actual model fields. Defined normalized place inputs, strict eligibility, optional wait validation and units, deterministic ranking/ties, result shape, integration mapping responsibility, and verification cases before implementation. Implementation followed this contract; no further plan changes.
