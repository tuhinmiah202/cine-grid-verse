import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Film, Database, LinkIcon } from "lucide-react";
import { AdminForm } from "@/components/AdminForm";
import { AdminMovieList } from "@/components/AdminMovieList";
import { TMDBSearch } from "@/components/TMDBSearch";
import { MovieLinkManager } from "@/components/MovieLinkManager";
import { AdminPasswordProtection } from "@/components/AdminPasswordProtection";
import { BulkImport } from "@/components/BulkImport";
import { Movie } from "@/types/Movie";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Admin = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [activeTab, setActiveTab] = useState<'bulk' | 'tmdb' | 'manual' | 'links'>('bulk');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadMovies = async () => {
    try {
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedMovies: Movie[] = data.map(movie => ({
        id: movie.id,
        tmdb_id: movie.tmdb_id,
        title: movie.title,
        description: movie.description || "",
        image: movie.image || "",
        releaseDate: movie.release_date || "",
        isReleased: movie.is_released ?? true,
        category: movie.category || "",
        rating: movie.rating
      }));

      setMovies(formattedMovies);
    } catch (error) {
      console.error('Error loading movies:', error);
      toast({
        title: "Error",
        description: "Failed to load movies from database.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadMovies();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <AdminPasswordProtection onPasswordCorrect={() => setIsAuthenticated(true)} />;
  }

  const addMovie = async (newMovie: Omit<Movie, "id">) => {
    try {
      const movieData = {
        title: newMovie.title,
        description: newMovie.description,
        image: newMovie.image || "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=500",
        release_date: newMovie.releaseDate,
        is_released: newMovie.isReleased,
        category: newMovie.category,
        rating: newMovie.rating
      };

      const { error } = await supabase
        .from('movies')
        .insert([movieData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Movie added successfully!",
      });

      loadMovies();
    } catch (error) {
      console.error('Error adding movie:', error);
      toast({
        title: "Error",
        description: "Failed to add movie.",
        variant: "destructive"
      });
    }
  };

  const deleteMovie = async (id: string) => {
    try {
      const { error } = await supabase
        .from('movies')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Movie deleted successfully!",
      });

      loadMovies();
    } catch (error) {
      console.error('Error deleting movie:', error);
      toast({
        title: "Error",
        description: "Failed to delete movie.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center text-yellow-400 hover:text-yellow-300 mr-6"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
            <div className="flex items-center">
              <Film className="w-8 h-8 text-yellow-400 mr-3" />
              <h1 className="text-3xl font-bold">Admin Panel</h1>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center mb-6">
              <Database className="w-6 h-6 text-yellow-400 mr-2" />
              <h2 className="text-2xl font-bold">Manage Content</h2>
            </div>
            
            <div className="flex mb-4 bg-gray-800 rounded-lg p-1 flex-wrap">
              <button
                onClick={() => setActiveTab('bulk')}
                className={`flex-1 py-2 px-3 rounded-md font-medium transition-colors text-sm ${
                  activeTab === 'bulk'
                    ? 'bg-yellow-400 text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Bulk Import
              </button>
              <button
                onClick={() => setActiveTab('tmdb')}
                className={`flex-1 py-2 px-3 rounded-md font-medium transition-colors text-sm ${
                  activeTab === 'tmdb'
                    ? 'bg-yellow-400 text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Search TMDB
              </button>
              <button
                onClick={() => setActiveTab('manual')}
                className={`flex-1 py-2 px-3 rounded-md font-medium transition-colors text-sm ${
                  activeTab === 'manual'
                    ? 'bg-yellow-400 text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Manual Entry
              </button>
              <button
                onClick={() => setActiveTab('links')}
                className={`flex-1 py-2 px-3 rounded-md font-medium transition-colors text-sm ${
                  activeTab === 'links'
                    ? 'bg-yellow-400 text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <LinkIcon className="w-4 h-4 mr-1 inline" />
                Watch Links
              </button>
            </div>

            {activeTab === 'bulk' && (
              <BulkImport onImportComplete={loadMovies} />
            )}

            {activeTab === 'tmdb' && (
              <div className="bg-gray-800 p-6 rounded-lg">
                <TMDBSearch onMovieAdded={loadMovies} />
              </div>
            )}

            {activeTab === 'manual' && (
              <AdminForm onAddMovie={addMovie} />
            )}

            {activeTab === 'links' && (
              <MovieLinkManager movies={movies} />
            )}
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-6">
              Manage Movies ({movies.length})
            </h2>
            <AdminMovieList movies={movies} onDeleteMovie={deleteMovie} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
