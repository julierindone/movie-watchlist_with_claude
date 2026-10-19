# Routing and Tool Grant Map

Project: `movie-watchlist_with_claude`

This map is the design decision of record. Agent definitions in `.claude/agents/` implement this table. When a definition and this map disagree, update the definition to match the map.

Tools referenced below are Claude Code's native tools (`Read`, `Write`, `Edit`, `Glob`, `Grep`, `Bash`, `WebFetch`, `WebSearch`, `Agent`) — this project has no MCP server registered, so there are no `mcp__*` tool identifiers to track separately.

## Role grants

| Role | Receives | Produces | Granted | Denied (reason) | Isolation reason | Autonomy |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `planner` | Feature request, repo path | Plan + file list | `Read`, `Glob`, `Grep` | `Write`/`Edit` (no code changes), `Bash` (no shell), `WebFetch`/`WebSearch` (research questions route through the orchestrator → Researcher, not a self-serve search), `Agent` (can't spawn its own subagents) | Reads code, never changes it; no write/execute/network access keeps blast radius at zero. | High — plans are cheap to fix, but still pause for human approval before any code is written. |
| `implementer` | Plan + file list, after human approval | Modified/new files | `Read`, `Write`, `Edit`, `Glob`, `Grep` | `Bash` (can't run arbitrary commands or grade its own tests), `WebFetch`/`WebSearch` (must raise questions to the orchestrator for routing, not search independently), `Agent` (can't spawn its own subagents) | Needs read/write to change code; no execution tool means it can't run or fake-pass its own tests; no direct web access keeps research questions visible to the orchestrator. | Medium — writes files directly once the plan is approved; no further human pause before Reviewer/Tester. |
| `reviewer` | Modified files | Review report (Critical/Warning/Suggestion) | `Read`, `Glob`, `Grep` | `Write`/`Edit` (proposes fixes, never applies them), `Bash`, `WebFetch`/`WebSearch`, `Agent` | Read-only by design; with no write/execute it can only propose, never act, so blast radius is zero even at high autonomy. | High — read-only, proposes but never changes anything. |
| `tester` | Modified files | Pass/fail report | `Read`, `Bash` (to run `npx vitest run`) | `Write`/`Edit` (must not quietly edit code or loosen an assertion to force a pass), `Glob`/`Grep` (not needed to run the suite it's handed), `WebFetch`/`WebSearch`, `Agent` | Owns test execution only; no write access means a failing test stays a reported failure, not a silently "fixed" one. | Medium — executes code, but bounded to what the test command itself does. |
| `researcher` | A single question, relayed by the orchestrator from the Implementer | Findings + sources | `WebSearch` | `Read`/`Write`/`Edit`/`Glob`/`Grep` (no project file access at all), `WebFetch` (search only, not arbitrary page fetches), `Agent` | Needs outside information only; zero file-system reach means it can't see or touch anything beyond the one question it was asked, and its findings return through the orchestrator rather than landing directly in the Implementer's files. | Medium — invoked ad hoc, only when the Implementer can't resolve something from the codebase or project memory. |
| `orchestrator` | Feature request + repo path, from the human | Final run summary (`docs/run-summary.md`) | `Read` (handoff/result docs), `Write` (handoff briefs + final summary only), `Agent` (to invoke subagents) | `Edit`, `Bash`, `Glob`, `Grep`, `WebFetch`, `WebSearch` — any code-level or research work must be delegated to a subagent, never done directly | If the orchestrator could edit code, run shell commands, or search directly, it would start doing a subagent's job instead of delegating — exactly what its role forbids. | Medium — coordinates the pipeline and evaluates each gate, but pauses for human approval after the Planner. |

Cross-role check:

- `Read` is granted to every role except the Researcher, but it's read-only and carries no mutation risk by itself.
- `Write`/`Edit` together appear on only two roles: the Implementer (the only role that should be changing source files) and the orchestrator (scoped to handoff briefs and the final summary only, never source code).
- `Bash` appears on only one role, the Tester — and only to run the test command, not arbitrary commands.
- `Agent` appears on only the orchestrator, which is what keeps this a single coordinated pipeline instead of subagents spawning their own subagents unsupervised.
- No role is granted `WebFetch`; the Researcher's `WebSearch` grant is the only path to information outside this repo, and even that is routed through the orchestrator rather than called directly by the Implementer.

Alternative considered: letting the Implementer call `WebSearch` directly when it hits a question, instead of routing through the orchestrator to the Researcher. Ruled out because the hop through the orchestrator is what makes a research detour visible in the run summary — a silent, self-served search would leave no trace of what the Implementer looked up or why.

## Memory layer access

Persistent state lives in `.memory/` (see CLAUDE.md's Memory Configuration section), not in a separate storage/retrieval MCP server — there's no `mcp__storage__*` or `mcp__retrieval__*` surface to grant here. Access to each layer is shaped by which native tools a role already holds, not by a separate permission system. `.claude/settings.json` additionally denies `Edit` on `.memory/knowledge/**` and `.memory/reference/**` project-wide, so those two layers stay read-only regardless of what any individual agent definition grants.

| Role | `.memory/project/` (state, decisions) | `.memory/knowledge/` (coding standards, conventions) | `.memory/reference/` | Reason |
| :--- | :--- | :--- | :--- | :--- |
| `planner` | Read only | Read only | Read only | A plan should fit existing conventions and decisions, but the Planner never records anything — persisting a new decision only makes sense once code actually changes. |
| `implementer` | Read, and write new entries under `.memory/project/decisions/` (following the existing template) plus a pointer in `MEMORY_INDEX.md`; updates its own entries in place rather than duplicating | Read only — binding, never proposed as a change | Read only | The only role whose output creates new architectural facts worth recording. CLAUDE.md's Confidential/Secret write policy applies to every write it makes. |
| `reviewer` | Read only | Read only | Read only | Read-only across the whole repo by design, including memory — it checks whether code and decisions line up with convention, it doesn't record anything itself. |
| `tester` | Read only | Read only | Read only | Works from the modified files and the test command it's given; has no reason to consult or write project memory. |
| `researcher` | None | None | None | Operates entirely outside the repo; findings return as text through the orchestrator, never written to a file. |
| `orchestrator` | Read (e.g. `MEMORY_INDEX.md` to orient itself per CLAUDE.md), write only `docs/run-summary.md` | Read only | Read only | Coordinates the run and writes the final summary, but never a source file or a memory entry — those stay with the role whose job they actually are (the Implementer). |

Cross-role check:

- Only `implementer` has write access to `.memory/project/decisions/`, consistent with it being the only role whose work creates new facts worth recording.
- No role has write access to `.memory/knowledge/` or `.memory/reference/` — enforced twice over, once by each agent's own tool grant (none has `Write` pointed at those paths in its instructions) and again by the `Edit` deny rule in `.claude/settings.json`.
- `researcher` is the only role with zero reach into `.memory/` in either direction, matching its job: answer one question from outside, don't touch the repo.

Alternative considered: granting the Reviewer write access to log a "reviewed, no issues" entry to `.memory/project/`. Ruled out — the Reviewer's report already feeds the run summary the orchestrator writes; a separate memory write would duplicate that record and would hand a deliberately read-only role its first write path for no real benefit.
