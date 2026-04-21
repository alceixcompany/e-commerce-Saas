'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiSearch, FiArrowRight } from 'react-icons/fi';
import { useProductStore } from '@/lib/store/useProductStore';
import { useCategoryStore } from '@/lib/store/useCategoryStore';
import { useContentStore } from '@/lib/store/useContentStore';
import { formatMoney, getCurrencySymbol } from '@/utils/currency';
import { useTranslation } from '@/hooks/useTranslation';
import type { Category } from '@/types/category';

function SearchItemImage({ src, alt, circle = false }: { src: string; alt: string; circle?: boolean }) {
  const [hasError, setHasError] = useState(false);
  const fallbackImage = '/image/alceix/product.png';

  return (
    <div className="relative w-full h-full">
      <Image
        src={hasError ? fallbackImage : src}
        alt={alt}
        fill
        className={`object-cover ${circle ? 'rounded-full' : ''}`}
        onError={() => {
          if (!hasError) setHasError(true);
        }}
      />
    </div>
  );
}

interface SearchBarProps {
  searchQuery: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchBar({ searchQuery, isOpen, onClose }: SearchBarProps) {
  const router = useRouter();
  const { searchResults, searchMetadata, searchProducts, clearSearchResults } = useProductStore();
  const { categories, fetchPublicCategories } = useCategoryStore();
  const { globalSettings } = useContentStore();
  const { t, i18n } = useTranslation();
  const currencySymbol = getCurrencySymbol(globalSettings?.currency);
  const [categoryResults, setCategoryResults] = useState<Category[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [page, setPage] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Initial Search
  useEffect(() => {
    const searchAll = async () => {
      if (!isOpen || searchQuery.trim().length < 2) {
        setCategoryResults([]);
        setPage(1);
        clearSearchResults();
        return;
      }

      setPage(1);
      setIsSearching(true);
      try {
        await searchProducts({ query: searchQuery.trim(), page: 1, limit: 10 });

        // Categories Search
        try {
	          const categoriesResult =
	            categories.length > 0
	              ? categories
	              : await fetchPublicCategories();
	          
	          if (categoriesResult) {
	            const filteredCategories = categoriesResult.filter((cat: Category) =>
	              cat.name.toLowerCase().includes(searchQuery.toLowerCase())
	            );
	            setCategoryResults(filteredCategories.slice(0, 3));
	          }
	        } catch (catError) {
	          console.error('Category search error:', catError);
	        }
	      } catch (error: unknown) {
	        console.error('Product search error:', error);
	      } finally {
	        setIsSearching(false);
	      }
    };

    const debounce = setTimeout(searchAll, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, isOpen, categories, searchProducts, clearSearchResults, fetchPublicCategories]);

  // Load more on scroll
  const loadMore = useCallback(async () => {
    if (isSearching || page >= searchMetadata.pages) return;

    const nextPage = page + 1;
    setPage(nextPage);
    setIsSearching(true);
    try {
      await searchProducts({ query: searchQuery.trim(), page: nextPage, limit: 10 });
    } catch (error) {
      console.error('Error loading more search results:', error);
    } finally {
      setIsSearching(false);
    }
  }, [isSearching, page, searchMetadata.pages, searchQuery, searchProducts]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      loadMore();
    }
  };

  // Handle ESC key to close search
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
        clearSearchResults();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose, clearSearchResults]);

  const handleProductClick = (productId: string) => {
    onClose();
    clearSearchResults();
    router.push(`/products/${productId}`);
  };

  const handleCategoryClick = (categorySlug: string) => {
    onClose();
    clearSearchResults();
    router.push(`/categories/${categorySlug}`);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-full right-0 mt-6 w-screen max-w-2xl bg-white border border-white/20 shadow-[0_40px_120px_rgba(0,0,0,0.2)] max-h-[70vh] overflow-hidden z-[1000] rounded-[2rem] animate-in fade-in slide-in-from-top-4 duration-500">
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="overflow-y-auto max-h-[70vh] custom-scrollbar"
      >
        {/* Categories Section */}
        {categoryResults.length > 0 && (
          <div className="border-b border-foreground/[0.03]">
            <div className="px-8 py-5 flex items-center justify-between">
            <h3 className="text-[9px] font-bold text-foreground/30 uppercase tracking-[0.4em]">
              {t('search.foundCollections')}
            </h3>
            </div>
            {categoryResults.filter(c => c && c._id).map((category) => {
              const fallbackImages: Record<string, string> = {
                'Bracelets': '/image/alceix/product.png',
                'Necklaces': '/image/alceix/product.png',
                'Rings': '/image/alceix/product.png',
                'Earrings': '/image/alceix/product.png',
                'default': '/image/alceix/hero.png'
              };
              const displayImage = category.image || fallbackImages[category.name] || fallbackImages.default;

              return (
                <button
                  key={category._id}
                  onClick={() => handleCategoryClick(category.slug)}
                  className="w-full flex items-center gap-6 px-8 py-5 hover:bg-foreground/[0.02] transition-all duration-500 group"
                >
                  <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-foreground/[0.03] p-0.5 border border-foreground/[0.05] relative">
                    <SearchItemImage
                      src={displayImage}
                      alt={category.name}
                      circle={true}
                    />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <h4 className="font-light text-foreground text-xs tracking-wider transition-colors group-hover:text-primary">{category.name}</h4>
                    <p className="text-[9px] text-foreground/30 mt-1 tracking-wider font-medium">{t('search.explore')}</p>
                  </div>
                  <FiArrowRight className="w-4 h-4 text-foreground/10 group-hover:text-primary group-hover:translate-x-2 transition-all duration-500 flex-shrink-0" strokeWidth={1} />
                </button>
              )
            })}
          </div>
        )}

        {/* Products Section */}
        {searchResults.length > 0 && (
          <div>
            <div className="px-8 py-5">
              <h3 className="text-[9px] font-bold text-foreground/30 uppercase tracking-[0.4em]">
                {t('search.foundPiecesCount', { count: searchMetadata.total })}
              </h3>
            </div>
            <div className="px-4 pb-4 grid grid-cols-1 gap-2">
              {searchResults.filter(p => p && p._id).map((product) => (
                <button
                  key={product._id}
                  onClick={() => handleProductClick(product._id)}
                  className="w-full flex items-center gap-6 px-4 py-4 rounded-2xl hover:bg-foreground/[0.02] transition-all duration-500 group"
                >
                  {product.mainImage || product.image ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-foreground/[0.03] group-hover:scale-105 transition-transform duration-700">
                      <SearchItemImage
                        src={product.mainImage || product.image}
                        alt={product.name}
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-foreground/[0.03] rounded-xl flex items-center justify-center flex-shrink-0">
                      <FiSearch className="w-6 h-6 text-foreground/20" strokeWidth={1} />
                    </div>
                  )}
                  <div className="flex-1 text-left min-w-0">
                    <h4 className="font-light text-foreground text-xs tracking-tight transition-colors group-hover:text-primary truncate">{product.name}</h4>
                    <div className="flex items-center gap-3 mt-1.5">
                      {product.discountedPrice ? (
                        <>
                        <span className="text-[11px] font-bold text-foreground">{currencySymbol} {formatMoney(product.discountedPrice, i18n.language === 'tr' ? 'tr-TR' : 'en-US')}</span>
                        <span className="text-[9px] text-foreground/20 line-through tracking-tighter">{currencySymbol} {formatMoney(product.price, i18n.language === 'tr' ? 'tr-TR' : 'en-US')}</span>
                        <span className="text-[8px] font-bold text-primary uppercase tracking-[0.2em]">{t('search.offer')}</span>
                        </>
                      ) : (
                        <span className="text-[11px] font-bold text-foreground tracking-tight">{currencySymbol} {formatMoney((product.price || 0), i18n.language === 'tr' ? 'tr-TR' : 'en-US')}</span>
                      )}
                    </div>
                  </div>
                  <FiArrowRight className="w-4 h-4 text-foreground/10 group-hover:text-primary group-hover:translate-x-2 transition-all duration-500 flex-shrink-0" strokeWidth={1} />
                </button>
              ))}
            </div>

            {/* Infinite Scroll Loader */}
            {page < searchMetadata.pages && (
              <div className="px-8 py-8 flex justify-center bg-foreground/[0.01]">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 border border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-foreground/20">{t('search.loading')}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {searchQuery.trim().length >= 2 && !isSearching && categoryResults.length === 0 && searchResults.length === 0 && (
          <div className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-foreground/[0.03] rounded-full flex items-center justify-center">
                <FiSearch className="w-8 h-8 text-foreground/10" strokeWidth={0.5} />
              </div>
              <h3 className="text-sm font-light text-foreground uppercase tracking-[0.3em]">{t('search.notFound')}</h3>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
