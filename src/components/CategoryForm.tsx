import  { useState } from 'react';
import { Category } from '../types';

interface CategoryFormProps {
  initialData?: Partial<Category>;
  onSubmit: (categoryData: Partial<Category>) => void;
}

export default function CategoryForm({ initialData, onSubmit }: CategoryFormProps) {
  const [categoryData, setCategoryData] = useState<Partial<Category>>(
    initialData || {
      name: '',
      description: '',
      imageUrl: '',
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCategoryData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(categoryData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={categoryData.name}
          onChange={handleChange}
          className="input"
          placeholder="e.g., Antiques, Vehicles, Art"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={categoryData.description}
          onChange={handleChange}
          className="input"
          rows={3}
          placeholder="A short description of this category"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category Image URL
        </label>
        <input
          type="text"
          name="imageUrl"
          value={categoryData.imageUrl}
          onChange={handleChange}
          className="input"
          placeholder="https://example.com/image.jpg"
        />
        <p className="mt-1 text-xs text-gray-500">
          Provide a URL to an image that represents this category (optional)
        </p>
      </div>

      <div className="flex justify-end">
        <button type="submit" className="btn btn-primary">
          {initialData ? 'Update Category' : 'Create Category'}
        </button>
      </div>
    </form>
  );
}
 