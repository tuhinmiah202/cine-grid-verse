
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Play, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Movie } from "@/types/Movie";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const Download = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [countdown, setCountdown] = useState(5);
  const [showWatchButton, setShowWatchButton] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMovie = async () => {
      if (!id) return;

      try {
        const { data: movieData, error: movieError } = await supabase
          .from('movies')
          .select('*')
          .eq('id', id)
          .single();

        if (movieError) throw movieError;

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

        // Try to get download link for this movie
        const { data: linkData, error: linkError } = await supabase
          .from('movie_links')
          .select('download_url')
          .eq('movie_id', id)
          .single();

        if (!linkError && linkData) {
          setDownloadUrl(linkData.download_url);
        }
      } catch (error) {
        console.error('Error loading movie:', error);
        setError('Failed to load movie');
        toast({
          title: "Error",
          description: "Failed to load movie details.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadMovie();
  }, [id]);

  useEffect(() => {
    if (countdown > 0 && !isLoading) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setShowWatchButton(true);
    }
  }, [countdown, isLoading]);

  const handleWatch = () => {
    if (!movie) return;
    
    if (downloadUrl) {
      // Open the actual download link
      window.open(downloadUrl, '_blank');
      toast({
        title: "Opening Movie",
        description: `${movie.title} is now opening.`,
      });
    } else {
      toast({
        title: "No Watch Link",
        description: "Watch link is not available for this movie.",
        variant: "destructive"
      });
    }
  };

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
      <div className="container mx-auto px-4 py-4 sm:py-6">
        <Link to={`/movie/${movie.id}`}>
          <Button 
            variant="outline" 
            size="sm"
            className="mb-4 bg-black bg-opacity-50 border-gray-600 text-white hover:bg-black hover:bg-opacity-75"
          >
            <ArrowLeft className="w-3 h-3 mr-1" />
            Back to Movie Details
          </Button>
        </Link>

        {/* Top Ad Space */}
        <div className="bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg p-4 text-center mb-6">
          <p className="text-gray-400">Top Advertisement Space</p>
          <p className="text-sm text-gray-500">728x90 Banner Ad</p>
        </div>

        <div className="max-w-xl mx-auto text-center">
          <div className="mb-6">
            <img 
              src={movie.image} 
              alt={movie.title}
              className="w-40 sm:w-48 h-auto mx-auto rounded-lg shadow-2xl mb-4"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=500";
              }}
            />
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">{movie.title}</h1>
            <p className="text-gray-400 text-sm sm:text-base">{movie.description}</p>
          </div>

          {/* Side Ad Space */}
          <div className="bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg p-3 text-center mb-6">
            <p className="text-gray-400 text-sm">Side Advertisement Space</p>
            <p className="text-xs text-gray-500">300x250 Rectangle Ad</p>
          </div>

          {!showWatchButton ? (
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-yellow-400 mr-2" />
                <h2 className="text-xl font-semibold">Preparing to Watch</h2>
              </div>
              
              <div className="text-4xl sm:text-5xl font-bold text-yellow-400 mb-3">
                {countdown}
              </div>
              
              <p className="text-gray-400 text-sm">
                Please wait while we prepare your movie...
              </p>
              
              <div className="w-full bg-gray-700 rounded-full h-2 mt-4">
                <div 
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-green-400">
                Ready to Watch!
              </h2>
              
              {downloadUrl ? (
                <Button 
                  onClick={handleWatch}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 text-lg"
                  size="lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch Now
                </Button>
              ) : (
                <div className="text-center">
                  <p className="text-yellow-400 mb-3">Watch link not available</p>
                  <p className="text-gray-400 text-sm">
                    Please contact admin to add watch link for this movie
                  </p>
                </div>
              )}
              
              <p className="text-gray-400 mt-3 text-sm">
                {downloadUrl ? "Click to start watching" : "Watch link will be provided by admin"}
              </p>
            </div>
          )}

          {/* Bottom Ad Space */}
          <div className="bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg p-4 text-center mb-4">
            <p className="text-gray-400">Bottom Advertisement Space</p>
            <p className="text-sm text-gray-500">728x90 Banner Ad</p>
          </div>

          {/* Video Ad Space */}
          <div className="bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg p-6 text-center mb-6">
            <p className="text-gray-400">Video Advertisement Space</p>
            <p className="text-sm text-gray-500">300x250 Video Player Ad</p>
            <div className="bg-gray-700 rounded mt-3 h-32 flex items-center justify-center">
              <Play className="w-8 h-8 text-gray-500" />
            </div>
          </div>

          <div className="mt-6 text-xs text-gray-500">
            <p>⚠️ Please ensure you have a stable internet connection</p>
            <p>🎬 Enjoy your movie experience</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Download;
