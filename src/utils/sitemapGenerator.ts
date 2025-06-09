
import { supabase } from "@/integrations/supabase/client";

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: string;
}

export const generateSitemap = async (): Promise<string> => {
  const baseUrl = 'https://movieshubbd.onrender.com';
  const urls: SitemapUrl[] = [];

  // Add static pages
  urls.push({
    loc: baseUrl,
    lastmod: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
    changefreq: 'daily',
    priority: '1.0'
  });

  urls.push({
    loc: `${baseUrl}/admin`,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: '0.3'
  });

  try {
    // Fetch all movies from database
    const { data: movies, error } = await supabase
      .from('movies')
      .select('id, updated_at')
      .order('updated_at', { ascending: false });

    if (!error && movies) {
      // Add movie detail pages
      movies.forEach((movie) => {
        const lastmod = movie.updated_at 
          ? new Date(movie.updated_at).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];

        urls.push({
          loc: `${baseUrl}/movie/${movie.id}`,
          lastmod,
          changefreq: 'weekly',
          priority: '0.8'
        });

        // Add download pages
        urls.push({
          loc: `${baseUrl}/download/${movie.id}`,
          lastmod,
          changefreq: 'weekly',
          priority: '0.7'
        });
      });
    }
  } catch (error) {
    console.error('Error fetching movies for sitemap:', error);
  }

  // Generate valid XML according to sitemap protocol
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
  const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  const urlsetClose = '</urlset>';

  const urlEntries = urls.map(url => 
    `  <url>\n    <loc>${escapeXml(url.loc)}</loc>\n    <lastmod>${url.lastmod}</lastmod>\n    <changefreq>${url.changefreq}</changefreq>\n    <priority>${url.priority}</priority>\n  </url>`
  ).join('\n');

  return `${xmlHeader}\n${urlsetOpen}\n${urlEntries}\n${urlsetClose}`;
};

// Helper function to escape XML special characters
const escapeXml = (unsafe: string): string => {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
};

export const saveSitemap = async (sitemapXml: string): Promise<void> => {
  try {
    // Store sitemap in localStorage for client-side serving
    localStorage.setItem('sitemap_xml', sitemapXml);
    localStorage.setItem('sitemap_generated_at', new Date().toISOString());
    console.log('Sitemap saved successfully');
  } catch (error) {
    console.error('Error saving sitemap:', error);
  }
};

export const getSavedSitemap = (): string | null => {
  try {
    return localStorage.getItem('sitemap_xml');
  } catch (error) {
    console.error('Error getting saved sitemap:', error);
    return null;
  }
};
