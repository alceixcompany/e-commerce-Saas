'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchProductsByIds } from '@/lib/slices/productSlice';
import ProductCard from '@/components/ProductCard';
import { useTranslation } from '@/hooks/useTranslation';

interface CustomProductsSectionProps {
    instanceId?: string;
    data?: any;
}
 
export default function CustomProductsSection({ instanceId, data: passedData }: CustomProductsSectionProps) {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { instances } = useAppSelector((state) => state.component);
    const { products, loading } = useAppSelector((state) => state.product);
    const isLoading = loading.fetchList;
 
    const instance = instanceId ? instances.find(i => i._id === instanceId) : null;
    const data = passedData || instance?.data || {
        title: t('home.customProducts.title'),
        subtitle: t('home.customProducts.subtitle'),
        productIds: [],
        variant: 'grid'
    };

    const [sectionProducts, setSectionProducts] = useState<any[]>([]);

    useEffect(() => {
        if (data.productIds && data.productIds.length > 0) {
            dispatch(fetchProductsByIds(data.productIds)).then((res: any) => {
                if (res.payload) {
                    setSectionProducts(res.payload);
                }
            });
        }
    }, [data.productIds, dispatch]);

    if (!data.productIds || data.productIds.length === 0) {
        if (instanceId) {
             return (
                <div className="py-20 text-center bg-muted/20 border-2 border-dashed border-muted-foreground/20 rounded-3xl m-10">
                    <p className="text-muted-foreground">{t('home.customProducts.empty')}</p>
                </div>
             );
        }
        return null;
    }

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

    const renderSlider = () => (
        <div className="relative group">
            <div className="flex overflow-x-auto gap-8 pb-12 hide-scrollbar snap-x">
                {sectionProducts.map((product, idx) => (
                    <div key={product._id} className="min-w-[280px] md:min-w-[350px] snap-start">
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>
            <style jsx>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );

    const renderFocused = () => {
        const mainProduct = sectionProducts[0];
        const otherProducts = sectionProducts.slice(1, 5); // Display up to 4 side products

        return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                {/* Main Featured Product - 6/12 width */}
                <div className="lg:col-span-6">
                    {mainProduct && (
                        <div className="h-full">
                            <ProductCard product={mainProduct} />
                        </div>
                    )}
                </div>
                {/* Side Products Grid - 6/12 width, 2 columns (3/12 each) */}
                <div className="lg:col-span-6 grid grid-cols-2 gap-4 md:gap-6">
                    {otherProducts.map((product) => (
                        <div key={product._id} className="h-fit">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <section className="w-full bg-background py-20 md:py-32 overflow-hidden">
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
                    <h2 className="text-3xl md:text-5xl font-light text-foreground serif lowercase tracking-tighter">
                        {data.title}
                    </h2>
                </motion.div>
            </div>

            <div className={`mx-auto px-6 lg:px-20 ${data.variant === 'focused' ? 'max-w-[1300px]' : 'max-w-[1440px]'}`}>
                {data.variant === 'slider' && renderSlider()}
                {data.variant === 'focused' && renderFocused()}
                {(data.variant === 'grid' || !data.variant) && renderGrid()}
            </div>
        </section>
    );
}
