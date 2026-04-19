'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { productService } from '@/lib/services/productService';
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
}

export default function ProductListingClient({
    initialProducts,
    initialMetadata,
    initialCategories,
    initialCategoryMetadata,
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

    const tag = currentSearchParams.get('tag') || undefined;
    const categoryParam = currentSearchParams.get('category') || undefined;
    const sortParam = currentSearchParams.get('sort') || undefined;
    const queryParam = currentSearchParams.get('q') || undefined;
    const pageParam = Number(currentSearchParams.get('page') || '1');

    const resolvedCategory = useMemo(
        () => initialCategories.find((category) =>
            category._id === categoryParam ||
            category.id === categoryParam ||
            category.slug === categoryParam
        ),
        [initialCategories, categoryParam]
    );

    const normalizedCategoryParam = resolvedCategory?._id;
    const selectedCategory = normalizedCategoryParam ?? 'all';
    const sortBy = sortParam ?? (tag === 'new-arrival' ? 'newest' : tag === 'best-seller' ? 'best-selling' : 'newest');
    const hasUrlFilters = !!(tag || categoryParam || sortParam || queryParam || pageParam > 1);

    useEffect(() => {
        if (!hasUrlFilters) {
            setProducts(initialProducts);
            setMetadata(initialMetadata);
            setCurrentPage(initialMetadata.page);
            return;
        }

        let cancelled = false;

        const syncWithUrl = async () => {
            try {
                const response = await productService.fetchPublicProductsPage({
                    page: pageParam,
                    limit: 12,
                    tag,
                    category: normalizedCategoryParam,
                    sort: sortBy,
                    q: queryParam,
                });

                if (cancelled) return;

                setProducts(response.data);
                setMetadata(response.metadata);
                setCurrentPage(response.metadata.page);
            } catch (error) {
                if (!cancelled) {
                    console.error('Failed to sync products with URL filters:', error);
                }
            }
        };

        void syncWithUrl();

        return () => {
            cancelled = true;
        };
    }, [
        hasUrlFilters,
        initialMetadata,
        initialProducts,
        pageParam,
        tag,
        normalizedCategoryParam,
        sortBy,
        queryParam,
    ]);

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
        const filterEntries: Array<[string, string | undefined]> = [
            ['tag', tag],
            ['category', normalizedCategoryParam],
            ['sort', sortParam],
            ['q', queryParam],
        ];

        filterEntries.forEach(([key, value]) => {
            if (typeof value === 'string' && value !== 'all') queryParams.set(key, value);
        });
        queryParams.set('page', String(nextPage));
        queryParams.set('limit', '12');

        try {
            const response = await productService.fetchPublicProductsPage({
                page: nextPage,
                limit: 12,
                tag: queryParams.get('tag') || undefined,
                category: queryParams.get('category') || undefined,
                sort: queryParams.get('sort') || undefined,
                q: queryParams.get('q') || undefined,
            });

            setProducts(prev => [...prev, ...response.data]);
            setMetadata(response.metadata);
            setCurrentPage(nextPage);
        } catch (error) {
            console.error('Failed to load more products:', error);
        } finally {
            setIsLoadingMore(false);
        }
    }, [isLoadingMore, currentPage, metadata.pages, tag, normalizedCategoryParam, sortParam, queryParam]);

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
            return resolvedCategory ? resolvedCategory.name : 'Collection';
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
