
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, ExternalLink, RefreshCw } from "lucide-react";
import { downloadSitemapFile } from "@/utils/buildSitemap";
import { toast } from "@/hooks/use-toast";

export const SimpleSitemapManager = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAndDownload = async () => {
    setIsGenerating(true);
    try {
      await downloadSitemapFile();
      toast({
        title: "Sitemap Generated",
        description: "Check console for XML content and download has started.",
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

  const testSitemap = () => {
    // Open sitemap in new tab to test
    window.open('/sitemap.xml', '_blank');
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <RefreshCw className="w-5 h-5 mr-2" />
          Sitemap Manager
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-400">
          <p>Generate and download your website's XML sitemap file.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleGenerateAndDownload}
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700 flex-1"
          >
            <Download className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generating...' : 'Generate & Download'}
          </Button>

          <Button
            onClick={testSitemap}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:text-white flex-1"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Test Current Sitemap
          </Button>
        </div>

        <div className="bg-gray-700 p-3 rounded text-xs text-gray-300">
          <h4 className="font-semibold mb-2">How to Update:</h4>
          <ol className="space-y-1 list-decimal list-inside">
            <li>Click "Generate & Download" to create new sitemap XML</li>
            <li>Copy the XML content from console</li>
            <li>Replace content in <code>public/sitemap.xml</code> file</li>
            <li>Your sitemap will be served directly at <code>/sitemap.xml</code></li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
