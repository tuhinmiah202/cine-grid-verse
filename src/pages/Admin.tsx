
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Film } from "lucide-react";
import { AdminForm } from "@/components/AdminForm";
import { AdminMovieList } from "@/components/AdminMovieList";
import { Movie } from "@/types/Movie";
import { toast } from "@/hooks/use-toast";

const Admin = () => {
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    const storedMovies = localStorage.getItem("movies");
    if (storedMovies) {
      setMovies(JSON.parse(storedMovies));
    }
  }, []);

  const addMovie = (newMovie: Omit<Movie, "id">) => {
    const movie: Movie = {
      ...newMovie,
      id: Date.now().toString()
    };
    
    const updatedMovies = [...movies, movie];
    setMovies(updatedMovies);
    localStorage.setItem("movies", JSON.stringify(updatedMovies));
    
    toast({
      title: "Success",
      description: "Movie added successfully!",
    });
  };

  const deleteMovie = (id: string) => {
    const updatedMovies = movies.filter(movie => movie.id !== id);
    setMovies(updatedMovies);
    localStorage.setItem("movies", JSON.stringify(updatedMovies));
    
    toast({
      title: "Success",
      description: "Movie deleted successfully!",
    });
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
            <h2 className="text-2xl font-bold mb-6">Add New Movie/Series</h2>
            <AdminForm onAddMovie={addMovie} />
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
