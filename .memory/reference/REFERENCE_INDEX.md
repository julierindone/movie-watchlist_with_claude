# Reference Index

Last updated: 2026-09-24

## How to use this file

- The agent reads this index, not the directory, to find a document.
- Open a document only when its entry below matches the current task.
- If no entry matches, the answer is "nothing filed" — not "read everything here."

## Entry schema

Each entry, when one exists, has:

- **Title**
- **Path** — relative to `.memory/reference/`
- **Covers** — one line on what's in it
- **Open when** — the situation that makes it relevant
- **Last reviewed**

## Filed documents

(none — see `docs/memory-architecture.md`, Layer 3, for the two candidates considered and rejected, and what would justify filing one for real)

## Review / removal

- A filed document is reviewed when the source it summarizes changes.
- It's removed when the source is gone, or it hasn't been opened in two review cycles.