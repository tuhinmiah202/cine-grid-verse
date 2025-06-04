
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, ExternalLink } from "lucide-react";
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
  const [selectedMovieId, setSelectedMovieId] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loadMovieLinks = async () => {
    try {
      // Use rpc to get movie links with movie titles since types aren't updated yet
      const { data, error } = await supabase.rpc('get_movie_links_with_titles');
      
      if (error) {
        // Fallback to raw query if RPC doesn't exist
        const { data: rawData, error: rawError } = await supabase
          .from('movie_links' as any)
          .select(`
            id,
            movie_id,
            download_url,
            movies!movie_links_movie_id_fkey(title)
          `)
          .order('created_at', { ascending: false });
          
        if (rawError) throw rawError;
        
        const formattedLinks: MovieLink[] = (rawData as any[]).map((link: any) => ({
          id: link.id,
          movie_id: link.movie_id,
          download_url: link.download_url,
          movie_title: link.movies?.title || 'Unknown Movie'
        }));
        
        setMovieLinks(formattedLinks);
        return;
      }

      setMovieLinks(data || []);
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
    if (!selectedMovieId || !downloadUrl) {
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
        .from('movie_links' as any)
        .insert([{
          movie_id: selectedMovieId,
          download_url: downloadUrl
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Movie download link added successfully!",
      });

      setSelectedMovieId("");
      setDownloadUrl("");
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
        .from('movie_links' as any)
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
            Add Download Link
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="movie-select" className="text-white">Select Movie</Label>
            <Select value={selectedMovieId} onValueChange={setSelectedMovieId}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Choose a movie..." />
              </SelectTrigger>
              <SelectContent>
                {movies.map((movie) => (
                  <SelectItem key={movie.id} value={movie.id}>
                    {movie.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="download-url" className="text-white">Download URL</Label>
            <Input
              id="download-url"
              value={downloadUrl}
              onChange={(e) => setDownloadUrl(e.target.value)}
              placeholder="Enter download URL..."
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <Button 
            onClick={handleAddLink}
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isLoading ? "Adding..." : "Add Download Link"}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">
            Existing Download Links ({movieLinks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {movieLinks.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No download links added yet.</p>
          ) : (
            <div className="space-y-3">
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};
