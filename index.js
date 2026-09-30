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

document.addEventListener('click', (event) => {
  if (event.target.id === 'search-bar') {
    searchBarWrapper.classList.toggle('fancy-focus');
  }

  // NOT IN USE; WILL NEED WHEN LIMITING RESULTS TO 5.
  else if (event.target.id === 'more-results-btn') {
    // generateFuzzyResultsHtml();
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
  else {
    return;
  }
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
