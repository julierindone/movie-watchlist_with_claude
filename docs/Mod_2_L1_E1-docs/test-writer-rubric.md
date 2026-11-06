# Quality Rubric: test-writer Agent
v0.1.1

## 1.1 Dimensions

### 1.1.1 Coverage Completeness
Measures whether the agent identified and wrote tests for all functions in the "Needs a test" bucket returned by find-untested-functions, without missing any or scope-creeping into unrelated files.

### 1.1.2 Test Correctness
Measures whether each test actually exercises the function's real logic and behavior, rather than tautological or trivial assertions.

### 1.1.3 Mocking Discipline
Measures whether any fetch/API calls are properly mocked, with zero real network requests made during the test run.

### 1.1.4 Scope Respect
Measures whether the agent respected its boundaries: no edits to non-test files, and new tests only appended to the end of existing test files (not restructuring them).

### 1.1.5 Self-Verification
Measures whether the agent actually ran vitest and accurately reported pass/fail in its summary, rather than assuming success.

---

## Scoring Guide

### Coverage Completeness

**1 — Does not meet:** Agent misses functions clearly flagged as "Needs a test," or writes tests for functions outside the intended scope without flagging why.
> *Example:* find-untested-functions flags 3 functions in search.js as needing tests; agent only writes tests for 1.

**2 — Partially meets:** Agent covers most flagged functions but misses one, or writes tests for functions in an unintended file without a clear reason.
> *Example:* Covers 2 of 3 flagged functions in search.js; the third is silently skipped with no explanation.

**3 — Meets:** Agent writes a test for every function in the "Needs a test" bucket for the target file(s), and doesn't wander into unrelated files.
> *Example:* All 3 flagged functions in search.js get corresponding tests; no other files are touched.

**4 — Exceeds:** All flagged functions are covered, and the agent explicitly notes any "Untestable as-is" or "Covered indirectly" functions it deliberately skipped and why.
> *Example:* Covers all 3 flagged functions, and notes in its summary that a 4th non-exported helper wasn't testable without exporting it first.

---

### Test Correctness

**1 — Does not meet:** Tests contain tautological assertions or don't actually exercise the function's logic.
> *Example:* `expect(mockFetch).toHaveBeenCalled()` with no assertion on the actual return value or behavior.

**2 — Partially meets:** Most tests check real behavior, but at least one test is trivial or checks the mock rather than the function.
> *Example:* 3 of 4 tests correctly verify search.js's output; one just confirms a mock was called with the right args and stops there.

**3 — Meets:** All tests verify actual function behavior — correct output for valid input, correct handling of edge cases — not just that a mock returned what it was told to.
> *Example:* Each test asserts on the actual transformed/returned value from the function under test.

**4 — Exceeds:** Tests are correct and each one is narrowly scoped to a single behavior, clearly named, matching the granularity seen in normalize.test.js.
> *Example:* Separate, clearly-named tests for "returns results for valid search," "returns empty array for no matches," "throws on network failure" rather than one large combined test.

---

### Mocking Discipline

**1 — Does not meet:** Tests make real network calls to the OMDB API.
> *Example:* A test for search.js calls the live OMDB endpoint instead of a mocked fetch.

**2 — Partially meets:** Fetch is mocked in some tests but not consistently — e.g., the happy path is mocked but the failure-case test isn't.
> *Example:* Mock is present for successful search results but the network-failure test accidentally hits the real API.

**3 — Meets:** All fetch/API calls across every new test are mocked; no test makes a real network request.
> *Example:* Every test in the new search.test.js uses a mocked fetch, confirmed by running the suite offline.

**4 — Exceeds:** Mocking is consistent and also covers realistic failure shapes (timeout, malformed JSON, HTTP error status) rather than only the success case.
> *Example:* Mock fetch is configured to simulate both a successful response and a rejected promise, matching real-world OMDB failure modes.

---

### Scope Respect

**1 — Does not meet:** Agent edits a non-test file, or rewrites/reorders an existing test file rather than appending.
> *Example:* Agent modifies search.js itself while "fixing" something it noticed during test writing.

**2 — Partially meets:** No non-test files are touched, but an existing test file is restructured rather than cleanly appended to.
> *Example:* New tests are inserted in the middle of watchlist.test.js instead of appended at the end.

**3 — Meets:** Only test files are touched; new tests are appended to the end of existing files or created fresh for files with no test file yet.
> *Example:* search.test.js is created fresh; new tests in watchlist.test.js are appended after the existing ones.

**4 — Exceeds:** Scope is respected, and the agent explicitly confirms in its summary which files it did and did not touch.
> *Example:* Summary states "Only search.test.js was created/modified. No other files were changed."

---

### Self-Verification

**1 — Does not meet:** Agent claims tests pass without running vitest, or the run actually fails and the agent doesn't report it.
> *Example:* Summary says "all tests pass" but vitest was never invoked.

**2 — Partially meets:** Agent runs vitest but doesn't clearly report the result, or reports it ambiguously.
> *Example:* Agent runs the suite but the summary just says "tests were added" with no pass/fail statement.

**3 — Meets:** Agent runs vitest after writing tests and clearly reports whether they passed or failed.
> *Example:* "Ran vitest: all 4 new tests passed."

**4 — Exceeds:** Agent runs vitest, reports pass/fail clearly, and if anything failed, includes the specific failure output rather than just a pass/fail count.
> *Example:* "3 of 4 new tests passed. 1 failed: expected empty array on no-match, got undefined — see output below."

---

## Pass Threshold

A run is passing if:
1. It scores **3 or higher on all five dimensions**, with a total of **15/20 or higher**.
2. Vitest has been run and tests are passing.

**Reasoning:** Test Correctness and Mocking Discipline are floors — tests that don't check real behavior or that hit live APIs aren't safe to keep regardless of how complete coverage looks. Self-Verification is also a floor, since an agent that doesn't confirm its own output actually works undermines the entire point of automating this task. The aggregate minimum catches a run that clears 3 everywhere but is mediocre overall. *Added after Run 001:* Regardless of score, the tests must be run in order for  to receive a passing grade - the run is worth nothing if the the newly created tests can't be verified.

---

## Alternatives Considered

Considered scoring "number of tests written" as its own dimension. Ruled out — test count says nothing about quality and would reward padding with trivial tests over writing fewer, well-targeted ones already captured by Test Correctness.

Considered folding Scope Respect into Coverage Completeness. Ruled out — an agent can have perfect coverage while still violating file boundaries; these are separate failure modes and conflating them would hide a scope violation behind a high coverage score.