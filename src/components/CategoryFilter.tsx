import  { Tag } from 'lucide-react';
import { Category } from '../types';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange
}: CategoryFilterProps) {
  return (
    <>
      <button
        onClick={() => onCategoryChange('all')}
        className={`flex-shrink-0 flex items-center px-4 py-2 rounded-full text-sm whitespace-nowrap ${
          selectedCategory === 'all'
            ? 'bg-primary-100 text-primary-700 font-medium'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <Tag className="h-4 w-4 mr-1.5" />
        All Categories
      </button>
      
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm whitespace-nowrap ${
            selectedCategory === category.id
              ? 'bg-primary-100 text-primary-700 font-medium'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {category.name}
        </button>
      ))}
    </>
  );
}
 