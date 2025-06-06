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

  // Comprehensive movie, TV series, and anime collection
  const titles: Array<{ title: string; type: 'tv' | 'movie' }> = [
    // Marvel Cinematic Universe
    { title: "Iron Man", type: "movie" },
    { title: "The Incredible Hulk", type: "movie" },
    { title: "Iron Man 2", type: "movie" },
    { title: "Thor", type: "movie" },
    { title: "Captain America: The First Avenger", type: "movie" },
    { title: "The Avengers", type: "movie" },
    { title: "Iron Man 3", type: "movie" },
    { title: "Thor: The Dark World", type: "movie" },
    { title: "Captain America: The Winter Soldier", type: "movie" },
    { title: "Guardians of the Galaxy", type: "movie" },
    { title: "Avengers: Age of Ultron", type: "movie" },
    { title: "Ant-Man", type: "movie" },
    { title: "Captain America: Civil War", type: "movie" },
    { title: "Doctor Strange", type: "movie" },
    { title: "Guardians of the Galaxy Vol. 2", type: "movie" },
    { title: "Spider-Man: Homecoming", type: "movie" },
    { title: "Thor: Ragnarok", type: "movie" },
    { title: "Black Panther", type: "movie" },
    { title: "Avengers: Infinity War", type: "movie" },
    { title: "Ant-Man and the Wasp", type: "movie" },
    { title: "Captain Marvel", type: "movie" },
    { title: "Avengers: Endgame", type: "movie" },
    { title: "Spider-Man: Far From Home", type: "movie" },
    { title: "Black Widow", type: "movie" },
    { title: "Shang-Chi and the Legend of the Ten Rings", type: "movie" },
    { title: "Eternals", type: "movie" },
    { title: "Spider-Man: No Way Home", type: "movie" },
    { title: "Doctor Strange in the Multiverse of Madness", type: "movie" },
    { title: "Thor: Love and Thunder", type: "movie" },
    { title: "Black Panther: Wakanda Forever", type: "movie" },
    { title: "Ant-Man and the Wasp: Quantumania", type: "movie" },
    { title: "Guardians of the Galaxy Vol. 3", type: "movie" },
    { title: "The Marvels", type: "movie" },

    // Star Wars
    { title: "Star Wars: Episode I – The Phantom Menace", type: "movie" },
    { title: "Star Wars: Episode II – Attack of the Clones", type: "movie" },
    { title: "Star Wars: Episode III – Revenge of the Sith", type: "movie" },
    { title: "Solo: A Star Wars Story", type: "movie" },
    { title: "Rogue One: A Star Wars Story", type: "movie" },
    { title: "Star Wars: Episode IV – A New Hope", type: "movie" },
    { title: "Star Wars: Episode V – The Empire Strikes Back", type: "movie" },
    { title: "Star Wars: Episode VI – Return of the Jedi", type: "movie" },
    { title: "Star Wars: Episode VII – The Force Awakens", type: "movie" },
    { title: "Star Wars: Episode VIII – The Last Jedi", type: "movie" },
    { title: "Star Wars: Episode IX – The Rise of Skywalker", type: "movie" },

    // Harry Potter & Fantastic Beasts
    { title: "Harry Potter and the Sorcerer's Stone", type: "movie" },
    { title: "Harry Potter and the Chamber of Secrets", type: "movie" },
    { title: "Harry Potter and the Prisoner of Azkaban", type: "movie" },
    { title: "Harry Potter and the Goblet of Fire", type: "movie" },
    { title: "Harry Potter and the Order of the Phoenix", type: "movie" },
    { title: "Harry Potter and the Half-Blood Prince", type: "movie" },
    { title: "Harry Potter and the Deathly Hallows – Part 1", type: "movie" },
    { title: "Harry Potter and the Deathly Hallows – Part 2", type: "movie" },
    { title: "Fantastic Beasts and Where to Find Them", type: "movie" },
    { title: "Fantastic Beasts: The Crimes of Grindelwald", type: "movie" },
    { title: "Fantastic Beasts: The Secrets of Dumbledore", type: "movie" },

    // Spider-Man Movies
    { title: "Spider-Man", type: "movie" },
    { title: "Spider-Man 2", type: "movie" },
    { title: "Spider-Man 3", type: "movie" },
    { title: "The Amazing Spider-Man", type: "movie" },
    { title: "The Amazing Spider-Man 2", type: "movie" },
    { title: "Spider-Man: Into the Spider-Verse", type: "movie" },
    { title: "Spider-Man: Across the Spider-Verse", type: "movie" },

    // James Bond
    { title: "Dr. No", type: "movie" },
    { title: "From Russia with Love", type: "movie" },
    { title: "Goldfinger", type: "movie" },
    { title: "Thunderball", type: "movie" },
    { title: "You Only Live Twice", type: "movie" },
    { title: "On Her Majesty's Secret Service", type: "movie" },
    { title: "Diamonds Are Forever", type: "movie" },
    { title: "Live and Let Die", type: "movie" },
    { title: "The Man with the Golden Gun", type: "movie" },
    { title: "The Spy Who Loved Me", type: "movie" },
    { title: "Moonraker", type: "movie" },
    { title: "For Your Eyes Only", type: "movie" },
    { title: "Octopussy", type: "movie" },
    { title: "A View to a Kill", type: "movie" },
    { title: "The Living Daylights", type: "movie" },
    { title: "Licence to Kill", type: "movie" },
    { title: "GoldenEye", type: "movie" },
    { title: "Tomorrow Never Dies", type: "movie" },
    { title: "The World Is Not Enough", type: "movie" },
    { title: "Die Another Day", type: "movie" },
    { title: "Casino Royale", type: "movie" },
    { title: "Quantum of Solace", type: "movie" },
    { title: "Skyfall", type: "movie" },
    { title: "Spectre", type: "movie" },
    { title: "No Time to Die", type: "movie" },

    // Lord of the Rings & The Hobbit
    { title: "The Lord of the Rings: The Fellowship of the Ring", type: "movie" },
    { title: "The Lord of the Rings: The Two Towers", type: "movie" },
    { title: "The Lord of the Rings: The Return of the King", type: "movie" },
    { title: "The Hobbit: An Unexpected Journey", type: "movie" },
    { title: "The Hobbit: The Desolation of Smaug", type: "movie" },
    { title: "The Hobbit: The Battle of the Five Armies", type: "movie" },

    // Fast & Furious
    { title: "The Fast and the Furious", type: "movie" },
    { title: "2 Fast 2 Furious", type: "movie" },
    { title: "The Fast and the Furious: Tokyo Drift", type: "movie" },
    { title: "Fast & Furious", type: "movie" },
    { title: "Fast Five", type: "movie" },
    { title: "Fast & Furious 6", type: "movie" },
    { title: "Furious 7", type: "movie" },
    { title: "The Fate of the Furious", type: "movie" },
    { title: "Fast & Furious Presents: Hobbs & Shaw", type: "movie" },
    { title: "F9: The Fast Saga", type: "movie" },
    { title: "Fast X", type: "movie" },

    // Batman / The Dark Knight
    { title: "Batman", type: "movie" },
    { title: "Batman Returns", type: "movie" },
    { title: "Batman Forever", type: "movie" },
    { title: "Batman & Robin", type: "movie" },
    { title: "Batman Begins", type: "movie" },
    { title: "The Dark Knight", type: "movie" },
    { title: "The Dark Knight Rises", type: "movie" },
    { title: "Batman v Superman: Dawn of Justice", type: "movie" },
    { title: "Justice League", type: "movie" },
    { title: "Zack Snyder's Justice League", type: "movie" },
    { title: "The Batman", type: "movie" },

    // X-Men
    { title: "X-Men", type: "movie" },
    { title: "X2: X-Men United", type: "movie" },
    { title: "X-Men: The Last Stand", type: "movie" },
    { title: "X-Men Origins: Wolverine", type: "movie" },
    { title: "X-Men: First Class", type: "movie" },
    { title: "The Wolverine", type: "movie" },
    { title: "X-Men: Days of Future Past", type: "movie" },
    { title: "Deadpool", type: "movie" },
    { title: "X-Men: Apocalypse", type: "movie" },
    { title: "Logan", type: "movie" },
    { title: "Deadpool 2", type: "movie" },
    { title: "Dark Phoenix", type: "movie" },
    { title: "The New Mutants", type: "movie" },

    // Transformers
    { title: "Transformers", type: "movie" },
    { title: "Transformers: Revenge of the Fallen", type: "movie" },
    { title: "Transformers: Dark of the Moon", type: "movie" },
    { title: "Transformers: Age of Extinction", type: "movie" },
    { title: "Transformers: The Last Knight", type: "movie" },
    { title: "Bumblebee", type: "movie" },
    { title: "Transformers: Rise of the Beasts", type: "movie" },

    // The Hunger Games
    { title: "The Hunger Games", type: "movie" },
    { title: "The Hunger Games: Catching Fire", type: "movie" },
    { title: "The Hunger Games: Mockingjay – Part 1", type: "movie" },
    { title: "The Hunger Games: Mockingjay – Part 2", type: "movie" },
    { title: "The Ballad of Songbirds and Snakes", type: "movie" },

    // Pirates of the Caribbean
    { title: "Pirates of the Caribbean: The Curse of the Black Pearl", type: "movie" },
    { title: "Pirates of the Caribbean: Dead Man's Chest", type: "movie" },
    { title: "Pirates of the Caribbean: At World's End", type: "movie" },
    { title: "Pirates of the Caribbean: On Stranger Tides", type: "movie" },
    { title: "Pirates of the Caribbean: Dead Men Tell No Tales", type: "movie" },

    // Twilight Saga
    { title: "Twilight", type: "movie" },
    { title: "The Twilight Saga: New Moon", type: "movie" },
    { title: "The Twilight Saga: Eclipse", type: "movie" },
    { title: "The Twilight Saga: Breaking Dawn – Part 1", type: "movie" },
    { title: "The Twilight Saga: Breaking Dawn – Part 2", type: "movie" },

    // The Incredibles
    { title: "The Incredibles", type: "movie" },
    { title: "Incredibles 2", type: "movie" },

    // Frozen
    { title: "Frozen", type: "movie" },
    { title: "Frozen II", type: "movie" },

    // Toy Story
    { title: "Toy Story", type: "movie" },
    { title: "Toy Story 2", type: "movie" },
    { title: "Toy Story 3", type: "movie" },
    { title: "Toy Story 4", type: "movie" },

    // Despicable Me / Minions
    { title: "Despicable Me", type: "movie" },
    { title: "Despicable Me 2", type: "movie" },
    { title: "Minions", type: "movie" },
    { title: "Despicable Me 3", type: "movie" },
    { title: "Minions: The Rise of Gru", type: "movie" },

    // Jurassic Park / World
    { title: "Jurassic Park", type: "movie" },
    { title: "The Lost World: Jurassic Park", type: "movie" },
    { title: "Jurassic Park III", type: "movie" },
    { title: "Jurassic World", type: "movie" },
    { title: "Jurassic World: Fallen Kingdom", type: "movie" },
    { title: "Jurassic World Dominion", type: "movie" },

    // The Lego Movies
    { title: "The Lego Movie", type: "movie" },
    { title: "The Lego Batman Movie", type: "movie" },
    { title: "The Lego Ninjago Movie", type: "movie" },
    { title: "The Lego Movie 2: The Second Part", type: "movie" },

    // Shrek
    { title: "Shrek", type: "movie" },
    { title: "Shrek 2", type: "movie" },
    { title: "Shrek the Third", type: "movie" },
    { title: "Shrek Forever After", type: "movie" },
    { title: "Puss in Boots", type: "movie" },
    { title: "Puss in Boots: The Last Wish", type: "movie" },

    // The Matrix
    { title: "The Matrix", type: "movie" },
    { title: "The Matrix Reloaded", type: "movie" },
    { title: "The Matrix Revolutions", type: "movie" },
    { title: "The Matrix Resurrections", type: "movie" },

    // The Conjuring Universe
    { title: "The Conjuring", type: "movie" },
    { title: "Annabelle", type: "movie" },
    { title: "The Conjuring 2", type: "movie" },
    { title: "Annabelle: Creation", type: "movie" },
    { title: "The Nun", type: "movie" },
    { title: "The Curse of La Llorona", type: "movie" },
    { title: "Annabelle Comes Home", type: "movie" },
    { title: "The Conjuring: The Devil Made Me Do It", type: "movie" },
    { title: "The Nun II", type: "movie" },

    // How to Train Your Dragon
    { title: "How to Train Your Dragon", type: "movie" },
    { title: "How to Train Your Dragon 2", type: "movie" },
    { title: "How to Train Your Dragon: The Hidden World", type: "movie" },

    // Finding Nemo / Dory
    { title: "Finding Nemo", type: "movie" },
    { title: "Finding Dory", type: "movie" },

    // The Secret Life of Pets
    { title: "The Secret Life of Pets", type: "movie" },
    { title: "The Secret Life of Pets 2", type: "movie" },

    // Zootopia
    { title: "Zootopia", type: "movie" },

    // The Chronicles of Narnia
    { title: "The Chronicles of Narnia: The Lion, the Witch and the Wardrobe", type: "movie" },
    { title: "The Chronicles of Narnia: Prince Caspian", type: "movie" },
    { title: "The Chronicles of Narnia: The Voyage of the Dawn Treader", type: "movie" },

    // Kung Fu Panda (excluding KFP 4 as requested)
    { title: "Kung Fu Panda", type: "movie" },
    { title: "Kung Fu Panda 2", type: "movie" },
    { title: "Kung Fu Panda 3", type: "movie" },

    // Top Anime Titles
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
    { title: "Monogatari Series", type: "tv" },
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
          Import {titles.length} popular movies, TV series, and anime including MCU, Star Wars, Harry Potter, Fast & Furious, Batman, X-Men, and many more blockbuster franchises
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
