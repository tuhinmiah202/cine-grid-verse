
export interface Movie {
  id: string;
  title: string;
  description: string;
  image: string;
  releaseDate: string;
  isReleased: boolean;
  category: string;
  rating?: number;
}
