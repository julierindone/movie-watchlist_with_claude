# Iteration Log

## Memory System Build | 2026-09-24 | Post-lesson exercise, Step 4

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
