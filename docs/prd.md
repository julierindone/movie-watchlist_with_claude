# Product Requirements Document
version: 1.0.1

## Description
Allow user to rate movies they've watched using a 10-star system.

## Trigger
A developer invokes `claude "build feature detailed in docs/prd.md"` from the repo root. The workflow is initiated manually; there is no automated hook. The repository folder must be present and accessible in the working directory when the agent is invoked.

## Actions
1. Read the watchlist.js, normalize.js, and render.js source files to understand how other conditional fields (watched, notes, tags) have been implemented.
2. Update parent node to fit new element:
	1. On the watchlist page, create a div as a new first child inside the div that has class "watchlist-rating" and give it the class `ratings`. 
	2. Move `<p id="rating-{imdbID}">` inside the div, and create a second element, `#user-rating-{imdbID}`. 
	3. Add the userRating field. 
   - If the user has not already rated the film, it should display an empty star icon and the word RATE.
   - If they have already rated the film, a star with their rating should display to its right.
   - Once the user has selected a value from the dropdown, it should hide again and instead of the word "RATE", the rating they chose should be displayed.
   - Dropdown should close when user selects a value toggle is clicked again, or the user clicks outside it. 
3. Add functionality.
	- When user clicks a `user-rating-{imdbID}` element, a dropdown menu appears with integers 1-10, with an empty field being the default.
	- The value should be stored as part of the movie object (just as notes and watched are), with the initial value of `null`.
4. Add `user rating` to sort options - highest to lowest, with unrated movies last.

## Decision Events
- Regardless of whether it has been rated, clicking the element should display the dropdown menu. 
- If the movie already has a user rating and they click it and select a new value, overwrite the existing value rather than creating a duplicate entry, and return to displaying "RATE" next to the star icon.
- If the movie already has a user rating and they click it, there should be a "remove rating" option in the dropdown in addition to the 1-10 values.

## Non-goals / Future plans
- Rating should have simple dropdown. I will make a decision about UI at a later time when I redesign the navigation.

## Acceptance Criteria
- The user can click the RATE input, choose an integer between 1 and 10 (or the blank default field), and then see the rating displayed instead of "RATE".
- The user can change their rating by clicking it and choosing a different number from the dropdown menu, or remove their rating by selecting "remove rating."
- After a movie has been rated, that rating persists and is displayed on the watchlist page.
- Movies on watchlist can sorted by user rating.
- Interactive elements are keyboard-accessible.
