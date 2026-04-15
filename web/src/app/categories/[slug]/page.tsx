'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { FiChevronDown, FiCheck, FiChevronLeft, FiLoader } from 'react-icons/fi';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchPublicProducts } from '@/lib/slices/productSlice';
import { fetchPublicCategories } from '@/lib/slices/categorySlice';
import { useCart } from '@/contexts/CartContext';
import PopularCollections from '@/components/home/PopularCollections';
import { useTranslation } from '@/hooks/useTranslation';
import type { Category } from '@/types/category';
import type { Product } from '@/types/product';

export default function CategoryPage() {
  const params = useParams();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { products, loading: productLoading, metadata } = useAppSelector((state) => state.product);
  const productsLoading = productLoading.fetchList;
  const { categories } = useAppSelector((state) => state.category);
  const { addItem } = useCart();

  const [sortBy, setSortBy] = useState('newest');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const observerTarget = useRef<HTMLDivElement | null>(null);

  // Global dependencies fetch
  useEffect(() => {
    dispatch(fetchPublicCategories());
  }, [dispatch]);

  // Find current category (real or special)
  const categorySlug = typeof params.slug === 'string' ? params.slug : '';
  const isSpecialCategory = ['new-arrivals', 'best-sellers'].includes(categorySlug);

  type SpecialCategory = Pick<Category, '_id' | 'name' | 'slug' | 'description' | 'image' | 'bannerImage'> & {
    tag: string;
  };

  const specialCategories: Record<string, SpecialCategory> = {
    'new-arrivals': {
      _id: 'new-arrivals',
      name: 'New Arrivals',
      slug: 'new-arrivals',
      tag: 'new-arrival',
      description: 'Discover our latest Alceix treasures, fresh from the atelier.',
      image: '/image/alceix/product.png'
    },
    'best-sellers': {
      _id: 'best-sellers',
      name: 'Best Sellers',
      slug: 'best-sellers',
      tag: 'best-seller',
      description: 'Our most coveted Alceix pieces, loved by collectors worldwide.',
      image: '/image/alceix/hero.png'
    }
  };

  const activeCategory: Category | SpecialCategory | undefined = isSpecialCategory
    ? specialCategories[categorySlug]
    : categories.find((c) => c.slug === categorySlug);

  const queryKey = useMemo(() => `${categorySlug}::${sortBy}`, [categorySlug, sortBy]);
  const [pageByKey, setPageByKey] = useState<Record<string, number>>({});
  const page = pageByKey[queryKey] ?? 1;

  const incrementPage = useCallback(() => {
    setPageByKey((prev) => ({ ...prev, [queryKey]: (prev[queryKey] ?? 1) + 1 }));
  }, [queryKey]);

  // Fetch products when category, page, or sort changes
  useEffect(() => {
    if (activeCategory) {
      const fetchParams: {
        page: number;
        limit: number;
        sort: string;
        tag?: string;
        category?: string;
      } = {
        page,
        limit: 10,
        sort: sortBy
      };

      if (isSpecialCategory) {
        fetchParams.tag = (activeCategory as SpecialCategory).tag;
      } else {
        fetchParams.category = activeCategory._id;
      }

      dispatch(fetchPublicProducts(fetchParams));
    }
  }, [dispatch, activeCategory, page, sortBy, isSpecialCategory]);

  // Infinite scroll observer logic
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && !productsLoading && metadata.page < metadata.pages) {
      incrementPage();
    }
  }, [incrementPage, productsLoading, metadata.page, metadata.pages]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '200px', // Fetch early before reaching the bottom
      threshold: 0,
    });

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [handleObserver]);

  const isLoading = productsLoading && page === 1;

  // Use products directly as they are now pre-filtered on server
  const filteredProducts: Product[] = products;

  type CartableProduct = Pick<Product, '_id' | 'name' | 'price'> &
    Partial<Pick<Product, 'discountedPrice' | 'mainImage' | 'image'>>;

  const handleAddToCart = (product: CartableProduct) => {
    addItem({
      id: product._id,
      name: product.name,
      price: product.discountedPrice || product.price,
      image: product.mainImage || product.image || '',
    }, 1);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.sort-dropdown')) {
        setShowSortDropdown(false);
      }
    };

    if (showSortDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSortDropdown]);


  if (isLoading && !activeCategory) {
    return (
      <div className="min-h-screen pt-24 flex justify-center">
        <div className="w-12 h-12 border-2 border-foreground/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!activeCategory && !isLoading) {
    return (
      <div className="min-h-screen pt-32 text-center">
        <h1 className="text-2xl font-serif">{t('product.archive.category.notFound')}</h1>
        <Link href="/collections" className="text-sm underline mt-4 inline-block">{t('product.archive.category.backToCatalog')}</Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-24 bg-background animate-in fade-in duration-700 font-sans">

      {/* Category Banner */}
      <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden mb-12">
        <div className="absolute inset-0 bg-foreground">
          {activeCategory?.bannerImage || activeCategory?.image ? (
            <Image
              src={activeCategory?.bannerImage || activeCategory?.image || ""}
              alt={activeCategory?.name || "Category Banner"}
              fill
              className="object-cover opacity-60"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-foreground/80 to-foreground opacity-90" />
          )}
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-background p-6 text-center">
          <span className="text-xs font-bold tracking-[0.3em] text-primary uppercase block mb-4">
            {t('product.archive.category.subPage')}
          </span>
          <h1 className="text-5xl md:text-7xl font-serif tracking-tight mb-4">
            {activeCategory?.name}
          </h1>
          {activeCategory?.description && (
            <p className="max-w-2xl text-lg font-light text-background/80">
              {activeCategory.description}
            </p>
          )}
        </div>
      </div>

      {/* Control Bar & Layout */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-foreground/10">

          {/* Back to Catalog */}
          <Link
            href="/collections"
            className="flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground transition-colors uppercase tracking-widest"
          >
            <FiChevronLeft /> {t('product.archive.category.backToCatalog')}
          </Link>

          {/* Sort & Count */}
          <div className="flex items-center gap-6 ml-auto">
            <span className="hidden md:block text-xs text-foreground/40 tracking-widest uppercase">
              {t('product.archive.category.count', { count: metadata.total })}
            </span>

            <div className="relative group sort-dropdown">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground hover:text-primary transition-colors"
              >
                {t('product.archive.category.sortBy')}
                <FiChevronDown size={14} className={`transition-transform duration-300 ${showSortDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showSortDropdown && (
                <div className="absolute right-0 top-full mt-4 bg-background border border-foreground/10 shadow-xl min-w-[220px] z-50 animate-in fade-in zoom-in-95 duration-200 p-2">
                  {[
                    { label: t('product.archive.sortOptions.newest'), value: 'newest' },
                    { label: t('product.archive.sortOptions.priceLow'), value: 'price-low' },
                    { label: t('product.archive.sortOptions.priceHigh'), value: 'price-high' },
                    { label: t('product.archive.sortOptions.name'), value: 'name' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-xs uppercase tracking-wider flex items-center justify-between group transition-colors ${sortBy === option.value ? 'bg-foreground/5 text-foreground font-bold' : 'text-foreground/60 hover:bg-foreground/5'}`}
                    >
                      {option.label}
                      {sortBy === option.value && <FiCheck className="text-primary" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="min-h-[400px]">
          {isLoading && page === 1 ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-2 border-foreground/20 border-t-primary rounded-full animate-spin"></div>
                <span className="text-xs uppercase tracking-widest text-foreground/40">{t('product.archive.category.loading')}</span>
              </div>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="flex flex-col gap-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
                {filteredProducts.map((product, idx) => {
                  const isNewBatch = idx >= (page - 1) * 10;
                  return (
                    <div
                      key={`${product._id}-${idx}`}
                      className={isNewBatch ? "animate-in fade-in slide-in-from-bottom-4 duration-700" : ""}
                      style={{ animationDelay: isNewBatch ? `${(idx % 10) * 50}ms` : '0ms' }}
                    >
                      <ProductCard
                        product={product}
                        onAddToCart={handleAddToCart}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Infinite Scroll & Loading UI */}
              <div
                ref={observerTarget}
                className="h-32 flex flex-col items-center justify-center gap-4 py-20"
              >
                {(metadata.page < metadata.pages || (isLoading && page > 1)) && (
                  <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
                    <div className="flex items-center gap-3">
                      <FiLoader className="w-5 h-5 text-primary animate-spin" />
                      <span className="text-[10px] uppercase tracking-[0.4em] text-foreground/40 font-bold">
                        {t('product.archive.category.moreTreasures')}
                      </span>
                    </div>
                    <div className="w-12 h-px bg-foreground/10" />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-24 text-center border-t border-foreground/10">
              <span className="text-4xl block mb-4">💎</span>
              <h3 className="serif text-2xl text-foreground mb-2">{t('product.archive.category.emptyTitle')}</h3>
              <p className="text-foreground/50 font-light mb-8">{t('product.archive.category.emptyDesc')}</p>
              <Link
                href="/collections"
                className="text-primary font-bold tracking-widest text-xs uppercase border-b border-primary pb-1 hover:text-foreground hover:border-foreground transition-colors"
              >
                {t('product.archive.category.browseAll')}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Popular Collections at Bottom */}
      <div className="mt-20">
        <PopularCollections />
      </div>



    </div>
  );
}
