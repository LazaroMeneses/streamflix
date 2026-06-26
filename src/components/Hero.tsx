import { Movie } from "@/data/movies";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Play, Info, Star } from "lucide-react";
import { Button } from "./ui/button";

export function Hero({ movie }: { movie: Movie }) {
  if (!movie) return null;

  return (
    <div
      className="relative w-full flex items-end overflow-hidden bg-black"
      style={{ minHeight: "min(88vh, 720px)" }}
    >
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={movie.backdrop}
          alt={movie.title}
          className="w-full h-full object-cover opacity-70"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/30" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pt-20 pb-10 sm:pb-16 lg:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-xl"
        >
          {/* Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4"
          >
            <span className="px-2.5 py-1 bg-primary text-primary-foreground text-[10px] sm:text-xs font-bold rounded uppercase tracking-wider">
              Destacada
            </span>
            <span className="text-white/80 text-xs sm:text-sm font-medium">{movie.genre}</span>
            <span className="flex items-center text-primary text-xs sm:text-sm font-bold">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1 fill-current" /> {movie.rating}
            </span>
            <span className="text-white/80 text-xs sm:text-sm">{movie.year}</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-3 sm:mb-4 leading-tight tracking-tighter"
          >
            {movie.title}
          </motion.h1>

          {/* Synopsis */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="text-sm sm:text-base md:text-lg text-white/80 mb-6 sm:mb-8 line-clamp-2 sm:line-clamp-3 leading-relaxed"
          >
            {movie.synopsis}
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="flex flex-wrap gap-3"
          >
            <Link href={`/movie/${movie.id}`}>
              <Button
                size="lg"
                className="text-sm sm:text-base h-10 sm:h-12 px-5 sm:px-8 font-bold gap-2"
                data-testid="button-hero-watch"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                Ver ahora
              </Button>
            </Link>
            <Link href={`/movie/${movie.id}`}>
              <Button
                size="lg"
                variant="outline"
                className="text-sm sm:text-base h-10 sm:h-12 px-5 sm:px-8 font-bold gap-2 bg-black/30 border-white/30 text-white hover:bg-white hover:text-black transition-colors"
                data-testid="button-hero-info"
              >
                <Info className="w-4 h-4 sm:w-5 sm:h-5" />
                Más info
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
