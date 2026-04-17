import { Metadata } from 'next';
import ProductDetailsClient from './ProductDetailsClient';
import { Product } from '@/types/product';
import { CustomPage } from '@/types/page';
import { serverProductService } from '@/lib/server/services/productService';
import { serverContentService } from '@/lib/server/services/contentService';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    const isDemo = resolvedParams.id === 'demo';

    if (isDemo) {
        return {
            title: "The Alceix Group Necklace - Demo",
            description: "A completely customizable view. Switch your background, text, layout style, and theme colors from the admin panel settings on the left."
        };
    }

    try {
        const product = await serverProductService.getProductById(resolvedParams.id);
        
        if (!product) return { title: 'Product Not Found' };

        return {
            title: product.name,
            description: product.shortDescription || product.name,
            openGraph: {
                title: product.name,
                description: product.shortDescription || product.name,
                images: (product.mainImage || product.image) ? [{ url: product.mainImage || product.image }] : [],
            }
        };
    } catch {
        return { title: 'Product' };
    }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const productId = resolvedParams.id;
    const isDemo = productId === 'demo';

    let product = null;
    let relatedProducts: Product[] = [];
    let pageData: CustomPage | null = null;
    let productSettings = null;

    try {
        // Parallel data loading for speed 
        const [fetchedPageData, fetchedProductSettings] = await Promise.all([
            serverContentService.getPageBySlug('product-detail'),
            serverContentService.getProductSettings()
        ]);
        
        pageData = fetchedPageData;
        productSettings = fetchedProductSettings;

        if (!isDemo) {
            product = await serverProductService.getProductById(productId);
        } else {
            product = {
                _id: 'demo', id: 'demo', name: 'The Alceix Group Necklace (Demo)', 
                price: 1850, discountedPrice: 1450, 
                shortDescription: 'A completely customizable view. Switch your background, text, layout style, and theme colors from the admin panel settings on the left.', 
                mainImage: '/image/alceix/defaults/necklace.png', image: '/image/alceix/defaults/necklace.png', images: ['/image/alceix/defaults/necklace.png'], 
                stock: 5, material: '18k Solid Gold', 
                category: { _id: 'cat-demo', id: 'cat-demo', name: 'Necklaces', slug: 'necklaces', status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, 
                sku: 'ALX-DEMO', shippingWeight: 0.1, status: 'active', isBestSeller: true, isNewArrival: true,
                createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
            } as Product;
        }

        // Fetch related products sequentially if needed based on the product category
        const categoryId = typeof product?.category === 'object' ? product?.category?._id : product?.category;
        if (categoryId) {
            relatedProducts = await serverProductService.getRelatedProducts(categoryId as string, productId, 4);
        }

    } catch (error) {
        console.error("[ProductDetailPage] Error fetching product data:", error);
    }

    // Default fallback page sections if absent from CMS
    if (!pageData) {
        pageData = {
            slug: 'product-detail',
            sections: ['product_details', 'related_products', 'advantages', 'journal', 'banner']
        } as CustomPage;
    }

    return (
        <ProductDetailsClient 
            productId={productId}
            initialProduct={product}
            initialRelatedProducts={relatedProducts}
            initialPage={pageData}
            initialProductSettings={productSettings}
        />
    );
}
