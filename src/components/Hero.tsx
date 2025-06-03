
import { Link } from "react-router-dom";
import { Film, Star } from "lucide-react";

export const Hero = () => {
  return (
    <div className="relative bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 py-20">
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative container mx-auto px-4 text-center">
        <div className="flex items-center justify-center mb-6">
          <Film className="w-12 h-12 text-yellow-400 mr-3" />
          <h1 className="text-4xl md:text-6xl font-bold text-white">
            Movie<span className="text-yellow-400">Hub</span>
          </h1>
        </div>
        <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
          Discover the latest movies and series. Get recommendations, read reviews, and never miss a great watch.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            to="/admin" 
            className="bg-yellow-400 text-black px-8 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
          >
            Admin Panel
          </Link>
          <div className="flex items-center text-yellow-400">
            <Star className="w-5 h-5 mr-1 fill-current" />
            <span>Premium Quality Content</span>
          </div>
        </div>
      </div>
    </div>
  );
};
