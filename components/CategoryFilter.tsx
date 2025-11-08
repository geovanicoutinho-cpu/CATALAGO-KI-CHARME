import React from 'react';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onCategorySelect: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ categories, selectedCategory, onCategorySelect }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-700 mb-3 text-center">CATEGORIAS</h3>
      <div className="flex justify-center">
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map(category => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => onCategorySelect(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium uppercase tracking-wider transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
                  ${
                    isSelected
                      ? 'bg-primary text-white shadow'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                  }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryFilter;