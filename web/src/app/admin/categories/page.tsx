'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  clearError,
} from '@/lib/slices/categorySlice';
import Link from 'next/link';
import ImageUpload from '@/components/ImageUpload';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiImage, FiX, FiCheck } from 'react-icons/fi';

export default function CategoriesPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { categories, isLoading, error } = useAppSelector((state) => state.category);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    image: '',
    bannerImage: '',
    status: 'active',
  });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
      // Auto-generate slug from name
      ...(name === 'name' && {
        slug: value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
      }),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    try {
      // Ensure all fields are properly set
      const submitData = {
        name: formData.name,
        slug: formData.slug,
        image: formData.image || '',
        bannerImage: formData.bannerImage || '',
        status: formData.status as 'active' | 'inactive',
      };

      if (editingId) {
        // Update existing category
        await dispatch(updateCategory({ id: editingId, data: submitData })).unwrap();
      } else {
        // Create new category
        await dispatch(createCategory(submitData)).unwrap();
      }
      setFormData({ name: '', slug: '', image: '', bannerImage: '', status: 'active' });
      setShowForm(false);
      setEditingId(null);
      dispatch(fetchCategories());
    } catch (err: any) {
      console.error('Submit error:', err);
      // Error is handled by Redux
    }
  };

  const handleEdit = (category: any) => {
    setEditingId(category._id);
    const editFormData = {
      name: category.name,
      slug: category.slug,
      image: category.image || '',
      bannerImage: category.bannerImage || '',
      status: category.status,
    };
    setFormData(editFormData);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', slug: '', image: '', bannerImage: '', status: 'active' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      await dispatch(deleteCategory(id)).unwrap();
    } catch (err: any) {
      alert(err || 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Categories</h1>
          <p className="text-gray-500 mt-2">Manage product categories and structure</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-black text-white text-sm font-medium hover:bg-zinc-800 transition-all rounded-lg shadow-sm hover:shadow-md"
          >
            <FiPlus size={18} />
            Add Category
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
          {error}
        </div>
      )}

      {/* Add/Edit Category Form */}
      {showForm && (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 animate-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">
              {editingId ? 'Edit Category' : 'Create New Category'}
            </h2>
            <button onClick={handleCancelEdit} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 placeholder:transition-colors">
              <FiX size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all placeholder:text-gray-400"
                    placeholder="e.g. Living Room"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-gray-300 transition-all font-mono"
                    placeholder="living-room"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <ImageUpload
                    label="Category Thumbnail"
                    value={formData.image}
                    onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                    onRemove={() => setFormData(prev => ({ ...prev, image: '' }))}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <div>
                <ImageUpload
                  label="Banner Image (Optional)"
                  value={formData.bannerImage}
                  onChange={(url) => {
                    setFormData(prev => ({ ...prev, bannerImage: url }));
                  }}
                  onRemove={() => setFormData(prev => ({ ...prev, bannerImage: '' }))}
                  isBanner={true}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Displayed at the top of the category page. Recommended size: 1920x400px.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-black text-white text-sm font-medium hover:bg-zinc-800 transition-colors rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <FiCheck size={16} />
                )}
                {editingId ? 'Update Category' : 'Create Category'}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading && categories.length === 0 ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
        </div>
      ) : categories.length === 0 && !showForm ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <FiImage size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No categories yet</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Create categories to organize your products effectively.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-zinc-800 font-medium transition-colors"
          >
            Add Category
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Image</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Slug</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.filter(cat => cat && cat._id).map((category) => (
                  <tr key={category._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement!.classList.add('flex', 'items-center', 'justify-center');
                              e.currentTarget.parentElement!.innerText = 'Img';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <FiImage size={18} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">{category.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded w-fit">{category.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${category.status === 'active'
                        ? 'bg-green-50 text-green-700 border-green-100'
                        : 'bg-gray-50 text-gray-600 border-gray-100'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${category.status === 'active' ? 'bg-green-600' : 'bg-gray-400'}`}></span>
                        {category.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(category.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/categories/${category.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="View on Site"
                        >
                          <FiEye size={16} />
                        </Link>
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-all"
                          title="Edit"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(category._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

