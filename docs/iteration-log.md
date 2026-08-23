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
| Coverage Reporting Accuracy | 4           |                                                                                                                                  |
| File Selection Quality      | 4           | Picked a file with high importance that has real flaws                                                                           |
| Justification Consistency   | 4           | Brought up already-identified weaknesses (that would've been caught by tests) and explained potential consequences if not fixed. |
| Total                       | 12 / 12     | Pass threshold: 3 on each                                                                                                        |

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
| Coverage Reporting Accuracy | 4           | Numbers matched                             |
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


<!-- TEMPLATE -->
<!-- 
## Run {number} | {date} {| If Baseline, "Baseline"}
- **Task:** {One-sentence description}
- **Full prompt:** {Exact task prompt}
- **Agent/Tool used:** {Agent/Tool}

### Rubric Scores:
| Dimension                   | Score (1-4) | Notes                       |
| --------------------------- | ----------- | --------------------------- |
| Coverage Reporting Accuracy | {Score}     | {Observation}               |
| File Selection Quality      | {Score}     | {Observation}               |
| Justification Consistency   | {Score}     | {Observation}               |
| Total                       | {X / Y}     | Pass threshold: {threshold} |

### Measurements:
- Cycle time: {X min Y sec}
- Review latency: {X min}
- Cost per run: ${X.XX} ({token input} in / {token output} out)

### Pass/Fail: {Pass / Fail}

### Observations

#### What worked
{1-2 sentences about what worked} 

#### What failed
{1-2 sentences about what failed}

#### Changes made:
{what changed since last run}

 -->