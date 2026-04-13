'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiChevronLeft } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchPublicProducts, fetchProduct } from '@/lib/slices/productSlice';
import { fetchPageBySlug } from '@/lib/slices/pageSlice';
import { fetchComponentInstances } from '@/lib/slices/componentSlice';
import { fetchProductSettings, fetchHomeSettings, fetchGlobalSettings } from '@/lib/slices/contentSlice'; // added fetchHomeSettings for generic components if needed
import { useCart } from '@/contexts/CartContext';
import { useTranslation } from '@/hooks/useTranslation';

import SectionRenderer from '@/components/SectionRenderer';
import { addToWishlist, removeFromWishlist } from '@/lib/slices/profileSlice';

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { products, currentProduct, loading } = useAppSelector((state) => state.product);
    const isLoading = loading.fetchOne;
    const { productSettings, homeSettings, globalSettings } = useAppSelector((state) => state.content);
    const { profile } = useAppSelector((state) => state.profile);
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    const { addItem } = useCart();
    const { t } = useTranslation();

    const { currentPage, loading: pageLoading } = useAppSelector((state) => state.pages);
    const isPageLoading = pageLoading.fetchOne;
    const { instances } = useAppSelector((state) => state.component);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);

    const productId = typeof params.id === 'string' ? params.id : '';

    useEffect(() => {
        const initPage = async () => {
            if (!productId) return;

            const tasks: any[] = [
                dispatch(fetchPageBySlug('product-detail')),
                dispatch(fetchComponentInstances(undefined)),
                dispatch(fetchPublicProducts()),   // For related products/other sections
                dispatch(fetchProductSettings()),
                dispatch(fetchHomeSettings())
            ];

            if (productId !== 'demo') {
                tasks.push(dispatch(fetchProduct(productId)));
            }

            await Promise.all(tasks);
            setIsInitialized(true);
        };
        initPage();
    }, [dispatch, productId]);

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
    const realProduct = products && products.length > 0 ? products[0] : null;

    const product = isDemo ? (realProduct ? { ...realProduct, _id: 'demo' } : {
        _id: 'demo',
        name: 'The Alceix Group Necklace (Demo)',
        price: 1850,
        discountedPrice: 1450,
        shortDescription: 'A completely customizable view. Switch your background, text, layout style, and theme colors from the admin panel settings on the left.',
        mainImage: '/image/alceix/defaults/necklace.png',
        image: '/image/alceix/defaults/necklace.png',
        images: ['/image/alceix/defaults/necklace.png'],
        stock: 5,
        material: '18k Solid Gold',
        category: { name: 'Necklaces', _id: 'cat-demo' },
        sku: 'ALX-DEMO',
        isBestSeller: true,
        isNewArrival: true,
    }) : (currentProduct || products.find((p) => p._id === productId));

    const relatedProducts = isDemo ? (
        products.length > 1 ? products.slice(1, 5) : [
            { _id: 'demo-2', name: 'Demo Ring', price: 550, mainImage: '/image/alceix/hero.png' },
            { _id: 'demo-3', name: 'Demo Earrings', price: 890, mainImage: '/image/alceix/hero.png' }
        ] as any[]
    ) : products
        .filter((p) => {
            if (!product || p._id === productId) return false;
            const productCatId = typeof product.category === 'object' ? product.category?._id : product.category;
            const pCatId = typeof p.category === 'object' ? p.category?._id : p.category;
            return productCatId === pCatId;
        })
        .slice(0, 4);

    if (!isInitialized || isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-[10px] font-bold tracking-[0.4em] text-foreground/20 uppercase"
                >
                    {t('product.loading')}
                </motion.div>
            </div>
        );
    }

    const theme = globalSettings?.theme || {};
    const layout = productSettings?.layout || {};

    if (!product) {
        return (
            <div className="min-h-screen pt-32 text-center bg-background">
                <div className="max-w-md mx-auto px-6">
                    <div className="w-24 h-24 mx-auto mb-8 bg-foreground/5 rounded-full flex items-center justify-center">
                        <img src="/image/alceix/defaults/necklace.png" className="w-16 h-16 object-contain opacity-20 grayscale" alt="Not Found" />
                    </div>
                    <h1 className="text-3xl font-serif text-foreground mb-4 italic" style={{ fontFamily: theme.headingFont }}>{t('product.notFound.title')}</h1>
                    <p className="text-foreground/50 font-light mb-8">
                        {t('product.notFound.desc')}
                    </p>
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-background rounded-lg font-semibold text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                    >
                        <FiChevronLeft size={16} />
                        {t('product.notFound.btn')}
                    </Link>
                </div>
            </div>
        );
    }

    const displayImage = product.mainImage || product.image || '';
    const displayPrice = product.discountedPrice ?? product.price ?? 0;

    const handleAddToCart = (quantity: number) => {
        addItem({ id: product._id, name: product.name, price: displayPrice, image: displayImage }, quantity);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: product.name,
                    text: product.shortDescription || product.name,
                    url: window.location.href,
                });
            } catch (err) { }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert(t('product.info.shareSuccess'));
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

    const visibleSections = currentPage?.sections || ['product_details', 'related_products', 'advantages', 'journal', 'banner'];

    const extraData = {
        product, theme, layout, isFavorite,
        onToggleFavorite: handleToggleWishlist,
        onAddToCart: handleAddToCart,
        onShare: handleShare,
        relatedProducts,
        productSettings,
        onAddToCartFromCard: (p: any) => addItem({ id: p._id, name: p.name, price: p.discountedPrice ?? p.price, image: p.mainImage || p.image || '' }, 1)
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
                            {t('product.breadcrumb.home')}
                        </Link>
                        <span className="text-foreground/20">/</span>
                        <Link href="/products" className="hover:text-primary transition-colors">
                            {t('product.breadcrumb.products')}
                        </Link>
                        <span className="text-foreground/20">/</span>
                        <span className="opacity-80">{product.name}</span>
                    </motion.div>
                </div>
            )}

            {visibleSections.map((section: any) => (
                <SectionRenderer
                    key={typeof section === 'string' ? section : section.id}
                    section={section}
                    instances={instances}
                    currentPage={currentPage}
                    extraData={extraData}
                />
            ))}


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
