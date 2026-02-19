'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchPopularCollectionsContent } from '@/lib/slices/contentSlice';
import { fetchProductStats } from '@/lib/slices/productSlice';
import { FiSearch } from 'react-icons/fi';

export default function PopularCollections() {
    const dispatch = useAppDispatch();
    const { popularCollections: content, isLoading: contentLoading } = useAppSelector((state) => state.content);
    const { stats, isLoading: statsLoading } = useAppSelector((state) => state.product);

    const loading = contentLoading || statsLoading;

    useEffect(() => {
        dispatch(fetchPopularCollectionsContent());
        dispatch(fetchProductStats());
    }, [dispatch]);

    if (loading || (!content.newArrivals && !content.bestSellers)) {
        return null;
    }

    const collections = [
        {
            id: 'new-arrivals',
            title: 'New Arrivals',
            image: content.newArrivals,
            link: '/products?tag=new-arrival',
            count: stats.newArrivals,
            delay: 0
        },
        {
            id: 'best-sellers',
            title: 'Best Sellers',
            image: content.bestSellers,
            link: '/products?tag=best-seller',
            count: stats.bestSellers,
            delay: 0.2
        }
    ];

    return (
        <section className="py-16 md:py-24 max-w-[1500px] mx-auto px-4">
            {/* Header */}
            <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-light tracking-[0.2em] text-gray-900 uppercase">
                    Popular Collections
                </h2>
                <div className="w-16 h-0.5 bg-gray-300 mx-auto mt-4"></div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {collections.map((item) => (
                    item.image && (
                        <Link
                            key={item.id}
                            href={item.link}
                            className="block group relative overflow-hidden aspect-[4/3] md:aspect-[3/2]"
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: item.delay }}
                                className="w-full h-full"
                            >
                                {/* Image */}
                                <div className="w-full h-full overflow-hidden">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                </div>

                                {/* Overlay - Darken on hover */}
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-500" />

                                {/* Content Container */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-8">

                                    {/* Product Count - Top */}
                                    <div className="absolute top-12 opacity-0 group-hover:opacity-100 transition-all duration-500 transform -translate-y-4 group-hover:translate-y-0 text-white text-xs md:text-sm tracking-[0.2em] uppercase font-medium">
                                        {item.count} Products
                                    </div>

                                    {/* Title - Center */}
                                    <h3 className="text-3xl md:text-5xl text-white font-light tracking-wide text-shadow-lg drop-shadow-md z-10 transition-transform duration-500 group-hover:-translate-y-2">
                                        {item.title}
                                    </h3>

                                    {/* CTA - Bottom */}
                                    <div className="absolute bottom-12 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 text-white text-xs md:text-sm tracking-widest uppercase font-medium">
                                        View the collection &gt;
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    )
                ))}
            </div>
        </section>
    );
}
