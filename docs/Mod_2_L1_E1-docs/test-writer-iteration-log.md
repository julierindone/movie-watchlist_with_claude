# Iteration Log

**Note on version control:** The assignment's submission form only has upload fields for the Agent Definition and this Iteration Log — there is no separate field for the rubric. Since the grader can only see what's uploaded, the full rubric is included at the bottom of this file (see "Rubric (test-writer Agent)") rather than left in its own file with no way to actually reach the grader.

**Commit timeline (all verifiable in local git history):**
| When (Pacific) | Commit | What |
|---|---|---|
| 9/1 17:52 | `cb7d057` | Agent definition v0.1.0 created — **before Run 001** |
| 9/2 14:13 | `32b2b24` | `permissionMode: acceptEdits` — still before Run 001 |
| 9/2 17:10 | — | **Run 001 executed** |
| 9/3 13:23 | `0c48f88` | `permissionMode: bypassPermissions`; `.claude/settings.json` created, first time `Bash(npx vitest run:*)` became an enforced restriction (it did not exist during Run 001) |
| 9/3 16:34 | `06c1dcd` | Rubric: added the "vitest must run" pass gate |
| 9/3 16:47 | `7301b50` | Dockerfile: re-added `RUN npm install` (later determined not to be the actual fix — see Run 001's "Changes made") |
| 9/4 11:44 | — | **Run 002 executed** |
| 9/4 13:25 | `5c36cc2` | Agent definition v0.1.1 — mock-diversity rule added, untested as of Run 002 |

The rubric itself has its own separate, real commit history predating both runs: created `7a5dbf3` (8/22), scoring guide added `1892a2a` (9/2, the same morning as Run 001), verification gate added `06c1dcd` (9/3, shown above). The iteration log entries below were committed as `e35a744` (Run 001, 9/3) and `f2b3205` (Run 002, 9/4). All of this — rubric, log, and the agent-definition commits above — was deleted in `fa76a97` ("Cleared out class-related clutter", 9/23) during an unrelated repo cleanup, along with the Mod 1 Lab docs, and is restored here from git history; the SHAs above are real evidence of the pre-testing timeline even though this copy's own commit date is later.

## Run 001 | 9/02/26 Baseline
- **Agent/Tool used:** Claude
- **Agent version/commit in effect:** v0.1.0 @ `32b2b24` (`permissionMode: acceptEdits`; no `.claude/settings.json` yet — Bash was not yet restricted by a hard permission at this point)
- **Task:** Scan the repo for untested Javascript functions, invoke vitest to create tests, and then run all tests.  

### Rubric Scores:
| Dimension             | Score (1-4) | Notes                                                                                                                                                                                                                                                                                                                                |
| --------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Coverage Completeness | 3           | All 3 tests written; no "Untestable as-is" or "Covered indirectly" to mention.                                                                                                                                                                                                                                                       |
| Test Correctness      | 4           | 1 small issue - getSpaceSaver test 3 inferred intent from a comment I made to myself in helpers.js as a truth and instead of just looking at observable behavior. My function *was* needed and does what it's supposed to; the test name just misrepresents it.                                                                      |
| Mocking Discipline    | 4           | No API calls; various error types covered                                                                                                                                                                                                                                                                                            |
| Scope Respect         | 3           | No explicit summary of what it did/did not touch, but it stayed in scope and listed what it had changed (just created test file).                                                                                                                                                                                                    |
| Self-Verification     | 4           | Attempted to run tests; vitest couldn't run at all. The agent's own summary (`run_001_output.md`) correctly diagnosed the actual cause rather than just reporting a generic failure, and this gated the run to Fail regardless of the 4 here — see Pass Threshold rule added after this run. |
| Total                 | 18 / 20     | Pass threshold: 3+ each                                                                                                                                                                                                                                                                                                              |

### Measurements:
- Cycle time: 5min 25sec
- Review latency: 57min
- Cost per run: $1.03 (2,402,275 in / 27,210 out) — recovered from the raw session transcript (`session1.jsonl`, since deleted and restored from git history); the figure previously recorded here had the input/output numbers swapped and the output-token digits garbled.

### Pass/Fail: Fail

### Observations:

#### What worked:
- The skill accurately found and reported the list of functions needing testing to the agent. 
- Tests created were thorough and aligned to existing conventions.
- The agent's summary correctly self-diagnosed the real cause of the verification failure (see `run_001_output.md`): `node_modules/@rolldown` only contained the `win32-x64-msvc` binding, because this container's `node_modules` had been bind-mounted in from the Windows host rather than installed fresh inside the Linux container — the same root cause later fixed properly in Module 1 with a dedicated named volume for `node_modules`. The agent confirmed this wasn't caused by its own changes by re-running an untouched, previously-passing test file and getting the identical startup error.

#### What failed:
- Wasn't able to use vitest, so verification was not complete. 
- Although the run passed the rubric categories, it failed due to not being able to verify that the tests actually *work.* This drove up the cycle time and the token spend due to troubleshooting the vitest issue.

### Fixes proposed:
- Fix the node_modules platform mismatch so vitest can actually run in this container.

#### Changes made:
- Fix 1 (Added test verification req to rubric): 06c1dcd — rubric v0.1.1
- Fix 2 (Added npm install to Dockerfile): 7301b50 - Dockerfile
  - **Correction (added on resubmission):** this fix didn't actually address the real cause above. My docker run command at the time bind-mounted the whole project directory (`-v "${PWD}:/workspace"`), so the Windows-built `node_modules` on my host would have overlaid whatever `RUN npm install` baked into the image regardless of whether that line existed. Run 002 passing vitest likely came from something else in my setup at the time (possibly running `npm install` manually inside the container before that run), not from this Dockerfile change — I don't have a saved log of exactly what I did differently. The real, durable fix for this class of bug is the named `node_modules` volume documented in `setup.md` from Module 1.

**Also worth mentioning:** I've decided the requirement for a *4* on coverage completeness to include a run-down of all untestable functions would be an unnecessary token drain and clutter up the summary without much value; it would be cumulative on every run as the project grows. Would be better to check occasionally as a prompt or skill; doesn't need to be included here. I'm leaving it on the rubric for now since not a high priority change, and it's poor practice to change the rubric after testing has begun.

---
---

## Run 002 | 09/04/26
- **Agent/Tool used:** Claude
- **Agent version/commit in effect:** v0.1.0 @ `0c48f88` (`permissionMode: bypassPermissions`; `.claude/settings.json` now scopes Bash to `Bash(npx vitest run:*)` only — the mock-diversity revision, `5c36cc2`, came after this run and was not active for it)
- **Task:** Scan the repo for untested Javascript functions, invoke vitest to create tests, and then run all tests.  

### Rubric Scores:
| Dimension             | Score (1-4) | Notes                                                                                                   |
| --------------------- | ----------- | ------------------------------------------------------------------------------------------------------- |
| Coverage Completeness | 3           | Created needed tests in partially covered files; created test file for all testable search.js functions |
| Test Correctness      | 4           | Full coverage, narrow scope, descriptive naming                                                         |
| Mocking Discipline    | 3           | All calls mocked, 0 real requests. Not a 4 because every failure case is the same shape.                |
| Scope Respect         | 4           | Verified via git dif that only test files needing coverage were touched, and new content was appended.  |
| Self-Verification     | 4           | All passed; gave test count for new vs preexisting tests.                                               |
| Total                 | 18 / 20     | Pass threshold: 3 on each                                                                               |

### Measurements:
- Cycle time: 5min 57sec
- Review latency: 44min
  - NOTE: I'm not familiar with testing and there were a lot of new tests, so the review took a long time despite the assistance of another agent.
- Cost per run: $1.09 (2,025,828 in / 40,167 out)

### Pass/Fail: 
Pass

### Observations

#### What worked:
- The vitest tests worked!  
- My new session-cost script saved time and math.

#### What failed:
1 Minor issue: all calls were mocked, although the mocking lacked realistic failure-shape diversity, not addressing some types of failures.

#### Fixes proposed:
Agent: Add requirement for mocking to mimic realistic failure-shape diversity.

#### Changes made:
*Change made, but not tested:*
- Fix 1 (needs diverse failure shapes): 5c36cc2 — agent: test-writer.md v0.1.1

---
---

## Rubric (test-writer Agent)

*Included here in full — see the version-control note at the top of this file for why: the assignment has no separate upload field for a rubric, so this is copied verbatim from `test-writer-rubric.md` (itself created `7a5dbf3` 8/22, scoring guide added `1892a2a` 9/2, verification gate added `06c1dcd` 9/3 — all before or on the day of Run 001, well before Run 002).*

# Quality Rubric: test-writer Agent
v0.1.1

### 1.1 Dimensions

#### 1.1.1 Coverage Completeness
Measures whether the agent identified and wrote tests for all functions in the "Needs a test" bucket returned by find-untested-functions, without missing any or scope-creeping into unrelated files.

#### 1.1.2 Test Correctness
Measures whether each test actually exercises the function's real logic and behavior, rather than tautological or trivial assertions.

#### 1.1.3 Mocking Discipline
Measures whether any fetch/API calls are properly mocked, with zero real network requests made during the test run.

#### 1.1.4 Scope Respect
Measures whether the agent respected its boundaries: no edits to non-test files, and new tests only appended to the end of existing test files (not restructuring them).

#### 1.1.5 Self-Verification
Measures whether the agent actually ran vitest and accurately reported pass/fail in its summary, rather than assuming success.

---

### Scoring Guide

#### Coverage Completeness

**1 — Does not meet:** Agent misses functions clearly flagged as "Needs a test," or writes tests for functions outside the intended scope without flagging why.
> *Example:* find-untested-functions flags 3 functions in search.js as needing tests; agent only writes tests for 1.

**2 — Partially meets:** Agent covers most flagged functions but misses one, or writes tests for functions in an unintended file without a clear reason.
> *Example:* Covers 2 of 3 flagged functions in search.js; the third is silently skipped with no explanation.

**3 — Meets:** Agent writes a test for every function in the "Needs a test" bucket for the target file(s), and doesn't wander into unrelated files.
> *Example:* All 3 flagged functions in search.js get corresponding tests; no other files are touched.

**4 — Exceeds:** All flagged functions are covered, and the agent explicitly notes any "Untestable as-is" or "Covered indirectly" functions it deliberately skipped and why.
> *Example:* Covers all 3 flagged functions, and notes in its summary that a 4th non-exported helper wasn't testable without exporting it first.

---

#### Test Correctness

**1 — Does not meet:** Tests contain tautological assertions or don't actually exercise the function's logic.
> *Example:* `expect(mockFetch).toHaveBeenCalled()` with no assertion on the actual return value or behavior.

**2 — Partially meets:** Most tests check real behavior, but at least one test is trivial or checks the mock rather than the function.
> *Example:* 3 of 4 tests correctly verify search.js's output; one just confirms a mock was called with the right args and stops there.

**3 — Meets:** All tests verify actual function behavior — correct output for valid input, correct handling of edge cases — not just that a mock returned what it was told to.
> *Example:* Each test asserts on the actual transformed/returned value from the function under test.

**4 — Exceeds:** Tests are correct and each one is narrowly scoped to a single behavior, clearly named, matching the granularity seen in normalize.test.js.
> *Example:* Separate, clearly-named tests for "returns results for valid search," "returns empty array for no matches," "throws on network failure" rather than one large combined test.

---

#### Mocking Discipline

**1 — Does not meet:** Tests make real network calls to the OMDB API.
> *Example:* A test for search.js calls the live OMDB endpoint instead of a mocked fetch.

**2 — Partially meets:** Fetch is mocked in some tests but not consistently — e.g., the happy path is mocked but the failure-case test isn't.
> *Example:* Mock is present for successful search results but the network-failure test accidentally hits the real API.

**3 — Meets:** All fetch/API calls across every new test are mocked; no test makes a real network request.
> *Example:* Every test in the new search.test.js uses a mocked fetch, confirmed by running the suite offline.

**4 — Exceeds:** Mocking is consistent and also covers realistic failure shapes (timeout, malformed JSON, HTTP error status) rather than only the success case.
> *Example:* Mock fetch is configured to simulate both a successful response and a rejected promise, matching real-world OMDB failure modes.

---

#### Scope Respect

**1 — Does not meet:** Agent edits a non-test file, or rewrites/reorders an existing test file rather than appending.
> *Example:* Agent modifies search.js itself while "fixing" something it noticed during test writing.

**2 — Partially meets:** No non-test files are touched, but an existing test file is restructured rather than cleanly appended to.
> *Example:* New tests are inserted in the middle of watchlist.test.js instead of appended at the end.

**3 — Meets:** Only test files are touched; new tests are appended to the end of existing files or created fresh for files with no test file yet.
> *Example:* search.test.js is created fresh; new tests in watchlist.test.js are appended after the existing ones.

**4 — Exceeds:** Scope is respected, and the agent explicitly confirms in its summary which files it did and did not touch.
> *Example:* Summary states "Only search.test.js was created/modified. No other files were changed."

---

#### Self-Verification

**1 — Does not meet:** Agent claims tests pass without running vitest, or the run actually fails and the agent doesn't report it.
> *Example:* Summary says "all tests pass" but vitest was never invoked.

**2 — Partially meets:** Agent runs vitest but doesn't clearly report the result, or reports it ambiguously.
> *Example:* Agent runs the suite but the summary just says "tests were added" with no pass/fail statement.

**3 — Meets:** Agent runs vitest after writing tests and clearly reports whether they passed or failed.
> *Example:* "Ran vitest: all 4 new tests passed."

**4 — Exceeds:** Agent runs vitest, reports pass/fail clearly, and if anything failed, includes the specific failure output rather than just a pass/fail count.
> *Example:* "3 of 4 new tests passed. 1 failed: expected empty array on no-match, got undefined — see output below."

---

### Pass Threshold

A run is passing if:
1. It scores **3 or higher on all five dimensions**, with a total of **15/20 or higher**. *(Original rule, in place before Run 001.)*
2. Vitest has been run and tests are passing. *(Added after Run 001, via `06c1dcd` on 9/3, before Run 002 — applied retroactively to Run 001 because an unverified run shouldn't pass regardless of when the gate was written down. Under rule 1 alone, Run 001's 18/20 would have passed; rule 2 is why it's marked Fail.)*

**Reasoning:** Test Correctness and Mocking Discipline are floors — tests that don't check real behavior or that hit live APIs aren't safe to keep regardless of how complete coverage looks. Self-Verification is also a floor, since an agent that doesn't confirm its own output actually works undermines the entire point of automating this task. The aggregate minimum catches a run that clears 3 everywhere but is mediocre overall.

---

### Alternatives Considered

Considered scoring "number of tests written" as its own dimension. Ruled out — test count says nothing about quality and would reward padding with trivial tests over writing fewer, well-targeted ones already captured by Test Correctness.

Considered folding Scope Respect into Coverage Completeness. Ruled out — an agent can have perfect coverage while still violating file boundaries; these are separate failure modes and conflating them would hide a scope violation behind a high coverage score.
