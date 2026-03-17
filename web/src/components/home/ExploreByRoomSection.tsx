'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchPublicCategories } from '@/lib/slices/categorySlice';
import { useTranslation } from '@/hooks/useTranslation';

interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
}

export default function ExploreByRoomSection() {
  const dispatch = useAppDispatch();
  const { categories, isLoading: loading } = useAppSelector((state) => state.category);
  const { t } = useTranslation();

  const roomCategories = [
    {
      name: t('rooms.livingRoom.name'),
      description: t('rooms.livingRoom.description'),
      image: '/image/alceix/hero.png',
      slug: 'living-room',
    },
    {
      name: t('rooms.bedroom.name'),
      description: t('rooms.bedroom.description'),
      image: '/image/alceix/product.png',
      slug: 'bedroom',
    },
    {
      name: t('rooms.diningKitchen.name'),
      description: t('rooms.diningKitchen.description'),
      image: '/image/alceix/hero.png',
      slug: 'dining-kitchen',
    },
  ];

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
              {t('rooms.title')}
            </h2>
            <p className="text-zinc-600 text-base font-normal">
              {t('rooms.subtitle')}
            </p>
          </div>

          {/* Right Side - Category Cards */}
          <div className="space-y-8">
            {loading ? (
              <div className="text-center py-12 text-zinc-500">
                {t('admin.saving')}...
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
                          <span>{t('rooms.browse')}</span>
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

