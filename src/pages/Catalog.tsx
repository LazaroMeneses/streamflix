import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import type { Movie } from "@/data/movies";
import { fetchPopular, fetchDiscoverByGenre, TMDB_GENRES } from "@/services/tmdb";
import { MovieCard } from "@/components/MovieCard";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Film } from "lucide-react";
import { Button } from "@/components/ui/button";

type GenreOption = { id: number | null; name: string };

const GENRES: GenreOption[] = [
  { id: null, name: "Todos" },
  ...TMDB_GENRES,
];

export default function Catalog() {
  const [activeGenre, setActiveGenre] = useState<GenreOption>(GENRES[0]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const loadMovies = useCallback(async (genre: GenreOption, pageNum: number, append: boolean) => {
    try {
      append ? setLoadingMore(true) : setLoading(true);
      const results = genre.id === null
        ? await fetchPopular(pageNum)
        : await fetchDiscoverByGenre(genre.id, pageNum);

      setMovies((prev) => append ? [...prev, ...results] : results);
      setHasMore(results.length >= 20);
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Reset on genre change
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    loadMovies(activeGenre, 1, false);
  }, [activeGenre, loadMovies]);

  // Infinite scroll with IntersectionObserver
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          const next = page + 1;
          setPage(next);
          loadMovies(activeGenre, next, true);
        }
      },
      { rootMargin: "200px" }
    );

    const sentinel = sentinelRef.current;
    if (sentinel) observerRef.current.observe(sentinel);

    return () => observerRef.current?.disconnect();
  }, [hasMore, loadingMore, loading, page, activeGenre, loadMovies]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="pt-20 sm:pt-24 pb-20 container mx-auto px-4 sm:px-6 lg:px-8"
    >
      {/* Header */}
      <div className="mb-5 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-black mb-1 tracking-tighter flex items-center gap-2">
          <Film className="w-7 h-7 text-primary" />
          Catálogo completo
        </h1>
        {!loading && (
          <p className="text-muted-foreground text-sm">
            {movies.length} película{movies.length !== 1 ? "s" : ""}
            {activeGenre.id ? ` de ${activeGenre.name}` : ""}
          </p>
        )}
      </div>

      {/* Genre Filter Pills */}
      <div
        className="flex gap-2 overflow-x-auto pb-3 mb-6 sm:mb-8"
        style={{ scrollbarWidth: "none" }}
      >
        {GENRES.map((genre) => (
          <Button
            key={genre.name}
            variant={activeGenre.name === genre.name ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveGenre(genre)}
            className="flex-none rounded-full px-3 sm:px-4 text-xs sm:text-sm font-semibold"
            data-testid={`button-filter-${genre.name.toLowerCase()}`}
          >
            {genre.name}
          </Button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
          {Array.from({ length: 18 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <motion.div
          key={activeGenre.name}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6"
        >
          {movies.map((movie, index) => (
            <MovieCard key={movie.id} movie={movie} index={index} />
          ))}

          {/* Skeleton tiles while loading more */}
          {loadingMore &&
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={`sk-${i}`} />)}
        </motion.div>
      )}

      {/* Invisible sentinel for IntersectionObserver */}
      <div ref={sentinelRef} className="h-8 mt-4" />

      {/* End of results */}
      {!loading && !hasMore && movies.length > 0 && (
        <p className="text-center text-muted-foreground text-sm mt-4 pb-4">
          Has llegado al final del catálogo
        </p>
      )}
    </motion.div>
  );
}
