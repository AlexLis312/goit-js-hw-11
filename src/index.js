import './styles.css';
import { fetchImages } from './photos-API.js';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';

import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';

const refs = {
  imageGallery: document.querySelector('.gallery'),
  searchform: document.querySelector('.search-form'),
  input: document.querySelector('input'),
  loadMoreBtn: document.querySelector('.load-more'),
};

let pageNum = 1;
let currentSearch = '';
let isLoading = false;

refs.searchform.addEventListener('submit', async e => {
  e.preventDefault();
  hide(refs.loadMoreBtn);
  pageNum = 1;

  const searchItem = e.currentTarget.elements.searchQuery.value.trim();

  if (!searchItem) {
    Notiflix.Notify.warning('Please enter a search query.');
    return;
  }

  currentSearch = searchItem;

  if (isLoading) return;
  isLoading = true;
  loadImages(currentSearch);
});

refs.loadMoreBtn.addEventListener('click', async () => {
  if (isLoading || !currentSearch) return;

  pageNum += 1;
  hide(refs.loadMoreBtn);

  isLoading = true;
  loadImages(currentSearch);
});

async function loadImages(searchItem) {
  try {
    showLoadingSpinner(refs.loadMoreBtn);
    const data = await fetchImages(searchItem, pageNum);
    processFetchedData(data);
  } catch (error) {
    Notiflix.Notify.failure('Something went wrong. Please try again later.');
    console.error('Error fetching images:', error);
  } finally {
    isLoading = false;
    hideLoadingSpinner(refs.loadMoreBtn);
  }
}

function processFetchedData(data) {
  if (pageNum === 1) {
    clearGallery();
    Notiflix.Notify.info(`Hooray! We found ${data.totalHits} images.`);
  }

  if (data.hits.length === 0) {
    return Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }

  renderImageCards(data.hits);

  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });

  const totalHits = data.totalHits;
  const loadedImages = pageNum * data.hits.length;

  if (loadedImages >= totalHits) {
    hide(refs.loadMoreBtn);
    Notiflix.Notify.info(
      `We're sorry, but you've reached the end of search results.`
    );
  } else {
    show(refs.loadMoreBtn);
  }
}

function renderImageCards(item) {
  const element = createImageMarkup(item);
  refs.imageGallery.insertAdjacentHTML('beforeend', element);

  const lightbox = new SimpleLightbox('.gallery a');
  lightbox.refresh();
}

function show(element) {
  element.classList.remove('is-hidden');
}

function hide(element) {
  element.classList.add('is-hidden');
}

function showLoadingSpinner(element) {
  element.classList.add('is-loading');
}

function hideLoadingSpinner(element) {
  element.classList.remove('is-loading');
}

function createImageMarkup(items) {
  return items
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `
    <div class="photo-card">
    <a href="${largeImageURL}">
  <img src="${webformatURL}" alt="${tags}" loading="lazy" />
  </a>
  <div class="info">
    <p class="info-item"><b>Likes: ${likes}</b></p>  
    <p class="info-item"><b>Views: ${views}</b></p>
    <p class="info-item"><b>Comments: ${comments}</b></p>
    <p class="info-item"><b>Downloads: ${downloads}</b></p>
  </div>
</div>`;
      }
    )
    .join('');
}

function clearGallery() {
  refs.imageGallery.innerHTML = '';
}
