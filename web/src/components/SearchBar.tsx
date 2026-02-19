'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch, FiX, FiArrowRight } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { searchProducts, clearSearchResults } from '@/lib/slices/productSlice';
import { fetchPublicCategories } from '@/lib/slices/categorySlice';

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchBar({ isOpen, onClose }: SearchBarProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { searchResults, searchMetadata, isLoading: productsLoading } = useAppSelector((state) => state.product);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryResults, setCategoryResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [page, setPage] = useState(1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Focus input when search opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
      const input = searchInputRef.current;
      const len = input.value.length;
      input.setSelectionRange(len, len);
    }
  }, [isOpen]);

  // Initial Search
  useEffect(() => {
    const searchAll = async () => {
      if (searchQuery.trim().length < 2) {
        setCategoryResults([]);
        setPage(1);
        dispatch(clearSearchResults());
        return;
      }

      setPage(1);
      setIsSearching(true);
      try {
        await dispatch(searchProducts({ query: searchQuery.trim(), page: 1, limit: 10 })).unwrap();

        // Categories Search (Keep as is, usually small number)
        try {
          const categoriesResult = await dispatch(fetchPublicCategories()).unwrap();
          if (categoriesResult) {
            const filteredCategories = categoriesResult.filter((cat: any) =>
              cat.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setCategoryResults(filteredCategories.slice(0, 3));
          }
        } catch (catError) {
          console.error('Category search error:', catError);
        }
      } catch (error: any) {
        console.error('Product search error:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchAll, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, dispatch]);

  // Load more on scroll
  const loadMore = useCallback(async () => {
    if (isSearching || page >= searchMetadata.pages) return;

    const nextPage = page + 1;
    setPage(nextPage);
    setIsSearching(true);
    try {
      await dispatch(searchProducts({ query: searchQuery.trim(), page: nextPage, limit: 10 })).unwrap();
    } catch (error) {
      console.error('Error loading more search results:', error);
    } finally {
      setIsSearching(false);
    }
  }, [isSearching, page, searchMetadata.pages, searchQuery, dispatch]);

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
        setSearchQuery('');
        setPage(1);
        dispatch(clearSearchResults());
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose, dispatch]);

  const handleProductClick = (productId: string) => {
    onClose();
    setSearchQuery('');
    dispatch(clearSearchResults());
    router.push(`/products/${productId}`);
  };

  const handleCategoryClick = (categorySlug: string) => {
    onClose();
    setSearchQuery('');
    dispatch(clearSearchResults());
    router.push(`/categories/${categorySlug}`);
  };

  const handleClear = () => {
    setSearchQuery('');
    setPage(1);
    dispatch(clearSearchResults());
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-500" onClick={onClose} />

      {/* Search Bar */}
      <div className="fixed left-1/2  top-20 -translate-x-1/2 w-full max-w-3xl z-50 transition-all duration-500 ease-out">
        <div className="relative mx-4" onClick={(e) => e.stopPropagation()}>
          <div className="relative group ">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
              <FiSearch className="w-5 h-5 text-gray-300 group-focus-within:text-[#C5A059] transition-colors" strokeWidth={1.5} />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={(e) => {
                const len = e.target.value.length;
                e.target.setSelectionRange(len, len);
              }}
              placeholder="Search products, categories..."
              className="w-full text-white pl-12 pr-12 py-5 text-sm md:text-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl focus:outline-none focus:border-[#C5A059] focus:bg-white/15 transition-all duration-300 placeholder:text-gray-400 cursor-text tracking-wide font-light"
              autoFocus
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
              {isSearching ? (
                <div className="w-5 h-5 border-2 border-gray-200 border-t-[#C5A059] rounded-full animate-spin"></div>
              ) : searchQuery.trim().length > 0 ? (
                <button
                  onClick={handleClear}
                  className="w-5 h-5 text-gray-400 hover:text-gray-900 transition-colors"
                  type="button"
                >
                  <FiX size={20} strokeWidth={1.5} />
                </button>
              ) : null}
              {searchQuery.trim().length === 0 && (
                <kbd className="hidden md:flex items-center gap-1 px-2 py-1 text-[9px] font-bold text-gray-400 bg-gray-50 border border-gray-200 uppercase tracking-widest">
                  <span>ESC</span>
                </kbd>
              )}
            </div>
          </div>

          {/* Search Results Dropdown */}
          {searchQuery.trim().length >= 2 && (categoryResults.length > 0 || searchResults.length > 0) && (
            <div className="absolute top-full mt-2 w-full bg-white border border-gray-100 shadow-2xl max-h-[500px] overflow-hidden z-50 rounded-2xl">
              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="overflow-y-auto max-h-[500px]"
              >
                {/* Categories Section */}
                {categoryResults.length > 0 && (
                  <div className="border-b border-gray-100">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Categories
                      </h3>
                    </div>
                    {categoryResults.filter(c => c && c._id).map((category) => {
                      const fallbackImages: Record<string, string> = {
                        'Bracelets': 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800',
                        'Necklaces': 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&q=80&w=800',
                        'Rings': 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800',
                        'Earrings': 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&q=80&w=800',
                        'default': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800'
                      };
                      const displayImage = category.image || fallbackImages[category.name] || fallbackImages.default;

                      return (
                        <button
                          key={category._id}
                          onClick={() => handleCategoryClick(category.slug)}
                          className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-all duration-200 border-b border-gray-50 last:border-b-0 group"
                        >
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 shadow-sm border border-gray-200">
                            <img
                              src={displayImage}
                              alt={category.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <h4 className="font-medium text-black text-sm transition-colors truncate">{category.name}</h4>
                            <p className="text-[10px] text-gray-400 mt-0.5">View category</p>
                          </div>
                          <FiArrowRight className="w-4 h-4 text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all duration-200 flex-shrink-0" />
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Products Section */}
                {searchResults.length > 0 && (
                  <div>
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Products ({searchMetadata.total})
                      </h3>
                    </div>
                    {searchResults.filter(p => p && p._id).map((product) => (
                      <button
                        key={product._id}
                        onClick={() => handleProductClick(product._id)}
                        className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-all duration-200 border-b border-gray-50 last:border-b-0 group"
                      >
                        {product.mainImage || product.image ? (
                          <div className="relative w-14 h-14 rounded overflow-hidden flex-shrink-0 bg-gray-50 group-hover:scale-105 transition-transform duration-200">
                            <img
                              src={product.mainImage || product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                if (fallback) fallback.classList.remove('hidden');
                              }}
                            />
                            <div className="hidden w-full h-full bg-gray-100 flex items-center justify-center">
                              <FiSearch className="w-6 h-6 text-gray-400" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-14 h-14 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                            <FiSearch className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 text-left min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm group-hover:text-[#C5A059] transition-colors line-clamp-1">{product.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            {product.discountedPrice ? (
                              <>
                                <span className="text-sm font-bold text-gray-900">$ {(product.discountedPrice).toLocaleString('en-US')}</span>
                                <span className="text-xs text-gray-400 line-through">$ {(product.price).toLocaleString('en-US')}</span>
                              </>
                            ) : (
                              <span className="text-sm font-bold text-gray-900">$ {(product.price || 0).toLocaleString('en-US')}</span>
                            )}
                          </div>
                        </div>
                        <FiArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-900 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0" />
                      </button>
                    ))}

                    {/* Infinite Scroll Loader */}
                    {page < searchMetadata.pages && (
                      <div className="px-6 py-6 flex justify-center border-t border-gray-50 bg-gray-50/30">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 border-2 border-[#C5A059]/30 border-t-[#C5A059] rounded-full animate-spin"></div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Loading more treasures</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* No Results */}
          {searchQuery.trim().length >= 2 && !isSearching && categoryResults.length === 0 && searchResults.length === 0 && (
            <div className="absolute top-full mt-2 w-full bg-white border border-gray-100 shadow-2xl p-8 text-center z-50">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                  <FiSearch className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-1">No results found</h3>
                  <p className="text-xs text-gray-400">Try searching with different keywords</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

