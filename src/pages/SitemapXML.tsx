
import { useEffect } from "react";
import { generateStaticSitemap } from "@/utils/buildSitemap";

const SitemapXML = () => {
  useEffect(() => {
    const serveSitemap = async () => {
      try {
        const sitemapXml = await generateStaticSitemap();
        
        // Clear the document and serve pure XML
        document.open();
        document.write(sitemapXml);
        document.close();
        
        // Set proper content type if possible
        if (document.contentType) {
          document.contentType = 'application/xml';
        }
      } catch (error) {
        console.error('Error serving XML sitemap:', error);
        document.open();
        document.write('<?xml version="1.0" encoding="UTF-8"?><error>Failed to generate sitemap</error>');
        document.close();
      }
    };

    serveSitemap();
  }, []);

  // This component will be replaced by the XML content
  return null;
};

export default SitemapXML;
