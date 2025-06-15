
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

  // Add static pages
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

  const urlEntries = urls.map(url => {
    return `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
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

export const downloadSitemap = (sitemapXml: string) => {
  const blob = new Blob([sitemapXml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sitemap.xml';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
