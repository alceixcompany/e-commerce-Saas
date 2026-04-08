'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import {
  fetchProducts,
  deleteProduct,
} from '@/lib/slices/productSlice';
import { fetchCategories } from '@/lib/slices/categorySlice';
import Link from 'next/link';
import { FiPlus, FiSearch, FiFilter, FiEdit2, FiTrash2, FiEye, FiMoreHorizontal } from 'react-icons/fi';

export default function ProductsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { products, loading, error } = useAppSelector((state) => state.product);
  const isLoading = loading.fetchList;
  const { categories } = useAppSelector((state) => state.category);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    dispatch(fetchProducts({
      page: 1,
      limit: 50, // Increase limit for admin or add pagination controls
      category: selectedCategory,
      q: searchQuery
    }));
    dispatch(fetchCategories());
  }, [dispatch, selectedCategory, searchQuery]);

  // Products are now filtered and searched by the backend
  const displayProducts = products;

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await dispatch(deleteProduct(id)).unwrap();
    } catch (err: any) {
      alert(err || 'Failed to delete product');
    }
  };

  const getCategoryName = (categoryId: string | any) => {
    if (typeof categoryId === 'object' && categoryId?.name) {
      return categoryId.name;
    }
    const category = categories.find((c) => c._id === categoryId);
    return category?.name || 'N/A';
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Products</h1>
          <p className="text-foreground/50 mt-2">Manage your product catalog</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-foreground text-background text-sm font-medium hover:bg-foreground/80 transition-all rounded-lg shadow-sm hover:shadow-md"
        >
          <FiPlus size={18} />
          Add Product
        </Link>
      </div>

      {/* Filters & Toolbar */}
      <div className="bg-background p-4 rounded-xl border border-foreground/10 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or SKU..."
            className="w-full pl-10 pr-4 py-2.5 bg-foreground/5 border-0 rounded-lg text-sm text-foreground placeholder:text-foreground/40 focus:ring-2 focus:ring-foreground/5"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" size={16} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full md:w-48 pl-9 pr-8 py-2.5 bg-background border border-foreground/10 rounded-lg text-sm text-foreground focus:outline-none focus:border-foreground/30 transition-colors appearance-none cursor-pointer hover:border-foreground/20"
            >
              <option value="all">All Categories</option>
              {categories.filter(cat => cat && cat._id).map((category) => (
                <option key={category._id} value={category._id} className="bg-background">
                  {category.name}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-foreground/40">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              className="text-sm text-red-600 hover:text-red-700 font-medium px-2"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-foreground"></div>
        </div>
      ) : displayProducts.length === 0 ? (
        <div className="bg-background border border-dashed border-foreground/20 rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-foreground/5 rounded-full flex items-center justify-center mx-auto mb-4 text-foreground/20">
            <FiSearch size={24} />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">No products found</h3>
          <p className="text-foreground/50 mb-6 max-w-sm mx-auto">
            No products match your current search criteria. Try adjusting your filters or search term.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-foreground/5 text-foreground/70 rounded-lg hover:bg-foreground/10 font-medium transition-colors border border-foreground/10"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="bg-background border border-foreground/10 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-foreground/5 border-b border-foreground/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-foreground/40 uppercase tracking-wider w-20">Image</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-foreground/40 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-foreground/40 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-foreground/40 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-foreground/40 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-foreground/40 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-foreground/40 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5">
                {displayProducts.filter(p => p && p._id).map((product) => (
                  <tr key={product._id} className="hover:bg-foreground/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 rounded-lg bg-foreground/5 overflow-hidden border border-foreground/10">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement!.classList.add('flex', 'items-center', 'justify-center');
                              e.currentTarget.parentElement!.innerText = 'Img';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-foreground/20 font-bold uppercase tracking-tighter">No Img</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-bold text-foreground">{product.name}</div>
                        <div className="text-[10px] text-foreground/40 flex items-center gap-2 mt-0.5">
                          <span className="font-mono bg-foreground/5 px-1 py-0.5 rounded uppercase">{product.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-foreground/5 text-foreground/60 border border-foreground/5">
                        {getCategoryName(product.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-foreground">
                        ${product.discountedPrice || product.price}
                        {product.discountedPrice && (
                          <span className="text-xs text-foreground/30 line-through ml-2 font-light">
                            ${product.price}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm font-bold ${product.stock <= 5 ? 'text-orange-500' : 'text-foreground/50'}`}>
                        {product.stock} <span className="text-[10px] font-medium opacity-50 uppercase ml-1">units</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${product.status === 'active'
                          ? 'bg-green-500/10 text-green-500 border-green-500/20'
                          : 'bg-foreground/5 text-foreground/40 border-foreground/10'
                          }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${product.status === 'active' ? 'bg-green-500' : 'bg-foreground/30'}`}></span>
                        {product.status === 'active' ? 'Active' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/products/${product._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-foreground/40 hover:text-foreground hover:bg-foreground/5 rounded-lg transition-all"
                          title="View"
                        >
                          <FiEye size={16} />
                        </Link>
                        <Link
                          href={`/admin/products/edit/${product._id}`}
                          className="p-2 text-foreground/40 hover:text-foreground hover:bg-foreground/5 rounded-lg transition-all"
                          title="Edit"
                        >
                          <FiEdit2 size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id)}
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
          <div className="p-4 border-t border-foreground/5 bg-foreground/5 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-foreground/40">
            <span>Synchronized {displayProducts.length} assets</span>
            {/* Pagination could go here */}
          </div>
        </div>
      )}
    </div>
  );
}

