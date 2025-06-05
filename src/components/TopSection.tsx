
import { useState, useEffect } from "react";
import { MovieCard } from "@/components/MovieCard";
import { Movie, TMDBMovie } from "@/types/Movie";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface TopSectionProps {
  type: 'movie' | 'tv';
  title: string;
}

export const TopSection = ({ type, title }: TopSectionProps) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopMovies = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('tmdb-top', {
          body: { type }
        });

        if (error) throw error;

        const formattedMovies: Movie[] = data.results.map((item: TMDBMovie) => ({
          id: item.id.toString(),
          tmdb_id: item.id,
          title: item.title || item.name || "",
          description: item.overview || "",
          image: item.poster_path 
            ? `https://image.tmdb.org/w500${item.poster_path}`
            : "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=500",
          releaseDate: item.release_date || item.first_air_date || "",
          isReleased: true,
          category: type === 'movie' ? 'Action' : 'TV Series',
          rating: item.vote_average ? Number(item.vote_average.toFixed(1)) : undefined
        }));

        setMovies(formattedMovies);
      } catch (error) {
        console.error(`Error fetching top ${type}:`, error);
        toast({
          title: "Error",
          description: `Failed to load top ${type}.`,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopMovies();
  }, [type]);

  if (isLoading) {
    return (
      <div className="mb-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-yellow-400">{title}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="bg-gray-800 rounded-lg h-64 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-yellow-400">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
        {movies.slice(0, 12).map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
      {movies.length > 12 && (
        <div className="mt-4 text-center">
          <button className="text-yellow-400 hover:text-yellow-300 font-medium">
            View All {movies.length} {type === 'movie' ? 'Movies' : 'Series'}
          </button>
        </div>
      )}
    </div>
  );
};
