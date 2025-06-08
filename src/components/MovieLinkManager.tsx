
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Plus, ExternalLink, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Movie } from "@/types/Movie";

interface MovieLink {
  id: string;
  movie_id: string;
  download_url: string;
  movie_title?: string;
}

interface MovieLinkManagerProps {
  movies: Movie[];
}

export const MovieLinkManager = ({ movies }: MovieLinkManagerProps) => {
  const [movieLinks, setMovieLinks] = useState<MovieLink[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const loadMovieLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('movie_links')
        .select(`
          id,
          movie_id,
          download_url,
          movies!inner(title)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedLinks: MovieLink[] = (data as any[]).map((link: any) => ({
        id: link.id,
        movie_id: link.movie_id,
        download_url: link.download_url,
        movie_title: link.movies?.title || 'Unknown Movie'
      }));

      setMovieLinks(formattedLinks);
    } catch (error) {
      console.error('Error loading movie links:', error);
      toast({
        title: "Error",
        description: "Failed to load movie links.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadMovieLinks();
  }, []);

  const handleAddLink = async () => {
    if (!selectedMovie || !downloadUrl) {
      toast({
        title: "Error",
        description: "Please select a movie and enter a download URL.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('movie_links')
        .insert([{
          movie_id: selectedMovie.id,
          download_url: downloadUrl
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Movie download link added successfully!",
      });

      setSelectedMovie(null);
      setDownloadUrl("");
      setSearchQuery("");
      loadMovieLinks();
    } catch (error) {
      console.error('Error adding movie link:', error);
      toast({
        title: "Error",
        description: "Failed to add movie link.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from('movie_links')
        .delete()
        .eq('id', linkId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Movie link deleted successfully!",
      });

      loadMovieLinks();
    } catch (error) {
      console.error('Error deleting movie link:', error);
      toast({
        title: "Error",
        description: "Failed to delete movie link.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Add Watch Link
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="movie-search" className="text-white">Search Movie</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="movie-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a movie..."
                className="bg-gray-700 border-gray-600 text-white pl-10"
              />
            </div>
            
            {searchQuery && filteredMovies.length > 0 && (
              <div className="mt-2 max-h-40 overflow-y-auto bg-gray-700 border border-gray-600 rounded">
                {filteredMovies.slice(0, 5).map((movie) => (
                  <div
                    key={movie.id}
                    onClick={() => {
                      setSelectedMovie(movie);
                      setSearchQuery(movie.title);
                    }}
                    className="p-2 hover:bg-gray-600 cursor-pointer text-white border-b border-gray-600 last:border-b-0"
                  >
                    {movie.title}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="download-url" className="text-white">Watch URL</Label>
            <Input
              id="download-url"
              value={downloadUrl}
              onChange={(e) => setDownloadUrl(e.target.value)}
              placeholder="Enter watch URL..."
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <Button 
            onClick={handleAddLink}
            disabled={isLoading || !selectedMovie}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isLoading ? "Adding..." : "Add Watch Link"}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">
            Existing Watch Links ({movieLinks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {movieLinks.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No watch links added yet.</p>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-3 pr-4">
                {movieLinks.map((link) => (
                  <div key={link.id} className="bg-gray-700 p-4 rounded-lg flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{link.movie_title}</h4>
                      <p className="text-gray-400 text-sm truncate">{link.download_url}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(link.download_url, '_blank')}
                        className="border-gray-600 text-gray-300 hover:text-white"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteLink(link.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
