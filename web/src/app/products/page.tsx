'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiChevronDown, FiCheck, FiFilter, FiX, FiGrid, FiList } from 'react-icons/fi';
import ProductCard from '@/components/ProductCard';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchPublicProducts } from '@/lib/slices/productSlice';
import { fetchPublicCategories } from '@/lib/slices/categorySlice';
import { useCart } from '@/contexts/CartContext';

function ProductsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();
    const { products, isLoading: productsLoading, metadata: productMetadata } = useAppSelector((state) => state.product);
    const { categories, isLoading: categoriesLoading } = useAppSelector((state) => state.category);
    const { addItem } = useCart();

    const [page, setPage] = useState(1);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    const [sortBy, setSortBy] = useState('newest');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Get filter from URL
    const tag = searchParams.get('tag');
    const categoryParam = searchParams.get('category');
    const sortParam = searchParams.get('sort');

    const isLoading = productsLoading || categoriesLoading;

    // Initialize state from URL params
    useEffect(() => {
        if (categoryParam) setSelectedCategory(categoryParam);
        if (sortParam) {
            setSortBy(sortParam);
        } else if (tag === 'new-arrival') {
            setSortBy('newest');
        } else if (tag === 'best-seller') {
            setSortBy('best-selling');
        }
    }, [tag, categoryParam, sortParam]);

    // Update URL when filters change
    const updateFilters = (newCategory?: string, newSort?: string) => {
        const params = new URLSearchParams(searchParams.toString());

        if (newCategory !== undefined) {
            if (newCategory === 'all') {
                params.delete('category');
            } else {
                params.set('category', newCategory);
            }
            setSelectedCategory(newCategory);
        }

        if (newSort !== undefined) {
            params.set('sort', newSort);
            setSortBy(newSort);
        }

        router.push(`/products?${params.toString()}`, { scroll: false });
    };

    useEffect(() => {
        const loadInitialData = async () => {
            setIsInitialLoading(true);
            await Promise.all([
                dispatch(fetchPublicProducts({
                    page: 1,
                    limit: 12,
                    category: selectedCategory,
                    sort: sortBy,
                    tag: tag || undefined
                })),
                dispatch(fetchPublicCategories())
            ]);
            setIsInitialLoading(false);
        };
        loadInitialData();
    }, [dispatch]);

    const loadMore = async () => {
        if (productsLoading || page >= productMetadata.pages) return;
        const nextPage = page + 1;
        setPage(nextPage);
        await dispatch(fetchPublicProducts({
            page: nextPage,
            limit: 12,
            category: selectedCategory,
            sort: sortBy,
            tag: tag || undefined
        }));
    };

    // Reset and refetch when filters change
    useEffect(() => {
        if (isInitialLoading) return; // Prevent double fetch on mount
        setPage(1);
        dispatch(fetchPublicProducts({
            page: 1,
            limit: 12,
            category: selectedCategory,
            sort: sortBy,
            tag: tag || undefined
        }));
    }, [selectedCategory, tag, sortBy, dispatch]);

    // Scroll listener for infinite scroll
    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
                loadMore();
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [page, productMetadata.pages, productsLoading]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.sort-dropdown')) {
                setShowSortDropdown(false);
            }
            if (!target.closest('.category-dropdown')) {
                setShowCategoryDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Products are now filtered and sorted by the backend
    const displayProducts = products;

    const handleAddToCart = (product: any) => {
        addItem({
            id: product._id,
            name: product.name,
            price: product.discountedPrice || product.price,
            image: product.mainImage || product.image,
        }, 1);
    };

    // Page Title logic
    const getPageTitle = () => {
        if (selectedCategory !== 'all') {
            const category = categories.find(c => c._id === selectedCategory);
            return category ? category.name : 'Collection';
        }
        if (tag === 'new-arrival') return 'New Arrivals';
        if (tag === 'best-seller') return 'Best Sellers';
        return 'All Products';
    };

    const getPageDescription = () => {
        if (selectedCategory !== 'all') return 'Browse our exclusive selection.';
        if (tag === 'new-arrival') return 'Explore our latest treasures, fresh from the atelier.';
        if (tag === 'best-seller') return 'Discover our most coveted pieces, loved by collectors worldwide.';
        return 'Browse our complete collection of exquisite jewelry.';
    };

    const hasActiveFilters = tag || categoryParam || sortParam;

    return (
        <div className="pt-20 pb-20 bg-white min-h-screen">

            {/* Minimal Elegant Hero */}
            <div className="relative overflow-hidden border-b border-gray-100">
                {/* Subtle Background Pattern */}
                <div className="absolute inset-0 opacity-[0.02]">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C5A059] rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gray-900 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-12 py-16">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-8 animate-in fade-in duration-500">
                        <Link href="/" className="hover:text-[#C5A059] transition-colors">Home</Link>
                        <span>/</span>
                        <span className="text-gray-900">Products</span>
                    </div>

                    {/* Title Section */}
                    <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-3 tracking-tight">
                            {getPageTitle()}
                        </h1>
                        <p className="text-sm text-gray-500 font-light leading-relaxed mb-6">
                            {getPageDescription()}
                        </p>

                        {/* Minimal Stats */}
                        <div className="flex items-center gap-6 text-xs">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">{productMetadata.total}</span>
                                <span className="text-gray-400">Products</span>
                            </div>
                            <div className="w-px h-3 bg-gray-200"></div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">{categories.length}</span>
                                <span className="text-gray-400">Categories</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12">
                {/* Refined Filter Bar */}
                <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-gray-100">

                    {/* Left - Clear Filters */}
                    <div className="flex items-center gap-3">
                        {hasActiveFilters && (
                            <button
                                onClick={() => {
                                    setSelectedCategory('all');
                                    setSortBy('newest');
                                    router.push('/products');
                                }}
                                className="group flex items-center gap-2 text-xs text-gray-500 hover:text-red-600 transition-colors"
                            >
                                <FiX size={14} className="group-hover:rotate-90 transition-transform duration-300" />
                                <span className="uppercase tracking-wider">Clear Filters</span>
                            </button>
                        )}
                    </div>

                    {/* Right - Filter Controls */}
                    <div className="flex items-center gap-3">

                        {/* Category Filter */}
                        <div className="relative category-dropdown">
                            <button
                                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                className="group flex items-center gap-2 px-4 py-2 border border-gray-200 hover:border-gray-300 rounded-lg transition-all text-xs"
                            >
                                <span className="text-gray-500">Category:</span>
                                <span className="font-medium text-gray-900">
                                    {selectedCategory === 'all' ? 'All' : categories.find(c => c._id === selectedCategory)?.name}
                                </span>
                                <FiChevronDown
                                    size={14}
                                    className={`text-gray-400 transition-transform duration-300 ${showCategoryDropdown ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {showCategoryDropdown && (
                                <div className="absolute right-0 md:left-0 md:right-auto top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-100 min-w-[220px] py-2 z-50 animate-in fade-in duration-200">
                                    <button
                                        onClick={() => {
                                            updateFilters('all');
                                            setShowCategoryDropdown(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-gray-50 transition-colors ${selectedCategory === 'all' ? 'font-semibold text-[#C5A059] bg-[#C5A059]/5' : 'text-gray-700'
                                            }`}
                                    >
                                        <span>All Categories</span>
                                        {selectedCategory === 'all' && <FiCheck size={14} />}
                                    </button>
                                    {categories.map((category) => (
                                        <button
                                            key={category._id}
                                            onClick={() => {
                                                updateFilters(category._id);
                                                setShowCategoryDropdown(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-gray-50 transition-colors ${selectedCategory === category._id ? 'font-semibold text-[#C5A059] bg-[#C5A059]/5' : 'text-gray-700'
                                                }`}
                                        >
                                            <span>{category.name}</span>
                                            {selectedCategory === category._id && <FiCheck size={14} />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sort Dropdown */}
                        <div className="relative sort-dropdown">
                            <button
                                onClick={() => setShowSortDropdown(!showSortDropdown)}
                                className="group flex items-center gap-2 px-4 py-2 border border-gray-200 hover:border-gray-300 rounded-lg transition-all text-xs"
                            >
                                <span className="text-gray-500">Sort:</span>
                                <span className="font-medium text-gray-900 capitalize">
                                    {sortBy.replace('-', ' ')}
                                </span>
                                <FiChevronDown
                                    size={14}
                                    className={`text-gray-400 transition-transform duration-300 ${showSortDropdown ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {showSortDropdown && (
                                <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-100 min-w-[200px] py-2 z-50 animate-in fade-in duration-200">
                                    {[
                                        { label: 'Newest', value: 'newest' },
                                        { label: 'Best Selling', value: 'best-selling' },
                                        { label: 'Price: Low to High', value: 'price-low' },
                                        { label: 'Price: High to Low', value: 'price-high' },
                                        { label: 'Name: A-Z', value: 'name' },
                                    ].map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => {
                                                updateFilters(undefined, option.value);
                                                setShowSortDropdown(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-gray-50 transition-colors ${sortBy === option.value ? 'font-semibold text-[#C5A059] bg-[#C5A059]/5' : 'text-gray-700'
                                                }`}
                                        >
                                            <span>{option.label}</span>
                                            {sortBy === option.value && <FiCheck size={14} />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Product Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                            <div
                                key={n}
                                className="aspect-[3/4] bg-gray-50 rounded animate-pulse"
                            />
                        ))}
                    </div>
                ) : displayProducts.length > 0 ? (
                    <div className="space-y-12">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {displayProducts.map((product, index) => (
                                <div
                                    key={product._id}
                                    className="animate-in fade-in duration-500"
                                    style={{
                                        animationDelay: `${index * 30}ms`,
                                        animationFillMode: 'backwards'
                                    }}
                                >
                                    <ProductCard
                                        product={product}
                                        onAddToCart={handleAddToCart}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Loading More Indicator */}
                        {page < productMetadata.pages && (
                            <div className="flex flex-col items-center justify-center py-12 border-t border-gray-50">
                                <div className="w-8 h-8 border-2 border-[#C5A059]/30 border-t-[#C5A059] rounded-full animate-spin mb-4"></div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em]">Unveiling more treasures</p>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Minimal Empty State */
                    <div className="py-24 text-center">
                        <div className="max-w-sm mx-auto">
                            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                                <FiGrid className="text-gray-300" size={28} />
                            </div>
                            <h3 className="text-lg font-serif text-gray-900 mb-2">No Products Found</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Try adjusting your filters or browse our full collection.
                            </p>
                            <div className="flex items-center justify-center gap-3">
                                <button
                                    onClick={() => {
                                        setSelectedCategory('all');
                                        setSortBy('newest');
                                        router.push('/products');
                                    }}
                                    className="px-6 py-2 bg-gray-900 text-white text-xs uppercase tracking-wider rounded hover:bg-gray-800 transition-colors"
                                >
                                    Clear Filters
                                </button>
                                <Link
                                    href="/"
                                    className="px-6 py-2 border border-gray-200 text-gray-700 text-xs uppercase tracking-wider rounded hover:border-gray-300 transition-colors"
                                >
                                    Go Home
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={
            <div className="pt-32 pb-20 bg-white min-h-screen flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full border-4 border-[#C5A059]/20 border-t-[#C5A059] animate-spin mb-4"></div>
                    <p className="text-xs text-gray-400 uppercase tracking-widest">Loading Collection...</p>
                </div>
            </div>
        }>
            <ProductsContent />
        </Suspense>
    );
}
