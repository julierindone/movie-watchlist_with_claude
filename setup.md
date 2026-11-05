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
- Docker run command: `docker run -it --rm -v "${PWD}:/workspace" -v "claude-auth:/claude-auth" movie-watchlist-agent`
- Mounted path: `/mnt/c/programming/automation/agentic_engineer/movie-watchlist_with_claude`
- Mount flag: `-v "${PWD}:/workspace"`

## Network mode:
My day-to-day container still runs without `--network none` (because Claude Code needs live internet to reach Anthropic's API), but I verified the blocking mechanism works, and a scoped allowlist is listed as future work.

### Network Egress Check
`docker run --rm --network none movie-watchlist-agent bash -c "curl -v https://example.com --max-time 5"`

```bash
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0* Could not resolve host: example.com
* Closing connection 0
curl: (6) Could not resolve host: example.com
```

## Smoke-testing  

### 1.  Host-side persistence check
Prompt: Summarize the structure of this repo and write the summary to `/workspace/agent-summary.md`.

```markdown      
# Repo Structure Summary

**Project:** `movie-watchlist_with_claude` — a client-side movie search & watchlist app built against the OMDb API.

## Stack
- Vanilla JS (no framework), bundled/served with **Vite**
- **Vitest** for testing
- Plain CSS (no preprocessor), `vanilla-tilt` for card hover effects
- Movie data from the OMDb API (key read from `VITE_OMDB_API_KEY` env var)

## Top-level layout
- `index.html` — search page (entry point)
- `watchlist.html` — saved watchlist page
- `index.js` — app bootstrap; wires up DOM listeners (search submit, watchlist icon clicks, expand/collapse details, broken-image fallback) and initializes localStorage-backed watchlist
- `assets/` — CSS (`style.css`, `cards.css`, `reset.css`, bundled `all.css`), JS bundle (`all.js`), images, webfonts, and the `vanilla-tilt` library
- `Dockerfile`, `dockerfile_orig`, `docker-entrypoint.sh` — containerized dev/run setup
- `settings.json`, `statusline.sh` — Claude Code project config (status line script)
- `.env` / `.env.example` — OMDb API key config
- `package.json` — `dev` (vite) and `test` (vitest) scripts; deps: `vite`, `vanilla-tilt`; devDep: `vitest`

## `src/` modules
- **`fetch.js`** — talks to the OMDb API: `fetchExact` (by title), `fetchFuzzy` (search), `fetchFromImdbId` (by IMDb ID), plus `toMovieArray` to normalize single vs. list responses
- **`normalize.js`** — `createMovieObject` maps raw OMDb fields into the app's internal movie shape (title, rating, runtime, thumbnail fallback, etc.); has a companion test file `normalize.test.js`
- **`search.js`** — drives the search page: runs searches, renders results, handles "more/less details" expansion and broken thumbnail images
- **`watchlist.js`** — manages the watchlist stored in `localStorage`: init, add/remove via icon click, and the in-memory `watchlistArray`
- **`render.js`** — builds HTML strings/DOM for movie cards, watchlist items, and error states (no-match, fetch failure, etc.)
- **`helpers.js`** — shared UI utilities: `resetAll`, `getSpaceSaver` (empty/error state messaging), `toggleMainSection`

## Flow
1. `index.js` initializes the watchlist from localStorage and sets up event listeners.
2. On the search page, submitting the search form calls `search.js`, which uses `fetch.js` to query OMDb, `normalize.js` to shape the data, and `render.js` to display cards.
3. Clicking a card's watchlist icon calls into `watchlist.js`, which persists the change to `localStorage`.
4. The watchlist page (`watchlist.html`) reads `watchlistArray` and renders it via `render.js`, or shows an empty-state message via `helpers.js` if nothing is saved.
```
#### Confirmed on host after container exit:
`ls -la agent-summary.md`  
output: `-rwxrwxrwx 1 node node 2650 Nov  4 23:35 agent-summary.md`

### 2. Prompt: Run the test command and summarize its findings.  

    ● I'll check the repo structure to find how tests are configured, then run them.
    ● Bash(ls -la /workspace | head -50)
      ⎿  total 92
        drwxrwxrwx 1 node node   512 Aug  5 00:18 .
        drwxr-xr-x 1 root root  4096 Aug  5 00:07 ..
        drwxrwxrwx 1 node node   512 Aug  5 00:00 .claude
        -rwxrwxrwx 1 node node    26 Aug  2 22:06 .env
        -rwxrwxrwx 1 node node    31 Aug  2 22:08 .env.example
        drwxrwxrwx 1 node node   512 Aug  3 21:17 .git
        -rwxrwxrwx 1 node node    32 Aug  3 21:16 .gitignore
        -rwxrwxrwx 1 node node  1340 Aug  4 22:38 Dockerfile
        -rwxrwxrwx 1 node node  2650 Aug  4 23:59 agent-summary.md
        drwxrwxrwx 1 node node   512 Jul 30 20:40 assets
        -rwxrwxrwx 1 node node  1406 Aug  4 22:42 docker-entrypoint.sh
        -rwxrwxrwx 1 node node  2110 Jul 30 20:40 index.html
        -rwxrwxrwx 1 node node  2258 Jul 30 22:42 index.js
        drwxrwxrwx 1 node node   512 Aug  4 23:04 node_modules
        -rwxrwxrwx 1 node node 42793 Aug  4 23:04 package-lock.json
        -rwxrwxrwx 1 node node   710 Jul 30 22:59 package.json
        -rwxrwxrwx 1 node node   124 Aug  4 00:13 settings.json
        -rwxrwxrwx 1 node node  4313 Aug  5 00:32 setup.md
        drwxrwxrwx 1 node node   512 Aug  5 00:18 src
        -rwxrwxrwx 1 node node  5456 Aug  4 00:13 statusline.sh
        -rwxrwxrwx 1 node node  1448 Jul 30 20:40 watchlist.html

    ● Read(/workspace/package.json)
      ⎿  Read 30 lines

                                                                            12:32 AM claude-sonnet-5
    ● The test command is npm test (vitest run). Running it now.

    ● Bash(npm test 2>&1)
      ⎿  > movie-watchlist_with_claude@1.0.0 test
        > vitest run

          RUN  v4.1.10 /workspace

          Test Files  1 passed (1)
              Tests  2 passed (2)
            Start at  00:32:51
            Duration  4.35s (transform 115ms, setup 0ms, import 448ms, tests 3ms, environment 0ms)

                                                                            12:32 AM claude-sonnet-5
    ● All tests pass: npm test (vitest run) found 1 test file with 2 tests, both passing, in 4.35s.

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
My source code, .env, package.json, and node_modules persist in /workspace. 

### What dependencies did you include in your extended Docker image?
#### Build-time:
- Base: node:24-slim (gives you Node + npm out of the box)
- System packages via apt-get: curl, git, bash, ca-certificates, nano, procps
- Claude Code (@anthropic-ai/claude-code, installed globally via npm)
  - NOTE: Only Claude Code is installed since it's the only agent tool I'm actually using for this project.
- Claude Code config files (settings.json, statusline.sh) and the entrypoint script
	
#### Installed with *npm install* at container runtime:
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
3. The agent has more outbound internet access than it needs - I need to restrict egress.
4. `claude-auth` isn't encrypted, so other containers could use my stored login.
5. I could do a poor job at reviewing code written by claude.
6. `npm install` could install a dependency's dependency that is harmful.


