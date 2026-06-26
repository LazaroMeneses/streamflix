import type { Movie } from "@/data/movies";

const BASE = "https://api.themoviedb.org/3";
const TOKEN = import.meta.env.VITE_TMDB_TOKEN;
const HEADERS = { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" };

export const IMG = {
  poster: (path: string | null) =>
    path ? `https://image.tmdb.org/t/p/w500${path}` : "https://picsum.photos/seed/noposter/300/450",
  backdrop: (path: string | null) =>
    path ? `https://image.tmdb.org/t/p/original${path}` : "https://picsum.photos/seed/nobackdrop/1920/1080",
};

export const TMDB_GENRES: { id: number; name: string }[] = [
  { id: 28,  name: "Acción" },
  { id: 878, name: "Ciencia Ficción" },
  { id: 27,  name: "Terror" },
  { id: 35,  name: "Comedia" },
  { id: 18,  name: "Drama" },
  { id: 16,  name: "Animación" },
];

const GENRE_LABEL: Record<number, string> = {
  28: "Acción", 12: "Aventura", 16: "Animación", 35: "Comedia",
  80: "Crimen", 99: "Documental", 18: "Drama", 10751: "Familiar",
  14: "Fantasía", 36: "Historia", 27: "Terror", 10402: "Música",
  9648: "Misterio", 10749: "Romance", 878: "Ciencia Ficción",
  10770: "TV Movie", 53: "Suspense", 10752: "Guerra", 37: "Western",
};

interface TMDBListItem {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

interface TMDBDetail {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  runtime: number | null;
  genres: { id: number; name: string }[];
}

interface TMDBVideo {
  key: string;
  site: string;
  type: string;
  official: boolean;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: HEADERS });
  if (!res.ok) throw new Error(`TMDB ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

function mapListItem(m: TMDBListItem): Movie {
  const firstGenre = m.genre_ids?.[0];
  return {
    id: m.id,
    title: m.title,
    year: m.release_date ? new Date(m.release_date).getFullYear() : 0,
    rating: Math.round(m.vote_average * 10) / 10,
    duration: "—",
    genre: firstGenre ? (GENRE_LABEL[firstGenre] ?? "Película") : "Película",
    synopsis: m.overview || "Sin descripción disponible.",
    poster: IMG.poster(m.poster_path),
    backdrop: IMG.backdrop(m.backdrop_path),
    trailerUrl: "",
    featured: false,
  };
}

function formatRuntime(minutes: number | null): string {
  if (!minutes) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export async function fetchTrending(page = 1): Promise<Movie[]> {
  const data = await get<{ results: TMDBListItem[] }>(
    `/trending/movie/week?language=en-US&page=${page}`
  );
  return data.results.map(mapListItem);
}

export async function fetchPopular(page = 1): Promise<Movie[]> {
  const data = await get<{ results: TMDBListItem[] }>(
    `/movie/popular?language=en-US&page=${page}`
  );
  return data.results.map(mapListItem);
}

export async function fetchDiscoverByGenre(genreId: number, page = 1): Promise<Movie[]> {
  const data = await get<{ results: TMDBListItem[] }>(
    `/discover/movie?language=en-US&with_genres=${genreId}&sort_by=popularity.desc&page=${page}`
  );
  return data.results.map(mapListItem);
}

export async function fetchMovieDetail(id: number): Promise<Movie | null> {
  try {
    const [detail, videos] = await Promise.all([
      get<TMDBDetail>(`/movie/${id}?language=en-US`),
      get<{ results: TMDBVideo[] }>(`/movie/${id}/videos?language=en-US`),
    ]);

    const trailer =
      videos.results.find((v) => v.type === "Trailer" && v.site === "YouTube" && v.official) ??
      videos.results.find((v) => v.type === "Trailer" && v.site === "YouTube") ??
      videos.results.find((v) => v.site === "YouTube");

    return {
      id: detail.id,
      title: detail.title,
      year: detail.release_date ? new Date(detail.release_date).getFullYear() : 0,
      rating: Math.round(detail.vote_average * 10) / 10,
      duration: formatRuntime(detail.runtime),
      genre: detail.genres?.[0]?.name ?? "Película",
      synopsis: detail.overview || "Sin descripción disponible.",
      poster: IMG.poster(detail.poster_path),
      backdrop: IMG.backdrop(detail.backdrop_path),
      trailerUrl: trailer ? `https://www.youtube.com/embed/${trailer.key}` : "",
      featured: false,
    };
  } catch {
    return null;
  }
}

export async function searchMovies(query: string): Promise<Movie[]> {
  if (!query.trim()) return [];
  const data = await get<{ results: TMDBListItem[] }>(
    `/search/movie?language=en-US&query=${encodeURIComponent(query)}&page=1`
  );
  return data.results.map(mapListItem);
}

export async function fetchMoviesByIds(ids: number[]): Promise<Movie[]> {
  if (ids.length === 0) return [];
  const results = await Promise.allSettled(ids.map((id) => fetchMovieDetail(id)));
  return results
    .filter((r): r is PromiseFulfilledResult<Movie> => r.status === "fulfilled" && r.value !== null)
    .map((r) => r.value);
}
