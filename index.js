import * as helpers from './src/helpers.js';
import { generateWatchlistHtml } from './src/render.js';
import { searchMovies, handleImageError, handleMoreDetailsClick, handleLessDetailsClick } from './src/search.js';
import { initLocalStorageWatchlist, handleWatchlistIconClick, watchlistArray } from './src/watchlist.js';

const searchBarWrapper = document.getElementById('search-bar-wrapper');
const searchForm = document.getElementById('search-form');
const searchBar = document.getElementById('search-bar');

// Check to see if watchlist exists in localStorage and create if it doesn't
initLocalStorageWatchlist();

if (document.getElementById('watchlist-page')) {
  if (watchlistArray.length > 0) {
    generateWatchlistHtml();
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
  else if (event.target.dataset.imdbId) {
    if (event.target.classList.contains('fa-solid')) {
      handleWatchlistIconClick(event.target);
    }
    // MORE DETAILS
    else if (event.target.classList.contains('details-summary')) {
      handleMoreDetailsClick(event.target);
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

document.getElementById('main-wrapper').addEventListener('error', (event) => {
  const brokenImage = event.target;
  if (brokenImage.tagName === "IMG" && brokenImage.classList.contains("thumbnail")) {
    handleImageError(brokenImage);
  }
}, true);
