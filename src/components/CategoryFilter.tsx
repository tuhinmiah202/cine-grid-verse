
interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={`px-2 py-1.5 rounded-lg font-medium transition-colors text-xs ${
            selectedCategory === category
              ? 'bg-yellow-400 text-black'
              : 'bg-gray-700 text-white hover:bg-gray-600'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
};
