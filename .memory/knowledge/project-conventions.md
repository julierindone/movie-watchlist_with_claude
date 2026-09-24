# Project Conventions

Last reviewed: 2026-09-24
Maintained by: Julie Rindone

Stable architectural rules for this project — separate from `coding-standards.md`'s style rules. Human-set; the agent should never modify this file.

## Per-item state is a boolean field, not a parallel array

New per-item states (watched, favorited, etc.) are added as boolean fields directly on the watchlist item object, not as separate arrays kept in sync with the main list. Established by `decisions/decision-001.md`; this generalizes it to every future toggle-style feature.

## Vanilla JavaScript only

No frameworks, no build step. The project stays plain JS/HTML/CSS.

## No CSS edits without explicit consent

Do not modify files in `assets/css/` unless the human grants it in that prompt.       

## Remind, don't chain, for test coverage

At the end of a feature task, remind the human to run the `test-writer` agent. Don't invoke another agent automatically — chaining specialized agents is unreliable in this setup.