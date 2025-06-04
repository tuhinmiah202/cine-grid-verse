import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, Star, ArrowLeft, Clock, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Movie } from "@/types/Movie";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface TMDBMovieDetails {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date?: string;
  first_air_date?: string;
  genres: { id: number; name: string }[];
  vote_average: number;
  vote_count: number;
  runtime?: number;
  episode_run_time?: number[];
  status: string;
  tagline: string;
  production_companies: { id: number; name: string; logo_path: string }[];
  cast?: { id: number; name: string; character: string; profile_path: string }[];
}

const MovieDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [movieDetails, setMovieDetails] = useState<TMDBMovieDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMovieDetails = async () => {
      if (!id) return;

      try {
        // First, get the movie from our database
        const { data: movieData, error: movieError } = await supabase
          .from('movies')
          .select('*')
          .eq('id', id)
          .single();

        if (movieError) throw movieError;

        // Map database fields to Movie type
        const mappedMovie: Movie = {
          id: movieData.id,
          tmdb_id: movieData.tmdb_id,
          title: movieData.title,
          description: movieData.description,
          image: movieData.image,
          releaseDate: movieData.release_date,
          isReleased: movieData.is_released,
          category: movieData.category,
          rating: movieData.rating
        };

        setMovie(mappedMovie);

        // If we have a TMDB ID, fetch detailed information
        if (movieData.tmdb_id) {
          const { data: tmdbData, error: tmdbError } = await supabase.functions.invoke('tmdb-details', {
            body: { tmdb_id: movieData.tmdb_id }
          });

          if (tmdbError) throw tmdbError;
          setMovieDetails(tmdbData);
        }
      } catch (error) {
        console.error('Error loading movie details:', error);
        setError('Failed to load movie details');
        toast({
          title: "Error",
          description: "Failed to load movie details.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadMovieDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-xl">Loading movie details...</p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-400 mb-4">{error || 'Movie not found'}</p>
          <Link to="/">
            <Button className="bg-yellow-400 text-black hover:bg-yellow-300">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Simplified header without backdrop */}
      <div className="bg-gray-800 py-8">
        <div className="container mx-auto px-4">
          <Link to="/">
            <Button 
              variant="outline" 
              className="bg-black bg-opacity-50 border-gray-600 text-white hover:bg-black hover:bg-opacity-75"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
      </div>

      {/* Movie Information */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0">
            <img 
              src={movie.image} 
              alt={movie.title}
              className="w-80 h-auto rounded-lg shadow-2xl"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=500";
              }}
            />
          </div>

          {/* Details */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
            {movieDetails?.tagline && (
              <p className="text-xl text-gray-400 italic mb-4">{movieDetails.tagline}</p>
            )}

            {/* Rating and Release Info */}
            <div className="flex flex-wrap items-center gap-6 mb-6">
              {movie.rating && (
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 fill-current mr-2" />
                  <span className="text-lg font-semibold">{movie.rating}</span>
                  {movieDetails?.vote_count && (
                    <span className="text-gray-400 ml-1">({movieDetails.vote_count} votes)</span>
                  )}
                </div>
              )}
              
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                <span>{new Date(movie.releaseDate).getFullYear()}</span>
              </div>

              {movieDetails?.runtime && (
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-400 mr-2" />
                  <span>{Math.floor(movieDetails.runtime / 60)}h {movieDetails.runtime % 60}m</span>
                </div>
              )}

              <span className={`px-3 py-1 rounded text-sm font-semibold ${
                movie.isReleased 
                  ? 'bg-green-500 text-white' 
                  : 'bg-yellow-500 text-black'
              }`}>
                {movie.isReleased ? 'Released' : 'Coming Soon'}
              </span>
            </div>

            {/* Watch Now Button */}
            <div className="mb-6">
              <Link to={`/download/${movie.id}`}>
                <Button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 text-lg">
                  <Play className="w-5 h-5 mr-2" />
                  Watch Now
                </Button>
              </Link>
            </div>

            {/* Genres */}
            {movieDetails?.genres && movieDetails.genres.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {movieDetails.genres.map((genre) => (
                    <span 
                      key={genre.id}
                      className="bg-purple-600 text-white px-3 py-1 rounded text-sm"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Overview */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Overview</h3>
              <p className="text-gray-300 leading-relaxed">{movie.description}</p>
            </div>

            {/* Status */}
            {movieDetails?.status && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Status</h3>
                <p className="text-gray-300">{movieDetails.status}</p>
              </div>
            )}

            {/* Cast */}
            {movieDetails?.cast && movieDetails.cast.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Cast</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {movieDetails.cast.slice(0, 8).map((actor) => (
                    <div key={actor.id} className="text-center">
                      <img
                        src={actor.profile_path 
                          ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                          : "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=185"
                        }
                        alt={actor.name}
                        className="w-full h-32 object-cover rounded-lg mb-2"
                      />
                      <p className="font-semibold text-sm">{actor.name}</p>
                      <p className="text-gray-400 text-xs">{actor.character}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Production Companies */}
            {movieDetails?.production_companies && movieDetails.production_companies.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Production Companies</h3>
                <div className="flex flex-wrap gap-4">
                  {movieDetails.production_companies.map((company) => (
                    <div key={company.id} className="flex items-center bg-gray-800 rounded-lg p-3">
                      {company.logo_path && (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${company.logo_path}`}
                          alt={company.name}
                          className="h-8 mr-3 object-contain"
                        />
                      )}
                      <span className="text-sm">{company.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
