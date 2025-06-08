
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, type = 'multi', genre, page = 1 } = await req.json();
    
    const TMDB_API_KEY = '566149bf98e53cc39a4c04bfe01c03fc';
    let endpoint = '';
    let url = '';
    
    // If genre is provided, use discover endpoint instead of search
    if (genre) {
      if (type === 'tv') {
        endpoint = 'discover/tv';
        url = `https://api.themoviedb.org/3/${endpoint}?api_key=${TMDB_API_KEY}&with_genres=${genre}&page=${page}&sort_by=popularity.desc&include_adult=false`;
      } else if (type === 'movie') {
        endpoint = 'discover/movie';
        url = `https://api.themoviedb.org/3/${endpoint}?api_key=${TMDB_API_KEY}&with_genres=${genre}&page=${page}&sort_by=popularity.desc&include_adult=false`;
      } else {
        // For multi type, we'll search both movies and TV shows and combine results
        const movieUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genre}&page=${page}&sort_by=popularity.desc&include_adult=false`;
        const tvUrl = `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&with_genres=${genre}&page=${page}&sort_by=popularity.desc&include_adult=false`;
        
        console.log('Making requests to both movie and TV endpoints for genre:', genre);
        
        const [movieResponse, tvResponse] = await Promise.all([
          fetch(movieUrl),
          fetch(tvUrl)
        ]);
        
        if (!movieResponse.ok || !tvResponse.ok) {
          console.error(`TMDB API error: Movie: ${movieResponse.status}, TV: ${tvResponse.status}`);
          throw new Error(`TMDB API error`);
        }
        
        const [movieData, tvData] = await Promise.all([
          movieResponse.json(),
          tvResponse.json()
        ]);
        
        // Add media_type to distinguish between movies and TV shows
        const movieResults = movieData.results.map((item: any) => ({ ...item, media_type: 'movie' }));
        const tvResults = tvData.results.map((item: any) => ({ ...item, media_type: 'tv' }));
        
        // Combine and sort by popularity
        const combinedResults = [...movieResults, ...tvResults]
          .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
          .slice(0, 20); // Limit to 20 results per page
        
        const combinedData = {
          page: parseInt(page),
          results: combinedResults,
          total_pages: Math.max(movieData.total_pages || 0, tvData.total_pages || 0),
          total_results: (movieData.total_results || 0) + (tvData.total_results || 0)
        };
        
        console.log('Combined response received, results count:', combinedData.results.length);
        
        return new Response(
          JSON.stringify(combinedData),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    } else {
      // Regular search functionality
      if (!query) {
        return new Response(
          JSON.stringify({ error: 'Query parameter is required when not searching by genre' }), 
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      switch (type) {
        case 'movie':
          endpoint = 'search/movie';
          break;
        case 'tv':
          endpoint = 'search/tv';
          break;
        default:
          endpoint = 'search/multi';
      }
      
      url = `https://api.themoviedb.org/3/${endpoint}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}&include_adult=false`;
    }
    
    console.log('Making request to:', url);
    
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`TMDB API error: ${response.status} - ${response.statusText}`);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('TMDB response received, results count:', data.results?.length || 0);
    
    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in tmdb-search function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})
