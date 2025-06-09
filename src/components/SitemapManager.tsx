
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Download, ExternalLink } from "lucide-react";
import { generateSitemap, saveSitemap } from "@/utils/sitemapGenerator";
import { toast } from "@/hooks/use-toast";

export const SitemapManager = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<string | null>(
    localStorage.getItem('sitemap_generated_at')
  );

  const handleGenerateSitemap = async () => {
    setIsGenerating(true);
    try {
      console.log('Generating sitemap...');
      const sitemapXml = await generateSitemap();
      await saveSitemap(sitemapXml);
      
      const now = new Date().toISOString();
      setLastGenerated(now);
      
      toast({
        title: "Success",
        description: "Sitemap generated and saved successfully!",
      });
    } catch (error) {
      console.error('Error generating sitemap:', error);
      toast({
        title: "Error",
        description: "Failed to generate sitemap.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadSitemap = () => {
    const savedSitemap = localStorage.getItem('sitemap_xml');
    if (savedSitemap) {
      const blob = new Blob([savedSitemap], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'sitemap.xml';
      link.click();
    } else {
      toast({
        title: "No Sitemap",
        description: "Please generate a sitemap first.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <RefreshCw className="w-5 h-5 mr-2" />
          Sitemap Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-400">
          <p>Generate and manage your website's XML sitemap for better SEO.</p>
          {lastGenerated && (
            <p className="mt-2">
              Last generated: {new Date(lastGenerated).toLocaleString()}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleGenerateSitemap}
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700 flex-1"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generating...' : 'Generate Sitemap'}
          </Button>

          <Button
            onClick={handleDownloadSitemap}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:text-white flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Download XML
          </Button>

          <Button
            onClick={() => window.open('/sitemap.xml', '_blank')}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:text-white flex-1"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Sitemap
          </Button>
        </div>

        <div className="bg-gray-700 p-3 rounded text-xs text-gray-300">
          <h4 className="font-semibold mb-2">Automatic Updates:</h4>
          <ul className="space-y-1">
            <li>• Generate sitemap after adding/removing movies</li>
            <li>• Submit sitemap URL to search engines: <code>/sitemap.xml</code></li>
            <li>• Sitemap includes all movie pages and download links</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
