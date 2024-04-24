import axios from 'axios';

const apiDomain = 'http://192.168.50.156:5001/artworks/vincent';

export async function fetchArtData(page, pageSize, searchKeyword, hasImage, genreSelected, periodSelected, techniqueSelected) {
  try {
    const response = await axios.get(apiDomain, {
      params: {
        page: page,
        pageSize: pageSize,
        search: searchKeyword,
        hasImage: hasImage,
        genres: genreSelected ? [genreSelected] : [],
        periods: periodSelected ? [periodSelected] : [],
        techniques: techniqueSelected ? [techniqueSelected] : []
      }
    });
    return response.data;
  } catch (error) {
    throw new Error('Error fetching art data');
  }
}

export async function fetchConfigData() {
  try {
    const [genreRes, periodRes, techniques] = await Promise.all([
      axios.get(apiDomain + '/config?cond=genre'),
      axios.get(apiDomain + '/config?cond=period'),
      axios.get(apiDomain + '/config?cond=technique'),
    ]);
    return {
      genres: genreRes.data,
      periods: periodRes.data,
      techniques: techniques.data
    };
  } catch (error) {
    throw new Error('Error fetching config data');
  }
}
