import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Movie } from "@/data/movies";
import { searchMovies, fetchTrending } from "@/services/tmdb";
import { MovieCard } from "@/components/MovieCard";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, TrendingUp } from "lucide-react";

export default function Search() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<Movie[]>([]);
  const [trending, setTrending] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  // Load trending for the empty state
  useEffect(() => {
    fetchTrending().then((t) => setTrending(t.slice(0, 12))).catch(() => {});
  }, []);

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 350);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch results when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    searchMovies(debouncedQuery)
      .then(setResults)
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  const showTrending = !debouncedQuery.trim();
  const showEmpty = debouncedQuery.trim() && !loading && results.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="pt-20 sm:pt-24 pb-20 px-4 sm:px-6 lg:px-8 container mx-auto min-h-screen"
    >
      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tighter mb-4 text-center">
          ¿Qué quieres ver?
        </h1>
        <div className="relative">
          <SearchIcon className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 sm:w-6 sm:h-6" />
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          )}
          <Input
            type="search"
            placeholder="Busca por título..."
            className="w-full h-12 sm:h-14 pl-10 sm:pl-12 pr-10 text-base sm:text-lg rounded-full border-2 border-border focus-visible:ring-primary focus-visible:border-primary shadow-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            data-testid="input-search"
            autoFocus
          />
        </div>
        {debouncedQuery && !loading && (
          <p className="text-center mt-3 text-sm text-muted-foreground">
            {results.length > 0
              ? `${results.length} resultado${results.length !== 1 ? "s" : ""} para "${debouncedQuery}"`
              : `Sin resultados para "${debouncedQuery}"`}
          </p>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* Trending fallback when empty query */}
        {showTrending && (
          <motion.div
            key="trending"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2 text-foreground/80">
              <TrendingUp className="w-5 h-5 text-primary" /> Tendencias de la semana
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {trending.length > 0
                ? trending.map((movie, i) => <MovieCard key={movie.id} movie={movie} index={i} />)
                : Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </motion.div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4"
          >
            {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
          </motion.div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6"
          >
            {results.map((movie, i) => <MovieCard key={movie.id} movie={movie} index={i} />)}
          </motion.div>
        )}

        {/* Empty state */}
        {showEmpty && (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="text-6xl mb-4 select-none">🎬</div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Sin resultados</h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-md">
              No encontramos películas que coincidan con <span className="font-semibold text-foreground">"{debouncedQuery}"</span>. Intenta con otro título.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
