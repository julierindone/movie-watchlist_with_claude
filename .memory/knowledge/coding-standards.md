# Coding Standards

Last reviewed: 2026-09-23
Maintained by: Julie Rindone

These standards apply to all code in this project. The
agent should consult this file before writing or reviewing
any code. These rules are set by humans and the agent
should never modify this file.

## Descriptive variable names

Names must say what the value is, not what type it is or where it sits in the
file. Single-letter names are permitted only as loop counters.

## Log every data modification

Any file that modifies data must record what it changed and when. A change that
leaves no trace cannot be audited or undone.

## Diagnosable error messages

An error message must carry enough context — the operation, the input, the
expected condition — to diagnose the failure without opening the source. Assume
the reader is looking at a log, not the code.

## No hardcoded file paths

Every path comes from configuration. A literal path in the source breaks the
moment the code runs on a different machine, which in this project it already
does.

## Comment budget

Explanatory comments are limited to two lines of fewer than 25 words each. TODOs
and error documentation are exempt; if an explanation needs more room than that,
the code itself needs the work.
