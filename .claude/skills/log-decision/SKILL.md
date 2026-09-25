---
name: log-decision
description: Write a decision entry to .memory/project/decisions/ using the project's decision template, then update MEMORY_INDEX.md. Use when the user asks to log, record, or capture a decision we just made in project memory — e.g. "log that decision", "write a decision entry for this", "record this in memory".
tools: Read, Write, Edit, Bash, Glob
permissionMode: inherit
---

Capture a decision that was actually made in this session as a numbered entry in
`.memory/project/decisions/`, then add a matching line to `MEMORY_INDEX.md`.

All paths below are relative to the repo root (`movie-watchlist_with_claude/`).

## Steps

### 1. Pick the entry number

List `.memory/project/decisions/decision-*.md` and read each one, lowest number
first. A file is an **empty stub** if its `**Decision:**`, `**Rationale:**`, and
`**Alternatives rejected:**` fields are all blank.

- If any empty stub exists, use the **lowest-numbered** one and overwrite it in place.
- Otherwise create `decision-00N.md` where N is the highest existing number + 1.
- Never overwrite a filled entry. Never skip a number to avoid a gap.

Say which file you picked and why ("003, 004, 005 are empty stubs — filling 003")
before writing.

### 2. Check for an existing entry on the same topic

Per `CLAUDE.md`'s write policy, read `.memory/project/MEMORY_INDEX.md` first. If
an active entry already covers this topic, update that entry instead of creating
a new one, and tell the user that's what you're doing.

### 3. Write the entry

Use `.memory/project/decisions/decision-template.md` as the shape — but strip the
three instruction lines at the top of that file; they are not part of an entry.
The written file starts at the `# Decision ...` heading.

```markdown
# Decision {NNN} - {Short title, 3-6 words}

**Date:** {today, YYYY-MM-DD}
**Review by:** {today + 90 days, YYYY-MM-DD}
**Status:** Active

**Decision:** {One sentence: what was decided.}

**Rationale:** {Two to three sentences: why. What problem does it solve? What
made this the right choice over the alternatives?}

**Alternatives rejected:** {One to two sentences: what else was considered and
why it was ruled out.}
```

Get both dates from `date +%F` and `date -d '+90 days' +%F` rather than guessing.
Zero-pad the number in the heading and filename (`003`, not `3`).

Optional field, only when it applies — `decision-002.md` is the model for it:

```markdown
**Depends on:** {Config, file layout, or tooling this decision quietly relies on,
and what to re-check if that thing changes.}
```

Match the existing entries' style: hard-wrap the body at ~78 columns, and write
prose, not bullets.

### 4. Content rules

- **Real decisions only.** The entry must describe something actually decided in
  this session, with the real reasoning. If there isn't a real decision to
  record, say so and stop — do not write a placeholder.
- **No secrets.** Never write credentials, API keys, `.env` values, tokens, or
  personal data. Describe the decision without the value ("we authenticate via a
  service account"), and mention that you've done so if the secret was material.
- **Rationale is the point.** Capture what a future session could not infer from
  the repo alone — why, and what was ruled out. A restatement of what the code
  already shows is not enough.
- If the user's stated rationale is thin, write what they gave you verbatim
  rather than inventing a better-sounding justification, then note the gap.

### 5. Show it and get approval

Display the full contents of the written file and ask the user to review and edit.
**Stop here for their response** — do not move on to the index until they've
approved it or told you what to change.

### 6. Update the index

Once the entry is approved, edit `.memory/project/MEMORY_INDEX.md`:

- Append a line under `## Active entries`, after the last `decisions/` line, in
  the existing format:

  ``- `decisions/decision-00N.md` — {One sentence on what it records}. Recorded {date}. Review by {review date}.``

- Set `Last updated:` at the top of the index to today's date.

Then report both files changed. Do not commit — the user handles git.

## Gotcha: em dashes in the index

Index lines use a real em dash (U+2014) as the separator. Do not edit
`MEMORY_INDEX.md` with `perl -CSD` — it double-encodes the dash into `â`.
Use the Edit tool, or `node -e` reading and writing the file as UTF-8. After
editing, confirm the new line's separator matches the existing ones.
