
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, Star, ArrowLeft, Clock, User } from "lucide-react";
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

        setMovie(movieData);

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

  const details = movieDetails || {};
  const backdropUrl = details.backdrop_path 
    ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}`
    : movie.image;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section with Backdrop */}
      <div 
        className="relative h-96 bg-cover bg-center"
        style={{ backgroundImage: `url(${backdropUrl})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60" />
        <div className="relative container mx-auto px-4 h-full flex items-end pb-8">
          <Link to="/">
            <Button 
              variant="outline" 
              className="absolute top-8 left-8 bg-black bg-opacity-50 border-gray-600 text-white hover:bg-black hover:bg-opacity-75"
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
            {details.tagline && (
              <p className="text-xl text-gray-400 italic mb-4">{details.tagline}</p>
            )}

            {/* Rating and Release Info */}
            <div className="flex flex-wrap items-center gap-6 mb-6">
              {movie.rating && (
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 fill-current mr-2" />
                  <span className="text-lg font-semibold">{movie.rating}</span>
                  {details.vote_count && (
                    <span className="text-gray-400 ml-1">({details.vote_count} votes)</span>
                  )}
                </div>
              )}
              
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                <span>{new Date(movie.releaseDate).getFullYear()}</span>
              </div>

              {details.runtime && (
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-400 mr-2" />
                  <span>{Math.floor(details.runtime / 60)}h {details.runtime % 60}m</span>
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

            {/* Genres */}
            {details.genres && details.genres.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {details.genres.map((genre) => (
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
            {details.status && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Status</h3>
                <p className="text-gray-300">{details.status}</p>
              </div>
            )}

            {/* Cast */}
            {details.cast && details.cast.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Cast</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {details.cast.slice(0, 8).map((actor) => (
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
            {details.production_companies && details.production_companies.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Production Companies</h3>
                <div className="flex flex-wrap gap-4">
                  {details.production_companies.map((company) => (
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
