# Pre-Session Plan — Sort & Filter Feature

## The Task

Add sort and filter capability to the movie watchlist app:  
- **Sort** the watchlist page by title (A–Z), year (newest → oldest), and rating (highest → lowest)
- **Filter** the search-results page by genre

---

## The Agent

`feature-builder` — a new agent defined at `.claude/agents/feature-builder.md`, scoped to editing `src/*.js` and `index.html` only (no CSS, no test files). Run as the main session via:

```
claude --agent feature-builder
```

not delegated/spawned as a background subagent — this exercise needs an interactive, multi-turn session.

---

## Phases of work

**Phase 1 — Sorting (watchlist page)**  
Add the three sort options above to the watchlist view. Sort logic lives in `watchlist.js`.  

**Phase 2 — Filtering (search-results page)**  
Add genre filtering to search results, reusing the same state-management pattern established (and corrected — see requirement change below) in Phase 1, so both pages behave consistently.  

---

## Rules / requirements / scope active in each phase

**Both phases (standing rules from the agent definition):**
- No CSS changes
- No new test files (informal sanity checks only — that's test-writer's job, run separately afterward)
- Ask before proceeding if the request is ambiguous — don't guess
- Match existing code formatting/conventions

**Phase 1 specific:**
- Scope limited to the watchlist page and `watchlist.js`
- No persistence requirement yet (introduced later — see below)

**Phase 2 specific:**
- Scope limited to the search-results page
- Must reuse Phase 1's (corrected) state pattern rather than inventing a new one

---

## Where a requirement will realistically change

After Phase 1 is complete, a new requirement is introduced: **sort preference must persist across page reloads**, matching how the watchlist itself already persists to `localStorage`. This forces a revision of whatever state approach was used in Phase 1, before Phase 2 begins.

---

## The artifact/decision the agent will revisit

The **state-management decision from Phase 1** — where sort state lives and what triggers re-render. This decision gets tested twice: once when the persistence requirement forces a correction, and again in Phase 2, where the (corrected) pattern must be reused rather than reinvented.

---

## Evidence used to evaluate the session

The three required rubric dimensions — **Accuracy, Task Adherence, Coherence** — scored 1–4 (created for this specific agent.).  
Evidence pulled from:
- `session-notes.md` (live-logged misfires/observations)
- `summary-artifact.md` (the agent's own proactive summaries, taken verbatim)
- Git commit history for this run