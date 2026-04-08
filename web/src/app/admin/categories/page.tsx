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
  const { categories, loading, error } = useAppSelector((state) => state.category);
  const isLoading = loading.fetchList;
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
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Categories</h1>
          <p className="text-foreground/50 mt-2">Manage product categories and structure</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-foreground text-background text-sm font-medium hover:bg-foreground/80 transition-all rounded-lg shadow-sm hover:shadow-md"
          >
            <FiPlus size={18} />
            Add Category
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
          {error}
        </div>
      )}

      {/* Add/Edit Category Form */}
      {showForm && (
        <div className="bg-background border border-foreground/10 rounded-xl shadow-sm p-6 animate-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-6 pb-6 border-b border-foreground/10">
            <h2 className="text-lg font-bold text-foreground">
              {editingId ? 'Edit Category' : 'Create New Category'}
            </h2>
            <button onClick={handleCancelEdit} className="text-foreground/40 hover:text-foreground p-1 rounded-full hover:bg-foreground/5 transition-colors">
              <FiX size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-background border border-foreground/10 rounded-lg text-sm text-foreground focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/30 transition-all placeholder:text-foreground/30"
                    placeholder="e.g. Living Room"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1">
                    URL Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-foreground/5 border border-foreground/10 rounded-lg text-sm text-foreground/60 focus:outline-none focus:border-foreground/20 transition-all font-mono"
                    placeholder="living-room"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-background border border-foreground/10 rounded-lg text-sm text-foreground focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/30 transition-all"
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

            <div className="pt-4 border-t border-foreground/10">
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
                <p className="mt-2 text-xs text-foreground/40">
                  Displayed at the top of the category page. Recommended size: 1920x400px.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 border border-foreground/10 text-foreground/70 text-sm font-medium hover:bg-foreground/5 transition-colors rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin"></div>
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
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-foreground"></div>
        </div>
      ) : categories.length === 0 && !showForm ? (
        <div className="bg-background border border-dashed border-foreground/20 rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-foreground/5 rounded-full flex items-center justify-center mx-auto mb-4 text-foreground/20">
            <FiImage size={24} />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">No categories yet</h3>
          <p className="text-foreground/50 mb-6 max-w-sm mx-auto">
            Create categories to organize your products effectively.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 font-medium transition-colors"
          >
            Add Category
          </button>
        </div>
      ) : (
        <div className="bg-background border border-foreground/10 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-foreground/5 border-b border-foreground/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-foreground/40 uppercase tracking-wider w-24">Image</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-foreground/40 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-foreground/40 uppercase tracking-wider">Slug</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-foreground/40 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-foreground/40 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-foreground/40 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5">
                {categories.filter(cat => cat && cat._id).map((category) => (
                  <tr key={category._id} className="hover:bg-foreground/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 rounded-lg bg-foreground/5 overflow-hidden border border-foreground/10">
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
                          <div className="w-full h-full flex items-center justify-center text-foreground/20">
                            <FiImage size={18} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-foreground">{category.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-mono text-foreground/50 bg-foreground/5 px-2 py-1 rounded w-fit">{category.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${category.status === 'active'
                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                        : 'bg-foreground/5 text-foreground/40 border-foreground/10'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${category.status === 'active' ? 'bg-green-500' : 'bg-foreground/30'}`}></span>
                        {category.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground/40">
                      {new Date(category.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/categories/${category.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-foreground/40 hover:text-foreground hover:bg-foreground/5 rounded-lg transition-all"
                          title="View on Site"
                        >
                          <FiEye size={16} />
                        </Link>
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 text-foreground/40 hover:text-foreground hover:bg-foreground/5 rounded-lg transition-all"
                          title="Edit"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(category._id)}
                          className="p-2 text-foreground/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
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

