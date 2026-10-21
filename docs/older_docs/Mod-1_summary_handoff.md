```markdown
# Module 1 Handoff Summary — Agentic Engineering Course

## About the learner
Julie is a front-end developer (JS/vanilla, learning React/TypeScript), Boeing background, currently job-searching. She's in LaunchCode's AI Adoption pilot cohort. She has ADHD and finds sustained focus difficult, especially when the material itself is poorly written — flag this rather than assume struggle means she's missing something. She knows Git well (used it professionally for 3 years) — do not over-explain basic Git concepts to her. Her actual weak spot is Linux/Docker/WSL mechanics, not Git itself.

**Communication preferences:** plain, direct language, no jargon without explanation, no hollow reassurance. She wants numbered/hierarchical note structures (1.1, 1.1.1) when generating condensed lesson notes — she copies these into Word and applies Styles. **Proactively flag when course material overloads or reuses a term inconsistently** (e.g., "workflow" meaning three different things across lessons; "sandbox" meaning the container, the safety concept, AND the practice repo name) — she's caught several of these herself and finds it validating, not pedantic, when flagged before she hits the confusion.

## Target Codebase
`movie-watchlist_with_claude` — vanilla JS, Vite, Vitest, OMDB API, npm. Course also uses a separate "Sandbox Example" repo for guided walkthroughs (LaunchCodeAgenticEngineer).

## Environment
WSL2 (Ubuntu) on Windows 11. **Hard rule now in place: all Git and Docker work happens in WSL, never PowerShell.** Mixing Windows-Git and WSL-Git on the same repo caused a real worktree corruption incident (Windows-Git writes Windows-style paths into `.git` pointer files, unreadable by WSL). PowerShell is now used only to type `wsl` and switch over.

## Key technical setups completed
- **Custom Dockerfile** for the Target Codebase: based on `node:24-slim` (not the course's `python:3.12-slim` default), with Claude Code, OpenCode, ngrok, and course config files preserved. Baked-in `RUN git config --global user.name/email` and `RUN git config --global --add safe.directory /workspace` so fresh containers don't require manual reconfiguration — **rebuild the image (`docker build`) after any Dockerfile edit, or changes won't take effect.**
- **`.dockerignore`** added (`.env`, `node_modules`, `.git`) as a safety net, though the current Dockerfile has no broad `COPY . .` that would leak them anyway.
- **Git worktrees** used for parallel agent sessions (e.g., `repo-agent-a`, `repo-agent-b`, or Target Codebase equivalents like `target-agent-a`). Always create/manage worktrees from WSL only.

## Critical, hard-won technical lessons (do not relitigate — apply directly)
1. **Worktree containers need the main repo mounted too, not just the worktree.** A worktree's `.git` file is a pointer to `<main-repo>/.git/worktrees/<name>` at an **absolute host path**. If only the worktree is mounted as `/workspace`, any real git command (`status`, `log`, `diff`) fails with `fatal: not a git repository`. Fix: mount the main repo into the container at the *exact* absolute path referenced in the worktree's `.git` file, in addition to mounting the worktree as `/workspace`.
2. **Casing must match exactly** between the host path shown in the WSL prompt and any path used in a `-v` mount or the worktree's `.git` pointer. Windows is case-insensitive; WSL/Linux Git is not always forgiving of mismatches here — this has caused multiple mount failures.
3. **`node_modules` does not carry over between worktrees or into containers via image build.** Each worktree is a separate folder on disk; `node_modules` isn't tracked by Git. Fix now in use: add an anonymous Docker volume (`-v /workspace/node_modules`) to the run command so the container gets its own persistent `node_modules`, independent of the bind-mounted worktree contents overwriting it.
4. **Bind mounts overwrite whatever's baked into the image at that path.** Anything installed at build time (e.g., `npm install` run in the Dockerfile) at `/workspace` gets silently wiped out the moment a bind mount points `-v host:/workspace` — the host folder's contents win.
5. **Git "dubious ownership" error** (`fatal: detected dubious ownership...`) is normal on first use of a mounted directory inside a container running as a different user than the file owner — fixed once via `git config --global --add safe.directory /workspace`, now baked into the image.
6. **CRLF/LF line-ending warnings are expected and harmless** given `core.autocrlf input` is set — Git auto-normalizes to LF on next touch, no action needed.
7. **WSL landing in unexpected directories** (Docker Desktop's internal bind-mount paths) was traced to Windows Terminal's "parent process directory" inheritance when launching `wsl` from an already-open PowerShell session, plus a stray old repo clone that had built up in the WSL home directory. Resolved via `wsl --shutdown` + Docker Desktop restart when it recurs, and keeping the WSL home directory clean.
8. **`--rm` only removes the ephemeral container itself** (its own layer, `/tmp`, etc.) on clean exit — never removes bind-mounted or volume-mounted data. Always type `exit` inside a container rather than closing the terminal window, or `--rm` won't trigger properly and containers pile up.
9. **`claude-auth` volume shared across simultaneous containers can cause mid-session re-authentication** if both are actively polling/writing at once — not fully solved, just something to expect and re-login through if it recurs.

## Course material quality — set expectations accordingly
This course has real, confirmed gaps and inconsistencies (not user error):
- Terminology overload ("workflow," "sandbox" used in 2-3 distinct senses each, undistinguished).
- The Lesson 3 Docker-review example task is likely **unrunnable as written** in the course's own container (no Docker-in-Docker access configured) — Julie hit this directly and handled it correctly by documenting it as an honest baseline failure rather than forcing a fake pass.
- Sequencing errors exist (e.g., an instruction referencing `/status` usage checks placed before any agent session has run).
- Julie has accurately self-diagnosed several of these gaps rather than assuming personal error — validate this pattern, don't second-guess her when she flags something as a course problem rather than her mistake.

## Quality-control artifacts built (repeatable pattern for Module 2)
Julie has authored and committed, for multiple agent workflows: `docs/prd.md` (trigger/decisions/actions/acceptance criteria), `docs/rubric.md` (3 dimensions per workflow, 4-level scoring guides with concrete examples, pass thresholds with alternatives-considered notes), and `docs/iteration-log.md` (baseline run entries with cycle time, cost, rubric scores, honest observations). She finds rubric-writing tedious — offer to draft full rubrics/scoring guides for her when she's fatigued rather than making her write them from scratch each time, as long as she's supplied the dimensions/PRD to build from.

## Resume/job search context
Actively job-searching; resume updated with Module 1 skills (Docker, AI Coding Agents/Claude Code, Sandboxed Dev Environments, WSL2/Linux CLI). Cover letters intentionally avoid mentioning AI directly, framing the same work as containerization/Git/version-control experience instead.
```