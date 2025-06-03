
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
    const { tmdb_id } = await req.json();
    
    if (!tmdb_id) {
      return new Response(
        JSON.stringify({ error: 'TMDB ID is required' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const TMDB_API_KEY = '566149bf98e53cc39a4c04bfe01c03fc';
    
    // Fetch movie/TV details
    const detailsResponse = await fetch(
      `https://api.themoviedb.org/3/movie/${tmdb_id}?api_key=${TMDB_API_KEY}&append_to_response=credits`
    );

    if (!detailsResponse.ok) {
      // Try TV series if movie fails
      const tvResponse = await fetch(
        `https://api.themoviedb.org/3/tv/${tmdb_id}?api_key=${TMDB_API_KEY}&append_to_response=credits`
      );
      
      if (!tvResponse.ok) {
        throw new Error(`TMDB API error: ${detailsResponse.status}`);
      }
      
      const tvData = await tvResponse.json();
      // Add cast to the main object for easier access
      tvData.cast = tvData.credits?.cast?.slice(0, 20) || [];
      
      return new Response(
        JSON.stringify(tvData),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const movieData = await detailsResponse.json();
    // Add cast to the main object for easier access
    movieData.cast = movieData.credits?.cast?.slice(0, 20) || [];
    
    return new Response(
      JSON.stringify(movieData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in tmdb-details function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})
