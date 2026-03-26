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

export default function ExploreByRoomSection({ instanceId }: { instanceId?: string }) {
  const dispatch = useAppDispatch();
  const { categories, isLoading: loading } = useAppSelector((state) => state.category);
  const { instances } = useAppSelector((state) => state.component);
  const { t } = useTranslation();

  const instanceData = instanceId ? instances.find(i => i._id === instanceId)?.data : null;
  const isVisible = instanceData?.isVisible !== false;

  if (!isVisible && instanceId) return null;

  const title = instanceData?.title || t('rooms.title');
  const subtitle = instanceData?.subtitle || t('rooms.subtitle');

  const defaultRoomCategories = [
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

  const roomCategories = instanceData?.rooms || defaultRoomCategories;
  const variant = instanceData?.variant || 'list'; // 'list', 'grid', 'focus'

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

  const renderListVariant = () => (
    <div className="space-y-12">
      <div className="text-left max-w-2xl">
        <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight tracking-tight italic">
          {title}
        </h2>
        <p className="text-muted-foreground text-lg font-normal mb-8">
          {subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {roomCategories.map((roomCategory: any) => {
          const categoryData = getCategoryData(roomCategory);

          return (
            <Link key={categoryData.slug} href={`/categories/${categoryData.slug}`} className="group block">
              <div className="flex flex-col md:flex-row gap-8 items-center bg-foreground/[0.02] border border-foreground/5 rounded-[2.5rem] p-6 transition-all duration-500 hover:bg-background hover:shadow-2xl hover:shadow-foreground/5">
                <div className="relative w-full md:w-96 aspect-video shrink-0 rounded-[2rem] overflow-hidden bg-muted shadow-sm">
                  <img
                    src={categoryData.image}
                    alt={categoryData.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                </div>
                <div className="flex-1 text-left py-4">
                  <h3 className="text-foreground font-bold text-2xl mb-3 italic">{categoryData.name}</h3>
                  <p className="text-muted-foreground text-base mb-6 leading-relaxed font-normal max-w-xl">{categoryData.description}</p>
                  <div className="inline-flex items-center gap-3 text-foreground font-bold text-sm tracking-widest uppercase border-b-2 border-foreground/10 pb-1 group-hover:border-primary group-hover:text-primary transition-all">
                    <span>{t('rooms.browse')}</span>
                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );

  const renderGridVariant = () => (
    <div className="space-y-16">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight tracking-tight italic">
          {title}
        </h2>
        <p className="text-muted-foreground text-lg font-normal">
          {subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {roomCategories.map((roomCategory: any) => {
          const categoryData = getCategoryData(roomCategory);
          return (
            <Link key={categoryData.slug} href={`/categories/${categoryData.slug}`} className="group h-full">
              <div className="flex flex-col h-full bg-foreground/[0.02] border border-foreground/5 rounded-[2rem] p-4 transition-all duration-500 hover:bg-background hover:shadow-2xl hover:shadow-foreground/5 hover:-translate-y-2">
                <div className="relative aspect-[4/5] rounded-[1.5rem] overflow-hidden bg-muted mb-6">
                  <img
                    src={categoryData.image}
                    alt={categoryData.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                    <span className="text-white text-xs font-bold uppercase tracking-[0.2em]">{t('rooms.browse')}</span>
                  </div>
                </div>
                <div className="px-4 pb-4">
                  <h3 className="text-foreground font-bold text-2xl mb-3 italic">{categoryData.name}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed font-normal line-clamp-2">
                    {categoryData.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );

  const renderFocusVariant = () => (
    <div className="grid md:grid-cols-2 gap-16 items-center">
      <div className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl group">
        <img
          src={roomCategories[0]?.image || '/image/alceix/hero.png'}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent"></div>
        <div className="absolute bottom-12 left-12 right-12 text-left">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 italic">{title}</h2>
          <p className="text-white/80 text-lg max-w-md">{subtitle}</p>
        </div>
      </div>

      <div className="space-y-6">
        {roomCategories.map((roomCategory: any) => {
          const categoryData = getCategoryData(roomCategory);
          return (
            <Link key={categoryData.slug} href={`/categories/${categoryData.slug}`} className="group block">
              <div className="flex items-center justify-between p-8 rounded-3xl bg-foreground/[0.03] border border-foreground/5 transition-all duration-300 hover:bg-foreground hover:text-background hover:shadow-xl group-hover:-translate-x-2">
                <div className="text-left">
                  <h3 className="font-bold text-xl mb-1 italic transition-colors">{categoryData.name}</h3>
                  <p className="text-sm opacity-60 font-normal">{categoryData.description}</p>
                </div>
                <div className="w-12 h-12 rounded-full border border-current flex items-center justify-center transition-transform group-hover:rotate-45">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <section className="bg-background py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {variant === 'list' && renderListVariant()}
            {variant === 'grid' && renderGridVariant()}
            {variant === 'focus' && renderFocusVariant()}
          </>
        )}
      </div>
    </section>
  );
}

