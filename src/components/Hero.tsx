
import { Link } from "react-router-dom";
import { Film, Star } from "lucide-react";

export const Hero = () => {
  return (
    <div className="relative bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 py-4 sm:py-6">
      {/* Movie background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1489599004781-b788b6e6c3ed?w=1920&h=400&fit=crop&crop=center')`
        }}
      ></div>
      <div className="absolute inset-0 bg-black opacity-70"></div>
      
      <div className="relative container mx-auto px-4 text-center">
        <div className="flex items-center justify-center mb-2 sm:mb-3">
          <Film className="w-6 sm:w-8 h-6 sm:h-8 text-yellow-400 mr-2" />
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
            Movie<span className="text-yellow-400">Hub</span>
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-gray-200 mb-3 sm:mb-4 max-w-xl mx-auto">
          Discover the latest movies and series. Get recommendations and never miss a great watch.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center items-center">
          <Link 
            to="/admin" 
            className="bg-yellow-400 text-black px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold hover:bg-yellow-300 transition-colors text-xs sm:text-sm"
          >
            Admin Panel
          </Link>
          <div className="flex items-center text-yellow-400 text-xs sm:text-sm">
            <Star className="w-3 sm:w-4 h-3 sm:h-4 mr-1 fill-current" />
            <span>Premium Quality</span>
          </div>
        </div>
      </div>
    </div>
  );
};
