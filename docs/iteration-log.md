# Iteration Log

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
| Self-Verification     | 4           | Attempted to run tests, but there was a problem with the node_modules having been mounted in instead of being installed for linux. It gave clear instructions for fixing this, but found a spot where I need a gate for passing the run - even though  it explained why it couldn't run the tests, they still haven't been verified. |
| Total                 | 18 / 20     | Pass threshold: 3+ each                                                                                                                                                                                                                                                                                                              |

### Measurements:
- Cycle time: 5min 25sec
- Review latency: 57min
- Cost per run: ${X.XX} (27,210 in / 2,402,27532 out)

### Pass/Fail: Fail

### Observations:

#### What worked:
- The skill accurately found and reported the list of functions needing testing to the agent. 
- Tests created were thorough and aligned to existing conventions.
- Summary accurately described the work it did and suggested a fix for the node problem that sunk the attempt at verification.

#### What failed:
- Wasn't able to use vitest, so verification was not complete. 
- Although the run passed the rubric categories, it failed due to not being able to verify that the tests actually *work.* This drove up the cycle time and the token spend due to troubleshooting the vitest issue.

### Fixes proposed:
- Fix issue with node packages - verification

#### Changes made:
- Fix 1 (Added test verification req to rubric): 06c1dcd — rubric v0.1.1
- Fix 2 (Added npm install to Dockerfile): 7301b50 - Dockerfile

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
Pending
