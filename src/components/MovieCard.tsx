
import { Calendar, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Movie } from "@/types/Movie";

interface MovieCardProps {
  movie: Movie;
}

export const MovieCard = ({ movie }: MovieCardProps) => {
  return (
    <Link to={`/movie/${movie.id}`} className="block">
      <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
        <div className="relative">
          <img 
            src={movie.image} 
            alt={movie.title}
            className="w-full h-48 sm:h-64 object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=500";
            }}
          />
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 rounded text-xs font-semibold ${
              movie.isReleased 
                ? 'bg-green-500 text-white' 
                : 'bg-yellow-500 text-black'
            }`}>
              {movie.isReleased ? 'Released' : 'Coming Soon'}
            </span>
          </div>
          {movie.rating && (
            <div className="absolute top-2 left-2 bg-black bg-opacity-75 rounded px-2 py-1 flex items-center">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current mr-1" />
              <span className="text-white text-xs sm:text-sm">{movie.rating}</span>
            </div>
          )}
        </div>
        
        <div className="p-3 sm:p-4">
          <h3 className="text-sm sm:text-lg font-bold text-white mb-2 line-clamp-1">{movie.title}</h3>
          <p className="text-gray-400 text-xs sm:text-sm mb-3 line-clamp-2">{movie.description}</p>
          
          <div className="flex items-center justify-between">
            <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs">
              {movie.category}
            </span>
            <div className="flex items-center text-gray-400 text-xs">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              {new Date(movie.releaseDate).getFullYear()}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
