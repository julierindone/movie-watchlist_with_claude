import * as helpers from './src/helpers.js';
import { searchMovies, handleImageError, handleMoreDetailsClick, handleLessDetailsClick } from './src/search.js';
import {
  initLocalStorageWatchlist,
  handleWatchlistIconClick,
  handleWatchedIconClick,
  handleSortChange,
  getStoredSortPreference,
  handleFilterChange,
  handleWatchedFilterChange,
  getStoredWatchedFilter,
  populateGenreFilterOptions,
  handleNoteChange,
  handleAddTag,
  handleRemoveTag,
  handleTagFilterChange,
  populateTagFilterOptions,
  handleUserRatingChange,
  watchlistArray
} from './src/watchlist.js';

const searchBarWrapper = document.getElementById('search-bar-wrapper');
const searchForm = document.getElementById('search-form');
const searchBar = document.getElementById('search-bar');
const sortSelect = document.getElementById('sort-select');
const genreFilterSelect = document.getElementById('genre-filter-select');
const watchedFilterSelect = document.getElementById('watched-filter-select');
const tagFilterSelect = document.getElementById('tag-filter-select');

// Check to see if watchlist exists in localStorage and create if it doesn't
initLocalStorageWatchlist();

if (document.getElementById('watchlist-page')) {
  if (watchlistArray.length > 0) {
    // Rebuild genre and tag options, then restore the saved sort and watched-filter choices.
    populateGenreFilterOptions();
    populateTagFilterOptions();
    watchedFilterSelect.value = getStoredWatchedFilter();
    sortSelect.value = getStoredSortPreference();
    handleSortChange(sortSelect.value);
  }
  else {
    helpers.getSpaceSaver('watchlist');
  }
}

/* ====================================== */
/* ========== LISTENERS ========== */
/* ====================================== */

// Hides every open user-rating dropdown for which shouldStayOpen returns false.
function hideOpenRatingSelects(shouldStayOpen) {
  document.querySelectorAll('.rating-select').forEach((ratingSelect) => {
    if (!ratingSelect.hidden && !shouldStayOpen(ratingSelect)) {
      ratingSelect.hidden = true;
    }
  });
}

// Opens/closes the rating dropdown for one movie, closing any other open dropdown first.
function handleUserRatingToggleClick(toggleButton) {
  let movieImdbID = toggleButton.dataset.imdbId;
  let ratingSelect = document.getElementById(`rating-select-${movieImdbID}`);
  if (ratingSelect == null) {
    console.error(`handleUserRatingToggleClick failed: no rating-select found for imdbID "${movieImdbID}".`);
    return;
  }

  let wasOpen = !ratingSelect.hidden;
  hideOpenRatingSelects((candidateSelect) => candidateSelect === ratingSelect);
  ratingSelect.hidden = wasOpen;

  if (!ratingSelect.hidden) {
    ratingSelect.focus();
  }
}

document.addEventListener('click', (event) => {
  let userRatingToggle = event.target.closest('.user-rating-toggle');

  if (event.target.id === 'search-bar') {
    searchBarWrapper.classList.toggle('fancy-focus');
  }

  // NOT IN USE; WILL NEED WHEN LIMITING RESULTS TO 5.
  else if (event.target.id === 'more-results-btn') {
    // generateFuzzyResultsHtml();
  }
  // OPEN/CLOSE USER RATING DROPDOWN
  else if (userRatingToggle) {
    handleUserRatingToggleClick(userRatingToggle);
  }
  // ADD TO WATCHLIST
  // TODO: Use regex to simplify condition
  else if (event.target.dataset.imdbId) {
    if (event.target.classList.contains('fa-circle-check') || event.target.classList.contains('fa-circle-plus')) {
      handleWatchlistIconClick(event.target);
    }
    // MARK AS WATCHED
    else if (event.target.classList.contains('fa-eye')) {
      handleWatchedIconClick(event.target);
    }
    // MORE DETAILS
    else if (event.target.classList.contains('details-summary')) {
      handleMoreDetailsClick(event.target);
    }
    // REMOVE A TAG
    else if (event.target.classList.contains('tag-chip-remove')) {
      handleRemoveTag(event.target.dataset.imdbId, event.target.dataset.tag);
    }
    // ADD A TAG (via button)
    else if (event.target.classList.contains('tag-add-btn')) {
      let tagInput = document.getElementById(`tag-input-${event.target.dataset.imdbId}`);
      handleAddTag(event.target.dataset.imdbId, tagInput.value);
    }
  }
  // LESS DETAILS
  else if (event.target.classList.contains('less-details')) {
    handleLessDetailsClick(event.target);
  }

  // CLOSE ANY OPEN USER RATING DROPDOWN NOT OWNED BY THIS CLICK (its own toggle is handled above)
  hideOpenRatingSelects((candidateSelect) => candidateSelect.closest('.ratings').contains(event.target));
});

if (searchBar) {
  searchBar.addEventListener('blur', () => {
    searchBarWrapper.classList.remove('fancy-focus');
  });
}

if (searchForm) {
  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    searchMovies();
  });
}

if (sortSelect) {
  sortSelect.addEventListener('change', () => {
    handleSortChange(sortSelect.value);
  });
}

if (genreFilterSelect) {
  genreFilterSelect.addEventListener('change', () => {
    handleFilterChange(genreFilterSelect.value);
  });
}

if (watchedFilterSelect) {
  watchedFilterSelect.addEventListener('change', () => {
    handleWatchedFilterChange(watchedFilterSelect.value);
  });
}

if (tagFilterSelect) {
  tagFilterSelect.addEventListener('change', () => {
    handleTagFilterChange(tagFilterSelect.value);
  });
}

// SAVE USER RATING ON SELECT (delegated: rating-selects are rebuilt on every render)
document.addEventListener('change', (event) => {
  if (event.target.classList.contains('rating-select')) {
    // Hide immediately; also covers the brief gap before renderHtml() rebuilds it hidden.
    event.target.hidden = true;
    handleUserRatingChange(event.target.dataset.imdbId, event.target.value);
  }
});

// CLOSE RATING DROPDOWN ON BLUR (capturing: blur doesn't bubble), unless focus is moving
// to this select's own toggle button — that click's own handler decides the outcome then.
document.addEventListener('blur', (event) => {
  if (event.target.classList.contains('rating-select')) {
    let ownToggle = document.getElementById(`user-rating-${event.target.dataset.imdbId}`);
    if (event.relatedTarget === ownToggle) {
      return;
    }
    event.target.hidden = true;
  }
}, true);

// ADD TAG ON ENTER (focus stays in the tag input; keydown bubbles unlike blur)
document.addEventListener('keydown', (event) => {
  if (event.target.classList.contains('tag-input') && event.key === 'Enter') {
    event.preventDefault();
    handleAddTag(event.target.dataset.imdbId, event.target.value);
  }
});

document.getElementById('main-wrapper').addEventListener('error', (event) => {
  const brokenImage = event.target;
  if (brokenImage.tagName === "IMG" && brokenImage.classList.contains("thumbnail")) {
    handleImageError(brokenImage);
  }
}, true);

// SAVE NOTE ON BLUR (watchlist page only; focusout bubbles, blur doesn't)
if (document.getElementById('watchlist-page')) {
  document.addEventListener('focusout', (event) => {
    if (event.target.classList.contains('note-input')) {
      handleNoteChange(event.target.dataset.imdbId, event.target.value);
    }
  });
}
