
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
          className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
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
