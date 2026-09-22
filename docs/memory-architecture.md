# Memory Architecture

## What this workflow needs to remember
This agent helps maintain [movie-watchlist] by creating features. Across sessions, it needs to remember [decisions, unresolved questions, constraints, priorities, or current phase]. It does not need to store [information already captured by code, tests, configuration, or documentation]. It must not store [credentials, sensitive information, or details that should expire with a completed task].

This agent helps maintain the Movie Watchlist app by implementing and extending features across the codebase  and its localStorage-based persistence layer. Across sessions, it needs to remember prior implementation decisions and their rationale, which features are complete versus which have a known, deliberately deferred next step, and any conventions established along the way that should guide future feature work. It does not need to store the current implementation itself — the sort/filter logic, the watched-status field, or any other shipped feature — since that's already captured in the code. It must not store credentials, personal data, or details specific to a task that's already been completed and merged.

## Layer 1: Project memory directory
Belongs: decision not to store watched movies in a separate array; current sprint goal; a known staging-only bug; the team’s error-handling convention.   
Doesn’t belong: API keys, instructions for how test conventions.   
Scope: project-scoped, this repo only.   
Write permissions: agent can write and update entries.   
Pruning policy: feature-branch entries archived on merge; project-wide entries reviewed every 90 days.  

## Layer 2: Knowledge files
Belongs: project-wide conventions once they're settled — e.g. "new per-item states are added as boolean fields on the item object, not parallel arrays," vanilla-JS-only (no frameworks), the existing file split and what belongs in each.  
Doesn't belong: anything specific to one feature's implementation (that's project memory), temporary test data. 
Scope: project-scoped, this repo only. 
Write permissions: human-maintained, read-only to the agent. 
Pruning policy: reviewed by you every 90 days, or whenever a convention actually changes.

## Layer 3: Indexed reference documents
Belongs: things you'd want to dig up occasionally but not load every session — e.g. the test-writer rubric and iteration-log entries from Lesson 1, past exercise write-ups, design reasoning you're not actively using right now. 
Doesn't belong: active/current decisions (project memory) or standing rules (knowledge files) — if it's still shaping today's work, it's not "reference" yet. 
Scope: project-scoped. 
Write permissions: mostly human-curated, though the agent could file something here once it's no longer active. 
Pruning policy: no fixed schedule — consulted by keyword when relevant, pruned only if it goes stale or wrong.

## Allocation decision table
I checked each candidate against the filter questions. The field-vs-array decision and the deferred filtering step aren't recorded anywhere in the repo — only the resulting code is — and both will matter to future work, so they stay in project memory. The boolean-field convention isn't a one-time decision but a standing rule I want applied to any future toggle-style feature, so it belongs in a Knowledge File rather than project memory. The add-toggle-feature procedure is genuinely a skill, not memory — it's a repeatable how-to, so it should live as a .claude/skills/ file rather than a .memory/ entry. The watched field and its UI are already fully visible in the code, so recording them separately would just duplicate the repo. The test movies and console errors I used to confirm things worked were true only in the moment and don't affect any future decision, so they stay out of memory entirely.

## Alternatives considered
I considered recording "new per-item states are added as boolean fields, not parallel arrays" as a project memory decision entry, since it came from one specific feature. I chose a Knowledge File instead, because the rule is meant to govern any future toggle-style feature indefinitely, not just this one — a project memory entry would tie it to a single 90-day review cycle, where a Knowledge File treats it as a standing constraint like coding standards.
