
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Copy, ExternalLink } from "lucide-react";
import { updateStaticSitemap } from "@/utils/updateStaticSitemap";
import { toast } from "@/hooks/use-toast";

export const StaticSitemapUpdater = () => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateSitemap = async () => {
    setIsUpdating(true);
    try {
      await updateStaticSitemap();
      toast({
        title: "Sitemap Generated",
        description: "Check the console for the updated XML content to copy to your static file.",
      });
    } catch (error) {
      console.error('Error updating sitemap:', error);
      toast({
        title: "Error",
        description: "Failed to generate sitemap.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const copyLatestSitemap = () => {
    const latestSitemap = localStorage.getItem('latest_sitemap');
    if (latestSitemap) {
      navigator.clipboard.writeText(latestSitemap);
      toast({
        title: "Copied",
        description: "Latest sitemap copied to clipboard!",
      });
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
          Static Sitemap Updater
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-400">
          <p>Generate updated XML content for your static sitemap file.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleUpdateSitemap}
            disabled={isUpdating}
            className="bg-blue-600 hover:bg-blue-700 flex-1"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
            {isUpdating ? 'Generating...' : 'Generate Updated XML'}
          </Button>

          <Button
            onClick={copyLatestSitemap}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:text-white flex-1"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Latest XML
          </Button>

          <Button
            onClick={() => window.open('/sitemap.xml', '_blank')}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:text-white flex-1"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Test Sitemap
          </Button>
        </div>

        <div className="bg-gray-700 p-3 rounded text-xs text-gray-300">
          <h4 className="font-semibold mb-2">Instructions:</h4>
          <ol className="space-y-1 list-decimal list-inside">
            <li>Click "Generate Updated XML" to create new sitemap content</li>
            <li>Copy the XML content from the console</li>
            <li>Replace the content in <code>public/sitemap-static.xml</code></li>
            <li>Your sitemap will be automatically served at <code>/sitemap.xml</code></li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
