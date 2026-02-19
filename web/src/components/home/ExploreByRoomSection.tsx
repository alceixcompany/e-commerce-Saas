'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchPublicCategories } from '@/lib/slices/categorySlice';

interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
}

const roomCategories = [
  {
    name: 'Living Room',
    description: 'Relax and entertain with plush sofas, modern tables, and warm lighting',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop',
    slug: 'living-room',
  },
  {
    name: 'Bedroom',
    description: 'Build your sanctuary with cozy beds, functional dressers, and calming accents',
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop',
    slug: 'bedroom',
  },
  {
    name: 'Dining & Kitchen',
    description: 'Gather in style with sturdy dining sets, elegant chairs, and storage solutions',
    image: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e4?w=800&h=600&fit=crop',
    slug: 'dining-kitchen',
  },
];

export default function ExploreByRoomSection() {
  const dispatch = useAppDispatch();
  const { categories, isLoading: loading } = useAppSelector((state) => state.category);

  useEffect(() => {
    dispatch(fetchPublicCategories());
  }, [dispatch]);

  // Map API categories to room categories or use default
  const getCategoryData = (roomCategory: typeof roomCategories[0]) => {
    const apiCategory = categories.find(
      (cat) => cat.name.toLowerCase() === roomCategory.name.toLowerCase() ||
        cat.slug === roomCategory.slug
    );

    return {
      ...roomCategory,
      _id: apiCategory?._id || '',
      slug: apiCategory?.slug || roomCategory.slug,
      image: apiCategory?.image || roomCategory.image,
    };
  };

  return (
    <section className="bg-white py-32 ">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-[30%_70%] gap-12 items-start">
          {/* Left Side - Header */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4 leading-tight tracking-tight">
              Explore by Room
            </h2>
            <p className="text-zinc-600 text-base font-normal">
              Browse thoughtfully curated furniture for every corner of your home.
            </p>
          </div>

          {/* Right Side - Category Cards */}
          <div className="space-y-8">
            {loading ? (
              <div className="text-center py-12 text-zinc-500">
                Loading categories...
              </div>
            ) : (
              roomCategories.map((roomCategory, index) => {
                const categoryData = getCategoryData(roomCategory);
                const isEven = index % 2 === 0;

                return (
                  <Link
                    key={categoryData.slug}
                    href={`/categories/${categoryData.slug}`}
                    className="group block"
                  >
                    <div className={`flex gap-6 items-center ${isEven ? 'flex-row' : 'flex-row-reverse'}`}>
                      {/* Image */}
                      <div className="relative w-80 h-48 flex-shrink-0 rounded-lg overflow-hidden">
                        <img
                          src={categoryData.image}
                          alt={categoryData.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              const placeholder = document.createElement('div');
                              placeholder.className = 'w-full h-full flex items-center justify-center text-zinc-400 bg-zinc-50';
                              placeholder.textContent = 'No Image';
                              parent.appendChild(placeholder);
                            }
                          }}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="text-zinc-900 font-bold text-xl mb-2">
                          {categoryData.name}
                        </h3>
                        <p className="text-zinc-600 text-base mb-3 leading-relaxed font-normal">
                          {categoryData.description}
                        </p>
                        <div className="flex items-center gap-2 text-zinc-900 font-normal text-sm underline">
                          <span>Browse Category</span>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

