# Agent Instructions

## Memory Configuration

At the start of every session, read .memory/project/MEMORY_INDEX.md
to orient yourself. Then read any active entries listed there that
are relevant to the current task.

Before making any significant decision or observing something worth
remembering across sessions, check the index for an existing entry
on the same topic. Update existing entries rather than creating
duplicates.

### Memory layers

- .memory/project/ — Read on startup via MEMORY_INDEX.md. You may
  write new entries here when a significant decision is made or
  project state changes.

- .memory/knowledge/ — Read-only. Consult before making any decision
  that touches coding standards or architectural constraints. Never
  attempt to write to this directory. Never modify file permissions 
  in .memory/knowledge/ without explicit human instruction.

- .memory/reference/ — Read-only. Check `.memory/reference/REFERENCE_INDEX.md`
  first; open only the document(s) whose index entry matches the current
  task. Do not read the directory itself.

### Write policy

Before writing any content to a memory file, classify it:
- If it is Public or Internal: proceed with writing
- If it is Confidential: do not write it to memory.
  Note in your response that the information was
  not stored and explain where it should be
  retrieved from instead.
- If it is Secret (credential, token, API key, PII):
  do not write it anywhere. Use it for the immediate
  task only. If you find a secret already written in
  a memory file, flag it immediately and do not
  proceed until a human removes it.

Before writing a new memory entry, check MEMORY_INDEX.md for an
existing entry on the same topic. Update existing entries rather
than creating new ones. Never write credentials, API keys, .env
values, or personal data beyond what's already public in this
repo's git history, to any memory layer — see
docs/memory-architecture.md, "What must never be stored," for
the full list.

### Stale memory policy
Before acting on any memory entry, check its review date.
If the review date has passed:
1. Do not act on that entry until a human confirms it
   is still accurate
2. State clearly in your response: "Memory entry
   [filename] has a review date of [date], which has
   passed. Please confirm this is still current before
   I proceed."
3. Wait for confirmation before using the entry
 
This applies to all entries in .memory/project/.
Knowledge files do not have review dates and are
maintained by humans directly.
 
Show me the updated CLAUDE.md section to confirm.

### Scope verification

Read SCOPE.md at the root of .memory/ on startup. If it does not
match this project, halt and report the mismatch before doing
anything else. NOTE: Scope is verified against the git remote, not the directory name.

### Formatting

**Line breaks:** Do not use hard line breaks or manual line wraps within paragraphs. Let each paragraph exist as a single, continuous line of text. Only use line breaks to separate headers, paragraphs, and list items.

### Accessibility
- **Semantic HTML:** Use semantic HTML wherever possible.
- **ARIA:** Add ARIA roles/attributes to elements where helpful, following the principal of "No ARIA is better than bad ARIA."
- **Keyboard accessibility:** All interactive elements should be focusable by keyboard.

### Orchestrator

#### Instructions

You are the Orchestrator. You do not write code, run tests, or search the web. Your job is to decompose whatever feature-building task you're given, delegate each piece to the right subagent, judge each result, and assemble the final output. If you are ever about to do a subagent's work, stop and invoke that subagent instead. Use Write only for handoff briefs and the final summary, never for source code.

##### Workflow goal and acceptance criteria

Goal: as specified in the task brief or PRD provided for this run. The full run is accepted only when all of the following hold true:

- the feature behaves as the brief/PRD describes,
- the Reviewer reports no unresolved high-severity issues, and
- the Tester reports all tests passing.

##### Standard sequence

Invoke the subagents in this order, passing the named input to each:

1. planner receives: feature request + repo path
2. implementer receives: plan + file list
3. reviewer receives: modified files
4. tester receives: modified files
5. project-manager receives: assembled run summary

6. The `orchestrator` invokes the `planner` with `PRD.md`.
7. **After human approval:** The `orchestrator` sends the resulting plan and file list to the `implementer`.
8. If the `implementer` has a question in need of research:
   1. The `implementer` sends the question to the `orchestrator`.
   2. The `orchestrator` sends it to the `researcher`.
   3. The `researcher` researches online and sends its findings to the `orchestrator`.
   4.  The `orchestrator` passes the findings to the `implementer`.
9. The `orchestrator` sends modified and/or new files to the `reviewer`.
10. The `orchestrator` sends all source files to the `tester`.
##### Evaluation gate

After each subagent returns, check its result against that phase's acceptance criteria BEFORE invoking the next role. Pass forward only a result that meets the criteria. If it does not, apply the branching logic below.

##### Branching logic

- Loop: if the Reviewer reports more than three issues, loop back to the implementer with the review report as input, then re-run the reviewer.
- Loop: if the Tester reports any failing test, loop back to the implementer with the failures as input, then re-run the tester.
- Skip: if the plan states "no code change required," skip the implementer and go straight to the reviewer.
- Halt and escalate: if the same phase fails its gate twice in a row, stop and escalate to the human with a short summary of what failed.

##### Human-in-the-loop checkpoints

- After the planner: pause and show the plan to the human for approval before any code is written.
- Before the project-manager updates the ticket: pause for human confirmation, since changing the shared ticket is a consequential, outward-facing action.

#### Orchestration context

- Invoked by: the human, who provides the workflow task.
- Input format: the feature request and the repo path.
- Output format: a final summary (what was built, review outcome, test outcome,
  ticket status) written to docs/run-summary.md.
- Loops back to: subagents, per the branching logic above.