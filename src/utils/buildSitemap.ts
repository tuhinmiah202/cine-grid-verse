
import { supabase } from './supabaseClient';

const baseUrl = 'https://movieshubbd.onrender.com';

export const generateStaticSitemap = async (): Promise<string> => {
  const urls: Array<{
    loc: string;
    lastmod: string;
    changefreq: string;
    priority: string;
  }> = [];
  
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
    console.error('Error fetching movies for sitemap:', error);
  }

  const urlEntries = urls.map(url => 
    `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  ).join('\n');

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

export const downloadSitemapFile = async () => {
  try {
    const sitemapXml = await generateStaticSitemap();
    
    const blob = new Blob([sitemapXml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sitemap.xml';
    link.click();
    URL.revokeObjectURL(url);
    
    console.log('=== SITEMAP CONTENT FOR MANUAL REPLACEMENT ===');
    console.log('Replace the content in public/sitemap.xml with:');
    console.log('');
    console.log(sitemapXml);
    console.log('');
    console.log('=== END OF CONTENT ===');
    
    return sitemapXml;
  } catch (error) {
    console.error('Error generating sitemap for download:', error);
    throw error;
  }
};
