
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Download, ExternalLink } from "lucide-react";
import { generateSitemap, downloadSitemap } from "@/utils/sitemapGenerator";
import { toast } from "@/hooks/use-toast";

export const SitemapManager = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAndDownload = async () => {
    setIsGenerating(true);
    try {
      console.log('Generating sitemap...');
      const sitemapXml = await generateSitemap();
      downloadSitemap(sitemapXml);
      
      toast({
        title: "Success",
        description: "Sitemap generated and download started.",
      });
      
      console.log('=== SITEMAP CONTENT FOR public/sitemap.xml ===');
      console.log(sitemapXml);
      console.log('==============================================');

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
          <p>Generate an updated sitemap for your website. This is needed for good SEO.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleGenerateAndDownload}
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700 flex-1"
          >
            <Download className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generating...' : 'Generate & Download Sitemap'}
          </Button>

          <Button
            onClick={() => window.open('/sitemap.xml', '_blank')}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:text-white flex-1"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Current Live Sitemap
          </Button>
        </div>

        <div className="bg-gray-700 p-3 rounded text-xs text-gray-300">
          <h4 className="font-semibold mb-2">How to Update Your Sitemap:</h4>
          <ol className="space-y-1 list-decimal list-inside">
            <li>Click "Generate & Download Sitemap". A file named <code>sitemap.xml</code> will be downloaded.</li>
            <li>Open the downloaded file in a text editor.</li>
            <li>Copy all the content from the downloaded file.</li>
            <li>In the codebase, open the file <code>public/sitemap.xml</code>.</li>
            <li>Replace all the content in <code>public/sitemap.xml</code> with the content you copied.</li>
            <li>Once you save and deploy this change, the live sitemap will be updated.</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
