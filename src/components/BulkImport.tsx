
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

  // Popular titles including the 100 anime titles provided
  const titles: Array<{ title: string; type: 'tv' | 'movie' }> = [
    // Top Movies
    { title: "The Godfather", type: "movie" },
    { title: "The Godfather Part II", type: "movie" },
    { title: "The Dark Knight", type: "movie" },
    { title: "Pulp Fiction", type: "movie" },
    { title: "Fight Club", type: "movie" },
    { title: "Forrest Gump", type: "movie" },
    { title: "Inception", type: "movie" },
    { title: "Interstellar", type: "movie" },
    { title: "The Matrix", type: "movie" },
    { title: "Schindler's List", type: "movie" },
    { title: "Casablanca", type: "movie" },
    { title: "Citizen Kane", type: "movie" },
    { title: "12 Angry Men", type: "movie" },
    { title: "Lawrence of Arabia", type: "movie" },
    { title: "The Bridge on the River Kwai", type: "movie" },
    { title: "Gone with the Wind", type: "movie" },
    { title: "One Flew Over the Cuckoo's Nest", type: "movie" },
    { title: "Taxi Driver", type: "movie" },
    { title: "Apocalypse Now", type: "movie" },
    { title: "Memento", type: "movie" },
    { title: "The Prestige", type: "movie" },
    { title: "Se7en", type: "movie" },
    { title: "Shutter Island", type: "movie" },
    { title: "Donnie Darko", type: "movie" },
    { title: "Black Swan", type: "movie" },
    { title: "Oldboy", type: "movie" },
    { title: "Requiem for a Dream", type: "movie" },
    { title: "Mulholland Drive", type: "movie" },
    { title: "Eternal Sunshine of the Spotless Mind", type: "movie" },
    { title: "No Country for Old Men", type: "movie" },
    { title: "The Silence of the Lambs", type: "movie" },
    { title: "American Beauty", type: "movie" },
    { title: "A Beautiful Mind", type: "movie" },
    { title: "The Departed", type: "movie" },
    { title: "The King's Speech", type: "movie" },
    { title: "Birdman", type: "movie" },
    { title: "Slumdog Millionaire", type: "movie" },
    { title: "12 Years a Slave", type: "movie" },
    { title: "Parasite", type: "movie" },
    { title: "Star Wars: Episode IV - A New Hope", type: "movie" },
    { title: "Star Wars: The Empire Strikes Back", type: "movie" },
    { title: "The Lord of the Rings: The Fellowship of the Ring", type: "movie" },
    { title: "The Lord of the Rings: The Two Towers", type: "movie" },
    { title: "The Lord of the Rings: The Return of the King", type: "movie" },
    { title: "Avatar", type: "movie" },
    { title: "Dune", type: "movie" },
    { title: "Blade Runner", type: "movie" },
    { title: "Blade Runner 2049", type: "movie" },
    { title: "Jurassic Park", type: "movie" },
    { title: "Titanic", type: "movie" },
    { title: "La La Land", type: "movie" },
    { title: "The Notebook", type: "movie" },
    { title: "Pride and Prejudice", type: "movie" },
    { title: "Before Sunrise", type: "movie" },
    { title: "Her", type: "movie" },
    { title: "Call Me by Your Name", type: "movie" },
    { title: "Atonement", type: "movie" },
    { title: "Pan's Labyrinth", type: "movie" },
    { title: "Amélie", type: "movie" },
    { title: "Life Is Beautiful", type: "movie" },
    { title: "City of God", type: "movie" },
    { title: "Cinema Paradiso", type: "movie" },
    { title: "Ikiru", type: "movie" },
    { title: "Crouching Tiger, Hidden Dragon", type: "movie" },
    { title: "The Lives of Others", type: "movie" },
    { title: "The Hunt", type: "movie" },
    { title: "Some Like It Hot", type: "movie" },
    { title: "Monty Python and the Holy Grail", type: "movie" },
    { title: "The Big Lebowski", type: "movie" },
    { title: "Groundhog Day", type: "movie" },
    { title: "Ferris Bueller's Day Off", type: "movie" },
    { title: "Superbad", type: "movie" },
    { title: "Dr. Strangelove", type: "movie" },
    { title: "The Grand Budapest Hotel", type: "movie" },
    { title: "The Truman Show", type: "movie" },
    { title: "The Wolf of Wall Street", type: "movie" },
    { title: "Toy Story", type: "movie" },
    { title: "Finding Nemo", type: "movie" },
    { title: "WALL-E", type: "movie" },
    { title: "Up", type: "movie" },
    { title: "Inside Out", type: "movie" },
    { title: "Coco", type: "movie" },
    { title: "How to Train Your Dragon", type: "movie" },
    { title: "The Lion King", type: "movie" },
    { title: "Shrek", type: "movie" },
    { title: "Ratatouille", type: "movie" },
    { title: "Gladiator", type: "movie" },
    { title: "Mad Max: Fury Road", type: "movie" },
    { title: "The Revenant", type: "movie" },
    { title: "Skyfall", type: "movie" },
    { title: "John Wick", type: "movie" },
    { title: "Inglourious Basterds", type: "movie" },
    { title: "Kill Bill: Vol. 1", type: "movie" },
    { title: "Heat", type: "movie" },
    { title: "Die Hard", type: "movie" },
    { title: "The Bourne Ultimatum", type: "movie" },
    
    // Top TV Series
    { title: "Breaking Bad", type: "tv" },
    { title: "The Wire", type: "tv" },
    { title: "The Sopranos", type: "tv" },
    { title: "Better Call Saul", type: "tv" },
    { title: "True Detective", type: "tv" },
    { title: "Fargo", type: "tv" },
    { title: "Ozark", type: "tv" },
    { title: "Mad Men", type: "tv" },
    { title: "Boardwalk Empire", type: "tv" },
    { title: "Narcos", type: "tv" },
    { title: "Mindhunter", type: "tv" },
    { title: "Sherlock", type: "tv" },
    { title: "Hannibal", type: "tv" },
    { title: "Mr. Robot", type: "tv" },
    
    // Top 100 Anime Titles
    { title: "Fullmetal Alchemist: Brotherhood", type: "tv" },
    { title: "Steins;Gate", type: "tv" },
    { title: "Attack on Titan", type: "tv" },
    { title: "Death Note", type: "tv" },
    { title: "Hunter x Hunter", type: "tv" },
    { title: "One Piece", type: "tv" },
    { title: "Code Geass", type: "tv" },
    { title: "Demon Slayer", type: "tv" },
    { title: "Your Name", type: "movie" },
    { title: "Spirited Away", type: "movie" },
    { title: "Clannad: After Story", type: "tv" },
    { title: "Jujutsu Kaisen", type: "tv" },
    { title: "Gintama", type: "tv" },
    { title: "Mob Psycho 100", type: "tv" },
    { title: "Vinland Saga", type: "tv" },
    { title: "Made in Abyss", type: "tv" },
    { title: "Tokyo Ghoul", type: "tv" },
    { title: "Parasyte", type: "tv" },
    { title: "Psycho-Pass", type: "tv" },
    { title: "Erased", type: "tv" },
    { title: "My Hero Academia", type: "tv" },
    { title: "Fate/Zero", type: "tv" },
    { title: "Bakemonogatari", type: "tv" },
    { title: "Bleach: Thousand-Year Blood War", type: "tv" },
    { title: "Naruto: Shippuden", type: "tv" },
    { title: "Neon Genesis Evangelion", type: "tv" },
    { title: "Cowboy Bebop", type: "tv" },
    { title: "Samurai Champloo", type: "tv" },
    { title: "Hellsing Ultimate", type: "tv" },
    { title: "Re:Zero", type: "tv" },
    { title: "Toradora!", type: "tv" },
    { title: "Violet Evergarden", type: "tv" },
    { title: "The Promised Neverland", type: "tv" },
    { title: "Black Clover", type: "tv" },
    { title: "Dr. Stone", type: "tv" },
    { title: "Chainsaw Man", type: "tv" },
    { title: "Frieren: Beyond Journey's End", type: "tv" },
    { title: "Horimiya", type: "tv" },
    { title: "Berserk", type: "tv" },
    { title: "Bungo Stray Dogs", type: "tv" },
    { title: "Trigun", type: "tv" },
    { title: "No Game No Life", type: "tv" },
    { title: "Steins;Gate 0", type: "tv" },
    { title: "Kaguya-sama: Love is War", type: "tv" },
    { title: "The Rising of the Shield Hero", type: "tv" },
    { title: "Noragami", type: "tv" },
    { title: "Akame ga Kill!", type: "tv" },
    { title: "Elfen Lied", type: "tv" },
    { title: "Ergo Proxy", type: "tv" },
    { title: "Black Lagoon", type: "tv" },
    { title: "Soul Eater", type: "tv" },
    { title: "Kill la Kill", type: "tv" },
    { title: "Angel Beats!", type: "tv" },
    { title: "The Melancholy of Haruhi Suzumiya", type: "tv" },
    { title: "Yuri!!! on Ice", type: "tv" },
    { title: "Anohana", type: "tv" },
    { title: "5 Centimeters per Second", type: "movie" },
    { title: "Weathering with You", type: "movie" },
    { title: "I Want to Eat Your Pancreas", type: "movie" },
    { title: "The Garden of Words", type: "movie" },
    { title: "Bakuman", type: "tv" },
    { title: "Barakamon", type: "tv" },
    { title: "March Comes in Like a Lion", type: "tv" },
    { title: "Great Teacher Onizuka", type: "tv" },
    { title: "The Tatami Galaxy", type: "tv" },
    { title: "Ping Pong the Animation", type: "tv" },
    { title: "Terror in Resonance", type: "tv" },
    { title: "Kino's Journey", type: "tv" },
    { title: "Mushishi", type: "tv" },
    { title: "Nichijou", type: "tv" },
    { title: "A Silent Voice", type: "movie" },
    { title: "Haikyuu!!", type: "tv" },
    { title: "Kuroko's Basketball", type: "tv" },
    { title: "Blue Lock", type: "tv" },
    { title: "Initial D", type: "tv" },
    { title: "Golden Kamuy", type: "tv" },
    { title: "Dorohedoro", type: "tv" },
    { title: "Baccano!", type: "tv" },
    { title: "Durarara!!", type: "tv" },
    { title: "Devilman Crybaby", type: "tv" },
    { title: "Cyberpunk: Edgerunners", type: "tv" },
    { title: "The Dangers in My Heart", type: "tv" },
    { title: "Call of the Night", type: "tv" },
    { title: "The World God Only Knows", type: "tv" },
    { title: "Nana", type: "tv" },
    { title: "K-On!", type: "tv" },
    { title: "School Rumble", type: "tv" },
    { title: "Shiki", type: "tv" },
    { title: "Higurashi When They Cry", type: "tv" },
    { title: "Monster", type: "tv" },
    { title: "Paranoia Agent", type: "tv" },
    { title: "Serial Experiments Lain", type: "tv" },
    { title: "Texhnolyze", type: "tv" },
    { title: "Planetes", type: "tv" },
    { title: "Space Brothers", type: "tv" },
    { title: "Welcome to the NHK", type: "tv" },
    { title: "Arakawa Under the Bridge", type: "tv" },
    { title: "Lucky Star", type: "tv" },
    { title: "Haven't You Heard? I'm Sakamoto", type: "tv" },
    { title: "Toriko", type: "tv" },
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

        // Special handling for anime titles
        const animeKeywords = [
          "fullmetal", "steins", "attack on titan", "death note", "hunter", "one piece", 
          "code geass", "demon slayer", "spirited away", "clannad", "jujutsu", "gintama",
          "mob psycho", "vinland", "made in abyss", "tokyo ghoul", "parasyte", "psycho-pass",
          "erased", "hero academia", "fate", "monogatari", "bleach", "naruto", "evangelion",
          "cowboy bebop", "champloo", "hellsing", "re:zero", "toradora", "violet evergarden",
          "promised neverland", "black clover", "dr. stone", "chainsaw man", "frieren",
          "horimiya", "berserk", "bungo stray dogs", "trigun", "no game no life", "kaguya",
          "shield hero", "noragami", "akame", "elfen lied", "ergo proxy", "black lagoon",
          "soul eater", "kill la kill", "angel beats", "haruhi", "yuri on ice", "anohana",
          "5 centimeters", "weathering", "pancreas", "garden of words", "bakuman",
          "barakamon", "march comes", "onizuka", "tatami galaxy", "ping pong", "terror",
          "kino", "mushishi", "nichijou", "silent voice", "haikyuu", "kuroko", "blue lock",
          "initial d", "golden kamuy", "dorohedoro", "baccano", "durarara", "devilman",
          "cyberpunk", "dangers in my heart", "call of the night", "world god only knows",
          "nana", "k-on", "school rumble", "shiki", "higurashi", "monster", "paranoia",
          "serial experiments", "texhnolyze", "planetes", "space brothers", "welcome to the nhk",
          "arakawa", "lucky star", "sakamoto", "toriko", "your name"
        ];

        const isAnime = animeKeywords.some(keyword => 
          title.toLowerCase().includes(keyword) || 
          tmdbItem.overview?.toLowerCase().includes(keyword) ||
          (tmdbItem.origin_country && tmdbItem.origin_country.includes('JP'))
        );

        if (isAnime) {
          category = "Animation";
        } else if (isTV) {
          if (tmdbItem.genre_ids && tmdbItem.genre_ids.length > 0) {
            category = genreMap[tmdbItem.genre_ids[0]] || "Drama";
          }
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
          Import {titles.length} popular movies, TV series, and anime titles
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
