import  { useState } from 'react';
import { doc, updateDoc, deleteDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { Category } from '../types';
import { Edit, Trash, Check, X } from 'lucide-react';
import CategoryForm from './CategoryForm';
import toast from 'react-hot-toast';

interface AdminCategoryListProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

export default function AdminCategoryList({ categories, setCategories }: AdminCategoryListProps) {
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  
  const handleEdit = (categoryId: string) => {
    setEditingCategoryId(categoryId);
  };
  
  const handleUpdate = async (categoryId: string, updatedData: Partial<Category>) => {
    try {
      const categoryRef = doc(db, 'categories', categoryId);
      await updateDoc(categoryRef, updatedData);
      
      // Update local state
      setCategories(prevCategories => 
        prevCategories.map(category => 
          category.id === categoryId ? { ...category, ...updatedData } : category
        )
      );
      
      setEditingCategoryId(null);
      toast.success('Category updated successfully');
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    }
  };
  
  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This may affect auctions assigned to this category.')) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'categories', categoryId));
      
      // Update local state
      setCategories(prevCategories => 
        prevCategories.filter(category => category.id !== categoryId)
      );
      
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };
  
  const handleCancelEdit = () => {
    setEditingCategoryId(null);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Category Management</h2>
      
      {categories.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
          <p className="text-gray-500">Create your first category to organize your auctions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {editingCategoryId === category.id ? (
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Edit Category</h3>
                    <button 
                      onClick={handleCancelEdit}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <CategoryForm 
                    initialData={category}
                    onSubmit={(data) => handleUpdate(category.id, data)}
                  />
                </div>
              ) : (
                <>
                  {category.imageUrl && (
                    <div className="h-40 bg-gray-200">
                      <img 
                        src={category.imageUrl} 
                        alt={category.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(category.id)}
                          className="text-gray-400 hover:text-gray-500"
                          title="Edit"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="text-red-400 hover:text-red-500"
                          title="Delete"
                        >
                          <Trash className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    {category.description && (
                      <p className="mt-2 text-sm text-gray-600">{category.description}</p>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
 