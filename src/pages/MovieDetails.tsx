import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, Star, ArrowLeft, Clock, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Movie } from "@/types/Movie";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { OptimizedMovieCard } from "@/components/OptimizedMovieCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [relatedMovies, setRelatedMovies] = useState<Movie[]>([]);

  useEffect(() => {
    const fetchRelatedMovies = async (category: string, currentMovieId: string) => {
      if (!category) return;
      try {
        const { data, error } = await supabase
          .from('movies')
          .select('*')
          .eq('category', category)
          .neq('id', currentMovieId)
          .limit(10);

        if (error) throw error;
        
        const mappedMovies: Movie[] = data.map(m => ({
          id: m.id,
          tmdb_id: m.tmdb_id,
          title: m.title,
          description: m.description || "",
          image: m.image || "",
          releaseDate: m.release_date || "",
          isReleased: m.is_released ?? true,
          category: m.category || "",
          rating: m.rating
        }));

        setRelatedMovies(mappedMovies);
      } catch (err) {
        console.error("Failed to fetch related movies:", err);
      }
    };

    const loadMovieDetails = async () => {
      if (!id) return;

      // Reset state for page transitions
      setIsLoading(true);
      setMovie(null);
      setMovieDetails(null);
      setRelatedMovies([]);
      setError(null);

      try {
        // First, get the movie from our database (fast)
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
        fetchRelatedMovies(mappedMovie.category, mappedMovie.id);

        // Then load TMDB details in background (slower)
        if (movieData.tmdb_id) {
          setIsLoadingDetails(true);
          try {
            const { data: tmdbData, error: tmdbError } = await supabase.functions.invoke('tmdb-details', {
              body: { tmdb_id: movieData.tmdb_id }
            });

            if (tmdbError) {
              console.error('TMDB details error:', tmdbError);
            } else {
              setMovieDetails(tmdbData);
            }
          } catch (tmdbError) {
            console.error('TMDB details fetch failed:', tmdbError);
          } finally {
            setIsLoadingDetails(false);
          }
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
      {/* Compact header */}
      <div className="bg-gray-800 py-3 sm:py-4">
        <div className="container mx-auto px-4">
          <Link to="/">
            <Button 
              variant="outline" 
              size="sm"
              className="bg-black bg-opacity-50 border-gray-600 text-white hover:bg-black hover:bg-opacity-75"
            >
              <ArrowLeft className="w-3 h-3 mr-1" />
              Back
            </Button>
          </Link>
        </div>
      </div>

      {/* Movie Information */}
      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Poster */}
          <div className="flex-shrink-0">
            <img 
              src={movie.image} 
              alt={movie.title}
              className="w-48 sm:w-64 h-auto rounded-lg shadow-2xl mx-auto lg:mx-0"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=500";
              }}
            />
          </div>

          {/* Details */}
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">{movie.title}</h1>
            {movieDetails?.tagline && (
              <p className="text-base sm:text-lg text-gray-400 italic mb-2 sm:mb-3">{movieDetails.tagline}</p>
            )}

            {/* Rating and Release Info */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              {movie.rating && (
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                  <span className="text-sm sm:text-base font-semibold">{movie.rating}</span>
                  {movieDetails?.vote_count && (
                    <span className="text-gray-400 ml-1 text-xs sm:text-sm">({movieDetails.vote_count})</span>
                  )}
                </div>
              )}
              
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                <span className="text-sm">{new Date(movie.releaseDate).getFullYear()}</span>
              </div>

              {movieDetails?.runtime && (
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-gray-400 mr-1" />
                  <span className="text-sm">{Math.floor(movieDetails.runtime / 60)}h {movieDetails.runtime % 60}m</span>
                </div>
              )}

              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                movie.isReleased 
                  ? 'bg-green-500 text-white' 
                  : 'bg-yellow-500 text-black'
              }`}>
                {movie.isReleased ? 'Released' : 'Coming Soon'}
              </span>
            </div>

            {/* Watch Now Button */}
            <div className="mb-4">
              <p className="text-sm text-gray-300 mb-2">
                👉 Available on platforms like Netflix, Disney+, etc.
              </p>
              <Link to={`/download/${movie.id}`}>
                <Button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm sm:text-base">
                  <Play className="w-4 h-4 mr-2" />
                  Watch Now
                </Button>
              </Link>
            </div>

            {/* Ad Space */}
            <div className="bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg p-3 text-center mb-4">
              <p className="text-gray-400 text-sm">Advertisement Space</p>
              <p className="text-xs text-gray-500">728x90 Banner Ad</p>
            </div>

            {/* Genres - Show immediately if available, update when TMDB loads */}
            {movieDetails?.genres && movieDetails.genres.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm sm:text-base font-semibold mb-2">Genres</h3>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {movieDetails.genres.map((genre) => (
                    <span 
                      key={genre.id}
                      className="bg-purple-600 text-white px-2 py-0.5 rounded text-xs"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Overview */}
            <div className="mb-4">
              <h3 className="text-sm sm:text-base font-semibold mb-2">Overview</h3>
              <p className="text-gray-300 leading-relaxed text-sm sm:text-base">{movie.description}</p>
            </div>

            {/* Cast - Only show when TMDB details are loaded */}
            {movieDetails?.cast && movieDetails.cast.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm sm:text-base font-semibold mb-2">
                  Cast {isLoadingDetails && <span className="text-xs text-gray-400">(Loading...)</span>}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {movieDetails.cast.slice(0, 8).map((actor) => (
                    <div key={actor.id} className="bg-gray-800 rounded-lg p-2">
                      <p className="font-semibold text-xs text-white">{actor.name}</p>
                      <p className="text-gray-400 text-xs">{actor.character}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Movies Section */}
      {relatedMovies.length > 0 && (
        <div className="container mx-auto px-4 py-8 border-t border-gray-700">
          <h2 className="text-2xl font-bold mb-6 text-yellow-400">Related Movies & Shows</h2>
          <Carousel
            opts={{
              align: "start",
              loop: false,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2">
              {relatedMovies.map((relatedMovie) => (
                <CarouselItem key={relatedMovie.id} className="pl-2 basis-3/4 sm:basis-2/5 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                  <OptimizedMovieCard movie={relatedMovie} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="text-white bg-black bg-opacity-50 hover:bg-opacity-75" />
            <CarouselNext className="text-white bg-black bg-opacity-75 hover:bg-black" />
          </Carousel>
        </div>
      )}
    </div>
  );
};

export default MovieDetails;
