'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiChevronLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useUserStore } from '@/lib/store/useUserStore';
import { useContentStore } from '@/lib/store/useContentStore';
import { useCmsStore } from '@/lib/store/useCmsStore';
import { useCart } from '@/contexts/CartContext';
import { useTranslation } from '@/hooks/useTranslation';

import SectionRenderer from '@/components/SectionRenderer';
import type { PageSection, CustomPage } from '@/types/page';
import type { Product } from '@/types/product';
import type { ProductSettings, GlobalSettings } from '@/types/content';
import * as Sections from '@/types/sections';

const PRODUCT_SETTINGS_PREVIEW_DRAFT_KEY = 'layout-editor-product-settings-draft';

export default function ProductDetailsClient({
    productId,
    initialProduct,
    initialRelatedProducts,
    initialPage,
    initialProductSettings
}: {
    productId: string;
    initialProduct: Product | null;
    initialRelatedProducts: Product[];
    initialPage: CustomPage | null;
    initialProductSettings: ProductSettings | null;
}) {
    const router = useRouter();
    const { globalSettings } = useContentStore();
    const { profile, addToWishlist, removeFromWishlist } = useUserStore();
    const { isAuthenticated } = useAuthStore();
    const { instances } = useCmsStore();

    const { addItem } = useCart();
    const { t } = useTranslation();

    const [isFavorite, setIsFavorite] = useState(false);
    const [previewProductSettings, setPreviewProductSettings] = useState<ProductSettings | null>(initialProductSettings);

    useEffect(() => {
        setPreviewProductSettings(initialProductSettings);
    }, [initialProductSettings]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (!window.location.search.includes('preview=true')) return;

        const applyDraftSettings = () => {
            const rawDraft = window.localStorage.getItem(PRODUCT_SETTINGS_PREVIEW_DRAFT_KEY);
            if (!rawDraft) {
                setPreviewProductSettings(initialProductSettings);
                return;
            }

            try {
                setPreviewProductSettings(JSON.parse(rawDraft) as ProductSettings);
            } catch (error) {
                console.error('Failed to parse product settings preview draft:', error);
                setPreviewProductSettings(initialProductSettings);
            }
        };

        applyDraftSettings();
        window.addEventListener('storage', applyDraftSettings);
        const intervalId = window.setInterval(applyDraftSettings, 250);

        return () => {
            window.removeEventListener('storage', applyDraftSettings);
            window.clearInterval(intervalId);
        };
    }, [initialProductSettings]);

    // Initial check for wishlist
    useEffect(() => {
        if (isAuthenticated && profile && profile.wishlist && productId) {
            const wishlist = (profile as unknown as { wishlist?: Array<string | { _id: string }> }).wishlist;
            const inWishlist = Boolean(
                wishlist?.some((item) => (typeof item === 'string' ? item === productId : item._id === productId))
            );
            const timer = setTimeout(() => setIsFavorite(inWishlist), 0);
            return () => clearTimeout(timer);
        }
    }, [profile, isAuthenticated, productId]);

    const product = initialProduct;
    const relatedProducts = initialRelatedProducts;
    const currentPage = initialPage;
    const productSettings = previewProductSettings;

    const theme = globalSettings?.theme || {} as NonNullable<GlobalSettings['theme']>;
    const layout = productSettings?.layout || {};

    if (!product) {
        return (
            <div className="min-h-screen pt-32 text-center bg-background">
                <div className="max-w-md mx-auto px-6">
                    <div className="w-24 h-24 mx-auto mb-8 bg-foreground/5 rounded-full flex items-center justify-center relative overflow-hidden">
                        <Image src="/image/alceix/defaults/necklace.png" fill className="object-contain opacity-20 grayscale" alt="Not Found" />
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
            } catch (_err) { }
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
            await removeFromWishlist(productId);
            setIsFavorite(false);
        } else {
            await addToWishlist(productId);
            setIsFavorite(true);
        }
    };

    type RenderableSection = string | (PageSection & { instanceData?: Sections.SectionData });
    const visibleSections: RenderableSection[] = (currentPage?.sections || ['product_details', 'related_products', 'advantages', 'journal', 'banner']) as RenderableSection[];

    type CartableProduct = Pick<Product, '_id' | 'name'> & Partial<Pick<Product, 'price' | 'discountedPrice' | 'mainImage' | 'image'>>;

    const extraData = {
        product, theme, layout, isFavorite,
        onToggleFavorite: handleToggleWishlist,
        onAddToCart: handleAddToCart,
        onShare: handleShare,
        relatedProducts,
        productSettings: productSettings || undefined,
        onAddToCartFromCard: (p: CartableProduct) => addItem({ id: p._id, name: p.name, price: p.discountedPrice ?? p.price ?? 0, image: p.mainImage || p.image || '' }, 1)
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

            {visibleSections.map((section) => (
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
