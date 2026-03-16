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
      <div className="min-h-screen pt-24 pb-12 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-foreground/20 border-t-primary rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-background font-sans">
      {/* Header */}
      <div className="bg-background border-b border-foreground/10">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-2 text-sm text-foreground/60 mb-4">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span className="text-foreground/30">/</span>
            <span className="text-foreground font-medium">Categories</span>
          </div>
          <h1 className="text-4xl font-light tracking-[0.1em] uppercase text-foreground mb-4">All Categories</h1>
          <p className="text-foreground/60 tracking-wider text-sm uppercase">
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
                  className="group bg-background border border-foreground/10 overflow-hidden hover:border-primary hover:shadow-xl transition-all block"
                >
                  {/* Category Image */}
                  <div className="relative h-64 bg-foreground/5">
                    {categoryImage ? (
                      <img
                        src={categoryImage}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
                      <svg className="w-16 h-16 text-foreground/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    
                    {/* Product Count Badge */}
                    <div className="absolute top-4 right-4 px-3 py-1 bg-background/90 backdrop-blur-sm shadow-sm text-[10px] tracking-widest uppercase font-bold text-foreground">
                      {count} {count === 1 ? 'item' : 'items'}
                    </div>
                  </div>

                  {/* Category Info */}
                  <div className="p-8 text-center bg-background group-hover:bg-foreground/5 transition-colors duration-500">
                    <h3 className="text-xl font-light tracking-widest uppercase text-foreground mb-3 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-foreground/50 inline-flex items-center gap-2 border-b border-transparent group-hover:border-primary pb-1 transition-all">
                      View Collection
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-32">
            <div className="w-24 h-24 bg-foreground/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-foreground/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-light tracking-widest uppercase text-foreground mb-4">No Categories Found</h3>
            <p className="text-sm uppercase tracking-wider text-foreground/50 mb-8">We are currently curating our collections.</p>
            <Link
              href="/"
              className="inline-block px-8 py-3 bg-foreground text-background text-xs uppercase tracking-widest font-bold hover:bg-primary transition-colors"
            >
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

