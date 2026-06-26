import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import type { Movie } from "@/data/movies";
import { fetchMovieDetail } from "@/services/tmdb";
import { useFavorites } from "@/context/FavoritesContext";
import { useRatings } from "@/context/RatingsContext";
import { useToast } from "@/hooks/use-toast";
import { Star, Clock, Heart, Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StarRating } from "@/components/StarRating";
import NotFound from "./NotFound";

export default function MovieDetail() {
  const { id } = useParams<{ id: string }>();
  const movieId = parseInt(id || "", 10);

  const [movie, setMovie] = useState<Movie | null | undefined>(undefined);

  const { isFavorite, toggleFavorite } = useFavorites();
  const { getAverageRating } = useRatings();
  const { toast } = useToast();

  useEffect(() => {
    if (!movieId) { setMovie(null); return; }
    setMovie(undefined);
    fetchMovieDetail(movieId).then(setMovie).catch(() => setMovie(null));
  }, [movieId]);

  /* ── Loading ── */
  if (movie === undefined) {
    return (
      <div className="pt-16 pb-20">
        <div className="w-full h-64 sm:h-80 relative">
          <Skeleton className="w-full h-full" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-4">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </div>
    );
  }

  if (movie === null) return <NotFound />;

  const favorited = isFavorite(movie.id);

  const handleFavoriteClick = () => {
    toggleFavorite(movie.id);
    toast({
      title: favorited ? "Eliminado de favoritos" : "Agregado a favoritos",
      description: `"${movie.title}" ha sido ${favorited ? "eliminado de" : "agregado a"} tus favoritos.`,
      duration: 3000,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="pb-20"
    >
      {/* ── Hero / Backdrop Header ── */}
      <div className="relative w-full pt-16 pb-10 sm:pb-14">
        {/* Backdrop (absolute, fills section) */}
        <div className="absolute inset-0 z-0">
          <img
            src={movie.backdrop}
            alt={movie.title}
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Back link */}
          <Link href="/catalog">
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer mb-5 sm:mb-8">
              <ArrowLeft className="w-4 h-4" /> Volver al catálogo
            </span>
          </Link>

          {/* Poster + Details */}
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 items-start">
            {/* Poster */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="w-36 sm:w-52 md:w-64 shrink-0 rounded-xl overflow-hidden shadow-2xl shadow-black/60 border border-white/10"
            >
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full h-auto block"
              />
            </motion.div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex-1 min-w-0"
            >
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-2.5 py-1 bg-primary/20 text-primary border border-primary/40 text-xs font-bold rounded uppercase tracking-wider">
                  {movie.genre}
                </span>
                <span
                  className="flex items-center gap-1 text-foreground/80 text-sm font-medium"
                  data-testid="text-average-rating"
                >
                  <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                  {getAverageRating(movie.id, movie.rating)}
                </span>
                <span className="flex items-center gap-1 text-foreground/70 text-sm">
                  <Calendar className="w-3.5 h-3.5" /> {movie.year}
                </span>
                {movie.duration !== "—" && (
                  <span className="flex items-center gap-1 text-foreground/70 text-sm">
                    <Clock className="w-3.5 h-3.5" /> {movie.duration}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-tight mb-4">
                {movie.title}
              </h1>

              {/* Synopsis */}
              <p className="text-sm sm:text-base text-foreground/75 leading-relaxed max-w-2xl mb-6 sm:mb-8 line-clamp-4 sm:line-clamp-none">
                {movie.synopsis}
              </p>

              {/* Actions */}
              <div className="flex flex-col gap-5">
                <Button
                  size="lg"
                  onClick={handleFavoriteClick}
                  variant={favorited ? "secondary" : "default"}
                  className="w-fit font-bold px-6 sm:px-8 h-11 sm:h-12"
                  data-testid="button-detail-favorite"
                >
                  <Heart
                    className={`w-4 h-4 mr-2 ${favorited ? "fill-current text-primary" : ""}`}
                  />
                  {favorited ? "En favoritos" : "Agregar a favoritos"}
                </Button>

                <StarRating movieId={movie.id} movieTitle={movie.title} />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Trailer ── */}
      {movie.trailerUrl && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-4 sm:mt-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 tracking-tight">Tráiler</h2>
          <div className="aspect-video w-full max-w-4xl rounded-xl overflow-hidden shadow-2xl border border-border/50">
            <iframe
              width="100%"
              height="100%"
              src={movie.trailerUrl}
              title={`${movie.title} Tráiler`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
