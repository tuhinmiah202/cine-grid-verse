
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Search, Plus } from "lucide-react";

interface GenreBulkImportProps {
  onImportComplete: () => void;
}

interface TMDBResult {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  genre_ids: number[];
  media_type?: 'movie' | 'tv';
}

export const GenreBulkImport = ({ onImportComplete }: GenreBulkImportProps) => {
  const [selectedGenre, setSelectedGenre] = useState("");
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie');
  const [searchResults, setSearchResults] = useState<TMDBResult[]>([]);
  const [selectedMovies, setSelectedMovies] = useState<Set<number>>(new Set());
  const [isSearching, setIsSearching] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const genres = [
    { id: "28", name: "Action" },
    { id: "12", name: "Adventure" },
    { id: "16", name: "Animation" },
    { id: "35", name: "Comedy" },
    { id: "80", name: "Crime" },
    { id: "99", name: "Documentary" },
    { id: "18", name: "Drama" },
    { id: "10751", name: "Family" },
    { id: "14", name: "Fantasy" },
    { id: "36", name: "History" },
    { id: "27", name: "Horror" },
    { id: "10402", name: "Music" },
    { id: "9648", name: "Mystery" },
    { id: "10749", name: "Romance" },
    { id: "878", name: "Science Fiction" },
    { id: "10770", name: "TV Movie" },
    { id: "53", name: "Thriller" },
    { id: "10752", name: "War" },
    { id: "37", name: "Western" }
  ];

  const genreMap: { [key: number]: string } = {
    28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
    99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
    27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
    10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
  };

  const searchByGenre = async () => {
    if (!selectedGenre) {
      toast({
        title: "Error",
        description: "Please select a genre first.",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('tmdb-search', {
        body: { 
          query: '', 
          type: mediaType,
          genre: selectedGenre,
          page: 1
        }
      });

      if (error) throw error;

      if (data.results) {
        setSearchResults(data.results);
        setSelectedMovies(new Set());
      }
    } catch (error) {
      console.error('Error searching by genre:', error);
      toast({
        title: "Error",
        description: "Failed to search movies by genre.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const toggleMovieSelection = (movieId: number) => {
    const newSelected = new Set(selectedMovies);
    if (newSelected.has(movieId)) {
      newSelected.delete(movieId);
    } else {
      newSelected.add(movieId);
    }
    setSelectedMovies(newSelected);
  };

  const selectAll = () => {
    setSelectedMovies(new Set(searchResults.map(r => r.id)));
  };

  const deselectAll = () => {
    setSelectedMovies(new Set());
  };

  const bulkImportSelected = async () => {
    if (selectedMovies.size === 0) {
      toast({
        title: "Error",
        description: "Please select at least one item to import.",
        variant: "destructive"
      });
      return;
    }

    setIsImporting(true);
    setProgress(0);
    
    const selectedResults = searchResults.filter(r => selectedMovies.has(r.id));
    let successCount = 0;
    
    for (let i = 0; i < selectedResults.length; i++) {
      const result = selectedResults[i];
      
      try {
        const category = result.genre_ids && result.genre_ids.length > 0 
          ? genreMap[result.genre_ids[0]] || "Drama"
          : "Drama";

        const title = result.title || result.name || "Unknown Title";
        const releaseDate = result.release_date || result.first_air_date || new Date().toISOString().split('T')[0];
        const image = result.poster_path 
          ? `https://image.tmdb.org/t/p/w500${result.poster_path}`
          : "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=500";

        const itemData = {
          tmdb_id: result.id,
          title,
          description: result.overview || "No description available.",
          image,
          release_date: releaseDate,
          is_released: new Date(releaseDate) <= new Date(),
          category,
          rating: Math.round(result.vote_average * 10) / 10
        };

        const { error: insertError } = await supabase
          .from('movies')
          .insert([itemData]);

        if (insertError && !insertError.message.includes('duplicate')) {
          console.error(`Error adding ${title}:`, insertError);
        } else {
          successCount++;
        }
      } catch (error) {
        console.error(`Error processing ${result.title || result.name}:`, error);
      }
      
      setProgress(((i + 1) / selectedResults.length) * 100);
      
      // Small delay to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    setIsImporting(false);
    setSearchResults([]);
    setSelectedMovies(new Set());
    
    toast({
      title: "Import Complete",
      description: `Successfully imported ${successCount} out of ${selectedResults.length} items.`,
    });
    
    onImportComplete();
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg space-y-4">
      <div>
        <h3 className="text-xl font-bold text-white mb-2">Genre-Based Bulk Import</h3>
        <p className="text-gray-400 text-sm mb-4">
          Search movies and TV series by genre from TMDB and import them in bulk
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-white">Media Type</Label>
          <Select value={mediaType} onValueChange={(value: 'movie' | 'tv') => setMediaType(value)}>
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="movie">Movies</SelectItem>
              <SelectItem value="tv">TV Series</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="text-white">Genre</Label>
          <Select value={selectedGenre} onValueChange={setSelectedGenre}>
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder="Select a genre" />
            </SelectTrigger>
            <SelectContent>
              {genres.map((genre) => (
                <SelectItem key={genre.id} value={genre.id}>
                  {genre.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button 
        onClick={searchByGenre}
        disabled={isSearching || !selectedGenre}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        {isSearching ? "Searching..." : (
          <>
            <Search className="w-4 h-4 mr-2" />
            Search by Genre
          </>
        )}
      </Button>

      {searchResults.length > 0 && (
        <Card className="bg-gray-700 border-gray-600">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>Search Results ({searchResults.length})</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={selectAll}>
                  Select All
                </Button>
                <Button size="sm" variant="outline" onClick={deselectAll}>
                  Deselect All
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  onClick={() => toggleMovieSelection(result.id)}
                  className={`p-3 rounded cursor-pointer border transition-colors ${
                    selectedMovies.has(result.id)
                      ? 'bg-yellow-600 bg-opacity-20 border-yellow-400'
                      : 'bg-gray-600 border-gray-500 hover:bg-gray-500'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedMovies.has(result.id)}
                      onChange={() => toggleMovieSelection(result.id)}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <h4 className="text-white font-medium">
                        {result.title || result.name}
                      </h4>
                      <p className="text-gray-400 text-sm">
                        {result.release_date || result.first_air_date} • Rating: {result.vote_average}/10
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedMovies.size > 0 && (
        <div className="space-y-3">
          {isImporting ? (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Importing {selectedMovies.size} items...</span>
                <span className="text-yellow-400">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </>
          ) : (
            <Button 
              onClick={bulkImportSelected}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Import Selected ({selectedMovies.size} items)
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
