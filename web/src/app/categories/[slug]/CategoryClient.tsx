'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { FiChevronDown, FiCheck, FiChevronLeft, FiLoader } from 'react-icons/fi';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { productService } from '@/lib/services/productService';
import { useCart } from '@/contexts/CartContext';
import PopularCollections from '@/components/home/PopularCollections';
import { useTranslation } from '@/hooks/useTranslation';
import type { Category } from '@/types/category';
import type { PaginationData } from '@/types/common';
import type { Product } from '@/types/product';

interface SpecialCategoryViewModel extends Pick<Category, '_id' | 'name' | 'slug' | 'description'> {
    image: string;
    bannerImage?: string;
}

interface ProductListMetadata extends PaginationData {
    limit: number;
}

interface PublicProductQuery {
    page: number;
    limit: number;
    sort: string;
    tag?: 'new-arrival' | 'best-seller';
    category?: string;
}

interface CategoryClientProps {
    slug: string;
    initialCategory: Category | SpecialCategoryViewModel;
    initialProducts: Product[];
    initialMetadata: ProductListMetadata;
}

export default function CategoryClient({ slug, initialCategory, initialProducts, initialMetadata }: CategoryClientProps) {
    const { t } = useTranslation();
    const { addItem } = useCart();

    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [metadata, setMetadata] = useState<ProductListMetadata>(initialMetadata);
    const [currentPage, setCurrentPage] = useState(initialMetadata.page);
    const [productsLoading, setProductsLoading] = useState(false);
    const [sortBy, setSortBy] = useState('newest');
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const observerTarget = useRef<HTMLDivElement | null>(null);

    const getFetchParams = useCallback((page: number): PublicProductQuery => {
        const isSpecialCategory = ['new-arrivals', 'best-sellers'].includes(slug);
        const fetchParams: PublicProductQuery = {
            page,
            limit: 10,
            sort: sortBy
        };

        if (isSpecialCategory) {
            fetchParams.tag = slug === 'new-arrivals' ? 'new-arrival' : 'best-seller';
        } else {
            fetchParams.category = initialCategory?._id;
        }

        return fetchParams;
    }, [initialCategory?._id, slug, sortBy]);

    useEffect(() => {
        setProducts(initialProducts);
        setMetadata(initialMetadata);
        setCurrentPage(initialMetadata.page);
    }, [initialProducts, initialMetadata]);

    // Fetch the first client-side page when the user changes sorting.
    useEffect(() => {
        if (sortBy === 'newest') {
            setProducts(initialProducts);
            setMetadata(initialMetadata);
            setCurrentPage(initialMetadata.page);
            return;
        }

        let cancelled = false;

        const fetchSortedProducts = async () => {
            setProductsLoading(true);
            try {
                const response = await productService.fetchPublicProducts(getFetchParams(1));
                if (cancelled) return;

                setProducts(response.data);
                setMetadata(response.metadata);
                setCurrentPage(response.metadata.page);
            } catch (error) {
                if (!cancelled) {
                    console.error('Failed to fetch sorted category products:', error);
                }
            } finally {
                if (!cancelled) setProductsLoading(false);
            }
        };

        void fetchSortedProducts();

        return () => {
            cancelled = true;
        };
    }, [getFetchParams, initialMetadata, initialProducts, sortBy]);

    const loadMore = useCallback(async () => {
        if (productsLoading || currentPage >= metadata.pages) return;

        setProductsLoading(true);
        const nextPage = currentPage + 1;

        try {
            const response = await productService.fetchPublicProducts(getFetchParams(nextPage));
            setProducts((prev) => {
                const existingIds = new Set(prev.map((product) => product._id));
                const nextProducts = response.data.filter((product) => !existingIds.has(product._id));
                return [...prev, ...nextProducts];
            });
            setMetadata(response.metadata);
            setCurrentPage(response.metadata.page);
        } catch (error) {
            console.error('Failed to load more category products:', error);
        } finally {
            setProductsLoading(false);
        }
    }, [currentPage, getFetchParams, metadata.pages, productsLoading]);

    // Infinite scroll observer logic
    const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
        const target = entries[0];
        if (target.isIntersecting && !productsLoading && metadata.page < metadata.pages) {
            void loadMore();
        }
    }, [loadMore, productsLoading, metadata.page, metadata.pages]);

    useEffect(() => {
        const observer = new IntersectionObserver(handleObserver, {
            root: null,
            rootMargin: '200px',
            threshold: 0,
        });

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [handleObserver]);

    const handleAddToCart = (product: Product) => {
        const defaultVariation = product.variations?.[0];
        addItem({
            id: defaultVariation?._id ? `${product._id}:${defaultVariation._id}` : product._id,
            productId: product._id,
            name: product.name,
            price: defaultVariation?.price ?? product.discountedPrice ?? product.price,
            image: product.mainImage || product.image || '',
            variationId: defaultVariation?._id,
            variationLabel: defaultVariation?.label,
        }, 1);
    };

    return (
        <div className="pt-24 pb-24 bg-background animate-in fade-in duration-700 font-sans">
            {/* Category Banner */}
            <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden mb-12">
                <div className="absolute inset-0 bg-foreground">
                    {initialCategory?.bannerImage || initialCategory?.image ? (
                        <Image
                            src={initialCategory?.bannerImage || initialCategory?.image || ""}
                            alt={initialCategory?.name || "Category Banner"}
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
                        {initialCategory?.name}
                    </h1>
                    {initialCategory?.description && (
                        <p className="max-w-2xl text-lg font-light text-background/80">
                            {initialCategory.description}
                        </p>
                    )}
                </div>
            </div>

            {/* Control Bar */}
            <div className="max-w-[1440px] mx-auto px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-foreground/10">
                    <Link
                        href="/collections"
                        className="flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground transition-colors uppercase tracking-widest"
                    >
                        <FiChevronLeft /> {t('product.archive.category.backToCatalog')}
                    </Link>

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
                    {products.length > 0 ? (
                        <div className="flex flex-col gap-12">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
                                {products.map((product, idx) => (
                                    <ProductCard
                                        key={`${product._id}-${idx}`}
                                        product={product}
                                        onAddToCart={handleAddToCart}
                                    />
                                ))}
                            </div>

                            <div ref={observerTarget} className="h-32 flex flex-col items-center justify-center gap-4 py-20">
                                {(metadata.page < metadata.pages || (productsLoading)) && (
                                    <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
                                        <div className="flex items-center gap-3">
                                            <FiLoader className="w-5 h-5 text-primary animate-spin" />
                                            <span className="text-[10px] uppercase tracking-[0.4em] text-foreground/40 font-bold">
                                                {t('product.archive.category.moreTreasures')}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="py-24 text-center border-t border-foreground/10">
                            <h3 className="serif text-2xl text-foreground mb-2">{t('product.archive.category.emptyTitle')}</h3>
                            <Link href="/collections" className="text-primary font-bold tracking-widest text-xs uppercase border-b border-primary pb-1">
                                {t('product.archive.category.browseAll')}
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-20">
                <PopularCollections />
            </div>
        </div>
    );
}
