import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Movie } from "@/data/movies";
import { fetchTrending, fetchMoviesByIds } from "@/services/tmdb";
import { useFavorites } from "@/context/FavoritesContext";
import { useRatings } from "@/context/RatingsContext";
import { useAuth } from "@/context/AuthContext";
import { User, Film, Clock, Heart, Star, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function Profile() {
  const { favorites } = useFavorites();
  const { ratings } = useRatings();
  const { user, logOut } = useAuth();
  const { toast } = useToast();

  const [historyMovies, setHistoryMovies] = useState<Movie[]>([]);
  const [favMovies, setFavMovies] = useState<Movie[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const totalRatings = Object.keys(ratings).length;
  const hoursWatched = favorites.length * 2 + totalRatings + 14;
  const avgRating =
    totalRatings > 0
      ? (Object.values(ratings).reduce((a, b) => a + b, 0) / totalRatings).toFixed(1)
      : "—";

  const displayName = user?.displayName ?? user?.email ?? "Usuario StreamFlix";
  const email = user?.email ?? "";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  useEffect(() => {
    setLoadingHistory(true);
    const historyIds = favorites.slice(0, 5);
    const p1 = historyIds.length > 0
      ? fetchMoviesByIds(historyIds)
      : fetchTrending().then((t) => t.slice(0, 5));
    const p2 = favorites.length > 0
      ? fetchMoviesByIds(favorites.slice(0, 5))
      : Promise.resolve([]);

    Promise.all([p1, p2])
      .then(([history, favs]) => {
        setHistoryMovies(history);
        setFavMovies(favs);
      })
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, [favorites]);

  const handleLogout = async () => {
    await logOut();
    toast({ title: "Sesión cerrada", description: "Hasta pronto.", duration: 2500 });
  };

  const progressValues = [72, 45, 88, 31, 60];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="pt-20 sm:pt-24 pb-20 px-4 sm:px-6 lg:px-8 container mx-auto max-w-5xl min-h-screen"
    >
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 mb-10 sm:mb-16">
        <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center shadow-xl shrink-0">
          <span className="text-3xl sm:text-4xl md:text-5xl font-black text-white">{initials}</span>
        </div>

        <div className="text-center sm:text-left flex-1 w-full">
          <h1 className="text-3xl sm:text-4xl font-black mb-1 tracking-tighter" data-testid="text-display-name">
            {displayName}
          </h1>
          {email && (
            <p className="text-muted-foreground text-sm mb-1" data-testid="text-email">{email}</p>
          )}
          <p className="text-muted-foreground text-sm sm:text-base mb-5">Cinéfilo &amp; Fanático del streaming</p>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 max-w-xl mb-5 sm:mb-6">
            {[
              { icon: Heart, value: favorites.length, label: "Favoritos" },
              { icon: Star, value: totalRatings, label: "Calificadas" },
              { icon: Film, value: avgRating, label: "Prom. rating" },
              { icon: Clock, value: `${hoursWatched}h`, label: "Vistas" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="bg-card border border-border p-3 sm:p-4 rounded-xl text-center shadow-sm">
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary mx-auto mb-1 sm:mb-2" />
                <div className="text-xl sm:text-2xl font-bold">{value}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-semibold">{label}</div>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={handleLogout}
            size="sm"
            className="text-destructive border-destructive/40 hover:bg-destructive/10"
            data-testid="button-profile-logout"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar sesión
          </Button>
        </div>
      </div>

      {/* Favorites preview */}
      {favMovies.length > 0 && (
        <div className="mb-10 sm:mb-12">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              Tus favoritos
            </h2>
            <Link href="/favorites">
              <span className="text-sm text-primary font-medium hover:underline cursor-pointer">Ver todos</span>
            </Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
            {favMovies.map((movie) => (
              <Link href={`/movie/${movie.id}`} key={movie.id}>
                <div className="rounded-lg overflow-hidden aspect-[2/3] cursor-pointer hover:opacity-80 transition-opacity">
                  <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Watch History */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 tracking-tight flex items-center gap-2">
          <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          Historial reciente
        </h2>

        {loadingHistory ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl bg-card border border-border">
                <Skeleton className="w-14 sm:w-16 h-20 sm:h-24 rounded-md shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-1.5 w-full mt-4 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {historyMovies.map((movie, i) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-card border border-border shadow-sm hover:border-primary/50 transition-colors"
              >
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-14 sm:w-16 h-20 sm:h-24 object-cover rounded-md shadow-md shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm sm:text-base md:text-lg truncate">{movie.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                    {movie.year} &bull; {movie.genre}
                  </p>
                  <div className="w-full bg-secondary h-1 sm:h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${progressValues[i % 5]}%` }}
                    />
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                    {progressValues[i % 5]}% completado
                  </p>
                </div>
                {ratings[movie.id] && (
                  <div className="flex items-center gap-1 shrink-0">
                    <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-primary text-primary" />
                    <span className="text-xs sm:text-sm font-bold">{ratings[movie.id]}/5</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
