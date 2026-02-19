'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiChevronDown, FiCheck, FiChevronLeft } from 'react-icons/fi';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchPublicProducts } from '@/lib/slices/productSlice';
import { fetchPublicCategories } from '@/lib/slices/categorySlice';
import { fetchProfile } from '@/lib/slices/profileSlice';
import { useCart } from '@/contexts/CartContext';
import PopularCollections from '@/components/home/PopularCollections';

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { products, isLoading: productsLoading } = useAppSelector((state) => state.product);
  const { categories, isLoading: categoriesLoading } = useAppSelector((state) => state.category);
  const { addItem } = useCart();

  const [sortBy, setSortBy] = useState('newest');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  useEffect(() => {
    dispatch(fetchPublicProducts());
    dispatch(fetchPublicCategories());
    if (isAuthenticated) {
      dispatch(fetchProfile());
    }
  }, [dispatch, isAuthenticated]);

  // Special categories configuration
  const specialCategories: Record<string, any> = {
    'new-arrivals': {
      _id: 'new-arrivals',
      name: 'New Arrivals',
      slug: 'new-arrivals',
      description: 'Discover our latest treasures, fresh from the atelier.',
      image: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&q=80&w=1600'
    },
    'best-sellers': {
      _id: 'best-sellers',
      name: 'Best Sellers',
      slug: 'best-sellers',
      description: 'Our most coveted pieces, loved by collectors worldwide.',
      image: 'https://images.unsplash.com/photo-1589674781759-c21c37956a44?auto=format&fit=crop&q=80&w=1600'
    }
  };

  // Find current category (real or special)
  const categorySlug = typeof params.slug === 'string' ? params.slug : '';
  const isSpecialCategory = ['new-arrivals', 'best-sellers'].includes(categorySlug);

  const activeCategory = isSpecialCategory
    ? specialCategories[categorySlug]
    : categories.find(c => c.slug === categorySlug);

  const isLoading = productsLoading || categoriesLoading;

  // Filter products
  const filteredProducts = products
    .filter((product) => {
      if (!product || !product._id) return false;

      // Special category filtering
      if (categorySlug === 'best-sellers') {
        return product.isBestSeller === true;
      }
      if (categorySlug === 'new-arrivals') {
        return product.isNewArrival === true;
      }

      // Regular category filtering
      if (!activeCategory) return false;
      const productCatId = typeof product.category === 'object' ? product.category?._id : product.category;
      return productCatId === activeCategory._id;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (a.discountedPrice || a.price || 0) - (b.discountedPrice || b.price || 0);
        case 'price-high':
          return (b.discountedPrice || b.price || 0) - (a.discountedPrice || a.price || 0);
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'newest':
        default:
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });

  const handleAddToCart = (product: any) => {
    addItem({
      id: product._id,
      name: product.name,
      price: product.discountedPrice || product.price,
      image: product.mainImage || product.image,
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
        <div className="w-12 h-12 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!activeCategory && !isLoading) {
    return (
      <div className="min-h-screen pt-32 text-center">
        <h1 className="text-2xl font-serif">Category not found</h1>
        <Link href="/collections" className="text-sm underline mt-4 inline-block">Back to Catalog</Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-24 bg-white animate-in fade-in duration-700 font-sans">

      {/* Category Banner */}
      <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden mb-12">
        <div className="absolute inset-0 bg-gray-900">
          {activeCategory?.bannerImage || activeCategory?.image ? (
            <img
              src={activeCategory.bannerImage || activeCategory.image}
              alt={activeCategory.name}
              className="w-full h-full object-cover opacity-60"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-gray-800 to-gray-900 opacity-90" />
          )}
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
          <span className="text-xs font-bold tracking-[0.3em] text-[#C5A059] uppercase block mb-4">
            Collection (Sub-Page)
          </span>
          <h1 className="text-5xl md:text-7xl font-serif tracking-tight mb-4">
            {activeCategory?.name}
          </h1>
          {activeCategory?.description && (
            <p className="max-w-2xl text-lg font-light text-gray-200">
              {activeCategory.description}
            </p>
          )}
        </div>
      </div>

      {/* Control Bar & Layout */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-gray-100">

          {/* Back to Catalog */}
          <Link
            href="/collections"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors uppercase tracking-widest"
          >
            <FiChevronLeft /> Back to Catalog
          </Link>

          {/* Sort & Count */}
          <div className="flex items-center gap-6 ml-auto">
            <span className="hidden md:block text-xs text-gray-400 tracking-widest uppercase">
              {filteredProducts.length} Products
            </span>

            <div className="relative group sort-dropdown">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-900 hover:text-[#C5A059] transition-colors"
              >
                Sort By
                <FiChevronDown size={14} className={`transition-transform duration-300 ${showSortDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showSortDropdown && (
                <div className="absolute right-0 top-full mt-4 bg-white border border-gray-100 shadow-xl min-w-[220px] z-50 animate-in fade-in zoom-in-95 duration-200 p-2">
                  {[
                    { label: 'Newest Arrivals', value: 'newest' },
                    { label: 'Price: Low to High', value: 'price-low' },
                    { label: 'Price: High to Low', value: 'price-high' },
                    { label: 'Name: A-Z', value: 'name' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-xs uppercase tracking-wider flex items-center justify-between group transition-colors ${sortBy === option.value ? 'bg-gray-50 text-black font-bold' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      {option.label}
                      {sortBy === option.value && <FiCheck className="text-[#C5A059]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="min-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
                <span className="text-xs uppercase tracking-widest text-gray-400">Loading Treasures...</span>
              </div>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
              {filteredProducts.map((product, idx) => (
                <div key={product._id} className="animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${idx * 50}ms` }}>
                  <ProductCard
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center border-t border-gray-100">
              <span className="text-4xl block mb-4">💎</span>
              <h3 className="serif text-2xl text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 font-light mb-8">This collection is currently being curated.</p>
              <Link
                href="/collections"
                className="text-[#C5A059] font-bold tracking-widest text-xs uppercase border-b border-[#C5A059] pb-1 hover:text-black hover:border-black transition-colors"
              >
                Browse All Categories
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

