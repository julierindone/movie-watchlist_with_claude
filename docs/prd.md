# Product Requirements Document
## Description
Estimate current test coverage and identify one area with weak coverage.

## Trigger
A developer prompts Claude from the repo root: 
Estimate current test coverage for this project. 
- Run the project's test suite with coverage reporting enabled (e.g., `npx vitest run --coverage`). 
- Report the overall coverage percentage (lines, branches, functions — whatever the tool provides). 
- Identify ONE file with the greatest need for test coverage. 
- Briefly explain why that file is especially in need of test coverage (e.g., it contains complex conditional/branching logic, it handles data persistence or external API calls where silent failures are costly, it's a frequently-modified file with high risk of regressions, it's relied on by many other files, or it contains business-critical logic like watchlist state management). 
- Do not write or modify any test files. 
- Do not modify any source files.

## Decision Events
- If multiple files lack coverage, the agent must choose which single file is most in need, based on factors like complexity, criticality (e.g., data persistence, external API calls), or how frequently the file is relied on by others.

## Actions
1. Run the test suite with coverage reporting enabled (e.g., `npx vitest run --coverage`).
2. Capture the coverage report output (line, branch, and function percentages).
3. Review the coverage report to identify all files with low or no test coverage.
4. Evaluate candidate files against risk factors (complexity, criticality, external dependencies, frequency of reliance by other files).
5. Select the single file most in need of coverage.
6. Write a brief explanation of why that file was selected.
7. Report the overall coverage percentage and the selected file with its justification.

## Acceptance Criteria
The agent reports an overall coverage percentage that matches the actual output of the coverage tool (not an estimate or approximation).
- The agent selects exactly one file and provides a justification that references a specific, concrete factor (e.g., complexity, criticality, external dependencies) rather than a vague statement.
- The agent does not write or modify any test or source files.
