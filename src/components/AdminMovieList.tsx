
import { Button } from "@/components/ui/button";
import { Movie } from "@/types/Movie";
import { Trash2 } from "lucide-react";
import { generateSitemap, saveSitemap } from "@/utils/sitemapGenerator";
import { toast } from "@/hooks/use-toast";

interface AdminMovieListProps {
  movies: Movie[];
  onDeleteMovie: (id: string) => void;
}

export const AdminMovieList = ({ movies, onDeleteMovie }: AdminMovieListProps) => {
  const handleDeleteWithSitemapUpdate = async (id: string) => {
    // Delete the movie first
    onDeleteMovie(id);
    
    // Then update sitemap in background
    try {
      const sitemapXml = await generateSitemap();
      await saveSitemap(sitemapXml);
      console.log('Sitemap updated after movie deletion');
    } catch (error) {
      console.error('Error updating sitemap:', error);
    }
  };

  if (movies.length === 0) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg text-center">
        <p className="text-gray-400">No movies added yet. Add your first movie using the form.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {movies.map((movie) => (
        <div key={movie.id} className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src={movie.image} 
              alt={movie.title}
              className="w-16 h-20 object-cover rounded"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=500";
              }}
            />
            <div>
              <h3 className="font-semibold text-white">{movie.title}</h3>
              <p className="text-sm text-gray-400">{movie.category}</p>
              <p className="text-xs text-gray-500">
                {new Date(movie.releaseDate).getFullYear()} • 
                {movie.isReleased ? " Released" : " Coming Soon"}
              </p>
            </div>
          </div>
          
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDeleteWithSitemapUpdate(movie.id)}
            className="flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        </div>
      ))}
    </div>
  );
};
