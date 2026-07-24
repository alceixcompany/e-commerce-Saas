'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useCmsStore } from '@/lib/store/useCmsStore';
import { useCategoryStore } from '@/lib/store/useCategoryStore';
import { productService } from '@/lib/services/productService';
import {
    FiChevronLeft,
    FiChevronRight,
    FiFilter,
    FiGrid,
    FiLayout,
    FiMaximize,
    FiPlus,
    FiRefreshCw,
    FiSave,
    FiSearch,
    FiTrash2,
    FiX,
} from 'react-icons/fi';
import { useTranslation } from '@/hooks/useTranslation';
import type { Product } from '@/types/product';
import type { CustomProductsData } from '@/types/sections';

const DEFAULT_PAGE_SIZE = 8;

interface ProductMetadata {
    total: number;
    page: number;
    pages: number;
    limit: number;
}

function ProductImage({ src, alt }: { src?: string; alt: string }) {
    const [hasError, setHasError] = useState(false);
    const fallbackImage = '/image/alceix/product.png';

    if (!src) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-foreground/5">
                <FiGrid size={16} className="text-foreground/20" />
            </div>
        );
    }

    return (
        <div className="relative h-full w-full">
            <Image
                src={hasError ? fallbackImage : src}
                alt={alt}
                fill
                sizes="48px"
                className="object-cover"
                onError={() => setHasError(true)}
            />
        </div>
    );
}

function getVisiblePages(currentPage: number, totalPages: number) {
    if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
    return Array.from({ length: 5 }, (_, index) => start + index);
}

export default function CustomProductsEditorModal({
    onClose,
    onUpdate,
    instanceId,
}: {
    onClose: () => void;
    onUpdate: () => void;
    instanceId?: string;
}) {
    const { t } = useTranslation();
    const { instances, updateInstance } = useCmsStore();
    const { categories, fetchPublicCategories } = useCategoryStore();

    const instance = instanceId ? instances.find((item) => item._id === instanceId) : null;
    const instanceData = instance?.data as CustomProductsData | undefined;
    const existingProductIdsKey = Array.isArray(instanceData?.productIds)
        ? [...instanceData.productIds].sort().join(',')
        : '';

    const [settings, setSettings] = useState({
        title: 'Featured Collection',
        subtitle: 'Selected pieces for your home',
        productIds: [] as string[],
        variant: 'grid' as 'grid' | 'slider' | 'focused',
    });
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [metadata, setMetadata] = useState<ProductMetadata>({
        total: 0,
        page: 1,
        pages: 1,
        limit: DEFAULT_PAGE_SIZE,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const requestIdRef = useRef(0);

    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedTag, setSelectedTag] = useState('all');
    const [sort, setSort] = useState('newest');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

    useEffect(() => {
        void fetchPublicCategories();
    }, [fetchPublicCategories]);

    useEffect(() => {
        if (!instanceId || !instanceData) return;

        setSettings((current) => ({
            ...current,
            ...instanceData,
            productIds: Array.isArray(instanceData.productIds) ? instanceData.productIds : [],
        }));
    }, [instanceId, instanceData]);

    useEffect(() => {
        const ids = existingProductIdsKey ? existingProductIdsKey.split(',') : [];
        if (ids.length === 0) {
            setSelectedProducts([]);
            return;
        }

        let cancelled = false;
        void productService.fetchProductsByIds(ids)
            .then((payload) => {
                if (!cancelled) setSelectedProducts(payload);
            })
            .catch(() => {
                if (!cancelled) setSelectedProducts([]);
            });

        return () => {
            cancelled = true;
        };
    }, [existingProductIdsKey]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            const normalizedSearch = searchInput.trim();
            setSearchTerm(normalizedSearch.length >= 2 ? normalizedSearch : '');
            setPage(1);
        }, 350);

        return () => window.clearTimeout(timer);
    }, [searchInput]);

    const loadProducts = useCallback(async () => {
        const requestId = ++requestIdRef.current;
        setIsLoading(true);
        setLoadError('');

        try {
            const parsedMinPrice = minPrice === '' ? undefined : Number(minPrice);
            const parsedMaxPrice = maxPrice === '' ? undefined : Number(maxPrice);
            const response = await productService.fetchPublicProducts({
                page,
                limit: pageSize,
                q: searchTerm || undefined,
                category: selectedCategory === 'all' ? undefined : selectedCategory,
                tag: selectedTag === 'all' ? undefined : selectedTag,
                sort,
                minPrice: Number.isFinite(parsedMinPrice) ? parsedMinPrice : undefined,
                maxPrice: Number.isFinite(parsedMaxPrice) ? parsedMaxPrice : undefined,
                minimal: true,
            });

            if (requestId === requestIdRef.current) {
                setProducts(response.data);
                setMetadata(response.metadata);
            }
        } catch {
            if (requestId === requestIdRef.current) {
                setProducts([]);
                setLoadError(t('admin.customProductsEditor.loadError'));
            }
        } finally {
            if (requestId === requestIdRef.current) {
                setIsLoading(false);
            }
        }
    }, [maxPrice, minPrice, page, pageSize, searchTerm, selectedCategory, selectedTag, sort, t]);

    useEffect(() => {
        void loadProducts();
    }, [loadProducts]);

    const resetFilters = () => {
        setSearchInput('');
        setSearchTerm('');
        setSelectedCategory('all');
        setSelectedTag('all');
        setSort('newest');
        setMinPrice('');
        setMaxPrice('');
        setPage(1);
        setPageSize(DEFAULT_PAGE_SIZE);
    };

    const addProduct = (product: Product) => {
        if (settings.productIds.includes(product._id)) return;

        setSettings((current) => ({
            ...current,
            productIds: [...current.productIds, product._id],
        }));
        setSelectedProducts((current) => [...current, product]);
    };

    const removeProduct = (id: string) => {
        setSettings((current) => ({
            ...current,
            productIds: current.productIds.filter((productId) => productId !== id),
        }));
        setSelectedProducts((current) => current.filter((product) => product._id !== id));
    };

    const handleSave = async () => {
        if (!instanceId) return;

        setIsSaving(true);
        try {
            await updateInstance(instanceId, settings);
            onUpdate();
            onClose();
        } catch {
            alert(t('admin.saveError'));
        } finally {
            setIsSaving(false);
        }
    };

    const visiblePages = useMemo(
        () => getVisiblePages(metadata.page, metadata.pages),
        [metadata.page, metadata.pages],
    );

    const resultStart = metadata.total === 0 ? 0 : (metadata.page - 1) * metadata.limit + 1;
    const resultEnd = Math.min(metadata.page * metadata.limit, metadata.total);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm">
            <div className="flex max-h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-3xl bg-background shadow-2xl">
                <div className="z-10 flex items-center justify-between border-b border-border bg-background p-6">
                    <div>
                        <h3 className="flex items-center gap-2 text-lg font-bold italic">
                            <FiGrid className="text-primary" />
                            {t('admin.customProductsEditor.title')}
                        </h3>
                        <p className="text-xs text-muted-foreground/80">
                            {t('admin.customProductsEditor.subtitle')}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
                        aria-label={t('common.close')}
                    >
                        <FiX size={20} />
                    </button>
                </div>

                <div className="flex flex-1 flex-col overflow-hidden bg-muted/30 lg:flex-row">
                    <div className="w-full space-y-8 overflow-y-auto border-r border-border bg-background p-6 lg:w-[62%] lg:p-8">
                        <section className="space-y-6">
                            <h4 className="border-b pb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                                {t('admin.customProductsEditor.layoutAndText')}
                            </h4>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <label>
                                    <span className="mb-1 block text-[10px] font-bold uppercase text-muted-foreground/80">
                                        {t('admin.customProductsEditor.collectionTitle')}
                                    </span>
                                    <input
                                        className="w-full rounded-xl border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                        value={settings.title}
                                        onChange={(event) => setSettings({ ...settings, title: event.target.value })}
                                    />
                                </label>
                                <label>
                                    <span className="mb-1 block text-[10px] font-bold uppercase text-muted-foreground/80">
                                        {t('admin.customProductsEditor.collectionSubtitle')}
                                    </span>
                                    <input
                                        className="w-full rounded-xl border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                        value={settings.subtitle}
                                        onChange={(event) => setSettings({ ...settings, subtitle: event.target.value })}
                                    />
                                </label>
                            </div>

                            <div>
                                <span className="mb-3 block text-[10px] font-bold uppercase text-muted-foreground/80">
                                    {t('admin.customProductsEditor.displayVariant')}
                                </span>
                                <div className="grid grid-cols-3 gap-3">
                                    {(['grid', 'slider', 'focused'] as const).map((variant) => (
                                        <button
                                            type="button"
                                            key={variant}
                                            onClick={() => setSettings({ ...settings, variant })}
                                            className={`flex flex-col items-center gap-2 rounded-xl border px-4 py-3 transition-all ${
                                                settings.variant === variant
                                                    ? 'border-primary bg-primary/5 text-primary shadow-sm'
                                                    : 'border-border bg-background text-muted-foreground hover:border-primary/20'
                                            }`}
                                        >
                                            {variant === 'grid' && <FiGrid size={18} />}
                                            {variant === 'slider' && <FiLayout size={18} />}
                                            {variant === 'focused' && <FiMaximize size={18} />}
                                            <span className="text-[9px] font-bold uppercase">
                                                {t(`admin.customProductsEditor.variants.${variant}`)}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <section className="space-y-5">
                            <div className="flex items-center justify-between border-b pb-2">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                                    {t('admin.customProductsEditor.productPicker')}
                                </h4>
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    <FiRefreshCw size={12} />
                                    {t('admin.customProductsEditor.resetFilters')}
                                </button>
                            </div>

                            <div className="relative">
                                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <input
                                    className="w-full rounded-2xl border bg-background py-4 pl-12 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20"
                                    placeholder={t('admin.customProductsEditor.searchPlaceholder')}
                                    value={searchInput}
                                    onChange={(event) => setSearchInput(event.target.value)}
                                />
                            </div>

                            <div className="rounded-2xl border border-border bg-muted/20 p-4">
                                <div className="mb-3 flex items-center gap-2">
                                    <FiFilter size={14} className="text-primary" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">
                                        {t('admin.customProductsEditor.advancedFilters')}
                                    </span>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                    <label>
                                        <span className="mb-1 block text-[9px] font-bold uppercase text-muted-foreground">
                                            {t('admin.customProductsEditor.category')}
                                        </span>
                                        <select
                                            className="h-11 w-full rounded-xl border bg-background px-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-primary/20"
                                            value={selectedCategory}
                                            onChange={(event) => {
                                                setSelectedCategory(event.target.value);
                                                setPage(1);
                                            }}
                                        >
                                            <option value="all">{t('admin.customProductsEditor.allCategories')}</option>
                                            {categories.map((category) => (
                                                <option key={category._id} value={category._id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label>
                                        <span className="mb-1 block text-[9px] font-bold uppercase text-muted-foreground">
                                            {t('admin.customProductsEditor.collectionType')}
                                        </span>
                                        <select
                                            className="h-11 w-full rounded-xl border bg-background px-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-primary/20"
                                            value={selectedTag}
                                            onChange={(event) => {
                                                setSelectedTag(event.target.value);
                                                setPage(1);
                                            }}
                                        >
                                            <option value="all">{t('admin.customProductsEditor.allProducts')}</option>
                                            <option value="new-arrival">{t('common.newArrivals')}</option>
                                            <option value="best-seller">{t('common.bestSellers')}</option>
                                        </select>
                                    </label>

                                    <label>
                                        <span className="mb-1 block text-[9px] font-bold uppercase text-muted-foreground">
                                            {t('admin.customProductsEditor.sort')}
                                        </span>
                                        <select
                                            className="h-11 w-full rounded-xl border bg-background px-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-primary/20"
                                            value={sort}
                                            onChange={(event) => {
                                                setSort(event.target.value);
                                                setPage(1);
                                            }}
                                        >
                                            <option value="newest">{t('admin.customProductsEditor.sortNewest')}</option>
                                            <option value="name">{t('admin.customProductsEditor.sortName')}</option>
                                            <option value="price-low">{t('admin.customProductsEditor.sortPriceLow')}</option>
                                            <option value="price-high">{t('admin.customProductsEditor.sortPriceHigh')}</option>
                                            <option value="best-selling">{t('admin.customProductsEditor.sortBestSelling')}</option>
                                        </select>
                                    </label>

                                    <label>
                                        <span className="mb-1 block text-[9px] font-bold uppercase text-muted-foreground">
                                            {t('admin.customProductsEditor.perPage')}
                                        </span>
                                        <select
                                            className="h-11 w-full rounded-xl border bg-background px-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-primary/20"
                                            value={pageSize}
                                            onChange={(event) => {
                                                setPageSize(Number(event.target.value));
                                                setPage(1);
                                            }}
                                        >
                                            {[8, 12, 24].map((size) => (
                                                <option key={size} value={size}>{size}</option>
                                            ))}
                                        </select>
                                    </label>
                                </div>

                                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                    <label>
                                        <span className="mb-1 block text-[9px] font-bold uppercase text-muted-foreground">
                                            {t('admin.customProductsEditor.minPrice')}
                                        </span>
                                        <input
                                            type="number"
                                            min="0"
                                            className="h-11 w-full rounded-xl border bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                                            value={minPrice}
                                            onChange={(event) => {
                                                setMinPrice(event.target.value);
                                                setPage(1);
                                            }}
                                            placeholder="0"
                                        />
                                    </label>
                                    <label>
                                        <span className="mb-1 block text-[9px] font-bold uppercase text-muted-foreground">
                                            {t('admin.customProductsEditor.maxPrice')}
                                        </span>
                                        <input
                                            type="number"
                                            min="0"
                                            className="h-11 w-full rounded-xl border bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                                            value={maxPrice}
                                            onChange={(event) => {
                                                setMaxPrice(event.target.value);
                                                setPage(1);
                                            }}
                                            placeholder={t('admin.customProductsEditor.noLimit')}
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground">
                                <span>
                                    {t('admin.customProductsEditor.resultRange', {
                                        start: resultStart,
                                        end: resultEnd,
                                        total: metadata.total,
                                    })}
                                </span>
                                {searchInput.trim().length === 1 && (
                                    <span>{t('admin.customProductsEditor.searchHint')}</span>
                                )}
                            </div>

                            <div className="min-h-[330px] space-y-3">
                                {isLoading ? (
                                    Array.from({ length: Math.min(pageSize, 6) }, (_, index) => (
                                        <div key={index} className="h-[70px] animate-pulse rounded-xl border border-border bg-muted/40" />
                                    ))
                                ) : loadError ? (
                                    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-red-500/30 text-center">
                                        <p className="text-xs text-red-500">{loadError}</p>
                                        <button
                                            type="button"
                                            onClick={() => void loadProducts()}
                                            className="mt-3 rounded-lg bg-foreground px-4 py-2 text-[10px] font-bold uppercase text-background"
                                        >
                                            {t('admin.customProductsEditor.tryAgain')}
                                        </button>
                                    </div>
                                ) : products.length === 0 ? (
                                    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border text-center">
                                        <FiSearch size={24} className="mb-3 text-muted-foreground/40" />
                                        <p className="text-xs font-bold">{t('admin.customProductsEditor.noResults')}</p>
                                        <p className="mt-1 text-[10px] text-muted-foreground">
                                            {t('admin.customProductsEditor.noResultsDesc')}
                                        </p>
                                    </div>
                                ) : (
                                    products.map((product) => {
                                        const isSelected = settings.productIds.includes(product._id);
                                        const categoryName = typeof product.category === 'object'
                                            ? product.category.name
                                            : categories.find((category) => category._id === product.category)?.name;

                                        return (
                                            <div
                                                key={product._id}
                                                className="group flex items-center justify-between rounded-xl border border-border/70 bg-background p-3 transition-all hover:border-primary/40 hover:shadow-sm"
                                            >
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                                                        <ProductImage
                                                            src={product.mainImage || product.image || product.images?.[0]}
                                                            alt={product.name}
                                                        />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-xs font-bold">{product.name}</p>
                                                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                                            {product.sku && (
                                                                <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] uppercase text-muted-foreground">
                                                                    {product.sku}
                                                                </span>
                                                            )}
                                                            {categoryName && (
                                                                <span className="max-w-28 truncate text-[9px] font-bold uppercase text-primary/70">
                                                                    {categoryName}
                                                                </span>
                                                            )}
                                                            <span className="text-[9px] font-bold">
                                                                {product.discountedPrice ?? product.price}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => addProduct(product)}
                                                    disabled={isSelected}
                                                    className="ml-3 flex shrink-0 items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-[10px] font-bold text-primary transition-all hover:bg-primary hover:text-background disabled:cursor-default disabled:opacity-40"
                                                >
                                                    <FiPlus />
                                                    {isSelected
                                                        ? t('admin.customProductsEditor.selected')
                                                        : t('admin.customProductsEditor.add')}
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {!isLoading && metadata.pages > 1 && (
                                <div className="flex flex-wrap items-center justify-center gap-1.5 border-t pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setPage((current) => Math.max(1, current - 1))}
                                        disabled={metadata.page <= 1}
                                        className="grid h-9 w-9 place-items-center rounded-lg border bg-background disabled:opacity-30"
                                        aria-label={t('admin.customProductsEditor.previousPage')}
                                    >
                                        <FiChevronLeft />
                                    </button>
                                    {visiblePages.map((pageNumber) => (
                                        <button
                                            type="button"
                                            key={pageNumber}
                                            onClick={() => setPage(pageNumber)}
                                            className={`h-9 min-w-9 rounded-lg border px-2 text-xs font-bold transition-colors ${
                                                metadata.page === pageNumber
                                                    ? 'border-foreground bg-foreground text-background'
                                                    : 'bg-background hover:border-foreground/40'
                                            }`}
                                        >
                                            {pageNumber}
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => setPage((current) => Math.min(metadata.pages, current + 1))}
                                        disabled={metadata.page >= metadata.pages}
                                        className="grid h-9 w-9 place-items-center rounded-lg border bg-background disabled:opacity-30"
                                        aria-label={t('admin.customProductsEditor.nextPage')}
                                    >
                                        <FiChevronRight />
                                    </button>
                                </div>
                            )}
                        </section>
                    </div>

                    <div className="flex w-full flex-col overflow-y-auto p-6 lg:w-[38%] lg:p-8">
                        <section className="flex-1 space-y-4">
                            <div className="mb-6 flex items-center justify-between gap-3">
                                <div>
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                                        {t('admin.customProductsEditor.selectedProducts')}
                                    </h4>
                                    <p className="mt-1 text-xs font-bold">
                                        {t('admin.customProductsEditor.selectedCount', {
                                            count: settings.productIds.length,
                                        })}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    disabled={isSaving}
                                    onClick={handleSave}
                                    className="flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-xs font-bold text-background transition-all hover:bg-foreground/80 disabled:opacity-50"
                                >
                                    <FiSave />
                                    {isSaving
                                        ? t('admin.customProductsEditor.saving')
                                        : t('admin.customProductsEditor.saveChanges')}
                                </button>
                            </div>

                            <div className="space-y-3">
                                {settings.productIds.length === 0 ? (
                                    <div className="rounded-3xl border-2 border-dashed border-muted-foreground/10 py-20 text-center">
                                        <p className="text-xs text-muted-foreground">
                                            {t('admin.customProductsEditor.noSelectedProducts')}
                                        </p>
                                    </div>
                                ) : (
                                    settings.productIds.map((id, index) => {
                                        const product = selectedProducts.find((item) => item._id === id)
                                            || products.find((item) => item._id === id);

                                        return (
                                            <div
                                                key={id}
                                                className="group flex items-center justify-between rounded-2xl border border-border bg-background p-4 shadow-sm transition-all"
                                            >
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <span className="text-xs font-mono text-muted-foreground/40">{index + 1}</span>
                                                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                                                        {product ? (
                                                            <ProductImage
                                                                src={product.mainImage || product.image || product.images?.[0]}
                                                                alt={product.name}
                                                            />
                                                        ) : (
                                                            <FiGrid className="m-3 text-muted-foreground/30" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-xs font-bold">
                                                            {product?.name || t('admin.customProductsEditor.selectedProduct')}
                                                        </p>
                                                        <p className="mt-1 text-[10px] uppercase text-muted-foreground">
                                                            {product?.sku || id.slice(-6)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeProduct(id)}
                                                    className="ml-2 shrink-0 rounded-lg p-2 text-red-500 opacity-60 transition-all hover:bg-red-50 hover:opacity-100"
                                                    aria-label={t('admin.customProductsEditor.remove')}
                                                >
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
