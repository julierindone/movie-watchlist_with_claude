# Context-Management Technique Plan

*Mod 2 · Lesson 2 · Exercise 1*

## Technique 1: Explicit Context Boundaries

**Where:** At the transition between Phase 1 (sorting) and Phase 2 (filtering).

**What gets stated at that boundary:** Phase 1 is closed; the new persistence
requirement and what it means for existing code; Phase 2's scope; which
standing rules still apply.

**Why:** This is the specific moment the exercise is designed to test —
whether the agent updates earlier work under a new constraint, or just bolts
new behavior on top. Stating the boundary explicitly (rather than letting it
happen implicitly) is what makes that observable.

---

## Technique 2: Proactive Summarization

**Where:** Immediately after Phase 1, before the boundary message — and again
at the very end of Phase 2.

**What it must preserve:** what was built, where the relevant state lives,
decisions made along the way, anything unresolved.

**Why:** Requesting this *before* introducing the requirement change creates a
clean "before" record. If the agent's later work contradicts its own summary,
that's direct evidence for the Accuracy/Coherence scores — no guessing needed.

---

## Technique 3: Compaction

**Stance:** Not planned proactively. This task is small enough (two phases,
one small codebase) that the context window is unlikely to fill up.

**Why:** Forcing compaction where it isn't needed would just add noise to
observe. If the session runs long and Claude Code auto-compacts, note when it
happened in `session-notes.md` — that's still useful data, just not something
to engineer on purpose here.