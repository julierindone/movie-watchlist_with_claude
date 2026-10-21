# Iteration Log

## Run 1 | 2026-10-19
- **Agent/Tool used:** Orchestrator pipeline (`.claude/agents/orchestrator.md`) → planner → implementer (3 passes) → reviewer (3 passes) → tester, per CLAUDE.md's Orchestrator workflow.
- **Task:** Build the user-rating feature (1–10 dropdown on watchlist cards) per `docs/prd.md`.

### Rubric Scores:
| Dimension                           | Score (1-4) | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ----------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| PRD Fidelity                        | 4           | Every Action, Decision Event, and Acceptance Criterion traced to code and verified (always-opens-regardless-of-state, overwrite-not-duplicate, conditional remove-rating option, unrated-last sort, blank default). Exceeds: the PRD's Action 3 text ("`rating-{imdbID}`") collided with the pre-existing critic-rating id, and the team caught this and checked in with the human on the `user-` prefix before implementing, rather than guessing — this is exactly the ambiguity-is-an-open-question behavior planner.md/implementer.md require, and happened more than once across the run. The `userRating` field-naming rationale is also documented in `run-summary.md`'s "Key decisions" section.                                                                                                     |
| Scope & Process Compliance          | 4           | Each role stayed in its tool/file lane; the reviewer's Critical/Warning labels and fix guidance survived into `run-summary.md` across all 3 passes; ambiguities were raised to the human rather than resolved silently (see PRD Fidelity note). Exceeds: pass 2 produced a Critical regression and still hadn't cleared the original issue — the orchestrator correctly applied the "same phase fails its gate twice → halt and escalate" rule, got human sign-off on root-cause guidance, and documented that pass 3 cleared the gate before proceeding to the tester. (Earlier in this review I flagged `assets/css/*` and `index.html` changes in the working tree as scope violations — confirmed by the human those were the human's own unrelated manual edits, not the orchestration's; disregarded.) |
| Accessibility & Integration Quality | 3           | Native `<button>` + native `<select>` gives full keyboard operability end-to-end (focusable, arrow-key/Enter selection, native Escape handling) with no custom popup/listbox to maintain; `aria-label` added only where no visible label exists, consistent with decision-005's precedent; `userRating` reads/writes/normalizes/backfills/sorts exactly like sibling `notes`/`tags`/`watched` fields, no parallel storage mechanism. Not "Exceeds": focus is dropped to document body after a re-render (e.g. after "remove rating"), but this matches the app's existing pattern (no field returns focus post-rerender today), so it's neither a new regression nor an anticipated edge case beyond PRD scope.                                                                                              |
| Total                               | 11 / 12     | Pass threshold: **PASS** — all three dimensions ≥3, feature behaves as PRD describes, reviewer reported no unresolved Critical issues after pass 3, tester reported 164/164 passing, human-in-the-loop checkpoints were honored.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

### Measurements:
- Cycle time: 46 min 5 sec
- Review latency: 88 min
- Cost per run: $5.65 ( 3.6M in / 37.9k out)

### Pass/Fail: **PASS** (11/12, all dimensions ≥3, all binary acceptance criteria met)

### Observations

#### What worked
- Full PRD traceability: every Action, Decision Event, and Acceptance Criterion is implemented and verifiable in the diff (dropdown always opens regardless of prior state; overwrite replaces rather than duplicates; "remove rating" only appears once rated; sort is highest→lowest with unrated last, same comparator shape as the existing `rating` sort; blank default option).
- `userRating` is integrated exactly like its sibling conditional fields (`notes`, `tags`, `watched`): colocated on the movie object, defaulted in `createMovieObject()`, backfilled for legacy items in `initLocalStorageWatchlist()`, persisted via `setLocalStorageWatchlist()` — no parallel storage mechanism introduced, matching `project-conventions.md`.
- Native `<select>`/`<button>` choice gives full keyboard operability for free and reuses the existing sort/genre/tag-filter pattern instead of a custom popup.
- When the PRD was ambiguous (the `rating-{imdbID}` vs. new element naming collision, and apparently others), the team checked in with the human rather than guessing — correctly following planner.md/implementer.md's "record it as an open question, don't guess" instruction — and the resulting naming decision is documented in `run-summary.md`.
- Review/escalation branching logic was applied correctly to a real case: pass 2 introduced a Critical regression and the orchestrator applied the "same phase fails twice → halt and escalate" rule, got human-approved root-cause guidance, and confirmed pass 3 cleared the gate — this is the rubric's own "Exceeds" example for Scope & Process Compliance, played out in practice.
- Memory hygiene was clean: `decision-008.md` added for the new dropdown-state mechanism, `decision-007.md` updated in place (not duplicated) once its tracked test conflict resolved, and `MEMORY_INDEX.md`/`current-state.md` both kept current — matches CLAUDE.md's "update existing entries rather than creating duplicates."
- Two pre-existing, unrelated test failures (a stale fixture predating `userRating`'s backfill, and a lowercase/uppercase placeholder-text assertion) were found, confirmed against the base commit, and fixed rather than papered over.
- The missing test coverage for the new `userRating` logic was explicitly flagged as a reminder to run `test-writer`, per `project-conventions.md`'s "remind, don't chain" rule, rather than silently left uncovered.

#### What failed
- Minor traceability gap only: `run-summary.md` documents several mid-run human approvals (CSS decline, naming collision, third implementer pass) but has no standalone line confirming the initial planner-approval pause before any code was written. Not scored as a failure given the human's confirmation that check-ins happened throughout, but worth a one-line "plan approved [time]" entry in future run summaries so that checkpoint is traceable from the artifact alone.
- No functional or process failures found once the CSS/`index.html` changes were correctly attributed to the human's own unrelated edits rather than the orchestration run.

#### Fixes proposed:
- Add an explicit "plan approved by human at [time]" line to the orchestrator's run-summary template so the first human-in-the-loop checkpoint is traceable from the artifact itself, not just from memory of the session.

#### Changes made:
- Fix 1: fixed unrelated broken tests so run 002 starts from a clean slate: ef186f2 — tests: repair tests broken by tagging feature, add tag-escaping coverage.
- Fix 2: 7abf9d6 - agent: added time of human approval line to run-summary requirements - CLAUDE.md & orchestrator.md

---

## Run 2 | 2026-10-20

### Rubric Scores:
| Dimension                           | Score (1-4) | Notes                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ----------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PRD Fidelity                        | 3           | Every Action, Decision Event, and Acceptance Criterion is implemented and traceable to a PRD line (overwrite-not-duplicate, "remove rating" option, dropdown opens regardless of prior state, sort highest-to-lowest with unrated last).                                                                                                                                                                                   |
| Scope & Process Compliance          | 4           | Every role stayed in its tool/scope boundary; plan approval is timestamped before any code; the Tester-loop rule fired for real (1/166 stale-fixture failure → fixed → 166/166) and is explicitly named, which is the Exceeds bar. Minor: the later icon-bleed fix cycle went straight from human bug report to implementer with no planner pass — not an authorized skip, though reasonable for a one-line diagnosed fix. |
| Accessibility & Integration Quality | 3           | Native `<button>`/`<select>` are keyboard-operable end-to-end with no custom widget; `userRating` reads/writes/backfills/sorts through the same mechanism as sibling `watched`/`notes`/`tags` fields. No ARIA added where none was needed. Doesn't reach Exceeds — no accessibility edge case beyond the PRD's own ask was tackled (e.g. focus isn't moved into the `<select>` when it's keyboard-revealed).               |
| Total                               | 10 / 12     | Pass threshold: **met** (all three ≥3, all binary acceptance criteria green).                                                                                                                                                                                                                                                                                                                                              |

### Measurements:
- Cycle time: 18:12
- Review latency: 101min
- Cost per run: $2.86 ( 2.03M in / 28.3k out)
- Cost (including fixing icon issue):  $3.95 ( 2.99M in / 34.8k o
ut)

### Pass/Fail: **PASS** (10/12, all dimensions ≥3, all binary acceptance criteria met)

### Observations

#### What worked
- Reused every existing convention: nullable field on the movie object (not a parallel array), `?? ''`/`?? []`-style backfill (extended with a deliberate `undefined`-vs-`null` distinction so already-unrated movies aren't miscounted as "backfilled"), delegated single-listener DOM wiring, native controls instead of a custom dropdown.
- No CSS files touched in either run — the icon-bleed bug was fixed by moving FA classes onto a nested `<i>` and adjusting the click-delegation selector, not by editing `cards.css`.
- Tester loop (stale fixture → fix → re-run → 166/166) is a clean, well-documented example of the orchestrator's branching logic actually firing.
- `decision-008.md` records not just the final shape but the rejected first approach and why it was reversed — good traceability.

#### What failed
- Test coverage for the new logic (`compareByUserRating`, `handleUserRatingChange`/`handleRemoveUserRating`, the backfill branch) is still zero; both run-summary entries correctly flag this as a reminder rather than hiding it, but it's now been carried across two fix cycles without `test-writer`/`test-repair` actually running.
- The icon-bleed follow-up fix skipped the planner role entirely (human-diagnosed bug straight to implementer) — a reasonable but ad hoc shortcut that CLAUDE.md's skip/loop rules don't actually define.

#### Fixes proposed:
- Actually run `test-writer`/`test-repair` for the still-open coverage gap rather than carrying the reminder forward again.
- Add a "human-diagnosed trivial fix" branch to the orchestrator's skip/loop rules (skip planner only when the human supplies both root cause and fix location) so the next hot-fix cycle doesn't have to invent the shortcut.
- Optional polish: call `.focus()` on the `<select>` when a keyboard activation reveals it, tightening the keyboard flow.

#### Changes made:
*pending*