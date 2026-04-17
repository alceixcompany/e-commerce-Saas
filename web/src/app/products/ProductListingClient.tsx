'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import ProductHero from './_components/ProductHero';
import ProductFilters from './_components/ProductFilters';
import ProductGrid from './_components/ProductGrid';
import type { Product } from '@/types/product';
import type { Category } from '@/types/category';

interface ProductListingClientProps {
    initialProducts: Product[];
    initialMetadata: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
    initialCategories: Category[];
    initialCategoryMetadata?: {
        totalProducts: number;
    };
    searchParams: Record<string, string>;
}

export default function ProductListingClient({
    initialProducts,
    initialMetadata,
    initialCategories,
    initialCategoryMetadata,
    searchParams: params
}: ProductListingClientProps) {
    const router = useRouter();
    const currentSearchParams = useSearchParams();
    const { addItem } = useCart();

    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [metadata, setMetadata] = useState(initialMetadata);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(initialMetadata.page);

    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

    // Sync state with props when filters change (initial load or URL change)
    useEffect(() => {
        setProducts(initialProducts);
        setMetadata(initialMetadata);
        setCurrentPage(initialMetadata.page);
    }, [initialProducts, initialMetadata]);

    const tag = params.tag;
    const categoryParam = params.category;
    const sortParam = params.sort;
    const queryParam = params.q;

    const selectedCategory = categoryParam ?? 'all';
    const sortBy = sortParam ?? (tag === 'new-arrival' ? 'newest' : tag === 'best-seller' ? 'best-selling' : 'newest');

    const updateFilters = useCallback((newCategory?: string, newSort?: string) => {
        const nextParams = new URLSearchParams(currentSearchParams.toString());

        if (newCategory !== undefined) {
            if (newCategory === 'all') {
                nextParams.delete('category');
            } else {
                nextParams.set('category', newCategory);
            }
            nextParams.delete('page'); // Reset page when category changes
        }

        if (newSort !== undefined) {
            nextParams.set('sort', newSort);
            nextParams.delete('page'); // Reset page when sort changes
        }

        router.push(`/products?${nextParams.toString()}`, { scroll: false });
    }, [currentSearchParams, router]);

    const loadMore = useCallback(async () => {
        if (isLoadingMore || currentPage >= metadata.pages) return;

        setIsLoadingMore(true);
        const nextPage = currentPage + 1;

        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value && value !== 'all') queryParams.set(key, value);
        });
        queryParams.set('page', String(nextPage));
        queryParams.set('limit', '12');

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
            const res = await fetch(`${API_URL}/public/products?${queryParams.toString()}`);
            const json = await res.json();

            if (json.success) {
                setProducts(prev => [...prev, ...json.data]);
                setMetadata(json.metadata);
                setCurrentPage(nextPage);
            }
        } catch (error) {
            console.error('Failed to load more products:', error);
        } finally {
            setIsLoadingMore(false);
        }
    }, [isLoadingMore, currentPage, metadata.pages, params]);

    // Infinite scroll effect
    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 800) {
                loadMore();
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loadMore]);

    const handleAddToCart = useCallback((product: Product) => {
        addItem({
            id: product._id,
            name: product.name,
            price: product.discountedPrice || product.price,
            image: product.mainImage || product.image,
        }, 1);
    }, [addItem]);

    const pageTitle = (() => {
        if (selectedCategory !== 'all') {
            const cat = initialCategories.find(c => c._id === selectedCategory);
            return cat ? cat.name : 'Collection';
        }
        if (queryParam) return `Search Results for "${queryParam}"`;
        if (tag === 'new-arrival') return 'New Arrivals';
        if (tag === 'best-seller') return 'Best Sellers';
        return 'All Products';
    })();

    const pageDescription = (() => {
        if (queryParam) return `Found ${metadata.total} items matching your search.`;
        if (selectedCategory !== 'all') return 'Browse our exclusive selection.';
        if (tag === 'new-arrival') return 'Explore our latest treasures, fresh from the atelier.';
        if (tag === 'best-seller') return 'Discover our most coveted pieces, loved by collectors worldwide.';
        return 'Browse our complete collection of exquisite jewelry.';
    })();

    return (
        <div className="pt-20 pb-20 bg-background min-h-screen">
            <ProductHero
                title={pageTitle}
                description={pageDescription}
                totalProducts={metadata.total}
                totalCategories={initialCategories.length}
            />

            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12">
                <ProductFilters
                    hasActiveFilters={!!(tag || categoryParam || sortParam || queryParam)}
                    selectedCategory={selectedCategory}
                    categories={initialCategories}
                    sortBy={sortBy}
                    showCategoryDropdown={showCategoryDropdown}
                    setShowCategoryDropdown={setShowCategoryDropdown}
                    showSortDropdown={showSortDropdown}
                    setShowSortDropdown={setShowSortDropdown}
                    updateFilters={updateFilters}
                    totalProductsInCategories={initialCategoryMetadata?.totalProducts}
                />

                <ProductGrid
                    products={products}
                    isLoading={false} // Initial load is done by RSC
                    page={currentPage}
                    totalPages={metadata.pages}
                    onAddToCart={handleAddToCart}
                    onClearFilters={() => router.push('/products')}
                />

                {isLoadingMore && (
                    <div className="mt-12 flex justify-center">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
            </div>
        </div>
    );
}
