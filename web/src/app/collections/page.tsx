'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchPublicCategories } from '@/lib/slices/categorySlice';

// Fallback images if category doesn't have one
const fallbackImages: Record<string, string> = {
  'Bracelets': '/image/alceix/product.png',
  'Necklaces': '/image/alceix/product.png',
  'Rings': '/image/alceix/product.png',
  'Earrings': '/image/alceix/product.png',
  'default': '/image/alceix/hero.png'
};

export default function CollectionsPage() {
  const dispatch = useAppDispatch();
  const { categories, isLoading } = useAppSelector((state) => state.category);

  useEffect(() => {
    dispatch(fetchPublicCategories());
  }, [dispatch]);

  return (
    <div className="pt-24 pb-24 bg-background animate-in fade-in duration-700 font-sans">
      {/* Catalog Header */}
      <div className="text-center mb-16 px-4">
        <h1 className="text-3xl md:text-4xl font-light tracking-[0.2em] uppercase text-foreground mb-4">
          Catalog
        </h1>
        <div className="w-12 h-0.5 bg-foreground/20 mx-auto"></div>
      </div>

      {/* Catalog Grid */}
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
        {isLoading ? (
          <div className="text-center py-20 text-foreground/50 tracking-widest uppercase text-sm">Loading Catalog...</div>
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
                  <div className="absolute inset-0 bg-background/20 group-hover:bg-background/30 transition-colors duration-500"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h2 className="text-foreground text-3xl md:text-5xl font-light tracking-wide text-shadow transition-transform duration-500 group-hover:-translate-y-2">
                      {category.name}
                    </h2>
                  </div>
                  {/* Optional: 'Shop Now' subtle indicator */}
                  <div className="absolute bottom-12 left-0 w-full text-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                    <span className="text-foreground text-xs tracking-[0.3em] uppercase border-b border-foreground pb-1">Shop Collection</span>
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
