'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchPublicProducts } from '@/lib/slices/productSlice';
import { fetchPublicCategories } from '@/lib/slices/categorySlice';

export default function CategoriesPage() {
  const dispatch = useAppDispatch();
  const { products } = useAppSelector((state) => state.product);
  const { categories, isLoading } = useAppSelector((state) => state.category);

  useEffect(() => {
    dispatch(fetchPublicCategories());
    dispatch(fetchPublicProducts());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-zinc-300 border-t-zinc-900 rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-zinc-50">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-2 text-sm text-zinc-600 mb-4">
            <Link href="/" className="hover:text-zinc-900 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-zinc-900 font-medium">Categories</span>
          </div>
          <h1 className="text-4xl font-bold text-zinc-900 mb-2">All Categories</h1>
          <p className="text-zinc-600">
            Browse our collection of {categories.length} {categories.length === 1 ? 'category' : 'categories'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const count = products.filter((p) => {
                if (!p.category) return false;
                return typeof p.category === 'object' 
                  ? p.category._id === category._id 
                  : p.category === category._id;
              }).length;

              // Use category image if available, otherwise use first product image
              let categoryImage = category.image;
              if (!categoryImage) {
                const firstProduct = products.find((p) => {
                  if (!p.category) return false;
                  return typeof p.category === 'object' 
                    ? p.category._id === category._id 
                    : p.category === category._id;
                });
                categoryImage = firstProduct?.mainImage || firstProduct?.image;
              }
              
              return (
                <Link
                  key={category._id}
                  href={`/categories/${category.slug}`}
                  className="group bg-white border border-zinc-200 rounded-lg overflow-hidden hover:border-zinc-900 hover:shadow-lg transition-all"
                >
                  {/* Category Image */}
                  <div className="relative h-48 bg-zinc-100">
                    {categoryImage ? (
                      <img
                        src={categoryImage}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const placeholder = e.currentTarget.nextElementSibling;
                          if (placeholder) {
                            (placeholder as HTMLElement).style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full items-center justify-center ${categoryImage ? 'hidden' : 'flex'}`}>
                      <svg className="w-16 h-16 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    
                    {/* Product Count Badge */}
                    <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold text-zinc-900">
                      {count} {count === 1 ? 'item' : 'items'}
                    </div>
                  </div>

                  {/* Category Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-zinc-900 mb-2 group-hover:text-zinc-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-zinc-600 flex items-center gap-2">
                      View all products
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-2">No Categories Found</h3>
            <p className="text-zinc-600 mb-8">There are no categories available yet.</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

