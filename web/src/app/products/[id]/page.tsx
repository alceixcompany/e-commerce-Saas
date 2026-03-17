'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiChevronLeft, FiShoppingCart, FiHeart, FiShare2, FiCheck, FiMinus, FiPlus } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchPublicProducts } from '@/lib/slices/productSlice';
import { fetchProductSettings, fetchHomeSettings } from '@/lib/slices/contentSlice'; // added fetchHomeSettings for generic components if needed
import { useCart } from '@/contexts/CartContext';
import ProductCard from '@/components/ProductCard';
import { addToWishlist, removeFromWishlist } from '@/lib/slices/profileSlice';

import AdvantageSection from '@/components/home/AdvantageSection';
import HomeJournal from '@/components/home/HomeJournal';
import HomeBanner from '@/components/home/HomeBanner';
import HeroSection from '@/components/home/HeroSection';
import FeaturedCollection from '@/components/home/FeaturedCollection';
import CollectionsSection from '@/components/home/CollectionsSection';
import PopularCollections from '@/components/home/PopularCollections';
import CampaignSection from '@/components/home/CampaignSection';
import ProductBaseInfo from '@/components/product/ProductBaseInfo';

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { products, isLoading } = useAppSelector((state) => state.product);
    const { productSettings, homeSettings, globalSettings } = useAppSelector((state) => state.content);
    const { profile } = useAppSelector((state) => state.profile);
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    const { addItem } = useCart();

    const [isFavorite, setIsFavorite] = useState(false);

    const productId = typeof params.id === 'string' ? params.id : '';

    useEffect(() => {
        dispatch(fetchPublicProducts());
        dispatch(fetchProductSettings());
        dispatch(fetchHomeSettings());
    }, [dispatch]);

    // Check if product is in wishlist
    useEffect(() => {
        if (isAuthenticated && profile && profile.wishlist && productId) {
            const inWishlist = profile.wishlist.some((item: any) =>
                (typeof item === 'string' ? item === productId : item._id === productId)
            );
            setIsFavorite(inWishlist);
        }
    }, [profile, isAuthenticated, productId]);

    const isDemo = productId === 'demo';

    // Try to use a real product for the demo to show normal images
    const realProduct = products && products.length > 0 ? products[0] : null;

    // Provide a rich fallback object for layout-settings demo mode
    const product = isDemo ? (realProduct ? { ...realProduct, _id: 'demo' } : {
        _id: 'demo',
        name: 'The Ocean Gem Necklace (Demo)',
        price: 1850,
        discountedPrice: 1450,
        shortDescription: 'A completely customizable view. Switch your background, text, layout style, and theme colors from the admin panel settings on the left.',
        mainImage: '/image/alceix/hero.png', // safe internal fallback
        image: '/image/alceix/hero.png',     // safe internal fallback
        images: [
            '/image/alceix/hero.png'
        ],
        stock: 5,
        material: '18k Solid Gold',
        category: { name: 'Necklaces', _id: 'cat-demo' },
        sku: 'OG-DEMO',
        isBestSeller: true,
        isNewArrival: true,
    }) : products.find((p) => p._id === productId);

    const relatedProducts = isDemo ? (
        products.length > 1 ? products.slice(1, 5) : [
            {
                _id: 'demo-2',
                name: 'Demo Ring',
                price: 550,
                mainImage: '/image/alceix/hero.png'
            },
            {
                _id: 'demo-3',
                name: 'Demo Earrings',
                price: 890,
                mainImage: '/image/alceix/hero.png'
            }
        ] as any[]
    ) : products
        .filter((p) => {
            if (!product || p._id === productId) return false;
            const productCatId = typeof product.category === 'object' ? product.category?._id : product.category;
            const pCatId = typeof p.category === 'object' ? p.category?._id : p.category;
            return productCatId === pCatId;
        })
        .slice(0, 4);

    if (isLoading && !isDemo) {
        return (
            <div className="min-h-screen pt-32 flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-foreground/20 border-t-primary rounded-full animate-spin"></div>
                    <span className="text-xs uppercase tracking-widest text-foreground/40">Loading Product...</span>
                </div>
            </div>
        );
    }

    const theme = globalSettings?.theme || {};
    const layout = productSettings?.layout || {};

    if (!product) {
        return (
            <div className="min-h-screen pt-32 text-center bg-background">
                <div className="max-w-md mx-auto px-6">
                    <div className="text-6xl mb-6">💎</div>
                    <h1 className="text-3xl font-serif text-foreground mb-4" style={{ fontFamily: theme.headingFont }}>Product Not Found</h1>
                    <p className="text-foreground/50 font-light mb-8">
                        The product you're looking for doesn't exist or has been removed.
                    </p>
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-background rounded-lg font-semibold text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                    >
                        <FiChevronLeft size={16} />
                        Browse All Products
                    </Link>
                </div>
            </div>
        );
    }

    const displayImage = product.mainImage || product.image || '';
    const displayPrice = product.discountedPrice ?? product.price ?? 0;

    const handleAddToCart = (quantity: number) => {
        addItem(
            {
                id: product._id,
                name: product.name,
                price: displayPrice,
                image: displayImage,
            },
            quantity
        );
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: product.name,
                    text: product.shortDescription || product.name,
                    url: window.location.href,
                });
            } catch (err) {
                // Share cancelled or failed silently
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    const handleToggleWishlist = async () => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        if (isFavorite) {
            await dispatch(removeFromWishlist(productId));
            setIsFavorite(false);
        } else {
            await dispatch(addToWishlist(productId));
            setIsFavorite(true);
        }
    };

    const sectionOrder = (productSettings?.sectionOrder && productSettings.sectionOrder.length > 0)
        ? productSettings.sectionOrder
        : ['product_details', 'related_products', 'advantages', 'journal', 'banner'];

    const hiddenSections = productSettings?.hiddenSections || [];

    const finalSections = sectionOrder.filter(id => !hiddenSections.includes(id));

    const renderProductDetails = () => (
        <ProductBaseInfo
            key="product_details"
            product={product}
            theme={theme}
            layout={layout}
            isFavorite={isFavorite}
            onToggleFavorite={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onShare={handleShare}
        />
    );

    const renderRelatedProducts = () => {
        if (relatedProducts.length === 0) return null;

        const relSettings = productSettings?.relatedProductsLayout || {
            title: 'You May Also Like',
            displayType: 'grid',
            itemsCount: 4
        };

        const displayItems = relatedProducts.slice(0, relSettings.itemsCount || 4);

        const renderItems = () => {
            if (relSettings.displayType === 'slider') {
                return (
                    <div className="flex gap-8 overflow-x-auto pb-8 snap-x custom-scrollbar -mx-4 px-4 md:-mx-0 md:px-0">
                        {displayItems.map((relatedProduct) => (
                            <div key={relatedProduct._id} className="w-72 shrink-0 snap-start">
                                <ProductCard
                                    product={relatedProduct}
                                    onAddToCart={(p) => addItem({ id: p._id, name: p.name, price: p.discountedPrice ?? p.price, image: p.mainImage || p.image || '' }, 1)}
                                />
                            </div>
                        ))}
                    </div>
                );
            }

            if (relSettings.displayType === 'minimal') {
                return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {displayItems.map((relatedProduct) => (
                            <Link href={`/products/${relatedProduct._id}`} key={relatedProduct._id} className="flex gap-4 p-4 border border-foreground/10 rounded-xl hover:shadow-md transition-shadow bg-background">
                                <div className="w-24 h-24 shrink-0 bg-foreground/5 rounded-lg overflow-hidden">
                                    <img src={relatedProduct.mainImage || relatedProduct.image} alt={relatedProduct.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex flex-col justify-center">
                                    <h4 className="font-bold text-sm text-foreground mb-1">{relatedProduct.name}</h4>
                                    <p className="text-xs text-primary font-medium">$ {(relatedProduct.discountedPrice ?? relatedProduct.price).toLocaleString()}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                );
            }

            // Default: Grid
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                    {displayItems.map((relatedProduct, index) => (
                        <div
                            key={relatedProduct._id}
                            className="animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out"
                            style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}
                        >
                            <ProductCard
                                product={relatedProduct}
                                onAddToCart={(p) => addItem({ id: p._id, name: p.name, price: p.discountedPrice ?? p.price, image: p.mainImage || p.image || '' }, 1)}
                            />
                        </div>
                    ))}
                </div>
            );
        };

        return (
            <div key="related_products" className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-12 mb-32">
                <div className="mt-16 pt-16 lg:mt-32 lg:pt-32 border-t border-foreground/10">
                    <div className="flex flex-col items-center text-center mb-16">
                        <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-foreground/40 block mb-4">Recommendations</span>
                        <h2 className="text-3xl md:text-5xl font-serif text-foreground" style={{ fontFamily: theme.headingFont }}>{relSettings.title}</h2>
                    </div>
                    {renderItems()}
                </div>
            </div>
        );
    };

    const renderSection = (id: string) => {
        switch (id) {
            case 'product_details': return renderProductDetails();
            case 'related_products': return renderRelatedProducts();
            case 'advantages': return <div key="advantages" className="mb-32"><AdvantageSection data={homeSettings?.advantageSection} /></div>;
            case 'journal': return <div key="journal" className="mb-32"><HomeJournal /></div>;
            case 'banner': return <div key="banner" className="mb-32"><HomeBanner /></div>;
            case 'hero': return <HeroSection key={id} />;
            case 'featured': return <FeaturedCollection key={id} />;
            case 'collections': return <CollectionsSection key={id} />;
            case 'popular': return <PopularCollections key={id} />;
            case 'campaigns': return <CampaignSection key={id} data={homeSettings?.campaignSection} />;
            default: return null;
        }
    };

    return (
        <div className="pt-24 pb-24 min-h-screen bg-background text-foreground" style={{ fontFamily: theme.bodyFont }}>
            {/* Breadcrumb */}
            {layout.showBreadcrumbs !== false && (
                <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-12 py-8">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40"
                    >
                        <Link href="/" className="hover:text-primary transition-colors">
                            Home
                        </Link>
                        <span className="text-foreground/20">/</span>
                        <Link href="/products" className="hover:text-primary transition-colors">
                            Products
                        </Link>
                        <span className="text-foreground/20">/</span>
                        <span className="opacity-80">{product.name}</span>
                    </motion.div>
                </div>
            )}

            {finalSections.map(renderSection)}


            <style jsx>{`
                /* Custom Scrollbar Styling */
                .custom-scrollbar::-webkit-scrollbar {
                    height: 3px;
                    width: 3px;
                    background-color: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background-color: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: var(--foreground-opacity-10, #e5e7eb);
                    border-radius: 9999px;
                    transition: background-color 0.3s ease;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: var(--foreground-opacity-20, #d1d5db);
                }
                
                /* Hide on mobile/tablet if preferred, but user asked for "like previous" which was hidden on mobile but here vertical scroll happens on large screens */
                /* For consistent experience, we keep it visible but subtle on all sizes as requested "like previous one" */
                 @media (max-width: 1024px) {
                  .custom-scrollbar::-webkit-scrollbar {
                    display: none;
                    width: 0px;
                    background: transparent;
                  }
                }
            `}</style>
        </div>
    );
}
