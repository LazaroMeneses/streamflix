import { Movie } from "@/data/movies";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Heart, Star } from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";
import { useRatings } from "@/context/RatingsContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/button";

export function MovieCard({ movie, index = 0 }: { movie: Movie; index?: number }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { getUserRating } = useRatings();
  const { toast } = useToast();
  const userRating = getUserRating(movie.id);
  const favorited = isFavorite(movie.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to movie detail
    toggleFavorite(movie.id);
    toast({
      title: favorited ? "Removed from Favorites" : "Added to Favorites",
      description: `"${movie.title}" has been ${favorited ? "removed from" : "added to"} your favorites.`,
      duration: 3000,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      className="group relative rounded-lg overflow-hidden aspect-[2/3] bg-muted/20"
      data-testid={`card-movie-${movie.id}`}
    >
      <Link href={`/movie/${movie.id}`}>
        <div className="w-full h-full cursor-pointer">
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          
          {/* Default gradient overlay for better text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Hover Content */}
          <div className="absolute inset-0 p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              <h3 className="text-white font-bold text-lg leading-tight line-clamp-2 mb-1">{movie.title}</h3>
              <div className="flex items-center text-white/80 text-xs space-x-2 mb-3">
                <span>{movie.year}</span>
                <span>•</span>
                <span className="flex items-center text-primary font-medium">
                  <Star className="w-3 h-3 mr-1 fill-current" /> {movie.rating}
                </span>
                <span>•</span>
                <span>{movie.genre}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Favorite Button - Top Right */}
      <Button
        variant="ghost"
        size="icon"
        className={`absolute top-2 right-2 rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/50 ${favorited ? 'opacity-100' : ''}`}
        onClick={handleFavoriteClick}
        data-testid={`button-favorite-${movie.id}`}
      >
        <Heart className={`w-5 h-5 transition-colors ${favorited ? "fill-primary text-primary" : "text-white"}`} />
      </Button>

      {/* User Rating Badge - Top Left */}
      {userRating !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-2 left-2 z-10 flex items-center gap-0.5 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full"
          data-testid={`badge-user-rating-${movie.id}`}
        >
          <Star className="w-3 h-3 fill-primary text-primary" />
          <span className="text-white text-xs font-bold">{userRating}/5</span>
        </motion.div>
      )}
    </motion.div>
  );
}
