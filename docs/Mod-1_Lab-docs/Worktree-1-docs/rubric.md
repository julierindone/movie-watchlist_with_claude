<!-- Worktree 1 -->

# 1. Quality Rubric

## 1.1 Dimensions

### 1.1.1 Coverage Reporting Accuracy
Measures whether the agent's reported coverage percentage matches the actual output of the coverage tool. A high score requires the reported numbers to be real and traceable to the tool's output, not estimated or approximated.

### 1.1.2 File Selection Quality
Measures whether the file chosen as "most in need of coverage" is genuinely the strongest candidate, based on risk factors like complexity, criticality, external dependencies, or how frequently the file is relied on by others.

### 1.1.3 Justification Specificity
Measures how well the agent explains why the selected file needs coverage. A high score requires the justification to reference specific, concrete evidence from the file itself, not generic or vague reasoning.

---
## Alternatives Considered
Considered a single combined "Analysis Quality" dimension covering both file selection and justification together. Ruled out because a file could be correctly selected with a weak justification, or vice versa — collapsing them would hide which half of the reasoning needs improvement.

Considered adding a separate "Scope Compliance" dimension for whether the agent avoided modifying files. Ruled out as a rubric dimension since it's binary (no meaningful gradation between "modified a file" and "didn't") — kept as an acceptance criterion instead.

---

## Scoring Guide

### 1.1.1 Coverage Reporting Accuracy
1. **Does not meet:** The agent reports a coverage percentage without running the coverage tool, or the number contradicts the tool's actual output.  
    **Example:** Agent output: "Coverage is roughly 70%." No coverage command was ever run in the session.
2. **Partially meets:** The agent runs the coverage tool but reports the numbers incompletely or imprecisely (e.g., only line coverage, omitting branch/function coverage the tool also provided).  
    **Example:** Agent output: "Line coverage: 68%." The tool's output also included branch coverage (54%) and function coverage (71%), neither of which is mentioned.
3. **Meets:** The agent runs the coverage tool and accurately reports the percentages it produced.    
    - **Example:** Agent output: "Coverage results: 68% lines, 54% branches, 71% functions, per `vitest run --coverage`."
4. **Exceeds:** The agent reports accurate percentages and adds useful context, such as which coverage metric is weakest and what that implies.  
    - **Example:** Agent output: "Coverage results: 68% lines, 54% branches, 71% functions. Branch coverage is the weakest metric, suggesting many conditional paths are untested even where the surrounding lines are executed."

### 1.1.2 File Selection Quality
1. **Does not meet:** The selected file has little or no real coverage gap, or a file with a clearly larger gap was overlooked.  
    - **Example:** Agent selects a small utility file with 90% coverage while a core file like `watchlist.js` sits at 20% coverage and goes unmentioned.
2. **Partially meets:** The selected file has a real coverage gap, but the agent doesn't compare it against other plausible candidates.  
    - **Example:** Agent selects `fetch.js` (40% coverage) without noting whether other low-coverage files were considered or why this one was chosen over them.
3. **Meets:** The selected file has a genuine, meaningful coverage gap, and the agent's choice is reasonable given the project's structure.  
    - **Example:** Agent selects `fetch.js`, noting it has 40% coverage — the lowest of any file with more than one exported function.
4. **Exceeds:** The selected file has a genuine coverage gap, and the agent explicitly weighs it against at least one other candidate before choosing.  
    - **Example:** Agent selects `fetch.js` over `normalize.js`, noting both have low coverage, but `fetch.js` also handles external API failures — a higher-risk category than `normalize.js`'s pure data-shaping logic.

### 1.1.3 Justification Consistency
1. **Does not meet:** The justification is missing, generic, or unrelated to the actual contents of the file.  
    - **Example:** Agent output: "This file needs more tests because good test coverage is important."
2. **Partially meets:** The justification references the file's general purpose but not specific code paths or risks within it.  
    - **Example:** Agent output: "`fetch.js` handles API calls, so it should be tested more."
3. **Meets:** The justification references specific, concrete risk factors grounded in the file's actual code.  
    - **Example:** Agent output: "`fetch.js` makes external OMDB API calls with no test coverage of the error-handling branch, meaning a failed request could go undetected."
4. **Exceeds:** The justification references specific risk factors and connects them to a concrete, plausible failure scenario.  
    - **Example:** Agent output: "`fetch.js`'s error-handling branch is untested. If OMDB returns a malformed response, `processWatchlistAdd` would receive `undefined` and crash on the next line — a bug already flagged in the file's own TODO comments — yet nothing currently tests this path."

## Pass Threshold
A run passes if it scores 3 or higher on all three dimensions.

**Reasoning:** Coverage Reporting Accuracy must be reliable, since a fabricated number is worse than no number at all. File Selection Quality and Justification Specificity both need to clear a baseline of "genuinely useful" for this analysis to save a developer real time — a technically accurate but poorly justified pick isn't actionable.

## Notes on Threshold Design
Considered an aggregate minimum (e.g., 8/12) instead of a dimension floor. Ruled out because it would let a fabricated coverage number (1 on Coverage Reporting Accuracy) pass if the other two dimensions scored high — an inaccurate percentage undermines the entire report regardless of how well-justified the file selection is.