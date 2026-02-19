'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchBanners } from '@/lib/slices/contentSlice';

export default function HomeBanner() {
    const dispatch = useAppDispatch();
    const { banners, isLoading } = useAppSelector((state) => state.content);

    useEffect(() => {
        dispatch(fetchBanners());
    }, [dispatch]);

    if (isLoading) return null;
    if (banners.length === 0) return null;

    return (
        <section className="w-full flex flex-col gap-[2px]">
            {banners.filter(b => b && b._id).map((banner, index) => (
                <div key={banner._id} className="relative w-full h-[400px] md:h-[500px] overflow-hidden group">
                    {/* Background Image */}
                    <div className="absolute inset-0">
                        <img
                            src={banner.image}
                            alt={banner.title}
                            className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                        />
                        {/* Overlay Gradient - Adjust direction based on index */}
                        <div className={`absolute inset-0 bg-gradient-to-r ${index % 2 === 0 ? 'from-black/60 via-black/20 to-transparent' : 'from-transparent via-black/20 to-black/60'}`}></div>
                    </div>

                    {/* Content */}
                    <div className={`relative h-full max-w-[1440px] mx-auto px-6 lg:px-20 flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className={`max-w-xl text-white ${index % 2 === 0 ? 'text-left' : 'text-right flex flex-col items-end'}`}
                        >
                            <h3 className="text-xs md:text-sm tracking-[0.3em] font-medium uppercase mb-4 text-gray-200">
                                {banner.description}
                            </h3>

                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light serif mb-8 leading-tight">
                                {banner.title}
                            </h2>

                            <Link
                                href={banner.buttonUrl || '/collections'}
                                className="inline-flex items-center gap-3 bg-white text-black px-10 py-4 text-[10px] md:text-xs tracking-[0.2em] font-bold uppercase hover:bg-gray-100 transition-colors shadow-lg"
                            >
                                {banner.buttonText || 'Discover'}
                                <FiArrowRight />
                            </Link>
                        </motion.div>
                    </div>
                </div>
            ))}
        </section>
    );
}
