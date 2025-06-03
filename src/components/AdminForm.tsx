
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Movie } from "@/types/Movie";

interface AdminFormProps {
  onAddMovie: (movie: Omit<Movie, "id">) => void;
}

const categories = [
  "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary",
  "Drama", "Family", "Fantasy", "Horror", "Mystery", "Romance",
  "Sci-Fi", "Thriller", "War", "Western"
];

export const AdminForm = ({ onAddMovie }: AdminFormProps) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    releaseDate: "",
    isReleased: true,
    category: "",
    rating: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.category || !formData.releaseDate) {
      alert("Please fill in all required fields");
      return;
    }

    const movieData: Omit<Movie, "id"> = {
      title: formData.title,
      description: formData.description,
      image: formData.image || "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=500",
      releaseDate: formData.releaseDate,
      isReleased: formData.isReleased,
      category: formData.category,
      rating: formData.rating ? parseFloat(formData.rating) : undefined
    };

    onAddMovie(movieData);
    
    // Reset form
    setFormData({
      title: "",
      description: "",
      image: "",
      releaseDate: "",
      isReleased: true,
      category: "",
      rating: ""
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-6 rounded-lg">
      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          placeholder="Enter movie/series title"
          className="bg-gray-700 border-gray-600 text-white"
        />
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Enter movie/series description"
          className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
        />
      </div>

      <div>
        <Label htmlFor="image">Image URL</Label>
        <Input
          id="image"
          value={formData.image}
          onChange={(e) => setFormData({...formData, image: e.target.value})}
          placeholder="Enter image URL (optional)"
          className="bg-gray-700 border-gray-600 text-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category *</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="rating">Rating (0-10)</Label>
          <Input
            id="rating"
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={formData.rating}
            onChange={(e) => setFormData({...formData, rating: e.target.value})}
            placeholder="e.g., 8.5"
            className="bg-gray-700 border-gray-600 text-white"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="releaseDate">Release Date *</Label>
        <Input
          id="releaseDate"
          type="date"
          value={formData.releaseDate}
          onChange={(e) => setFormData({...formData, releaseDate: e.target.value})}
          className="bg-gray-700 border-gray-600 text-white"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isReleased"
          checked={formData.isReleased}
          onCheckedChange={(checked) => setFormData({...formData, isReleased: checked})}
        />
        <Label htmlFor="isReleased">
          {formData.isReleased ? "Released" : "Coming Soon"}
        </Label>
      </div>

      <Button type="submit" className="w-full bg-yellow-400 text-black hover:bg-yellow-300">
        Add Movie/Series
      </Button>
    </form>
  );
};
