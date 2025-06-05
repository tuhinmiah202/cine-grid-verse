
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
    const { type } = await req.json();
    
    if (!type || (type !== 'movie' && type !== 'tv')) {
      return new Response(
        JSON.stringify({ error: 'Type parameter must be "movie" or "tv"' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const TMDB_API_KEY = '566149bf98e53cc39a4c04bfe01c03fc';
    
    // Fetch multiple pages to get 100 items
    const responses = await Promise.all([
      fetch(`https://api.themoviedb.org/3/${type}/popular?api_key=${TMDB_API_KEY}&page=1`),
      fetch(`https://api.themoviedb.org/3/${type}/popular?api_key=${TMDB_API_KEY}&page=2`),
      fetch(`https://api.themoviedb.org/3/${type}/popular?api_key=${TMDB_API_KEY}&page=3`),
      fetch(`https://api.themoviedb.org/3/${type}/popular?api_key=${TMDB_API_KEY}&page=4`),
      fetch(`https://api.themoviedb.org/3/${type}/popular?api_key=${TMDB_API_KEY}&page=5`)
    ]);

    const data = await Promise.all(responses.map(response => response.json()));
    
    // Combine all results and take first 100
    const allResults = data.flatMap(page => page.results).slice(0, 100);
    
    return new Response(
      JSON.stringify({ results: allResults }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in tmdb-top function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})
