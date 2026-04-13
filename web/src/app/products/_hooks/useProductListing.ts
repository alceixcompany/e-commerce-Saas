import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchPublicProducts } from '@/lib/slices/productSlice';
import { fetchPublicCategories } from '@/lib/slices/categorySlice';
import { useCart } from '@/contexts/CartContext';

export function useProductListing() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();
    const { addItem } = useCart();

    const { products, loading, metadata: productMetadata } = useAppSelector((state) => state.product);
    const { categories, metadata: categoryMetadata } = useAppSelector((state) => state.category);
    
    const [page, setPage] = useState(1);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [sortBy, setSortBy] = useState('newest');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const lastFetchKeyRef = useRef<string | null>(null);

    // Params
    const tag = searchParams.get('tag');
    const categoryParam = searchParams.get('category');
    const sortParam = searchParams.get('sort');
    const queryParam = searchParams.get('q');

    const productsLoading = loading.fetchList;
    const categoriesLoading = loading.fetchPublic || false;

    // Sync state with URL
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

    // Initial load
    useEffect(() => {
        const load = async () => {
            setIsInitialLoading(true);
            const initialParams = {
                page: 1,
                limit: 12,
                category: selectedCategory,
                sort: sortBy,
                tag: tag || undefined,
                q: queryParam || undefined
            };
            lastFetchKeyRef.current = JSON.stringify(initialParams);
            await Promise.all([
                dispatch(fetchPublicProducts(initialParams)),
                dispatch(fetchPublicCategories())
            ]);
            setIsInitialLoading(false);
        };
        load();
    }, [dispatch]);

    // Update filters and URL
    const updateFilters = useCallback((newCategory?: string, newSort?: string) => {
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
    }, [searchParams, router]);

    const loadMore = useCallback(async () => {
        if (productsLoading || page >= productMetadata.pages) return;
        const nextPage = page + 1;
        setPage(nextPage);
        await dispatch(fetchPublicProducts({
            page: nextPage,
            limit: 12,
            category: selectedCategory,
            sort: sortBy,
            tag: tag || undefined,
            q: queryParam || undefined
        }));
    }, [productsLoading, page, productMetadata.pages, selectedCategory, sortBy, tag, queryParam, dispatch]);

    // Infinite scroll effect
    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
                loadMore();
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loadMore]);

    // Refetch when filters change
    useEffect(() => {
        if (isInitialLoading) return;
        setPage(1);
        const params = {
            page: 1,
            limit: 12,
            category: selectedCategory,
            sort: sortBy,
            tag: tag || undefined,
            q: queryParam || undefined
        };
        const requestKey = JSON.stringify(params);
        if (lastFetchKeyRef.current === requestKey) return;
        lastFetchKeyRef.current = requestKey;
        dispatch(fetchPublicProducts(params));
    }, [selectedCategory, tag, sortBy, queryParam, dispatch, isInitialLoading]);

    // Dropdown close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.sort-dropdown')) setShowSortDropdown(false);
            if (!target.closest('.category-dropdown')) setShowCategoryDropdown(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAddToCart = useCallback((product: any) => {
        addItem({
            id: product._id,
            name: product.name,
            price: product.discountedPrice || product.price,
            image: product.mainImage || product.image,
        }, 1);
    }, [addItem]);

    // Computed
    const pageTitle = (() => {
        if (selectedCategory !== 'all') {
            const cat = categories.find(c => c._id === selectedCategory);
            return cat ? cat.name : 'Collection';
        }
        if (queryParam) return `Search Results for "${queryParam}"`;
        if (tag === 'new-arrival') return 'New Arrivals';
        if (tag === 'best-seller') return 'Best Sellers';
        return 'All Products';
    })();

    const pageDescription = (() => {
        if (queryParam) return `Found ${productMetadata.total} items matching your search.`;
        if (selectedCategory !== 'all') return 'Browse our exclusive selection.';
        if (tag === 'new-arrival') return 'Explore our latest treasures, fresh from the atelier.';
        if (tag === 'best-seller') return 'Discover our most coveted pieces, loved by collectors worldwide.';
        return 'Browse our complete collection of exquisite jewelry.';
    })();

    return {
        products,
        categories,
        productMetadata,
        categoryMetadata,
        isLoading: productsLoading || categoriesLoading,
        isInitialLoading,
        page,
        sortBy,
        selectedCategory,
        showSortDropdown,
        setShowSortDropdown,
        showCategoryDropdown,
        setShowCategoryDropdown,
        pageTitle,
        pageDescription,
        hasActiveFilters: !!(tag || categoryParam || sortParam),
        updateFilters,
        handleAddToCart,
        router
    };
}
