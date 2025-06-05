
import { Link } from "react-router-dom";
import { Film, Star } from "lucide-react";

export const Hero = () => {
  return (
    <div className="relative bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 py-8 sm:py-12 md:py-16">
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1489599004781-b788b6e6c3ed?w=1920&h=600&fit=crop&crop=center')`
        }}
      ></div>
      <div className="absolute inset-0 bg-black opacity-60"></div>
      
      <div className="relative container mx-auto px-4 text-center">
        <div className="flex items-center justify-center mb-4 sm:mb-6">
          <Film className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 text-yellow-400 mr-2 sm:mr-3" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            Movie<span className="text-yellow-400">Hub</span>
          </h1>
        </div>
        <p className="text-sm sm:text-lg md:text-xl text-gray-200 mb-4 sm:mb-6 md:mb-8 max-w-2xl lg:max-w-3xl mx-auto">
          Discover the latest movies and series. Get recommendations, read reviews, and never miss a great watch.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
          <Link 
            to="/admin" 
            className="bg-yellow-400 text-black px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors text-sm sm:text-base"
          >
            Admin Panel
          </Link>
          <div className="flex items-center text-yellow-400 text-sm sm:text-base">
            <Star className="w-4 sm:w-5 h-4 sm:h-5 mr-1 fill-current" />
            <span>Premium Quality Content</span>
          </div>
        </div>
      </div>
    </div>
  );
};
