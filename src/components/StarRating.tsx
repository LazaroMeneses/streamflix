import { useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useRatings } from "@/context/RatingsContext";
import { useToast } from "@/hooks/use-toast";

interface StarRatingProps {
  movieId: number;
  movieTitle: string;
}

export function StarRating({ movieId, movieTitle }: StarRatingProps) {
  const { getUserRating, rateMovie } = useRatings();
  const { toast } = useToast();
  const userRating = getUserRating(movieId);
  const [hovered, setHovered] = useState<number | null>(null);

  const handleRate = (rating: number) => {
    rateMovie(movieId, rating);
    toast({
      title: "Calificación guardada",
      description: `Calificaste "${movieTitle}" con ${rating} de 5 estrellas.`,
      duration: 2500,
    });
  };

  const active = hovered ?? userRating ?? 0;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold text-foreground/50 uppercase tracking-widest">
        Tu calificación
      </span>
      <div
        className="flex items-center gap-1"
        onMouseLeave={() => setHovered(null)}
        data-testid="star-rating-group"
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleRate(star)}
            onMouseEnter={() => setHovered(star)}
            className="p-0.5 focus:outline-none"
            data-testid={`button-star-${star}`}
            aria-label={`Calificar con ${star} estrella${star !== 1 ? "s" : ""}`}
          >
            <Star
              className={`w-8 h-8 transition-colors duration-150 ${
                star <= active
                  ? "fill-primary text-primary"
                  : "fill-transparent text-foreground/30"
              }`}
            />
          </motion.button>
        ))}
        {userRating !== null && (
          <motion.span
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            className="ml-3 text-sm font-bold text-primary"
          >
            {userRating}/5
          </motion.span>
        )}
      </div>
      {userRating === null && (
        <p className="text-xs text-foreground/40">Toca una estrella para calificar</p>
      )}
    </div>
  );
}
