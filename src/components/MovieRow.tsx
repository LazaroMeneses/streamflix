import { Movie } from "@/data/movies";
import { MovieCard } from "./MovieCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "./ui/button";

interface MovieRowProps {
  title: string;
  movies: Movie[];
}

export function MovieRow({ title, movies }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo =
        direction === "left"
          ? scrollLeft - clientWidth + 100
          : scrollLeft + clientWidth - 100;
      rowRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  const onScroll = () => {
    if (rowRef.current) {
      setIsScrolled(rowRef.current.scrollLeft > 0);
    }
  };

  if (movies.length === 0) return null;

  return (
    <div className="py-4 sm:py-6 relative group">
      <h2 className="text-base sm:text-xl font-bold mb-3 sm:mb-4 px-4 sm:px-6 lg:px-8 tracking-tight">
        {title}
      </h2>

      <div className="relative">
        {/* Left Arrow — desktop only */}
        {isScrolled && (
          <div className="hidden sm:flex absolute top-0 bottom-0 left-0 z-10 w-14 lg:w-16 bg-gradient-to-r from-background to-transparent items-center justify-start opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="ml-2 bg-background/80 hover:bg-background rounded-full shadow-lg w-9 h-9"
              onClick={() => handleScroll("left")}
              data-testid={`button-scroll-left-${title.toLowerCase()}`}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Scroll Container */}
        <div
          ref={rowRef}
          onScroll={onScroll}
          className="flex space-x-2 sm:space-x-3 lg:space-x-4 overflow-x-auto px-4 sm:px-6 lg:px-8 pb-3 sm:pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {movies.map((movie, index) => (
            <div
              key={movie.id}
              className="flex-none w-[130px] sm:w-[180px] md:w-[200px] lg:w-[220px] xl:w-[240px] snap-start"
            >
              <MovieCard movie={movie} index={index % 5} />
            </div>
          ))}
        </div>

        {/* Right Arrow — desktop only */}
        <div className="hidden sm:flex absolute top-0 bottom-0 right-0 z-10 w-14 lg:w-16 bg-gradient-to-l from-background to-transparent items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 bg-background/80 hover:bg-background rounded-full shadow-lg w-9 h-9"
            onClick={() => handleScroll("right")}
            data-testid={`button-scroll-right-${title.toLowerCase()}`}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
