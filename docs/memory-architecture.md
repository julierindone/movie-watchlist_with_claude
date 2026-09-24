# Memory Architecture

- **Purpose:** plan of record for the persistent memory system in `movie-watchlist_with_claude`.
- **Covers:** the system actually being submitted, not the draft built during the lesson's Try It activities.
- **Headings:** follow the lesson's prescribed scaffold (3.1.4.1, Step 2).
- **Last revised:** 2026-09-24

---

## What this workflow needs to remember

**The recurring work:** implementing and extending user-facing features across `src/` (`fetch.js`, `normalize.js`, `search.js`, `watchlist.js`, `render.js`, `helpers.js`) and the app's localStorage persistence.

- **Completed instances:** sort and genre filtering (lesson 2); watched-status (lesson 3's Activation Exercise).
- This is a **category of work**, not one feature. The memory system is designed against the pattern those instances share, not against whichever feature is newest.

**Must remember across sessions:**

- Why past implementation choices were made, and what was rejected
- Which conventions those choices established for future features
- What state the current feature work is in
- Which questions are still open and blocking a related decision

**Does not need to store:** the implementation itself, the test files, authorship and change history, or the course material — the repo, `git log`, and `docs/` already preserve those.

**Must never store:** `.env` values, the OMDb API key, any credential, or notes that expire with a finished task.

### What a fresh session needs and cannot reliably infer from the repo

- **Why** a structure was chosen and what was rejected — the code shows `watched` is a boolean on the movie object; it cannot show that a parallel `watchedArray` was considered and ruled out, or why.
- Whether an apparent gap is a **defect or a deliberate deferral** — e.g. the eye icon is absent from search-result cards on purpose, not by omission.
- **Open questions** that block related work — can a movie be marked watched without being on the watchlist? Unanswered, and answering "yes" reopens the array-vs-field question decision-001 settled.
- **Standing conventions** meant to bind future features generally, not just the feature that produced them — booleans on the item object; no frameworks; no CSS edits without human consent.
- **Where this project deviates from the course instructions, and why** — the knowledge layer is protected by `.claude/settings.json` deny rules, not `chmod`. A fresh session that doesn't know this will "fix" it by running chmod, which silently does nothing here.

### What the repository already preserves

| Already preserved | Where |
|---|---|
| The current implementation and UI | `src/`, `watchlist.html`, `index.js` |
| Test coverage and layout | the six colocated `*.test.js` files |
| Who changed what, when, and in what order | `git log` / `git blame` |
| Course material, exercises, errata, handoffs | `docs/` |
| Long-form rationale for the permissions deviation | `docs/memory-directory-permissions.md` |

Memory may **point** to any of this. It may not **duplicate** it.

### What changes over time

- Feature state and priorities
- Whether a deferred step has shipped
- Whether a decision is still active or has been superseded
- Which questions remain open

This category needs an explicit review trigger, because it goes stale silently.

> **Observed — and the reason this document was revised:**
> - decision-001 and `docs/continuity-notes.md` both record "add a watched-status filter" as the deferred next step.
> - It already shipped: commit `fcc3eca`, live in `watchlist.html:48` and `src/watchlist.js:217`.
> - The memory was wrong within two days of being written.
> - **Cause:** *state* was recorded as a footnote inside a *decision* entry, where nothing triggers a re-read.
> - **Fix:** Layer 1 carries a dedicated, rewritten-in-place project-state entry, separate from the dated decision log.

### What stays stable unless a human changes it

- Coding standards
- Architectural conventions — booleans-on-the-item, vanilla JS only, the `src/` file split
- The human-consent rule for CSS
- The memory system's own structure and write policy

None of these expire on a schedule. They change when a human decides they have changed.

### What must never be stored, in any layer

- Credentials, the OMDb API key, `.env` contents
- Personal data beyond what is already public in this repo's git history
- Content copied from any real internal system
- Anything true only for the current session

---

## Layer 1: Project memory directory

`.memory/project/` — the agent's working notebook. Read at startup via `MEMORY_INDEX.md`.

**What belongs here**

- Dated decision entries whose rationale is invisible in the code — `decisions/decision-001.md` (watched-status as a field), `decisions/decision-002.md` (colocated tests)
- A single current-state entry: active work, what just shipped, what is deliberately deferred, what is blocked
- Open questions that would change a future decision if answered
- Known limitations that are accepted rather than scheduled

**Why this location is appropriate**

- This context changes as the project evolves.
- The agent discovers much of it mid-task, with no human present at that moment.
- So it has to live in the one layer the agent is permitted to write.

**Scope**

- Project-scoped: this repository only. Not user-scoped, not shared across projects.
- `SCOPE.md` pins it to `julierindone/movie-watchlist_with_claude`; CLAUDE.md halts the session on a mismatch.

**Write permissions**

- Agent may create and update entries, and must update `MEMORY_INDEX.md` in the same action.
- A human may edit anything here directly.

**Review, replacement, and removal triggers**

- Every decision entry carries a `Review by` date 90 days out; CLAUDE.md requires the agent to flag a passed date and ask before acting on the entry.
- A superseded decision is marked `Status: Superseded` with a pointer to its replacement — never deleted. The rejected-alternative reasoning is what stops a future session relitigating it.
- Feature-scoped entries move to the index's Archived list when the work merges to main.
- The current-state entry is rewritten in place, not appended to, and is checked against the repo whenever a feature ships.

**Intentionally excluded**

- Standing rules meant to bind all future work of a kind → Layer 2, so the agent cannot rewrite its own constraints
- The implementation and its tests → the code
- Step-by-step procedures → skills
- Per-session observations
- A chronological log of everything that happened

**Current contents:** `MEMORY_INDEX.md`, `decisions/decision-001.md`, `decisions/decision-002.md`. The state entry above does not exist yet — the main gap this revision opens for Step 2.

---

## Layer 2: Knowledge files

`.memory/knowledge/` — stable, human-owned rules. Read before any work touching standards or structure; never written by the agent.

**What belongs here**

- `coding-standards.md` — descriptive names, logged data modifications, diagnosable error messages, no hardcoded paths, the comment budget
- Architectural conventions — new per-item state is a boolean field on the watchlist item object, never a parallel array; vanilla JS only, no frameworks or build step; the `src/` responsibility split
- Human-consent rules — do not edit files in `assets/css/` unless the human grants it in the prompt
- Standing workflow constraints — at the end of a task, remind the human to run the `test-writer` agent rather than chaining agents automatically

**Why this location is appropriate**

- These bind indefinitely and sit on no review clock.
- Keeping them out of Layer 1 is the whole point: a rule the agent can silently rewrite mid-session is not a constraint.

**Scope**

- Project-scoped.
- The coding standards would transfer to other projects; not centralized here because no second project shares this memory directory yet.

**Write permissions — human only, enforced mechanically**

- `Edit()` deny rules in `.claude/settings.json` cover `.memory/knowledge/**` and `.memory/reference/**`.
- The agent may draft proposed content into scratch space; a human copies it into place.
- CLAUDE.md additionally forbids the agent from changing permissions on this directory on its own initiative.
- **`chmod` is not the mechanism, contrary to the lesson text:**
  - `chmod -R 444` on a directory strips traversal and blocks reads too (`555` on dirs, `444` on files is correct)
  - this repo sits on a Windows/DrvFs mount that stores no Unix mode bits
  - the agent runs as root, which bypasses mode bits anyway
  - git only preserves the executable bit, so nothing survives a clone
  - deny rules are tracked in git and do survive — full reasoning in `docs/memory-directory-permissions.md`
- **Known limit:** the deny rules cover the built-in file tools, the Bash file commands Claude Code recognizes, and shell redirects — not a subprocess that opens files itself. A guardrail, not a sandbox.

**Review, replacement, and removal triggers**

- No fixed schedule.
- A human updates a file when a convention actually changes, and refreshes its `Last reviewed` date.
- A rule is removed when it no longer applies.
- A repeated agent violation is itself a trigger — check whether the rule is still right, or just badly worded.

**Intentionally excluded**

- Anything tied to one feature's implementation → Layer 1
- Anything with a shelf life
- Procedures → skills
- Aspirational rules nobody intends to enforce — they only teach the agent that this file is advisory

**Current contents:** `coding-standards.md`. The architectural conventions, the CSS-consent rule, and the test-writer rule are specified above but not yet filed; adding them requires a human copy step by design.

---

## Layer 3: Indexed reference documents

`.memory/reference/` — background material located through an index, never loaded wholesale at startup.

**What belongs here**

- Documents that are genuinely occasional **and** too large to read directly, e.g.:
  - a full OMDb API contract, if `fetch.js` grows beyond its current handful of calls
  - accumulated past exercise write-ups, if they ever get consulted for project decisions rather than coursework

**Why this location is appropriate**

- Cost. A document useful four times a year should not spend context in the other 361 sessions.
- The index entry stays cheap; the document is pulled only when its entry matches.

**Scope:** project-scoped.

**Write permissions**

- Human files documents here; agent read-only, same deny rule as Layer 2.
- The agent reads `REFERENCE_INDEX.md` and opens only the documents whose entries match the task — it does not read the directory.

**Review, replacement, and removal triggers**

- A filed document is reviewed when the source it summarizes changes.
- It is removed when the source is gone, or when it has not been opened in two review cycles.

**Currently excluded: everything. The layer is empty by decision, not oversight.**

Two candidates weighed and rejected:

- `docs/repo-structure-summary.md` — small, already read directly, already wired into the `feature-builder` and `test-writer` agent definitions. An index would add a lookup step and save nothing.
- `docs/memory-directory-permissions.md` — the closest real candidate, both occasional and long. Stays in `docs/` because it is a write-up *about* the memory system for human readers, and the operative rule it produced (deny rules, never chmod) is short enough to live in Layer 2 directly. Filing the long version would split one rule across two layers.

**What would justify adding the layer for real:** a document over roughly a thousand words that the agent needs a few times a quarter and that cannot be compressed into a Layer 2 rule. An external API contract is the likeliest first case.

**Why the empty directory and `REFERENCE_INDEX.md` still exist**

- The layer stays wired and testable while empty.
- The index carries the schema an entry will use: title, path, what it covers, when to open it, last reviewed.
- It carries an explicit "no documents filed" line, so a fresh session can tell *empty* from *broken*.

---

## What does not belong in persistent memory

| Category | Example from this project | Where it belongs instead |
|---|---|---|
| Procedures | Adding a toggle feature: add the boolean → render the badge → wire the handler → confirm the localStorage round-trip | `.claude/skills/`, alongside `find-untested-functions`. Memory is what the agent must *know*; a skill is what it must *do*. |
| Temporary session details | Which movie titles were toggled to confirm persistence; a console error hit and fixed mid-build | The context window only. Decision-free once the task ends. |
| Already preserved by the repo | The `watched` field, the eye-icon markup, the filter dropdown, the six test files | The code. A second copy is a second thing to keep in sync — and it is the copy that will be wrong. |
| Sensitive information | The OMDb API key in `.env`; any credential | Environment variables. Never any memory layer, never a commit. `.env` is gitignored and stays that way. |

---

## Allocation decision table

| Item | Layer | Why there | Review trigger |
|---|---|---|---|
| Watched status as a field, not a parallel array — and the rejected alternative | 1 — project | Rationale absent from code; dated; could be superseded | 90 days (2026-12-21) |
| Tests colocated with source | 1 — project | A structural choice with a rationale the layout alone doesn't give | 90 days (2026-12-22) |
| Current feature state: filter shipped; eye icon deliberately absent from search results | 1 — project | Changes as work ships; a fresh session mis-reads absence as a bug | Rewritten whenever a feature ships |
| Open question: can a movie be watched without being on the watchlist? | 1 — project | Unresolved; answering it reopens decision-001 | Closed when answered, then folded into a decision entry |
| "New per-item state is a boolean on the item object" | 2 — knowledge | Binds *any* future toggle feature, not just watched-status; must not be agent-rewritable | Human, on convention change |
| Coding standards | 2 — knowledge | Stable, human-owned, consulted before writing code | Human, no schedule |
| Vanilla JS only; no CSS edits without consent | 2 — knowledge | Standing constraints on how work is done at all | Human, on convention change |
| chmod findings, long form | Neither — `docs/` | A human-facing write-up; its operative rule lives in Layer 2 | When the environment changes |
| Add-a-toggle-feature procedure | Neither — skill | Repeatable steps, not knowledge | When the procedure changes |
| The `watched` field, its UI, its tests | Neither — the code | Already the documentation of itself | n/a |
| Test data, transient console errors | Neither — context window | Expires with the task | n/a |
| OMDb API key | Neither — `.env` | Never in memory, never in git | n/a |

---

## Alternatives considered

**1. The boolean-field convention: Layer 1 or Layer 2?**

- **Argued for Layer 1:** it originated from a single decision (watched-status), which is what a decision entry is for.
- **Chose Layer 2.** It governs indefinitely many future toggle-style features; a 90-day review clock would imply it expires, and Layer 1 write access would let the agent revise the rule it is supposed to be bound by.
- **Tradeoff accepted:** adding it requires a human copy step.

**2. State: a fresh entry per change, or one entry rewritten in place?**

- **Argued for per-change entries:** more auditable, and it's what a decision log naturally produces.
- **Against:** that is exactly how decision-001's "deferred filter" note went stale while still looking authoritative.
- **Chose one current-state entry, rewritten in place.** Git history already supplies the audit trail, so memory can afford to hold only what is true now.
- **Tradeoff accepted:** the agent must rewrite rather than append — a CLAUDE.md instruction, not a mechanism.

**3. Protection: filesystem permissions or permission rules?**

- **Argued for `chmod`:** it's what the lesson prescribes, and it's enforced by the OS rather than the agent runtime.
- **Abandoned after testing:** doesn't work on this mount, bypassed by root, doesn't survive a clone.
- **Chose deny rules in `.claude/settings.json`.** Weaker in principle — they bind Claude Code's tools, not the filesystem — but the only option here that is tracked in git and actually holds.

---

## A note on verifying this system

- Claude Code has its own built-in auto-memory at `~/.claude/projects/.../memory/MEMORY.md`.
- It loads regardless of `--continue` or `--resume`.
- So a "fresh session" can recall prior-session content this system had nothing to do with — which quietly invalidates the fresh-session test.
- Any verification run has to account for it before its result means anything.
- Filed as errata in `docs/course-text-errata.md`.
