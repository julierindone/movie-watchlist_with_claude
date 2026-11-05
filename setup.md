# Setup

## Commands/paths
- Docker build command: `docker build -t movie-watchlist-agent .`
- Build context: `/mnt/c/programming/automation/agentic_engineer/movie-watchlist_with_claude` (project root, same folder as the Dockerfile), passed as `.` in `docker build -t movie-watchlist-agent .`
- Files copied from the context: 
  - `.claude/skills/`
  - `.claude/agents/`, 
  - `settings.json`
  - `statusline.sh`
  - `docker-entrypoint.sh`
  - `package.json`
  - `package-lock.json`
- Excluded via .dockerignore:
  - .env
  - .git
  - node_modules
- Docker run command: `docker run -it --rm --name movie-agent -v "${PWD}:/workspace" -v movie-watchlist-node_modules:/workspace/node_modules -v "claude-auth:/claude-auth" movie-watchlist-agent`
- Mounted path: `/mnt/c/programming/automation/agentic_engineer/movie-watchlist_with_claude`
- Mount flag: `-v "${PWD}:/workspace"`
- `--name movie-agent`: names the container so it can be targeted by `docker network` commands from a second terminal while it's running (see Network mode below)
- `-v movie-watchlist-node_modules:/workspace/node_modules`: a separate named volume mounted on top of the bind mount, so the container gets its own Linux-native `node_modules` instead of inheriting whatever got installed on my Windows/WSL host. Without this, native binary packages (e.g. Vite's `rolldown` dependency) resolve for the wrong platform and `npm test` fails inside the container. This volume persists across container restarts (`--rm` only removes the container, not named volumes), so `npm install` only needs to be re-run inside the container when a dependency actually changes.

## Network mode:
The container starts attached to Docker's default `bridge` network (no `--network` flag needed for that), but I immediately disconnect it before doing any work, and only reconnect it for the specific moments Claude Code needs to reach Anthropic's API. This is the same container used for the smoke test below — not a separate throwaway one.

### Network Egress Check
From a second terminal, with the named container already running:
`docker network disconnect bridge movie-agent`

Back inside the container:
`curl -v https://example.com --max-time 5`
```
* Could not resolve host: example.com
* Closing connection 0
curl: (6) Could not resolve host: example.com
```

Reconnected from the second terminal only once Claude Code needed to actually run the smoke test below:
`docker network connect bridge movie-agent`

## Smoke-testing  

### 1.  Host-side persistence check
Prompt: Summarize the structure of this repo and write the summary to `/workspace/agent-summary.md`.

```markdown
# Repo Structure Summary

**Project:** `movie-watchlist_with_claude` — a client-side movie search & watchlist app built against the OMDb API.

## Stack
- Vanilla JS (no framework), bundled/served with **Vite**
- **Vitest** (+ `@vitest/coverage-v8`) for testing, with test files colocated next to their source (`fileName.test.js` beside `fileName.js`)
- Plain CSS (no preprocessor), `vanilla-tilt` for card hover effects
- Movie data from the OMDb API (key read from `VITE_OMDB_API_KEY` env var in `.env`)

## Top-level layout
- `index.html` — search page (entry point)
- `watchlist.html` — saved watchlist page
- `index.js` — app bootstrap; wires up DOM listeners (search submit, watchlist/watched icon clicks, notes, tags, user-rating dropdowns, expand/collapse details, broken-image fallback) and initializes the localStorage-backed watchlist
- `assets/` — CSS (`style.css`, `cards.css`, `reset.css`, bundled `all.css`), JS bundle (`all.js`), images, webfonts, and the `vanilla-tilt` library
- `Dockerfile`, `docker-entrypoint.sh` — containerized dev/run setup
- `settings.json`, `statusline.sh` — Claude Code status line config
- `.env` / `.env.example` — OMDb API key config
- `package.json` — `dev` (vite) and `test` (vitest) scripts; deps: `vite`, `vanilla-tilt`; devDeps: `vitest`, `@vitest/coverage-v8`
- `scripts/session-cost.mjs` — standalone script, unrelated to the app runtime
- `coverage/` — generated Vitest coverage report output

## `src/` modules
- **`fetch.js`** — talks to the OMDb API: `fetchExact` (by title), `fetchFuzzy` (search), `fetchFromImdbId` (by IMDb ID), plus `toMovieArray` to normalize single vs. list responses
- **`normalize.js`** — `createMovieObject` maps raw OMDb fields into the app's internal movie shape (title, rating, runtime, thumbnail fallback, etc.)
- **`search.js`** — drives the search page: search type selection, broken-thumbnail handling
- **`watchlist.js`** — the largest module; owns all localStorage-backed state: add/remove, watched-status toggle, notes, tags (add/remove + tag filter), user rating (1–10, sortable), sort preference, genre/watched/tag filters, and legacy-item field backfill
- **`render.js`** — builds HTML strings/DOM for search results, watchlist cards, ratings, user-rating dropdown, notes, tag chips, and error/empty states
- **`helpers.js`** — shared utilities: `resetAll`, `getSpaceSaver` (empty/error messaging), `escapeHtml` (sanitizes user-typed text before `innerHTML` use), `getStoredPreference`/`setStoredPreference`, `toggleMainSection`

Every `src/` file except `search.js` has a matching `*.test.js` file.

## Flow
1. `index.js` initializes the watchlist from localStorage and sets up event listeners.
2. On the search page, submitting the search form uses `fetch.js` to query OMDb, `normalize.js` to shape the data, and `render.js` to display cards.
3. Clicking a card's watchlist/watched icon, editing a note, adding/removing a tag, or setting a user rating all route through `watchlist.js`, which persists the change to `localStorage`.
4. `watchlist.html` reads the (optionally sorted/filtered) watchlist array and renders it via `render.js`, or shows an empty-state message via `helpers.js` if nothing is saved.

## Claude Code / agent configuration (`.claude/`)
- `agents/` — subagent definitions: `orchestrator`, `planner`, `implementer`, `reviewer`, `tester`, `researcher`, `feature-builder`, `test-writer`, `test-repair`
- `skills/` — `find-untested-functions`, `log-decision`
- `settings.json` / `settings.local.json` — permissions and tool config

## Project memory (`.memory/`)
- `SCOPE.md` — declares this directory belongs to `julierindone/movie-watchlist_with_claude`, verified against the git remote
- `project/` — read/write working memory: `MEMORY_INDEX.md` (index), `current-state.md` (shipped/deferred features, open questions), `decisions/decision-00N.md` (8 recorded decisions, e.g. boolean watched field, colocated tests, notes field, tag filtering, user-rating UI)
- `knowledge/` — read-only, human-maintained: `coding-standards.md`, `project-conventions.md`
- `reference/` — read-only pointers, indexed via `REFERENCE_INDEX.md`

## `docs/`
- `prd.md` — product requirements
- `memory-architecture.md`, `memory-directory-permissions.md` — design docs for the `.memory/` system
- `iteration-log.md`, `course-text-errata.md`, `feature-builder-quality-rubric.md`, `orchestration-diagram.md`/`.png`, `routing-and-tool-grant-map.md`/`.json` — process/course documentation
- `_Notes-context-for-claude-helping-with-class-assignments/`, `_Notes-failed-exercise-bullshit/`, `older_docs/` — course-assignment working notes and archives
```
#### Confirmed on host after container exit:
`ls -la agent-summary.md`
output: `-rwxrwxrwx 1 node node 4696 Nov  5 20:15 agent-summary.md`

### 2. Prompt: Run the test command and summarize its findings.

Re-run today (Nov 5) in the same named container used for the network check, after fixing a Windows/Linux native-binary platform mismatch by adding the `movie-watchlist-node_modules` volume (see Commands/paths above) and running `npm install` once inside the container:

```
> movie-watchlist_with_claude@1.0.0 test
> vitest run


 RUN  v5.0.1 /workspace

 ✓ src/normalize.test.js (3 tests) 8ms
 ✓ src/fetch.test.js (18 tests) 17ms
 ✓ src/helpers.test.js (20 tests) 20ms
 ✓ src/render.test.js (30 tests) 19ms
 ✓ src/search.test.js (16 tests) 150ms
stdout | src/watchlist.test.js > initLocalStorageWatchlist > loads an existing, valid watchlist from localStorage into watchlistArray for a normal startup
Backfilled notes/tags/userRating on 2 legacy watchlist item(s) at 2026-11-05T20:43:57.987Z.

stderr | src/watchlist.test.js > handleAddTag > shows the space-saver error state and does not persist when no watchlist item matches the imdbID
handleAddTag failed: no watchlist item found for imdbID "tt9999999".

stderr | src/watchlist.test.js > handleRemoveTag > shows the space-saver error state and does not persist when no watchlist item matches the imdbID
handleRemoveTag failed: no watchlist item found for imdbID "tt9999999".

stderr | src/watchlist.test.js > handleRemoveTag > shows the space-saver error state without throwing for invalid input (missing imdbID and tag entirely)
handleRemoveTag failed: no watchlist item found for imdbID "undefined".

stdout | src/watchlist.test.js > handleUserRatingChange > clears the rating to null when the "remove" sentinel value is submitted
User rating updated to "null" for imdbID "tt0098258" at 2026-11-05T20:43:58.021Z.

stdout | src/watchlist.test.js > handleUserRatingChange > clears the rating to null when the blank ("") sentinel value is submitted
User rating updated to "null" for imdbID "tt0098258" at 2026-11-05T20:43:58.022Z.

 ✓ src/watchlist.test.js (88 tests) 43ms

 Test Files  6 passed (6)
      Tests  175 passed (175)
   Start at  20:43:57
   Duration  764ms (transform 58%, import 30%, tests 10%, worker 2%)
```

All tests pass: 6 test files, 175 tests, 0 failures. The `stderr` lines are expected console output from negative-path tests (confirming the app logs and bails out cleanly when an item isn't found), not test failures.


### 3.  Filesystem containment check
Before exiting, inside the container, I ran `ls /mnt/c/Users`.  
output: `ls: cannot access '/mnt/c/Users': No such file or directory`

## Security decisions

### Why did you mount only this folder?
The agent only needs this codebase to do its job. Explicitly excluded: my SSH keys (`~/.ssh`), cloud credential folders (e.g. AWS/gcloud config), my home directory, and my other project repos — none of those paths appear anywhere in the run command, so the agent has no way to reach them.

### What is `claude-auth` and why is it separate from /workspace?
`claude-auth` is a separate named Docker volume (`-v "claude-auth:/claude-auth"`), not part of the project bind mount. It persists Claude Code's login/session across container restarts so I don't have to re-authenticate every run. Keeping it separate from `/workspace` means rotating or deleting my Claude Code credentials never touches my project files, and vice versa.

### What did you choose to keep ephemeral?
Nothing beyond the container's own default filesystem layer. Because the container runs with `--rm`, anything written outside `/workspace` and the `claude-auth` volume — temp files, caches, OS state — is destroyed the moment the container exits. If I add caching or generate temp files later, those would go in `/tmp` for the same reason: it's container-only and disappears with the container.

### What did you choose to persist?
My source code, .env, and package.json persist in /workspace via the bind mount. node_modules persists separately, in its own named volume (movie-watchlist-node_modules) — see the next question for why.

### What is the movie-watchlist-node_modules volume and why is it separate from /workspace?
It's a named Docker volume mounted on top of the project bind mount at /workspace/node_modules, so the container gets its own Linux-native node_modules instead of inheriting whatever got installed on my Windows/WSL host. Without it, native binary packages (e.g. Vite's rolldown dependency) resolve for the wrong platform and npm test fails inside the container with a "cannot find native binding" error. Like claude-auth, it survives --rm because named volumes aren't removed with the container, so npm install only needs to be re-run when a dependency actually changes.

### What dependencies did you include in your extended Docker image?
#### Build-time:
- Base: node:24-slim (gives you Node + npm out of the box)
- System packages via apt-get: curl, git, bash, ca-certificates, nano, procps
- Claude Code (@anthropic-ai/claude-code, installed globally via npm)
  - NOTE: Only Claude Code is installed since it's the only agent tool I'm actually using for this project.
- Claude Code config files (settings.json, statusline.sh) and the entrypoint script
	
#### Installed with *npm install* inside the movie-watchlist-node_modules volume (not baked into the image, since the bind mount would overwrite it anyway):
- vite
- vitest
- vanilla-tilt


### What did your smoke test prove?
1. The summary creator showed my full repo is accessible and the code is decipherable by the agent.
2. By running vitest, I can see that the dependencies are installed correctly, and that the functions in my movie object creation module are working correctly.
3. Confirming `agent-summary.md` on the host after exiting the container (see Smoke-testing section above) proved the mount is read/write in both directions — the agent's output actually lands on my machine, not just inside the container's ephemeral layer.
4. Running `ls /mnt/c/Users` from inside the container and getting "No such file or directory" proved the reverse: host paths outside the project folder are not visible to the agent at all. Since only `/workspace` and the `claude-auth` volume are mounted, there is no host location the agent could have written to even if it tried — any write outside `/workspace` would only exist in the container's own disposable filesystem layer, which is destroyed on exit.

### What risks remain?
1. My API key is still visible to the agent inside my `.env` file.
2. The agent has full read/write access to everything in my repo, so if it deleted or overwrote something, the damage would exist on my host, too.
3. Egress is now blocked by default and only connected when Claude Code needs it, but it's a blunt on/off switch, not a scoped allowlist — once connected, the agent can reach anywhere, not just Anthropic's API. A real allowlist (only Anthropic, npm, and OMDb reachable) is still future work.
4. `claude-auth` isn't encrypted, so other containers could use my stored login.
5. I could do a poor job at reviewing code written by claude.
6. `npm install` could install a dependency's dependency that is harmful.


