
import { supabase } from './supabaseClient';
import { generateSitemap } from './sitemapGenerator';

export const updateStaticSitemap = async (): Promise<void> => {
  try {
    console.log('Generating updated sitemap...');
    const sitemapXml = await generateSitemap();
    
    console.log('=== UPDATED SITEMAP CONTENT ===');
    console.log('Copy this content and replace the content in public/sitemap-static.xml:');
    console.log('');
    console.log(sitemapXml);
    console.log('');
    console.log('=== END OF SITEMAP CONTENT ===');
    
    // Save to localStorage as backup
    localStorage.setItem('latest_sitemap', sitemapXml);
    localStorage.setItem('sitemap_updated_at', new Date().toISOString());
    
    return;
  } catch (error) {
    console.error('Error updating static sitemap:', error);
    throw error;
  }
};
