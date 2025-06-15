import { useEffect, useState } from "react";
import { generateSitemap, getSavedSitemap, createStaticSitemap } from "@/utils/sitemapGenerator";

const Sitemap = () => {
  const [sitemapXml, setSitemapXml] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // For regular UI requests, load sitemap for display
    const loadSitemap = async () => {
      try {
        let sitemap = await getSavedSitemap();
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

  const handleGenerateStatic = async () => {
    try {
      await createStaticSitemap();
      alert('Static sitemap generated! Check console for XML content to copy to public/sitemap-static.xml');
    } catch (error) {
      console.error('Error generating static sitemap:', error);
      alert('Error generating static sitemap');
    }
  };

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

            <button
              onClick={() => {
                // Create a new window with pure XML content
                const newWindow = window.open('', '_blank');
                if (newWindow) {
                  newWindow.document.open();
                  newWindow.document.write(sitemapXml);
                  newWindow.document.close();
                }
              }}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
            >
              View Raw XML
            </button>

            <button
              onClick={handleGenerateStatic}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
            >
              Generate Static File
            </button>
          </div>

          <div className="mt-6 p-4 bg-green-900 bg-opacity-50 rounded">
            <h3 className="font-semibold text-green-300 mb-2">Static Sitemap Solution:</h3>
            <ol className="text-sm text-green-200 space-y-1 list-decimal list-inside">
              <li>Click "Generate Static File" button above</li>
              <li>Copy the XML content from the console</li>
              <li>Create a file named "sitemap-static.xml" in the public folder</li>
              <li>Paste the XML content into that file</li>
              <li>Your sitemap will be accessible at: <code>/sitemap-static.xml</code></li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sitemap;
