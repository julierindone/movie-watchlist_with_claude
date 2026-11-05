# Iteration Log

## Run 001 -- 8/22/26 -- Baseline
- **Agent/Tool used:** Claude Code
- **Task:** Estimate current test coverage and identify one area with weak coverage.  
- **Full prompt:** 
  - Run the project's test suite with coverage reporting enabled (e.g., `npx vitest run --coverage`). 
  - Report the overall coverage percentage (lines, branches, functions — whatever the tool provides). 
  - Identify ONE file with the greatest need for test coverage. 
  - Briefly explain why that file is especially in need of test coverage (e.g., it contains complex conditional/branching logic, it handles data persistence or external API calls where silent failures are costly, it's a frequently-modified file with high risk of regressions, it's relied on by many other files, or it contains business-critical logic like watchlist state management). 
  - Do not write or modify any test or source files. 

### Rubric Scores:
| Dimension                   | Score (1-4) | Notes                                                                                                                            |
| --------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Coverage Reporting Accuracy | 3           | Reported percentages (34.73% stmts / 57.44% branch / 51.72% funcs / 31.03% lines, per output_001.md) exactly match the vitest --coverage output. This meets the rubric's level-3 bar ("accurately reports the percentages it produced"), but the agent added no interpretive context beyond the raw numbers (e.g., which metric is weakest and what that implies) — the level-4 bar this run doesn't clear. |
| File Selection Quality      | 4           | Picked a file with high importance that has real flaws                                                                           |
| Justification Consistency   | 4           | Brought up already-identified weaknesses (that would've been caught by tests) and explained potential consequences if not fixed. |
| Total                       | 11 / 12     | Pass threshold: 3 on each — still a pass                                                                                        |

### Measurements:
- Cycle time: 18:24
- Review latency: 16 min
- Cost per run: $0.24 (243.4k in / 3.5k out)

### Pass/Fail: 
Pass

### Observations

#### What worked
The agent did exactly what I told it to do.It explained all decisions and took into account not only the severity of errors that could be caused by a couple of bug I had TODOs written in the file if I do not fix them, when weighing that file's testing need against others. Also, I'd never used the test coverage functionality before, so I checked in afterward to ensure I understood the coverage test results. This slowed down the review process for this run.

#### What failed
I had an issue with an npm package I had to install separately (for some reason) and had to start over.

#### Changes made:
None - Baseline
---

## Run 002 | 8/22/26
- **Task:** Estimate current test coverage and identify one area with weak coverage.  
- **Full prompt:** Estimate current test coverage for this project. - Run the project's test suite with coverage reporting enabled (e.g., `npx vitest run --coverage`). - Report the overall coverage percentage (lines, branches, functions — whatever the tool provides). - Identify ONE file with the greatest need for test coverage. - Briefly explain why that file is especially in need of test coverage (e.g., it contains complex conditional/branching logic, it handles data persistence or external API calls where silent failures are costly, it's a frequently-modified file with high risk of regressions, it's relied on by many other files, or it contains business-critical logic like watchlist state management). - Do not write or modify any test or source files. - Write your output in a markdown file in the docs directory.
- **Agent/Tool used:** Claude Code

### Rubric Scores:
| Dimension                   | Score (1-4) | Notes                                       |
| --------------------------- | ----------- | ------------------------------------------- |
| Coverage Reporting Accuracy | 4           | Percentages matched the tool's output exactly (same figures as Run 001), and the agent added the interpretive context Run 001 lacked: it flagged that src/render.js and src/search.js are never imported by either test file, so v8 doesn't instrument them at all, meaning the 34.73% headline figure overstates real coverage of the src/ directory. That concrete "what this implies" finding, not just a restated percentage, is what clears the level-4 bar here. |
| File Selection Quality      | 4           | Gave 4 legit reasons why it outranks others |
| Justification Consistency   | 4           | Multiple specific examples                  |
| Total                       | 12          | Pass threshold: 3 on each                   |

### Measurements:
- Cycle time: 13min 24sec
- Review latency: 10min
- Cost per run: $0.31 (816.1k in / 4.9k out)

### Pass/Fail:
Pass

### Observations

#### What worked
The markdown output file made comprehension and scoring MUCH easier. The output from the first run was hard to comb through - a poor use of time and brain power.

#### What failed
Honestly, nothing.

#### Changes made:
Asked it to create an output markdown file.

