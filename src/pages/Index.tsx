import { useState, useEffect, useMemo, useCallback } from "react";
import { OptimizedMovieCard } from "@/components/OptimizedMovieCard";
import { MovieCardSkeleton } from "@/components/MovieCardSkeleton";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Hero } from "@/components/Hero";
import { SearchBar } from "@/components/SearchBar";
import { Footer } from "@/components/Footer";
import { PaginationControls } from "@/components/PaginationControls";
import { usePagination } from "@/hooks/usePagination";
import { Movie } from "@/types/Movie";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // Memoized sample movies to avoid recreation
  const sampleMovies = useMemo(() => [
    {
      id: "1",
      title: "Avengers: Endgame",
      description: "The Avengers assemble once more to reverse Thanos' actions and restore balance to the universe.",
      image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=500&q=80",
      releaseDate: "2019-04-26",
      isReleased: true,
      category: "Action",
      rating: 8.4
    },
    {
      id: "2",
      title: "The Matrix",
      description: "A computer programmer discovers reality as he knows it is actually a simulation.",
      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&q=80",
      releaseDate: "1999-03-31",
      isReleased: true,
      category: "Sci-Fi",
      rating: 8.7
    },
    {
      id: "3",
      title: "Inception",
      description: "A thief who enters people's dreams to steal secrets from their subconscious.",
      image: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=500&q=80",
      releaseDate: "2010-07-16",
      isReleased: true,
      category: "Thriller",
      rating: 8.8
    }
  ], []);

  // Load movies from Supabase with error handling
  const loadMovies = useCallback(async () => {
    try {
      console.log('Starting to load movies from database...');
      
      const { data, error, count } = await supabase
        .from('movies')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log(`Database query successful. Found ${count} total movies in database.`);
      console.log('First few movies:', data?.slice(0, 3));

      if (!data || data.length === 0) {
        console.log('No movies found in database, using sample data');
        toast({
          title: "No Movies Found",
          description: "No movies found in database. Using sample data.",
          variant: "destructive"
        });
        setMovies(sampleMovies);
      } else {
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

        console.log(`Successfully loaded ${formattedMovies.length} movies from database`);
        setMovies(formattedMovies);
      }
    } catch (error) {
      console.error('Error loading movies:', error);
      toast({
        title: "Error",
        description: "Failed to load movies from database. Using sample data.",
        variant: "destructive"
      });
      
      setMovies(sampleMovies);
    } finally {
      setIsLoading(false);
    }
  }, [sampleMovies]);

  useEffect(() => {
    loadMovies();
  }, [loadMovies]);

  // Optimized filter function with debouncing
  const filteredMovies = useMemo(() => {
    let filtered = movies;
    
    // Filter by type (Movies/Series/Anime)
    if (selectedType === "Movies") {
      filtered = filtered.filter(movie => 
        !["TV Series", "Series", "TV Show", "Animation", "Bollywood", "K-Drama"].includes(movie.category)
      );
    } else if (selectedType === "Series") {
      filtered = filtered.filter(movie => 
        ["TV Series", "Series", "TV Show"].includes(movie.category)
      );
    } else if (selectedType === "Anime") {
      filtered = filtered.filter(movie => 
        movie.category === "Animation" ||
        movie.title.toLowerCase().includes("anime") ||
        movie.description.toLowerCase().includes("anime")
      );
    }
    
    if (selectedCategory !== "All") {
      filtered = filtered.filter(movie => movie.category === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(movie => 
        movie.title.toLowerCase().includes(query) ||
        movie.description.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [movies, selectedCategory, selectedType, searchQuery]);

  const {
    currentData: currentMovies,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage
  } = usePagination({ 
    data: filteredMovies, 
    itemsPerPage: 20
  });

  const categories = useMemo(() => {
    const allCategories = Array.from(new Set(movies.map(movie => movie.category)));
    if (!allCategories.includes("Bollywood")) {
      allCategories.push("Bollywood");
    }
    if (!allCategories.includes("K-Drama")) {
      allCategories.push("K-Drama");
    }
    return ["All", ...allCategories];
  }, [movies]);
  
  const types = ["All", "Movies", "Series", "Anime"];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Hero />
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col space-y-2 sm:space-y-3 mb-3 sm:mb-4">
            <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="flex flex-wrap gap-2">
                {types.map((type) => (
                  <button
                    key={type}
                    className="px-2 py-1.5 rounded-lg font-medium transition-colors text-xs bg-gray-700 text-white"
                  >
                    {type}
                  </button>
                ))}
              </div>
              
              <CategoryFilter 
                categories={["All", "Loading..."]}
                selectedCategory="All"
                onCategoryChange={() => {}}
              />
            </div>
          </div>

          <div className="mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3">
              Loading Movies...
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 sm:gap-3 md:gap-4">
              {Array.from({ length: 20 }).map((_, index) => (
                <MovieCardSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Hero />
      
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
        <div className="flex flex-col space-y-2 sm:space-y-3 mb-3 sm:mb-4">
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {/* Type Filter (Movies/Series/Anime) */}
            <div className="flex flex-wrap gap-2">
              {types.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-2 py-1.5 rounded-lg font-medium transition-colors text-xs ${
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
        </div>

        <div className="mb-3 sm:mb-4">
          <h2 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3">
            {selectedType === "All" ? "All Movies & Series" : selectedType}
            {selectedCategory !== "All" && ` - ${selectedCategory}`}
            <span className="text-yellow-400 ml-2">({filteredMovies.length})</span>
            {totalPages > 1 && (
              <span className="text-gray-400 text-sm ml-2">
                Page {currentPage} of {totalPages}
              </span>
            )}
          </h2>
          
          {currentMovies.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <p className="text-gray-400 text-sm sm:text-base">No movies found matching your criteria.</p>
              <button 
                onClick={loadMovies}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Reload Movies
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 sm:gap-3 md:gap-4">
                {currentMovies.map((movie, index) => (
                  <OptimizedMovieCard 
                    key={movie.id} 
                    movie={movie} 
                    priority={index < 6} // Prioritize first 6 images
                  />
                ))}
              </div>
              
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
                onNextPage={nextPage}
                onPrevPage={prevPage}
              />
            </>
          )}
        </div>

        {/* Ad Space Placeholder */}
        <div className="bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg p-3 sm:p-4 text-center mb-3 sm:mb-4">
          <p className="text-gray-400 text-sm">Advertisement Space</p>
          <p className="text-xs text-gray-500">728x90 Banner Ad</p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Index;
