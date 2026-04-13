'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchProductsByIds } from '@/lib/slices/productSlice';
import ProductCard from '@/components/ProductCard';
import { useTranslation } from '@/hooks/useTranslation';
import CustomProductsSkeleton from './_components/CustomProductsSkeleton';
import { FiChevronLeft, FiChevronRight, FiArrowRight, FiGrid } from 'react-icons/fi';

interface CustomProductsSectionProps {
    instanceId?: string;
    data?: any;
}

export default function CustomProductsSection({ instanceId, data: passedData }: CustomProductsSectionProps) {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { instances } = useAppSelector((state) => state.component);
    const { products, loading } = useAppSelector((state) => state.product);
    const isLoading = loading.fetchByIds || loading.fetchList;

    const instance = instanceId ? instances.find(i => i._id === instanceId) : null;
    const data = passedData || instance?.data || {
        title: t('home.customProducts.title'),
        subtitle: t('home.customProducts.subtitle'),
        productIds: [],
        variant: 'grid'
    };

    const [sectionProducts, setSectionProducts] = useState<any[]>([]);
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (data.productIds && data.productIds.length > 0) {
            dispatch(fetchProductsByIds(data.productIds)).then((res: any) => {
                if (res.payload) {
                    setSectionProducts(res.payload);
                }
            });
        }
    }, [data.productIds, dispatch]);

    const renderEmpty = () => {
        if (!instanceId) return null;
        return (
            <div className="py-32 px-10 text-center max-w-[1440px] mx-auto">
                <div className="bg-muted/10 border-2 border-dashed border-muted-foreground/10 rounded-[3rem] p-16 space-y-4">
                    <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiGrid className="text-muted-foreground/40" size={32} />
                    </div>
                    <h3 className="text-xl font-light serif">{t('home.customProducts.emptyTitle') || 'Koleksiyonunuz Boş'}</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                        {t('home.customProducts.empty') || 'Henüz ürün seçilmedi. Lütfen panelden ürünlerinizi ekleyin.'}
                    </p>
                </div>
            </div>
        );
    };

    const renderGrid = () => (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
            {sectionProducts.map((product, idx) => (
                <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    viewport={{ once: true }}
                >
                    <ProductCard product={product} />
                </motion.div>
            ))}
        </div>
    );

    const renderSlider = () => {
        const scroll = (direction: 'left' | 'right') => {
            if (scrollContainerRef.current) {
                const scrollAmount = 400;
                scrollContainerRef.current.scrollBy({
                    left: direction === 'left' ? -scrollAmount : scrollAmount,
                    behavior: 'smooth'
                });
            }
        };

        return (
            <div className="relative group/slider">
                {/* Navigation Controls */}
                <div className="absolute -top-24 right-0 flex gap-3 z-10 opacity-0 group-hover/slider:opacity-100 transition-opacity duration-500 hidden md:flex">
                    <button
                        onClick={() => scroll('left')}
                        className="w-12 h-12 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-white hover:border-transparent transition-all"
                    >
                        <FiChevronLeft size={20} />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="w-12 h-12 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-white hover:border-transparent transition-all"
                    >
                        <FiChevronRight size={20} />
                    </button>
                </div>

                <div
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto gap-8 pb-12 hide-scrollbar snap-x scroll-smooth"
                >
                    {sectionProducts.map((product, idx) => (
                        <motion.div
                            key={product._id}
                            className="min-w-[280px] md:min-w-[400px] snap-start"
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1, duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <ProductCard product={product} />
                        </motion.div>
                    ))}
                </div>
                <style jsx>{`
                    .hide-scrollbar::-webkit-scrollbar { display: none; }
                    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                `}</style>
            </div>
        );
    };

    const renderFocused = () => {
        const mainProduct = sectionProducts[0];
        const otherProducts = sectionProducts.slice(1, 4);

        return (
            <div className="space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
                    <div className="lg:col-span-5 space-y-8 order-2 lg:order-1">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="space-y-6"
                        >
                            <div className="inline-block px-4 py-1.5 bg-primary/5 rounded-full border border-primary/10">
                                <span className="text-[10px] font-bold text-primary tracking-widest uppercase">özel seçim</span>
                            </div>
                            <h3 className="text-4xl md:text-6xl font-light serif leading-[1.1]">
                                {mainProduct?.name}
                            </h3>
                            <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
                                {mainProduct?.shortDescription || 'Bu koleksiyonun en nadide parçası, zarafet ve modern tasarımı bir araya getiriyor.'}
                            </p>
                            <div className="pt-4 flex items-center gap-10">
                                <div className="space-y-1">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">fiyat</p>
                                    <p className="text-2xl font-medium tracking-tight">₺{mainProduct?.price?.toLocaleString()}</p>
                                </div>
                                <motion.button
                                    whileHover={{ x: 5 }}
                                    className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest group"
                                >
                                    incele <FiArrowRight className="group-hover:text-primary transition-colors" />
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>

                    <div className="lg:col-span-7 order-1 lg:order-2">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1 }}
                            viewport={{ once: true }}
                            className="aspect-[4/3] lg:aspect-[16/10] overflow-hidden rounded-[2rem] shadow-2xl relative"
                        >
                            <img
                                src={mainProduct?.mainImage || mainProduct?.image}
                                alt={mainProduct?.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                        </motion.div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-border/50">
                    {otherProducts.map((product, idx) => (
                        <motion.div
                            key={product._id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + (idx * 0.1), duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <ProductCard product={product} />
                        </motion.div>
                    ))}
                </div>
            </div>
        );
    };

    const hasNoProducts = !data.productIds || data.productIds.length === 0;
    const showSkeleton = isLoading && sectionProducts.length === 0;

    return (
        <section className="w-full bg-background py-20 md:py-32 overflow-hidden">
            {showSkeleton ? (
                <CustomProductsSkeleton variant={data.variant} />
            ) : hasNoProducts ? (
                renderEmpty()
            ) : (
                <>
                    <div className="max-w-[1440px] mx-auto px-6 lg:px-20 text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="space-y-4"
                        >
                            <div className="flex items-center justify-center gap-4 mb-2">
                                <div className="w-8 h-[1px] bg-primary/30"></div>
                                <span className="text-[10px] md:text-xs tracking-[0.4em] font-bold text-primary uppercase">
                                    {data.subtitle}
                                </span>
                                <div className="w-8 h-[1px] bg-primary/30"></div>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-light text-foreground serif tracking-tighter">
                                {data.title}
                            </h2>
                        </motion.div>
                    </div>

                    <div className={`mx-auto px-6 lg:px-20 ${data.variant === 'focused' ? 'max-w-[1300px]' : 'max-w-[1440px]'}`}>
                        {data.variant === 'slider' && renderSlider()}
                        {data.variant === 'focused' && renderFocused()}
                        {(data.variant === 'grid' || !data.variant) && renderGrid()}
                    </div>
                </>
            )}
        </section>
    );
}
