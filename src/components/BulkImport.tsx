
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface BulkImportProps {
  onImportComplete: () => void;
}

export const BulkImport = ({ onImportComplete }: BulkImportProps) => {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTitle, setCurrentTitle] = useState("");

  // Popular titles from the screenshots
  const titles = [
    // Crime & Drama Series
    { title: "Dexter", type: "tv" },
    { title: "Luther", type: "tv" },
    { title: "Broadchurch", type: "tv" },
    { title: "The Night Of", type: "tv" },
    { title: "Top of the Lake", type: "tv" },
    { title: "The Fall", type: "tv" },
    
    // Fantasy, Sci-Fi & Supernatural
    { title: "Game of Thrones", type: "tv" },
    { title: "The Mandalorian", type: "tv" },
    { title: "Stranger Things", type: "tv" },
    { title: "The Last of Us", type: "tv" },
    { title: "Westworld", type: "tv" },
    { title: "Dark", type: "tv" },
    { title: "The Expanse", type: "tv" },
    { title: "Black Mirror", type: "tv" },
    { title: "The Witcher", type: "tv" },
    { title: "Doctor Who", type: "tv" },
    
    // Animated & Adult Animation
    { title: "Rick and Morty", type: "tv" },
    { title: "BoJack Horseman", type: "tv" },
    { title: "Avatar The Last Airbender", type: "tv" },
    { title: "The Legend of Korra", type: "tv" },
    { title: "Gravity Falls", type: "tv" },
    { title: "Arcane", type: "tv" },
    { title: "Invincible", type: "tv" },
    { title: "Attack on Titan", type: "tv" },
    { title: "Death Note", type: "tv" },
    { title: "Fullmetal Alchemist Brotherhood", type: "tv" },
    
    // Comedy & Sitcoms
    { title: "Friends", type: "tv" },
    { title: "The Office", type: "tv" },
    { title: "The Big Bang Theory", type: "tv" },
    { title: "How I Met Your Mother", type: "tv" },
    { title: "Parks and Recreation", type: "tv" },
    { title: "Brooklyn Nine-Nine", type: "tv" },
    { title: "Seinfeld", type: "tv" },
    { title: "Community", type: "tv" },
    { title: "Modern Family", type: "tv" },
    { title: "It's Always Sunny in Philadelphia", type: "tv" },
    
    // Miniseries & Limited Series
    { title: "Chernobyl", type: "tv" },
    { title: "Band of Brothers", type: "tv" },
    { title: "When They See Us", type: "tv" },
    { title: "The Queen's Gambit", type: "tv" },
    { title: "Unbelievable", type: "tv" },
    { title: "Mare of Easttown", type: "tv" },
    { title: "The Night Manager", type: "tv" },
    { title: "The Haunting of Hill House", type: "tv" },
    { title: "Alias Grace", type: "tv" },
    { title: "Godless", type: "tv" },
    
    // International Hits
    { title: "Money Heist", type: "tv" },
    { title: "Squid Game", type: "tv" },
    { title: "Sacred Games", type: "tv" },
    { title: "Borgen", type: "tv" },
    { title: "Fauda", type: "tv" },
    { title: "Lupin", type: "tv" },
    { title: "Giri Haji", type: "tv" },
    { title: "My Brilliant Friend", type: "tv" },
    { title: "The Bridge", type: "tv" },
    { title: "Alice in Borderland", type: "tv" },
    
    // Teen, Coming-of-Age & YA
    { title: "Euphoria", type: "tv" },
    { title: "The OC", type: "tv" },
    { title: "One Tree Hill", type: "tv" },
    { title: "13 Reasons Why", type: "tv" },
    { title: "Never Have I Ever", type: "tv" },
    { title: "Sex Education", type: "tv" },
    { title: "Heartstopper", type: "tv" },
    { title: "Gossip Girl", type: "tv" },
    { title: "The Vampire Diaries", type: "tv" },
    { title: "Gilmore Girls", type: "tv" },
    
    // Documentary & Reality
    { title: "Planet Earth", type: "tv" },
    { title: "Planet Earth II", type: "tv" },
    { title: "Blue Planet", type: "tv" },
    { title: "Making a Murderer", type: "tv" },
    { title: "The Jinx", type: "tv" },
    { title: "Tiger King", type: "tv" },
    
    // Recent Breakouts & Underrated Gems
    { title: "The Bear", type: "tv" },
    { title: "Beef", type: "tv" },
    { title: "The Boys", type: "tv" },
    { title: "Severance", type: "tv" },
    { title: "Yellowjackets", type: "tv" },
    { title: "The Morning Show", type: "tv" },
    { title: "The Leftovers", type: "tv" },
    { title: "Station Eleven", type: "tv" },
    { title: "Barry", type: "tv" },
    { title: "Wild Wild Country", type: "tv" },
    { title: "Last Chance U", type: "tv" },
    { title: "Cheer", type: "tv" },
    { title: "Drive to Survive", type: "tv" },
    { title: "The Defiant Ones", type: "tv" },
  ];

  const searchAndAddTitle = async (title: string, type: 'tv' | 'movie') => {
    try {
      const { data, error } = await supabase.functions.invoke('tmdb-search', {
        body: { query: title, type }
      });

      if (error) throw error;

      if (data.results && data.results.length > 0) {
        const tmdbItem = data.results[0];
        
        const genreMap: { [key: number]: string } = {
          28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
          99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
          27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
          10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
        };

        const isTV = type === 'tv' || tmdbItem.media_type === 'tv' || tmdbItem.first_air_date;
        let category = "Drama";

        if (isTV) {
          category = "TV Series";
        } else if (tmdbItem.genre_ids && tmdbItem.genre_ids.length > 0) {
          category = genreMap[tmdbItem.genre_ids[0]] || "Drama";
        }

        const itemTitle = tmdbItem.title || tmdbItem.name || title;
        const releaseDate = tmdbItem.release_date || tmdbItem.first_air_date || new Date().toISOString().split('T')[0];
        const image = tmdbItem.poster_path 
          ? `https://image.tmdb.org/t/p/w500${tmdbItem.poster_path}`
          : "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=500";

        const itemData = {
          tmdb_id: tmdbItem.id,
          title: itemTitle,
          description: tmdbItem.overview || "No description available.",
          image,
          release_date: releaseDate,
          is_released: new Date(releaseDate) <= new Date(),
          category,
          rating: Math.round(tmdbItem.vote_average * 10) / 10
        };

        const { error: insertError } = await supabase
          .from('movies')
          .insert([itemData]);

        if (insertError && !insertError.message.includes('duplicate')) {
          console.error(`Error adding ${title}:`, insertError);
        }

        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error processing ${title}:`, error);
      return false;
    }
  };

  const startBulkImport = async () => {
    setIsImporting(true);
    setProgress(0);
    
    let successCount = 0;
    
    for (let i = 0; i < titles.length; i++) {
      const { title, type } = titles[i];
      setCurrentTitle(title);
      
      const success = await searchAndAddTitle(title, type);
      if (success) successCount++;
      
      setProgress(((i + 1) / titles.length) * 100);
      
      // Small delay to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsImporting(false);
    setCurrentTitle("");
    
    toast({
      title: "Import Complete",
      description: `Successfully processed ${successCount} out of ${titles.length} titles.`,
    });
    
    onImportComplete();
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg space-y-4">
      <div>
        <h3 className="text-xl font-bold text-white mb-2">Bulk Import Popular Titles</h3>
        <p className="text-gray-400 text-sm mb-4">
          Import {titles.length} popular movies and TV series from your screenshots
        </p>
      </div>
      
      {isImporting ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Importing...</span>
            <span className="text-yellow-400">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="w-full" />
          {currentTitle && (
            <p className="text-sm text-gray-300">Adding: {currentTitle}</p>
          )}
        </div>
      ) : (
        <Button 
          onClick={startBulkImport}
          className="w-full bg-green-600 hover:bg-green-700"
          disabled={isImporting}
        >
          Start Bulk Import ({titles.length} titles)
        </Button>
      )}
    </div>
  );
};
