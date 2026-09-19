# Iteration Log

## Run 001 | 09/17/26 | Baseline
- **Agent/Tool used:** feature-builder
- **Task:** Add genre filter and sort (date, a-z, rating) capabilities to watchlist in my movie-watchlist project.

### Rubric Scores:
| Dimension      | Score (1-4) | Notes                                                                                                                                                            |
| -------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accuracy       | 4           | Flagged mistake in phase 2 prompt, which asked for the genre filter to be put on the search result lists instead of the watchlist and how I wanted to handle it. |
| Task Adherence | 4           | Flagged lack of persistence in phase 1 (which i hadn't asked for yet - that was my rule-change) but did not add it without my consent. automatically.            |
| Coherence      | 4           | Updated as requirement for storage changed. Explained all changes and rationales throughout task.                                                                |
| Total          | 12 / 12     | Pass threshold: 3 for all dimensions                                                                                                                             |

### Measurements:
sess in: 2.45M out: 41.7k $: $1.30 | now in: 87.7k out: 879
end time: Thu Sep 17 01:11:24 UTC 2026 (6:17)
- Cycle time: 1:47:22
- Review latency: 28 min
- Cost per run: $1.30 ( 2.45M in / 41.7k out)

### Pass/Fail: Pass

### Observations

#### What worked
Everything. Phase 1 created the sort feature as directed, after asking for direct permission to touch an html file I hadn't included in the agent's list of allowed files and giving me a rationale as to why it needed it. I hadn't told it to make the user's sort choice persistent, and it didn't try to do it on its own; rather it suggested that it would be wise to store it in the local storage like the watchlist is.

In the boundary, it was to switch over to persistence of sort option, and it updated code that it had written before that rule was changed. 

In Phase 2, it was accidentally told to add a genre filter to the search results rather than watchlist, which is impossible considering that for API calls for fuzzy searches don't include genres (and so it's not written into the original code for them to be in the fuzzy search result objects). It gave 2 options - add to watchlist instead or do a separate exact search for each item, and explained the pros and cons of its opinion, as well as an option to give a different solution.

Throughout the agent was communicative -- it asked clarifying questions throughout, and mentioned it didn't want to "take matters into its own hands" - words taken directly from the agent definition's rules.

The code it wrote was trim, easy to read, and wrote comments that adhered to length and quantity rules.

#### What failed
Nothing. Anything it was unsure about, it asked.

#### Fixes proposed:
No fixes, but will eventually need to be refactored to accommodate database storage instead of local, but I haven't added that yet.

#### Changes made:
None - Baseline 
