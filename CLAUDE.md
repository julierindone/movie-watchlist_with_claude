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

Before writing a new memory entry, check MEMORY_INDEX.md for an
existing entry on the same topic. Update existing entries rather
than creating new ones. Never write credentials, API keys, .env
values, or personal data beyond what's already public in this
repo's git history, to any memory layer — see
docs/memory-architecture.md, "What must never be stored," for
the full list.

### Stale memory policy

If a memory entry's review date has passed, flag it in your session
output and ask for human confirmation before acting on it.

### Scope verification

Read SCOPE.md at the root of .memory/ on startup. If it does not
match this project, halt and report the mismatch before doing
anything else. NOTE: Scope is verified against the git remote, not the directory name.

