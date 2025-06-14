
import { supabase } from './supabaseClient';

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: string;
}

const baseUrl = 'https://movieshubbd.onrender.com';

export const generateSitemap = async (): Promise<string> => {
  const urls: SitemapUrl[] = [];
  const currentDate = new Date().toISOString().split('T')[0];

  urls.push({
    loc: baseUrl,
    lastmod: currentDate,
    changefreq: 'daily',
    priority: '1.0'
  });

  urls.push({
    loc: `${baseUrl}/admin`,
    lastmod: currentDate,
    changefreq: 'monthly',
    priority: '0.3'
  });

  try {
    const { data: movies, error } = await supabase
      .from('movies')
      .select('id, updated_at, created_at')
      .order('updated_at', { ascending: false });

    if (!error && movies) {
      movies.forEach((movie) => {
        const lastmod = movie.updated_at
          ? new Date(movie.updated_at).toISOString().split('T')[0]
          : movie.created_at
          ? new Date(movie.created_at).toISOString().split('T')[0]
          : currentDate;

        urls.push({
          loc: `${baseUrl}/movie/${movie.id}`,
          lastmod,
          changefreq: 'weekly',
          priority: '0.8'
        });

        urls.push({
          loc: `${baseUrl}/download/${movie.id}`,
          lastmod,
          changefreq: 'weekly',
          priority: '0.7'
        });
      });
    }
  } catch (error) {
    console.error('Error fetching movies:', error);
  }

  const xmlDeclaration = '<?xml version="1.0" encoding="UTF-8"?>';
  const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  const urlsetClose = '</urlset>';

  const urlEntries = urls.map(url => {
    return `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`;
  }).join('\n');

  return `${xmlDeclaration}
${urlsetOpen}
${urlEntries}
${urlsetClose}`;
};

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

const isBrowser = typeof window !== 'undefined';

export const saveSitemap = async (sitemapXml: string): Promise<void> => {
  if (!isBrowser) return;
  try {
    localStorage.setItem('sitemap_xml', sitemapXml);
    localStorage.setItem('sitemap_generated_at', new Date().toISOString());
    console.log('Sitemap saved to localStorage.');
  } catch (error) {
    console.error('Error saving sitemap:', error);
  }
};

export const getSavedSitemap = async (): Promise<string | null> => {
  if (!isBrowser) return null;
  try {
    return localStorage.getItem('sitemap_xml');
  } catch (error) {
    console.error('Error reading sitemap from localStorage:', error);
    return null;
  }
};
