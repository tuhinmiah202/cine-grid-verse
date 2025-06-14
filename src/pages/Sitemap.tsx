import { useEffect, useState } from "react";
import { generateSitemap, getSavedSitemap, handleSitemapXmlRequest } from "@/utils/sitemapGenerator";

const Sitemap = () => {
  const [sitemapXml, setSitemapXml] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if this is a request for raw XML
    const isXmlRequest = window.location.pathname === '/sitemap.xml' ||
                        window.location.search.includes('format=xml') ||
                        window.location.search.includes('raw=true');

    if (isXmlRequest) {
      // Handle XML request immediately
      handleSitemapXmlRequest();
      return;
    }

    // Otherwise load sitemap for UI display
    const loadSitemap = async () => {
      try {
        // First try to get saved sitemap
        let sitemap = await getSavedSitemap();
        
        // If no saved sitemap, generate new one
        if (!sitemap) {
          console.log('Generating new sitemap...');
          sitemap = await generateSitemap();
        }

        setSitemapXml(sitemap || "");
      } catch (error) {
        console.error('Error loading sitemap:', error);
        setSitemapXml("");
      } finally {
        setIsLoading(false);
      }
    };

    loadSitemap();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-xl">Generating sitemap...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Website Sitemap</h1>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">XML Sitemap</h2>
          <p className="text-gray-400 mb-4">
            This sitemap contains all the public pages on our website for search engines.
          </p>
          
          <div className="bg-gray-900 rounded p-4 overflow-x-auto">
            <pre className="text-sm text-green-400 whitespace-pre-wrap">
              {sitemapXml}
            </pre>
          </div>
          
          <div className="mt-4 flex gap-4 flex-wrap">
            <button
              onClick={() => {
                const blob = new Blob([sitemapXml], { type: 'application/xml' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'sitemap.xml';
                link.click();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Download XML
            </button>
            
            <button
              onClick={() => {
                navigator.clipboard.writeText(sitemapXml);
                alert('Sitemap copied to clipboard!');
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Copy to Clipboard
            </button>

            <a
              href="/sitemap.xml?format=xml"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded inline-block"
            >
              View Raw XML
            </a>
          </div>

          <div className="mt-6 p-4 bg-yellow-900 bg-opacity-50 rounded">
            <h3 className="font-semibold text-yellow-300 mb-2">For Google Search Console:</h3>
            <p className="text-sm text-yellow-200 mb-2">Submit this URL to Google Search Console:</p>
            <code className="text-yellow-300 bg-gray-800 px-2 py-1 rounded">
              https://movieshubbd.onrender.com/sitemap.xml
            </code>
            <p className="text-xs text-yellow-200 mt-2">
              Note: The XML will be served automatically when accessed by search engines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sitemap;
