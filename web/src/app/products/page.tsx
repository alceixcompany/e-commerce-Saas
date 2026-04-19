import { Metadata } from 'next';
import { serverProductService } from '@/lib/server/services/productService';
import { serverCategoryService } from '@/lib/server/services/categoryService';
import ProductListingClient from './ProductListingClient';

export const metadata: Metadata = {
    title: 'Our Collection - Alceix Group',
    description: 'Browse our complete collection of exquisite jewelry.',
};

export default async function ProductsPage({
    searchParams
}: {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
    const resolvedSearchParams = searchParams ? await searchParams : {};
    const isPreview = resolvedSearchParams?.preview === 'true';
    // Server-side parallel fetch
    const [productsRes, categoriesRes] = await Promise.all([
        serverProductService.getPublicProducts({
            page: 1,
            limit: 12,
        }, isPreview),
        serverCategoryService.getPublicCategories(isPreview)
    ]);

    return (
        <ProductListingClient 
            initialProducts={productsRes.data}
            initialMetadata={productsRes.metadata}
            initialCategories={categoriesRes.data}
            initialCategoryMetadata={productsRes.categoryMetadata}
        />
    );
}
