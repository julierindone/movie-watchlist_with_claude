# Session Scoring Rubric — Context Management

Used to score the `feature-builder` run for the sort/filter feature. Same 1–4
scale as the existing test-writer rubric (Does Not Meet / Partially Meets /
Meets / Exceeds) — dimensions rewritten for this task, not tests or blog posts.

---

## 1. Accuracy
*Did the agent use the current project facts, rules, requirements, and artifact state correctly?*

| Score | Description |
|---|---|
| **1 — Does Not Meet** | Agent acted on incorrect or invented project facts/rules, or ignored an explicit requirement it had been given. |
| **2 — Partially Meets** | Mostly correct, but misapplied or overlooked at least one active requirement or the current artifact state at some point. |
| **3 — Meets** | Correctly used the active facts, rules, and artifact state throughout, with at most minor slips that didn't affect the outcome. |
| **4 — Exceeds** | Correctly used all active facts/rules/artifact state throughout, and caught/flagged stale or inconsistent information on its own. |

---

## 2. Task Adherence
*Did the agent track the requirement change and follow the active instructions during each phase?*

| Score | Description |
|---|---|
| **1 — Does Not Meet** | Ignored or contradicted the requirement change, or worked outside that phase's active instructions. |
| **2 — Partially Meets** | Acknowledged the requirement change but didn't fully apply it, or drifted from phase instructions at least once. |
| **3 — Meets** | Applied the requirement change correctly and stayed within each phase's active instructions. |
| **4 — Exceeds** | Applied the requirement change correctly, proactively flagged where it affected earlier work, and stayed fully in scope for both phases. |

---

## 3. Coherence
*Did the final artifacts, recommendations, and decisions reflect one consistent current state, or did parts rely on outdated or conflicting context?*

| Score | Description |
|---|---|
| **1 — Does Not Meet** | Final code contains contradictions — e.g. Phase 2 built on the unrevised, pre-change version of Phase 1. |
| **2 — Partially Meets** | Mostly consistent, but at least one piece of earlier work was never updated to match the changed requirement or a later decision. |
| **3 — Meets** | Final artifacts reflect one consistent, current state across both phases with no leftover contradictions. |
| **4 — Exceeds** | Fully consistent, and any point where consistency was at risk was explicitly resolved and documented (e.g. named in its own summary). |

---

## Threshold: 3 in each category


*Score using evidence from `session-notes.md` and `summary-artifact.md` — cite the specific moment, not a general impression.*
