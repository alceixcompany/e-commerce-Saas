import { Metadata } from 'next';
import { serverProductService } from '@/lib/server/services/productService';
import { serverCategoryService } from '@/lib/server/services/categoryService';
import ProductListingClient from './ProductListingClient';

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string>> }): Promise<Metadata> {
    const params = await searchParams;
    const tag = params.tag;
    const categoryId = params.category;
    const query = params.q;

    let title = 'Our Collection - Alceix Group';
    let description = 'Browse our complete collection of exquisite jewelry.';

    if (query) {
        title = `Search results for "${query}" - Alceix Group`;
    } else if (tag === 'new-arrival') {
        title = 'New Arrivals - Alceix Group';
        description = 'Explore our latest treasures, fresh from the atelier.';
    } else if (tag === 'best-seller') {
        title = 'Best Sellers - Alceix Group';
        description = 'Discover our most coveted pieces, loved by collectors worldwide.';
    } else if (categoryId && categoryId !== 'all') {
        const catRes = await serverCategoryService.getPublicCategories();
        const cat = catRes.data.find(c => c._id === categoryId);
        if (cat) {
            title = `${cat.name} - Alceix Group`;
            description = `Shop our exclusive ${cat.name.toLowerCase()} collection.`;
        }
    }

    return { title, description };
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
    const params = await searchParams;
    
    // Server-side parallel fetch
    const [productsRes, categoriesRes] = await Promise.all([
        serverProductService.getPublicProducts({
            page: Number(params.page) || 1,
            limit: 12,
            category: params.category,
            sort: params.sort,
            tag: params.tag,
            q: params.q
        }),
        serverCategoryService.getPublicCategories()
    ]);

    return (
        <ProductListingClient 
            initialProducts={productsRes.data}
            initialMetadata={productsRes.metadata}
            initialCategories={categoriesRes.data}
            initialCategoryMetadata={productsRes.categoryMetadata}
            searchParams={params}
        />
    );
}
