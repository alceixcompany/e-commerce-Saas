'use client';

import { Suspense } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useProductListing } from './_hooks/useProductListing';
import ProductHero from './_components/ProductHero';
import ProductFilters from './_components/ProductFilters';
import ProductGrid from './_components/ProductGrid';

function ProductsContent() {
    const {
        products,
        categories,
        productMetadata,
        categoryMetadata,
        isLoading,
        page,
        sortBy,
        selectedCategory,
        showSortDropdown,
        setShowSortDropdown,
        showCategoryDropdown,
        setShowCategoryDropdown,
        pageTitle,
        pageDescription,
        hasActiveFilters,
        updateFilters,
        handleAddToCart,
        router
    } = useProductListing();

    return (
        <div className="pt-20 pb-20 bg-background min-h-screen">
            <ProductHero 
                title={pageTitle}
                description={pageDescription}
                totalProducts={productMetadata.total}
                totalCategories={categories.length}
            />

            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12">
                <ProductFilters 
                    hasActiveFilters={hasActiveFilters}
                    selectedCategory={selectedCategory}
                    categories={categories}
                    sortBy={sortBy}
                    showCategoryDropdown={showCategoryDropdown}
                    setShowCategoryDropdown={setShowCategoryDropdown}
                    showSortDropdown={showSortDropdown}
                    setShowSortDropdown={setShowSortDropdown}
                    updateFilters={updateFilters}
                    totalProductsInCategories={categoryMetadata.totalProducts}
                />

                <ProductGrid 
                    products={products}
                    isLoading={isLoading}
                    page={page}
                    totalPages={productMetadata.pages}
                    onAddToCart={handleAddToCart}
                    onClearFilters={() => router.push('/products')}
                />
            </div>
        </div>
    );
}

export default function ProductsPage() {
    const { t } = useTranslation();
    return (
        <Suspense fallback={
            <div className="pt-32 pb-20 bg-background min-h-screen flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4"></div>
                    <p className="text-xs text-foreground/40 uppercase tracking-widest">{t('product.archive.loading')}</p>
                </div>
            </div>
        }>
            <ProductsContent />
        </Suspense>
    );
}
