# Iteration Log

**Note on version control:** This rubric and log were originally committed to `docs/rubric.md` / `docs/iteration-log.md` on their real run dates — `7a5dbf3` (8/22, rubric created), `1892a2a` (9/2, scoring guide added, same morning as Run 001), `06c1dcd` (9/3, verification gate added), `e35a744` (9/3, Run 001 entry), `f2b3205` (9/4, Run 002 entry) — and were deleted in `fa76a97` ("Cleared out class-related clutter", 9/23) during an unrelated repo cleanup, along with the Mod 1 Lab docs. They're restored here from that git history, so the commit SHAs above are the real evidence that both existed before testing began, even though this copy's own commit date is later.

## Run 001 | 9/02/26 Baseline
- **Agent/Tool used:** Claude
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
