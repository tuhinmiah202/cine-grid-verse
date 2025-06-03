
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TMDBMovie, TMDBSearchResponse, Movie } from "@/types/Movie";
import { toast } from "@/hooks/use-toast";

interface TMDBSearchProps {
  onMovieAdded: () => void;
}

export const TMDBSearch = ({ onMovieAdded }: TMDBSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TMDBMovie[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchTMDB = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('tmdb-search', {
        body: { query: searchQuery }
      });

      if (error) throw error;

      const tmdbData = data as TMDBSearchResponse;
      setSearchResults(tmdbData.results || []);
    } catch (error) {
      console.error('Error searching TMDB:', error);
      toast({
        title: "Error",
        description: "Failed to search movies. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const addMovieFromTMDB = async (tmdbMovie: TMDBMovie) => {
    try {
      const genreMap: { [key: number]: string } = {
        28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
        99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
        27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
        10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
      };

      const category = tmdbMovie.genre_ids && tmdbMovie.genre_ids.length > 0 
        ? genreMap[tmdbMovie.genre_ids[0]] || "Drama"
        : "Drama";

      const title = tmdbMovie.title || tmdbMovie.name || "Unknown Title";
      const releaseDate = tmdbMovie.release_date || tmdbMovie.first_air_date || new Date().toISOString().split('T')[0];
      const image = tmdbMovie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}`
        : "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=500";

      const movieData = {
        tmdb_id: tmdbMovie.id,
        title,
        description: tmdbMovie.overview || "No description available.",
        image,
        release_date: releaseDate,
        is_released: new Date(releaseDate) <= new Date(),
        category,
        rating: Math.round(tmdbMovie.vote_average * 10) / 10
      };

      const { error } = await supabase
        .from('movies')
        .insert([movieData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${title} added successfully!`,
      });

      onMovieAdded();
    } catch (error) {
      console.error('Error adding movie:', error);
      toast({
        title: "Error",
        description: "Failed to add movie. It might already exist.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search movies and TV shows..."
          className="bg-gray-700 border-gray-600 text-white"
          onKeyPress={(e) => e.key === 'Enter' && searchTMDB()}
        />
        <Button 
          onClick={searchTMDB} 
          disabled={isSearching}
          className="bg-yellow-400 text-black hover:bg-yellow-300"
        >
          <Search className="w-4 h-4" />
        </Button>
      </div>

      {searchResults.length > 0 && (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {searchResults.map((movie) => (
            <div key={movie.id} className="bg-gray-700 p-4 rounded-lg flex items-center gap-4">
              <img
                src={movie.poster_path 
                  ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
                  : "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=92"
                }
                alt={movie.title || movie.name}
                className="w-16 h-24 object-cover rounded"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-white">
                  {movie.title || movie.name}
                </h3>
                <p className="text-sm text-gray-400 line-clamp-2">
                  {movie.overview}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {movie.release_date || movie.first_air_date} • 
                  Rating: {movie.vote_average}/10 •
                  {movie.media_type === 'tv' ? ' TV Series' : ' Movie'}
                </p>
              </div>
              <Button
                onClick={() => addMovieFromTMDB(movie)}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
