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

### Compaction
Not used. By session end, context usage was at 9% — nowhere close to any compaction threshold for a two-phase, single-small-codebase task — so compaction was never triggered and wasn't manually invoked either.

### Observations

#### What worked
Everything. Phase 1 created the sort feature as directed, after asking for direct permission to touch an html file I hadn't included in the agent's list of allowed files and giving me a rationale as to why it needed it. I hadn't told it to make the user's sort choice persistent, and it didn't try to do it on its own; rather it suggested that it would be wise to store it in the local storage like the watchlist is.

In the boundary, it was to switch over to persistence of sort option, and it updated code that it had written before that rule was changed. 

In Phase 2, it was accidentally told to add a genre filter to the search results rather than watchlist, which is impossible considering that for API calls for fuzzy searches don't include genres (and so it's not written into the original code for them to be in the fuzzy search result objects). It gave 2 options - add to watchlist instead or do a separate exact search for each item, and explained the pros and cons of its opinion, as well as an option to give a different solution.

Throughout the agent was communicative -- it asked clarifying questions throughout, and mentioned it didn't want to "take matters into its own hands" - words taken directly from the agent definition's rules.

The code it wrote was trim, easy to read, and wrote comments that adhered to length and quantity rules.

#### What failed
Nothing. Anything it was unsure about, it asked.

#### Context-management choice to change next time:
The technique plan only placed proactive summaries at the planned phase boundary (end of Phase 1) and session end — it didn't account for a requirement correction arriving *mid-phase* instead of at a planned boundary. That's exactly what happened in Phase 2: the genre-filter location (search-results page vs. watchlist page) turned out to be wrong partway through, once the agent pointed out OMDb's search endpoint doesn't return genre data at all. Next time, I'd add a proactive-summary checkpoint immediately after any mid-phase scope/requirement correction, not only at the phases I planned in advance — real requirement changes don't reliably show up exactly where you scheduled them.

#### Fixes proposed (product-level, not a context-management change):
Will eventually need to be refactored to accommodate database storage instead of local, but I haven't added that yet.

#### Changes made:
- Fix 1 (watchlist.html permission): 54993fb — agent: feature-builder v0.1.1

### Relevant commit SHAs (full run)
- `b9a2e04` (9/17, 13:33) — pre-session plan committed
- `4e6b4ef` (9/17, 17:24) — Phase 1: sort feature (title, date, rating)
- `be86f3d` (9/17, 18:17) — Phase 2: genre filter + persistence fix for sort
- `54993fb` (9/19, 12:30) — agent v0.1.1: watchlist.html added to allowed files (the fix cited above)
- `49b4acb` (9/19, 12:39) — this iteration log and related artifacts committed
