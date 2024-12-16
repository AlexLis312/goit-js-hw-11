import axios from 'axios';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '47350680-86d30b4f2bd951cf6c4e0d295';

export const fetchImages = async function (query, page, per_page = 40) {
  const options = {
    key: API_KEY,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: 'true',
    q: query,
    page,
    per_page,
  };

  try {
    const response = await axios.get(BASE_URL, { params: options });
    return response.data;
  } catch (error) {
    throw new Error('Error fetching images');
  }
};
