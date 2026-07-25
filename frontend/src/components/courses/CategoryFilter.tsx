import React from 'react';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none font-['Sora']">
      {categories.map((cat) => {
        const isSelected = selectedCategory === cat;
        return (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
              isSelected
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20 border border-sky-500'
                : 'bg-white border border-sky-200 text-slate-700 hover:text-sky-700 hover:bg-sky-50'
            }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
};
