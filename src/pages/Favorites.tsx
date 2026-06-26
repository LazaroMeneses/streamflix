import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Movie } from "@/data/movies";
import { fetchMoviesByIds } from "@/services/tmdb";
import { useFavorites } from "@/context/FavoritesContext";
import { MovieCard } from "@/components/MovieCard";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Heart } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Favorites() {
  const { favorites } = useFavorites();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (favorites.length === 0) { setMovies([]); return; }
    setLoading(true);
    fetchMoviesByIds(favorites)
      .then(setMovies)
      .catch(() => setMovies([]))
      .finally(() => setLoading(false));
  }, [favorites]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="pt-20 sm:pt-24 pb-20 px-4 sm:px-6 lg:px-8 container mx-auto min-h-[80vh]"
    >
      <div className="mb-6 sm:mb-8 flex items-center gap-3">
        <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-primary fill-primary" />
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter">Mis Favoritos</h1>
          {favorites.length > 0 && !loading && (
            <p className="text-muted-foreground text-sm mt-0.5">
              {movies.length} película{movies.length !== 1 ? "s" : ""} guardada{movies.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
          {Array.from({ length: favorites.length || 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
          {movies.map((movie, index) => (
            <MovieCard key={movie.id} movie={movie} index={index} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 sm:py-32 text-center bg-muted/20 rounded-2xl border border-border/50 px-4">
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-muted rounded-full flex items-center justify-center mb-4 sm:mb-6">
            <Heart className="w-8 h-8 sm:w-12 sm:h-12 text-muted-foreground opacity-50" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Aún no tienes favoritos</h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto mb-6 sm:mb-8">
            Explora el catálogo y guarda las películas que más te gusten tocando el corazón.
          </p>
          <Link href="/catalog">
            <Button size="lg" className="font-bold px-6 sm:px-8">
              Explorar catálogo
            </Button>
          </Link>
        </div>
      )}
    </motion.div>
  );
}
