
import { useState, useEffect } from "react";
import { MovieCard } from "@/components/MovieCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Hero } from "@/components/Hero";
import { SearchBar } from "@/components/SearchBar";
import { Footer } from "@/components/Footer";
import { Movie } from "@/types/Movie";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All"); // New state for Movies/Series filter
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // Load movies from Supabase
  useEffect(() => {
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
        setFilteredMovies(formattedMovies);
      } catch (error) {
        console.error('Error loading movies:', error);
        toast({
          title: "Error",
          description: "Failed to load movies from database.",
          variant: "destructive"
        });
        
        // Fallback to sample movies if database fails
        const sampleMovies: Movie[] = [
          {
            id: "1",
            title: "Avengers: Endgame",
            description: "The Avengers assemble once more to reverse Thanos' actions and restore balance to the universe.",
            image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=500",
            releaseDate: "2019-04-26",
            isReleased: true,
            category: "Action",
            rating: 8.4
          },
          {
            id: "2",
            title: "The Matrix",
            description: "A computer programmer discovers reality as he knows it is actually a simulation.",
            image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500",
            releaseDate: "1999-03-31",
            isReleased: true,
            category: "Sci-Fi",
            rating: 8.7
          },
          {
            id: "3",
            title: "Inception",
            description: "A thief who enters people's dreams to steal secrets from their subconscious.",
            image: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=500",
            releaseDate: "2010-07-16",
            isReleased: true,
            category: "Thriller",
            rating: 8.8
          }
        ];
        setMovies(sampleMovies);
        setFilteredMovies(sampleMovies);
      } finally {
        setIsLoading(false);
      }
    };

    loadMovies();
  }, []);

  // Filter movies based on category, type, and search query
  useEffect(() => {
    let filtered = movies;
    
    // Filter by type (Movies/Series)
    if (selectedType === "Movies") {
      filtered = filtered.filter(movie => 
        movie.category !== "TV Series" && 
        movie.category !== "Series" && 
        movie.category !== "TV Show"
      );
    } else if (selectedType === "Series") {
      filtered = filtered.filter(movie => 
        movie.category === "TV Series" || 
        movie.category === "Series" || 
        movie.category === "TV Show"
      );
    }
    
    if (selectedCategory !== "All") {
      filtered = filtered.filter(movie => movie.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(movie => 
        movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredMovies(filtered);
  }, [movies, selectedCategory, selectedType, searchQuery]);

  const categories = ["All", ...Array.from(new Set(movies.map(movie => movie.category)))];
  const types = ["All", "Movies", "Series"];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-xl">Loading movies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Hero />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          
          {/* Type Filter (Movies/Series) */}
          <div className="flex flex-wrap gap-2">
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedType === type
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          
          <CategoryFilter 
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            {selectedType === "All" ? "All Movies & Series" : selectedType}
            {selectedCategory !== "All" && ` - ${selectedCategory}`}
            <span className="text-yellow-400 ml-2">({filteredMovies.length})</span>
          </h2>
          
          {filteredMovies.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No movies found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}
        </div>

        {/* Ad Space Placeholder */}
        <div className="bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg p-8 text-center mb-8">
          <p className="text-gray-400">Advertisement Space</p>
          <p className="text-sm text-gray-500">728x90 Banner Ad</p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Index;
