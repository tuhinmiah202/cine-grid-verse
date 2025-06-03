
import { Film } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-gray-800 border-t border-gray-700 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Film className="w-8 h-8 text-yellow-400 mr-2" />
            <span className="text-xl font-bold text-white">
              Movie<span className="text-yellow-400">Hub</span>
            </span>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-gray-400 mb-2">
              © 2024 MovieHub. All rights reserved.
            </p>
            <p className="text-sm text-gray-500">
              Built for movie enthusiasts worldwide
            </p>
          </div>
        </div>
        
        {/* Ad Space Placeholder */}
        <div className="mt-8 bg-gray-700 border border-gray-600 rounded-lg p-4 text-center">
          <p className="text-gray-400 text-sm">Footer Advertisement Space</p>
          <p className="text-xs text-gray-500">970x90 Banner Ad</p>
        </div>
      </div>
    </footer>
  );
};
