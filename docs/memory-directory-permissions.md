# Read-only enforcement for `.memory/knowledge/` and `.memory/reference/`

Companion to [memory-architecture.md](./memory-architecture.md), which establishes that
Layer 2 (Knowledge Files) and Layer 3 (Indexed Reference Documents) are human-maintained
and read-only to the agent. This document records **how** that is enforced in this repo,
and why it deviates from the `chmod -R 444` approach given in Module 2 Lesson 3, Step 2 of
the "Try It: Configure the Project Memory Directory" exercise.

## What's configured

**Layer 1 — Claude Code permission rules** (`.claude/settings.json`, checked in):

```json
"deny": [
  "Edit(/.memory/knowledge/**)",
  "Edit(/.memory/reference/**)",
  "Edit(.memory/knowledge/**)",
  "Edit(.memory/reference/**)"
]
```

Both anchor forms are listed deliberately. In a project settings file a leading `/` anchors
to the primary working directory; a bare path anchors to the current directory. They resolve
to the same place from the repo root, and listing both keeps the rule correct if the agent is
started from a subdirectory.

**Layer 2 — filesystem permissions:** directories `555`, files `444` (applied, but see the
caveat below — it is currently a no-op in this environment).

## Why not `chmod -R 444` as the handout specifies

Three independent reasons, in increasing order of how much they matter.

### 1. `444` on a *directory* also blocks reading the files inside it

This is a defect in the handout, independent of any local setup. On Unix a directory's
execute bit is what permits traversal, so removing it makes the directory's contents
unreadable — which contradicts the handout's own stated goal of letting the agent read but
not write. Verified on a native filesystem as a non-root user:

| directory mode | `ls` | `cat` a file inside | `touch` a new file |
| --- | --- | --- | --- |
| `444` (handout) | lists names | **Permission denied** | Permission denied |
| `555` + files `444` | lists names | reads fine | Permission denied |

The handout's verification step only checks that `touch` fails, which it does in both
cases — so the broken variant passes its own test. The correct form is `555` on directories
and `444` on files. That is what this repo applies.

### 2. This repo lives on a Windows drive mounted into WSL2

`/workspace` is `C:\` over 9p/DrvFs. That filesystem stores no Unix permission bits —
directories report `777` no matter what they are chmodded to. The chmod in Layer 2 is
therefore inert here. It is retained because it is correct and will take effect if the repo
is ever moved to a native Linux path.

### 3. Claude Code runs as root (uid 0) in this environment

Root bypasses discretionary access control entirely. Verified on a native filesystem: with a
directory at `444`, a write as a normal user is denied and a write as root succeeds. So even
on a correctly-permissioned native filesystem, filesystem permissions would not stop this
agent. This reason alone defeats the handout's approach regardless of reasons 1 and 2.

### And: Git does not preserve permission bits

Git records only the executable bit, so chmod-based protection does not survive a clone.
A teammate checking out this repo would get ordinary writable directories. `.claude/settings.json`
is a tracked file, so the permission rules do travel with the project. For a shared convention
this matters more than the local file mode.

## Verifying the permission rules

**Permission rules are read at session start. Editing `.claude/settings.json` mid-session does
not affect the running session** — verified on Claude Code v2.1.280, where deny rules added
mid-session were not consulted for either the Write or the Edit tool, in both anchor forms.

To verify, restart Claude Code, then ask the agent to write to the directory. Expect the tool
call to be refused by the permission system, naming the deny rule. `claude doctor` shows the
resolved settings if a rule appears not to load.

**Independently re-verified (2026-11-06), in a different environment than the one above:**
`chmod 555` on `.memory/knowledge/` and `chmod 444` on its files were (re-)applied for
consistency between `coding-standards.md` and `project-conventions.md` (the latter had drifted
to `777`). As expected, the directory itself still reported fully open (`drwxrwxrwx`) after the
chmod — the mount ignores directory mode bits, confirming reason 2 above independent of the
original test. A direct write attempt was then made as root:

```
$ echo "probe-write-..." >> .memory/knowledge/project-conventions.md
Permission to use Bash with command echo "..." >> .memory/knowledge/project-conventions.md has been denied.
```

The write was refused by the permission system before it reached the filesystem — the shell
redirect was caught by the `Edit()` deny rule, exactly as documented in "Known gaps" below. This
is independent confirmation that the rule travels with the repo via `.claude/settings.json` and
holds in an environment other than the one it was originally written and tested in, which is the
actual claim this document makes about why a harness-level rule is the right mechanism for an
agent (version-controlled, environment-independent) where filesystem permissions are not.

## Known gaps

- **`Write(path)` and `NotebookEdit(path)` rules are inert.** Claude Code checks file
  operations against `Edit(path)` and `Read(path)` rules *only*; a path rule written for
  `Write`, `NotebookEdit`, `Glob`, or `MultiEdit` is accepted and then never consulted, and
  warns at startup. `Edit(...)` is the rule that covers the Write tool. This is easy to get
  wrong — the intuitive `Write(.memory/knowledge/**)` silently does nothing.
- **A `Read` deny rule would be stronger but is wrong here.** A `Read` deny also blocks Edit
  and Write on the same path, including creating new files — but it blocks reads too, which
  defeats the purpose. Knowledge files exist to be read.
- **Indirect writes are not covered.** `Edit` deny rules apply to the built-in file tools, to
  file commands Claude Code recognises in Bash (`cat`, `sed`, `tee`, …) and to shell
  redirection targets (`> file`). They do not apply to a script that opens files itself, e.g.
  `node -e "fs.writeFileSync(...)"`. For enforcement against all processes, Claude Code's
  sandbox is the mechanism; a `PreToolUse` hook is the middle option.

## Bottom line

The handout's *design principle* is sound: knowledge and reference are human-maintained, and
the agent should not be able to write to them. Only the enforcement mechanism needed to
change. For an agent, the harness-level permission rule is the more appropriate control
anyway — it is checked before the tool call runs, it is independent of uid and filesystem,
and it is version-controlled with the project.
