'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiChevronLeft, FiHeart, FiShare2, FiCheck, FiMinus, FiPlus } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '@/lib/hooks';
import { useTranslation } from '@/hooks/useTranslation';
import { getCurrencySymbol } from '@/utils/currency';

import { Product } from '@/types/product';
import { GlobalSettings, ProductSettings } from '@/types/content';

interface ProductBaseInfoProps {
    product: Product;
    theme: NonNullable<GlobalSettings['theme']>;
    layout: NonNullable<ProductSettings['layout']>;
    isFavorite: boolean;
    onToggleFavorite: () => void;
    onAddToCart: (quantity: number) => void;
    onShare: () => void;
}

export default function ProductBaseInfo({
    product,
    theme,
    layout,
    isFavorite,
    onToggleFavorite,
    onAddToCart,
    onShare
}: ProductBaseInfoProps) {
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const { t, locale } = useTranslation();

    const { globalSettings } = useAppSelector((state) => state.content);
    const currencySymbol = getCurrencySymbol(globalSettings?.currency);

    const productImages = Array.from(new Set([
        product?.mainImage,
        product?.image,
        ...(product?.images || [])
    ])).filter(Boolean) as string[];

    const displayImage = product?.mainImage || product?.image || '';
    const activeImage = productImages[selectedImage] || displayImage;

    const displayPrice = product?.discountedPrice ?? product?.price ?? 0;
    const hasDiscount = product?.discountedPrice !== undefined && product?.discountedPrice < product?.price;
    const discountPercentage = hasDiscount && product?.discountedPrice !== undefined
        ? Math.round(((product?.price - product?.discountedPrice) / product?.price) * 100)
        : 0;

    const renderGallery = () => {
        const style = layout?.imageGallery || 'thumbnails-left';

        if (style === 'grid') {
            return (
                <div className="grid grid-cols-2 gap-4 h-fit">
                    {productImages.map((img, idx) => (
                        <div key={idx} className={`${idx === 0 ? 'col-span-2' : 'col-span-1'} relative aspect-[4/5] bg-foreground/5 overflow-hidden rounded-lg border border-foreground/10 group`}>
                            <Image src={img} alt={product?.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                            {idx === 0 && (
                                <>
                                    {renderBadgesOverlay()}
                                    {renderActionsOverlay()}
                                </>
                            )}
                        </div>
                    ))}
                    {productImages.length === 0 && (
                        <div className="col-span-2 aspect-video bg-foreground/5 flex items-center justify-center text-foreground/30 italic">{t('product.gallery.noImage')}</div>
                    )}
                </div>
            );
        }

        if (style === 'carousel') {
            return (
                <div className="relative aspect-[3/4] md:aspect-[4/5] bg-foreground/5 overflow-hidden rounded-lg border border-foreground/10 group w-full">
                    <AnimatePresence mode="wait">
                        <motion.div key={activeImage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
                            {activeImage ? (
                                <Image src={activeImage} alt={product?.name} fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-foreground/30 italic">{t('product.gallery.noImage')}</div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                    {renderBadgesOverlay()}
                    {renderActionsOverlay()}

                    {productImages.length > 1 && (
                        <div className="absolute bottom-6 left-0 w-full flex justify-center gap-2 px-4 z-20">
                            {productImages.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`w-2 h-2 rounded-full transition-all ${selectedImage === idx ? 'bg-foreground w-6' : 'bg-foreground/20'}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        if (style === 'thumbnails-bottom') {
            return (
                <div className="flex flex-col gap-4 w-full">
                    <div className="relative aspect-[4/5] bg-foreground/5 overflow-hidden rounded-xl border border-foreground/10 group">
                        <AnimatePresence mode="wait">
                            <motion.div key={activeImage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full relative">
                                <Image src={activeImage} alt={product?.name} fill className="object-cover" />
                            </motion.div>
                        </AnimatePresence>
                        {renderBadgesOverlay()}
                        {renderActionsOverlay()}
                    </div>
                    {productImages.length > 1 && (
                        <div className="grid grid-cols-5 gap-3">
                            {productImages.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`aspect-square rounded-lg border-2 transition-all overflow-hidden relative ${selectedImage === idx ? 'opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                    style={selectedImage === idx ? { borderColor: theme.primaryColor || '#C5A059' } : {}}
                                >
                                    <Image src={img} alt="" fill className="object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div className="flex flex-col-reverse lg:flex-row gap-6 h-fit lg:sticky lg:top-24 w-full">
                {productImages.length > 1 && (
                    <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-y-auto lg:max-h-[70vh] custom-scrollbar lg:w-20 xl:w-24 shrink-0 pb-2 lg:pb-0 snap-x">
                        {productImages.map((img, idx) => (
                            <motion.button
                                key={idx}
                                onClick={() => setSelectedImage(idx)}
                                style={selectedImage === idx ? { borderColor: theme.primaryColor || '#C5A059', boxShadow: `0 0 0 1px ${theme.primaryColor || '#C5A059'}` } : {}}
                                className={`relative w-20 h-24 lg:w-full lg:aspect-[4/5] shrink-0 border transition-all duration-300 snap-start overflow-hidden rounded-lg ${selectedImage === idx
                                    ? 'shadow-md opacity-100'
                                    : 'border-transparent opacity-60 hover:opacity-100 hover:border-foreground/20'
                                    }`}
                            >
                                <Image src={img} alt="" fill className="object-cover" />
                            </motion.button>
                        ))}
                    </div>
                )}
                <div className="flex-1 relative group w-full">
                    <div className="relative aspect-[3/4] md:aspect-[4/5] bg-foreground/5 w-full overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-foreground/10 rounded-xl">
                        <AnimatePresence mode="wait">
                            <motion.div key={activeImage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
                                {activeImage ? (
                                    <motion.div className="w-full h-full relative" whileHover={{ scale: 1.05 }} transition={{ duration: 0.7 }}>
                                        <Image src={activeImage} alt={product?.name} fill className="object-cover" />
                                    </motion.div>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-foreground/30 italic">{t('product.gallery.noImage')}</div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                        {renderBadgesOverlay()}
                        {renderActionsOverlay()}
                    </div>
                </div>
            </div>
        );
    };

    // --- VARIANT 1: DETAILED (CURRENT ORIGINAL) ---
    const renderDetailed = () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 mb-32">
            {/* Gallery Section */}
            {renderGallery()}

            {/* Info Box */}
            <div className="flex flex-col p-8 bg-foreground/5 border border-foreground/10 rounded-2xl shadow-sm">
                {renderCategoryBlock()}
                {renderTitleAndPrice()}
                {renderDescription()}

                {/* Order Options */}
                <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-background border border-foreground/10 rounded-sm">
                            <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-foreground/40 mb-2">{t('product.status.availability')}</h4>
                            <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${product.stock && product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                                    {product?.stock && product.stock > 0 ? t('product.status.unitsLeft', { count: product.stock }) : t('product.status.waitlist')}
                                </span>
                            </div>
                        </div>
                        {product?.material && (
                            <div className="p-4 bg-background border border-foreground/10 rounded-sm">
                                <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-foreground/40 mb-2">{t('product.info.craftsmanship')}</h4>
                                <span className="text-xs font-semibold text-foreground uppercase tracking-wider">{product.material}</span>
                            </div>
                        )}
                    </div>
                    {renderQuantityAndAdd()}
                </div>
                {layout.showBadges !== false && renderTrustBadges()}
            </div>
        </div>
    );

    // --- VARIANT 2: MINIMAL (SPLIT SCREEN) ---
    const renderMinimal = () => (
        <div className="flex flex-col lg:flex-row min-h-[80vh] -mx-4 md:-mx-6 lg:-mx-12 -mt-24 mb-24 overflow-hidden">
            {/* Huge Image Side */}
            <div className="w-full lg:w-1/2 relative bg-foreground/5 h-[60vh] lg:h-auto group">
                <AnimatePresence mode="wait">
                    <motion.div key={activeImage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full relative">
                        {activeImage ? (
                            <Image src={activeImage} alt={product?.name} fill className="object-cover" />
                        ) : null}
                    </motion.div>
                </AnimatePresence>
                {productImages.length > 1 && (
                    <div className="absolute bottom-10 left-0 w-full flex justify-center gap-3 px-4 z-20">
                        {productImages.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedImage(idx)}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${selectedImage === idx ? 'bg-background scale-150' : 'bg-background/40'}`}
                            />
                        ))}
                    </div>
                )}
                {renderBadgesOverlay()}
                {renderActionsOverlay()}
            </div>

            {/* Content Side */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-background">
                <div className="max-w-md w-full">
                    <div className="mb-12">
                        {renderCategoryBlock()}
                        <h1 className="text-4xl md:text-6xl font-serif leading-tight mb-8" style={{ fontFamily: theme.headingFont }}>{product?.name}</h1>
                        <div className="text-3xl font-light tracking-tight mb-8">{currencySymbol} {displayPrice.toLocaleString(locale)}</div>
                        {renderDescription()}
                    </div>

                    <div className="space-y-8">
                        {renderQuantityAndAdd()}
                        {layout.showBadges !== false && (
                            <div className="flex gap-8 pt-8 border-t border-foreground/10 italic opacity-60">
                                <div className="text-[10px] uppercase tracking-widest text-foreground/40">{t('product.guarantees.handcrafted')}</div>
                                <div className="text-[10px] uppercase tracking-widest text-foreground/40">{t('product.guarantees.ethicalGold')}</div>
                                <div className="text-[10px] uppercase tracking-widest text-foreground/40">{t('product.guarantees.warranty')}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    // --- VARIANT 3: CLASSIC (REVERSED) ---
    const renderClassic = () => (
        <div className="flex flex-col lg:flex-row-reverse gap-16 lg:gap-24 mb-32 items-center">
            {/* Gallery Section */}
            <div className="w-full lg:w-1/2">
                {renderGallery()}
            </div>

            {/* Content on Left */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center py-12">
                <div className="border-b border-foreground/10 pb-12 mb-12">
                    {renderCategoryBlock()}
                    <h1 className="text-4xl font-serif text-foreground mb-6" style={{ fontFamily: theme.headingFont }}>{product?.name}</h1>
                    <div className="flex items-center gap-6">
                        <span className="text-3xl font-medium">{currencySymbol} {displayPrice.toLocaleString(locale)}</span>
                        {hasDiscount && <span className="text-xl text-foreground/30 line-through">{currencySymbol} {product?.price.toLocaleString(locale)}</span>}
                    </div>
                </div>

                <div className="mb-12">
                    {renderDescription()}
                </div>

                <div className="max-w-sm">
                    {renderQuantityAndAdd()}
                </div>

                <div className="mt-12 space-y-4 pt-12 border-t border-foreground/10">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground/40">{t('product.status.availability')}</span>
                        <span className={(product?.stock || 0) > 0 ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>{(product?.stock || 0) > 0 ? t('product.status.inStock') : t('product.status.outOfStock')}</span>
                    </div>
                    {product?.sku && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-foreground/40">{t('product.status.ref')}</span>
                            <span className="font-medium">{product.sku}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    // --- SHARED RENDER HELPERS ---
    function renderBadgesOverlay() {
        return (
            <div className="absolute top-0 left-0 p-6 z-10 flex flex-col gap-2">
                {product.isBestSeller && (
                    <span className="text-[9px] font-extrabold tracking-[0.25em] uppercase text-background bg-foreground/90 backdrop-blur-md px-4 py-2 shadow-sm border border-foreground/10">
                        {t('product.badges.bestSeller')}
                    </span>
                )}
                {product.isNewArrival && (
                    <span style={{ backgroundColor: theme.primaryColor || '#C5A059' }} className="text-[9px] font-extrabold tracking-[0.25em] uppercase text-background backdrop-blur-md px-4 py-2 opacity-90 shadow-sm border border-white/10">
                        {t('product.badges.newArrival')}
                    </span>
                )}
                {hasDiscount && (
                    <span className="text-[9px] font-extrabold tracking-[0.25em] uppercase text-background bg-red-600/90 backdrop-blur-md px-4 py-2 shadow-sm border border-white/10">
                        -{discountPercentage}%
                    </span>
                )}
            </div>
        );
    }

    function renderActionsOverlay() {
        return (
            <div className="absolute top-6 right-6 flex flex-col gap-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex">
                <button
                    onClick={onToggleFavorite}
                    className={`w-10 h-10 rounded-full backdrop-blur-md shadow-lg flex items-center justify-center transition-colors duration-300 border border-foreground/10 ${isFavorite ? 'bg-red-500 text-background border-transparent' : 'bg-background/90 text-foreground hover:bg-foreground hover:text-background'}`}
                >
                    <FiHeart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
                <button
                    onClick={onShare}
                    className="w-10 h-10 bg-background/90 backdrop-blur-md rounded-full shadow-lg border border-foreground/10 flex items-center justify-center text-foreground hover:bg-foreground hover:text-background transition-colors duration-300"
                >
                    <FiShare2 size={16} />
                </button>
            </div>
        );
    }

    function renderCategoryBlock() {
        if (layout.showMaterialCategory === false) return null;
        return (
            <div className="mb-4">
                <div className="flex items-center gap-3 mb-1">
                    <span className="text-[10px] font-extrabold tracking-[0.3em] uppercase text-primary">
                        {product.material || (typeof product.category === 'object' ? product.category?.name : t('product.info.exclusivePiece'))}
                    </span>
                    {product.sku && (
                        <>
                            <span className="w-1 h-1 rounded-full bg-foreground/20"></span>
                            <span className="text-[9px] text-foreground/40 uppercase tracking-[0.2em] font-medium">{t('product.status.ref')}: {product.sku}</span>
                        </>
                    )}
                </div>
            </div>
        );
    }

    function renderTitleAndPrice() {
        return (
            <>
                <h1 className="text-2xl md:text-5xl font-serif leading-tight mb-6" style={{ fontFamily: theme.headingFont }}>{product.name}</h1>
                <div className="flex items-baseline gap-4 mb-10">
                    <span className="text-2xl md:text-4xl font-light tracking-tight text-foreground">
                        {currencySymbol} {displayPrice.toLocaleString(locale)}
                    </span>
                    {hasDiscount && (
                        <span className="text-xl text-foreground/30 line-through decoration-foreground/20">
                            {currencySymbol} {product.price.toLocaleString(locale)}
                        </span>
                    )}
                </div>
            </>
        );
    }

    function renderDescription() {
        if (!product?.shortDescription) return null;
        return (
            <div className="mb-10 pb-10 border-b border-foreground/10">
                <p className="text-foreground/50 leading-relaxed text-base font-light antialiased">{product.shortDescription}</p>
            </div>
        );
    }

    function renderQuantityAndAdd() {
        return (
            <div className="space-y-5">
                <div className="flex flex-col gap-3">
                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-foreground/40">{t('product.info.selectQuantity')}</label>
                    <div className="flex items-center w-fit bg-background border border-foreground/10 shadow-sm">
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 flex items-center justify-center hover:bg-foreground/5 transition-colors border-r border-foreground/10" disabled={quantity <= 1}>
                            <FiMinus size={12} className="text-foreground/40" />
                        </button>
                        <span className="w-14 h-12 flex items-center justify-center font-bold text-sm text-foreground">{quantity}</span>
                        <button onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))} className="w-12 h-12 flex items-center justify-center hover:bg-foreground/5 transition-colors border-l border-foreground/10" disabled={quantity >= (product.stock || 99)}>
                            <FiPlus size={12} className="text-foreground/40" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                    <button
                        onClick={() => onAddToCart(quantity)}
                        disabled={!product.stock || product.stock === 0}
                        style={{ backgroundColor: theme.secondaryColor || '#1A1A1A', color: '#ffffff' }}
                        className="w-full py-5 font-bold text-[10px] uppercase tracking-[0.3em] transition-all duration-500 disabled:bg-foreground/10 disabled:text-foreground/40 flex items-center justify-center gap-4 group relative overflow-hidden shadow-xl hover:bg-opacity-90"
                    >
                        <span className="relative z-10 flex items-center gap-3">
                            <FiPlus size={16} className="group-hover:rotate-90 transition-transform duration-500" />
                            {product.stock && product.stock > 0 ? t('product.info.addToCart') : t('product.status.outOfStock')}
                        </span>
                    </button>

                    <Link href="/products" className="w-full py-4 bg-background border border-foreground/10 text-primary font-bold text-[9px] uppercase tracking-[0.2em] hover:opacity-70 transition-all duration-500 flex items-center justify-center gap-2">
                        <FiChevronLeft size={12} />
                        {t('product.info.discoverMore')}
                    </Link>
                </div>
            </div>
        );
    }

    function renderTrustBadges() {
        return (
            <div className="mt-12 pt-10 border-t border-foreground/5 grid grid-cols-3 gap-4 text-center">
                <div className="space-y-2">
                    <div className="flex justify-center text-primary"><FiCheck size={18} /></div>
                    <p className="text-[9px] opacity-70 uppercase tracking-widest leading-relaxed">{t('product.guarantees.genuine').split(' ').join('\n')}</p>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-center text-primary"><FiShare2 size={18} /></div>
                    <p className="text-[9px] opacity-70 uppercase tracking-widest leading-relaxed">{t('product.guarantees.secure').split(' ').join('\n')}</p>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-center text-primary"><FiHeart size={18} /></div>
                    <p className="text-[9px] opacity-70 uppercase tracking-widest leading-relaxed">{t('product.guarantees.source').split(' ').join('\n')}</p>
                </div>
            </div>
        );
    }

    const currentVariant = layout?.infoBox || 'detailed';

    return (
        <div key={`product_details_${currentVariant}`} className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-12">
            {currentVariant === 'minimal' ? renderMinimal() :
                currentVariant === 'classic' ? renderClassic() :
                    renderDetailed()}
        </div>
    );
}
