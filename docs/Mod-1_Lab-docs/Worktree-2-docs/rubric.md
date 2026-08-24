<!-- Worktree 2 -->

# 1. Quality Rubric

## 1.1 Dimensions

### 1.1.1 Bug Diagnosis Accuracy
Measures whether the agent correctly understands the actual mechanics of the bug — that the missing return causes movie to be undefined, and that this later throws when passed to addToWatchList. A high score requires the plan to demonstrate accurate understanding of the failure, not just a surface restatement of the TODO comment.

### 1.1.2 Selected Fix Quality
Measures whether the path the agent details is genuinely the strongest choice, based on risk factors like how the function is used by other files or break as more features are added that might rely on it.

### 1.1.3 Justification Specificity
Measures how well the agent explains why the fix it comes up with is the best one. A high score requires the justification to reference specific, concrete evidence from the project itself, not generic or vague reasoning.

---
## Alternatives Considered
{1-2 sentences per alternative structure you considered and ruled out}

---

## Scoring Guide

### 1.1.1 Bug Diagnosis Accuracy
1. **Does not meet:** The plan restates the TODO comment without demonstrating an understanding of why the bug actually causes a failure.
    **Ex:** "There's a missing return statement in the if branch. This should be fixed."
2. **Partially meets:** The plan identifies the missing return but doesn't fully trace the downstream consequence (the crash in addToWatchList).
    **Ex:** "processWatchlistAdd doesn't return a value when the response is False, which is a bug."
3. **Meets:** The plan accurately explains that the missing return causes movie to be undefined, and that this later throws when addToWatchList is called with an undefined value.
    **Ex:** "Because the if (data.Response === 'False') branch has no return, the function implicitly returns undefined. Since movie is reassigned to this undefined value, the following call to addToWatchList(movie, ...) will throw."
4. **Exceeds:** The plan explains the failure mechanism accurately and also identifies related risks, such as other call sites or edge cases affected by the same root cause.
    **Ex:** "...This same implicit-undefined pattern could recur anywhere else in the codebase that calls processWatchlistAdd without checking the return value first, so any future callers should be checked for the same assumption."

### 1.1.2 Selected Fix Quality
1. **Does not meet:** The proposed fix would not actually resolve the bug, or would introduce an equally serious new problem.
    **Ex:** "Wrap the call to addToWatchList in a try/catch so the app doesn't crash." (Doesn't fix the underlying undefined value, just suppresses the symptom.)
2. **Partially meets:** The proposed fix resolves the immediate bug but doesn't consider how the function is used elsewhere or how the fix might interact with future features.
    **Ex:** "Add a return statement in the if branch that returns null." (Fixes the crash, but doesn't consider whether callers expect null vs. some other signal.)
3. **Meets:** The proposed fix resolves the bug and reflects awareness of how the function is currently used elsewhere in the codebase.
    **Ex:** "Add a return statement that returns a clearly-invalid sentinel value (or throws a caught, handled error), consistent with how other failed-lookup cases are handled elsewhere in watchlist.js."
4. **Exceeds:** The proposed fix resolves the bug, reflects current usage, and explicitly considers how the fix will hold up as new features are added.
    **Ex:** "...This approach also keeps the function's contract predictable for any future caller — for example, if a batch-add feature is built later, it can rely on getting a consistent, checkable failure value rather than an unexpected crash."

### 1.1.3 Justification Specificity
1. **Does not meet:** The justification is generic and doesn't reference anything specific to this file or bug.
    **Ex:** "This fix is a good idea because it makes the code more robust."
2. **Partially meets:** The justification references the bug generally but not specific code paths, call sites, or concrete evidence from the project.
    **Ex:** "This fix prevents the crash mentioned in the TODO."
3. **Meets:** The justification references specific, concrete evidence from the actual code — line numbers, function names, or call sites.
    **Ex:** "This fix prevents the crash on line 128, where addToWatchList(movie, ...) is called immediately after movie is reassigned."
4. **Exceeds:** The justification references specific evidence and also explains why the fix won't introduce new problems as the app is built out.
    **Ex:** "This fix prevents the crash on line 128 without changing the function's existing return type in the success case, so no other caller of processWatchlistAdd needs to change — including any future features that call it."

## Pass Threshold
A run passes if it scores: 1.1.1 and 1.1.2 must have 3 or higher. 1.1.3 can pass with a 2.
**Reasoning:** The most important aspects are the accurate diagnosis and proposed fix. Because this a fairly simple repair, the justification doesn't have quite as much importance.

## Notes on Threshold Design
Thought about 3s across the board, but decided that the justification wasn't as important to me as the first 2.
