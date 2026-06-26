export interface Movie {
  id: number;
  title: string;
  year: number;
  rating: number;
  duration: string;
  genre: string;
  synopsis: string;
  poster: string;
  backdrop: string;
  trailerUrl: string;
  featured?: boolean;
}
