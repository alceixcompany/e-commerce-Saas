'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchPublicCategories } from '@/lib/slices/categorySlice';

// Fallback images if category doesn't have one
const fallbackImages: Record<string, string> = {
  'Bracelets': 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800',
  'Necklaces': 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&q=80&w=800',
  'Rings': 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800',
  'Earrings': 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&q=80&w=800',
  'default': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800'
};

export default function CollectionsPage() {
  const dispatch = useAppDispatch();
  const { categories, isLoading } = useAppSelector((state) => state.category);

  useEffect(() => {
    dispatch(fetchPublicCategories());
  }, [dispatch]);

  return (
    <div className="pt-24 pb-24 bg-white animate-in fade-in duration-700 font-sans">
      {/* Catalog Header */}
      <div className="text-center mb-16 px-4">
        <h1 className="text-3xl md:text-4xl font-light tracking-[0.2em] uppercase text-gray-900 mb-4">
          Catalog
        </h1>
        <div className="w-12 h-0.5 bg-gray-300 mx-auto"></div>
      </div>

      {/* Catalog Grid */}
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
        {isLoading ? (
          <div className="text-center py-20 text-gray-400 tracking-widest uppercase text-sm">Loading Catalog...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {categories.map((category) => {
              const displayImage = category.image || fallbackImages[category.name] || fallbackImages.default;
              return (
                <Link
                  key={category._id}
                  href={`/categories/${category.slug}`}
                  className="relative group cursor-pointer overflow-hidden aspect-[16/10] block"
                >
                  <img
                    src={displayImage}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-500"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h2 className="text-white text-3xl md:text-5xl font-light tracking-wide text-shadow transition-transform duration-500 group-hover:-translate-y-2">
                      {category.name}
                    </h2>
                  </div>
                  {/* Optional: 'Shop Now' subtle indicator */}
                  <div className="absolute bottom-12 left-0 w-full text-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                    <span className="text-white text-xs tracking-[0.3em] uppercase border-b border-white pb-1">Shop Collection</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
