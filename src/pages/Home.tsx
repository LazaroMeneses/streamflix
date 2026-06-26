import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Movie } from "@/data/movies";
import { fetchTrending, fetchDiscoverByGenre, TMDB_GENRES } from "@/services/tmdb";
import { Hero } from "@/components/Hero";
import { MovieRow } from "@/components/MovieRow";
import { SkeletonCard } from "@/components/SkeletonCard";

type GenreRow = { name: string; movies: Movie[] };

export default function Home() {
  const [hero, setHero] = useState<Movie | null>(null);
  const [rows, setRows] = useState<GenreRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [trending, ...genreResults] = await Promise.all([
          fetchTrending(),
          ...TMDB_GENRES.map((g) => fetchDiscoverByGenre(g.id)),
        ]);

        const featured = trending[0] ? { ...trending[0], featured: true } : null;
        setHero(featured);

        setRows(
          TMDB_GENRES.map((g, i) => ({
            name: g.name,
            movies: genreResults[i] ?? [],
          }))
        );
      } catch (err) {
        console.error("TMDB fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="pb-20"
    >
      {/* Hero */}
      {loading ? (
        <div className="w-full bg-muted/30 animate-pulse" style={{ minHeight: "min(85vh, 700px)" }} />
      ) : hero ? (
        <Hero movie={hero} />
      ) : null}

      {/* Genre Rows */}
      <div className="relative z-20 space-y-2 sm:space-y-6">
        {loading
          ? TMDB_GENRES.map((g) => (
              <div key={g.id} className="py-4 sm:py-6">
                <div className="h-5 w-28 bg-muted/40 rounded animate-pulse mx-4 sm:mx-6 lg:mx-8 mb-4" />
                <div className="flex gap-3 px-4 sm:px-6 lg:px-8 overflow-hidden">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex-none w-[130px] sm:w-[180px]">
                      <SkeletonCard />
                    </div>
                  ))}
                </div>
              </div>
            ))
          : rows.map((row) => (
              <MovieRow key={row.name} title={row.name} movies={row.movies} />
            ))}
      </div>
    </motion.div>
  );
}
