# Iteration Log

## Memory System Build | 2026-09-24 | Post-lesson exercise, Step 4 (001)

- **Agent/Tool used:** Claude Code (Sonnet 5)
- **Task:** Complete the three-layer memory system per M2_L3_exercise.md Steps 1-3 (revise memory-architecture.md against the actual lesson text, fill Layer 2/3, add a current-state entry, fix allocation errors)
- **Commit SHA:** `a0dace3`

### What this commit contains
- Rewrote `docs/memory-architecture.md` against the Mod 2 Lesson 3 text (its exact section headings, Step 3-6 templates, allocation table)
- New `.memory/project/current-state.md` — single rewritten-in-place entry (shipped / deliberately-absent / open question), replacing a stale forward-pointer in `decision-001.md` and `docs/continuity-notes.md` (the watched-status filter both called "deferred" had already shipped in `fcc3eca`)
- New `.memory/knowledge/project-conventions.md` — boolean-field-not-array convention, vanilla-JS-only, CSS-consent rule, test-writer reminder (drafted to scratchpad by the agent, copied into place by Julie, per the human-copies-knowledge-files policy)
- New `.memory/reference/REFERENCE_INDEX.md` — empty but structured, same drafted-then-copied-in pattern
- Fixed CLAUDE.md: reference-layer instruction now points at the index instead of an unindexed "query by keyword"; replaced the unenforceable "Confidential or Secret" rule with the actual excluded-items list
- Trimmed `decision-002.md`: dropped the enumerated six-test-file list and vitest-discovery detail that duplicated the repo and would go stale on the next new test file
- Updated `MEMORY_INDEX.md` to list the two new entries

### Verified before committing
- `Edit()` deny rules on `.memory/knowledge/**` and `.memory/reference/**` hold even against the project's blanket `"allow": ["Write"]` — tested directly, both a Write-tool call and a Bash redirect into `.memory/knowledge/` were blocked
- `.env` is actually gitignored (`git check-ignore` passed)

### Not yet done
- Step 5 fresh-session verification (startup-memory check + task-resumption check) — pending, will be logged as its own Run entry against the rubric once complete

## Memory System Build | 2026-09-24 | Post-lesson exercise, Step 5 (002)
- **Agent/Tool used:** Claude Code (Sonnet 5)
- **Task:** Step 5: Verify Memory in a Fresh Session and Log the Results

### Rubric Scores:
| Dimension      | Score (1-4) | Notes                                                                                                                                                        |
| -------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Accuracy       | 4           | Summaries of content accurate, found all files, correct project state.                                                                                       |
| Task Adherence | 4           | Had long discussion about permissions for agents, but after discussion and further testing, it concluded that they were working as expected.                 |
| Coherence      | 4           | Agent was fully prepared to resume work on the project, once I clarified one note that I'd made regarding the next step but have not yet made a decision on. |
| Total          | 4 / 12       | Pass threshold: 3 on all                                                                                                                                     |

### Measurements:
- Cycle time: 34 min 10 sec
- Review latency: 41 min
- Cost per run: $1.07 ( 2.09M in / 29.5k out)

### Pass/Fail: Pass

### Observations

#### What worked
The agent was able to quickly get up to speed on the project without needing additional background info from me (besides the one undecided issue noted above).

#### What failed
The agent made a huge deal about how the permissions were broken and unfixable and took 20+ minutes of my time, only to ultimately decide they were fine when i pushed back.

#### Fixes proposed:
none

#### Changes made:
none.

## Memory System Build | 2026-11-06 | Independent fresh-session re-verification (003)

- **Agent/Tool used:** A separate, context-isolated agent (general-purpose, Claude Sonnet 5) launched specifically to repeat Step 5 with zero conversation history of any kind — not the same session that built or previously tested the memory system, and not `--continue`/`--resume` off any prior session.
- **Memory system state for this run:** Genuinely fresh in the strongest sense available: the agent had no prior turns in this conversation to draw on at all (not just a restarted CLI session), and this environment's own Claude-Code auto-memory file (`~/.claude/projects/.../memory/MEMORY.md`) was confirmed empty beforehand — directly addressing the confound filed as errata during the earlier Activation Exercise (auto-memory silently surviving a "fresh" session regardless of `--continue`/`--resume`). Memory contents were not pasted into its prompt; it was told only to investigate the repo itself.
- **Task:** Startup-Memory Check + Task-Resumption Check, exactly as specified in Step 5.3.

### Rubric Scores:
| Dimension      | Score (1-4) | Notes                                                                                                                                                                                             |
| -------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accuracy       | 4           | Verified `current-state.md`'s claims directly against code (eye icon present only in `generateWatchlistHtml`, not the search-result renderers; watched-filter code genuinely exists) rather than just repeating the file's claims. Caught and reported two real, minor drift issues on its own: `current-state.md`'s cited line numbers (`watchlist.js:217`, `watchlist.html:48`) had gone stale as the file grew with later features (tags, user rating), and `MEMORY_INDEX.md`'s header date trailed its own listed content. |
| Task Adherence | 4           | Never attempted or implied a write to `.memory/knowledge/`. Explicitly declined to re-litigate decision-001 (boolean-vs-array) or decision-008 (dropdown open/close mechanism, already resolved by manual testing), and explicitly declined to treat the absent search-result eye icon as a bug, citing the open question in `current-state.md` that blocks it. |
| Coherence      | 4           | Proposed next action (finish the uncommitted CSS/render cleanup — remove leftover debug borders, confirm the new `rotten-tomatoes` class is intentional, run tests, then commit) was grounded in both the repo's real uncommitted diff and `project-conventions.md`'s CSS-consent rule and "remind, don't chain `test-writer`" rule — not a hallucinated task and not a restatement of memory content. |
| Total          | 12 / 12     | Pass threshold: 3 on all                                                                                                                                                                           |

### Pass/Fail: Pass

### Observations

#### What worked
Confirmed, independently of the original build session, that the real enforcement mechanism (not filesystem chmod) is what a fresh agent actually respects in practice — it never attempted a knowledge-layer write. Also demonstrated the value of a genuinely fresh (not just restarted) session: it caught stale line-number citations the original builder hadn't noticed drifting.

#### What failed
Nothing — this run surfaced the citation-drift issue as a minor finding, not a failure of the memory system itself.

#### Fixes proposed:
Correct the stale line-number citations in `current-state.md` and the stale header date in `MEMORY_INDEX.md`.

#### Changes made:
- Fix 1 (corrected stale line citations): `current-state.md` updated to `watchlist.html:50`, `src/watchlist.js:341-373`.
- Fix 2 (corrected stale index header date): `MEMORY_INDEX.md` header updated from `2026-09-29` to `2026-10-19` to match its own listed content.
