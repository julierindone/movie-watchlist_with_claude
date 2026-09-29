# 1. Quality Rubric — `test-repair` agent

## 1.1 Dimensions

### 1.1.1 Failure Reporting Accuracy
Measures whether the agent's reported failing-test counts and identities match the actual output of `npx vitest run`, both before and after its fixes. A high score requires the numbers to be real and traceable to the tool's output, not estimated, and requires the "after" report to be verified by an actual re-run rather than assumed.

### 1.1.2 Classification Accuracy
Measures whether the agent correctly sorts each failure into "mechanical drift" (safe to fix — a mock, renamed reference, or signature mismatch with no change to the test's underlying behavior claim) versus "behavior judgment" (requires deciding whether a new expected value is correct). This is the agent's central judgment call and the reason its fix scope is restricted at all.

### 1.1.3 Escalation Justification Specificity
Measures how well the agent explains, for each failure it leaves red, why that failure requires a human judgment call rather than a mechanical fix. A high score requires the explanation to reference the specific assertion and source behavior in question, not generic or vague reasoning.

---
## Alternatives Considered

Considered a single combined "Fix Quality" dimension covering both classification and the correctness of applied mechanical fixes together. Ruled out because a failure could be correctly classified as mechanical but fixed with the wrong reference (e.g. the wrong renamed export), or correctly classified with a weak escalation write-up — collapsing them would hide which half of the reasoning needs improvement. Fix correctness is instead captured inside 1.1.1's "after" re-run: a mechanical fix that didn't actually work shows up as a reporting-accuracy failure, not a separate dimension.

Considered adding a separate "Scope Compliance" dimension for whether the agent touched only `*.test.js` files and never deleted, skipped, or loosened an assertion to force a pass. Ruled out as a rubric dimension since it's binary (no meaningful gradation between "stayed in scope" and "didn't") — kept as an acceptance criterion instead.

---

## Scoring Guide

### 1.1.1 Failure Reporting Accuracy
1. **Does not meet:** The agent reports failing tests or a fix outcome without running `npx vitest run`, or its reported counts contradict the tool's actual output.
   **Example:** Agent output: "That should fix both failures." No re-run was performed to confirm it.
2. **Partially meets:** The agent runs vitest but reports the results incompletely (e.g., reports a failing count but not which test files/names failed, or reports "before" but not a verified "after").
   **Example:** Agent output: "2 tests failing." Doesn't name `src/render.test.js` or which two assertions, and never re-runs after fixing.
3. **Meets:** The agent runs vitest before and after its fixes and accurately reports the failing test names/files and counts both times.
   **Example:** Agent output: "Before: 2 failed, 129 passed (`render.test.js`, both in `generateWatchlistHtml`). After fixing the mock: 0 failed, 131 passed, per `npx vitest run`."
4. **Exceeds:** Accurate before/after reporting, plus useful context such as noting a fix's blast radius or a discrepancy between expected and actual outcome.
   **Example:** Agent output as above, plus: "No other test files import the same mock factory, so this fix shouldn't affect anything outside `render.test.js`."

### 1.1.2 Classification Accuracy
1. **Does not meet:** The agent misclassifies a behavior-judgment failure as mechanical and fixes it anyway (silently changes an expected value), or misclassifies genuine mechanical drift as a judgment call and leaves an obviously safe fix undone.
   **Example:** A test's mock is missing a new export; the agent instead treats this as ambiguous and escalates it without attempting the mechanical fix. Or: an assertion's expected count changed because of new filtering logic, and the agent "fixes" it by updating the number without flagging that this is a behavior claim.
2. **Partially meets:** The classification itself is correct, but the agent doesn't state why a given failure landed in one bucket rather than the other.
   **Example:** Agent fixes the missing-export mock and correctly leaves a value-assertion failure red, but gives no reasoning for either call.
3. **Meets:** Classification is correct, and the agent states its reasoning for the split on each failure.
   **Example:** "`render.test.js`'s mock factory doesn't return `escapeHtml`, which `generateWatchlistHtml` now calls — that's a reference gap, not a behavior change, so I added it to the mock."
4. **Exceeds:** Correct classification with reasoning, plus explicit handling of borderline cases — noting where a failure could plausibly go either way and why it erred toward escalation rather than guessing.
   **Example:** As above, plus: "A third failure in `watchlist.test.js` looked like it might be the same kind of gap, but the expected array length also changed — that could be either a missed mock update or an intentional behavior change, so I left it red rather than assume."

### 1.1.3 Escalation Justification Specificity
1. **Does not meet:** The escalation note is missing, generic, or unrelated to the actual failing assertion.
   **Example:** Agent output: "This test needs a human look."
2. **Partially meets:** The note references the general area of the failure but not the specific expected value or behavior in question.
   **Example:** Agent output: "Something in the watched-status logic changed and the test doesn't match anymore."
3. **Meets:** The note references the specific assertion and the specific source behavior causing the mismatch, and states why it's a judgment call rather than a mechanical fix.
   **Example:** "`watchlist.test.js:142` expects `filterByWatched()` to return 2 items; it now returns 3 because `handleWatchedIconClick` no longer excludes items with an empty `notes` field. Whether 3 is correct depends on intended behavior, not a reference mismatch, so I left it red."
4. **Exceeds:** As "Meets," plus a concrete description of what could go wrong if the wrong choice were made silently.
   **Example:** As above, plus: "If 3 is treated as simply the new correct value without checking, a movie could show as 'watched' in the filtered view. before the human viewer actually opened it — worth confirming intent before changing the assertion."

## Pass Threshold
A run passes if it scores 3 or higher on all three dimensions, and meets every binary acceptance criterion (test-files-only scope; no deleted/skipped/loosened assertions; no new tests added for previously-untested functions).

**Reasoning:** Classification Accuracy is the dimension the agent's entire restricted scope exists to protect — a misclassification that silently overwrites a behavior-changing assertion is worse than leaving the suite red, because it hides a possible regression behind a green checkmark. Failure Reporting Accuracy and Escalation Justification Specificity both need to clear a baseline of "genuinely useful," since accurate-but-unexplained escalations still leave the human to redo the diagnosis from scratch.

## Notes on Threshold Design
Considered an aggregate minimum (e.g., 8/12) instead of a dimension floor. Ruled out because it would let a misclassified, silently-fixed behavior assertion (1 on Classification Accuracy) pass if reporting and escalation write-ups elsewhere were polished — exactly the failure mode the agent's mechanical-only scope was designed to prevent.
