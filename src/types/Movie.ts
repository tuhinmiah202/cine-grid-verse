
export interface Movie {
  id: string;
  tmdb_id?: number;
  title: string;
  description: string;
  image: string;
  releaseDate: string;
  isReleased: boolean;
  category: string;
  rating?: number;
}

export interface TMDBMovie {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
  vote_average: number;
  media_type: 'movie' | 'tv';
}

export interface TMDBSearchResponse {
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}
