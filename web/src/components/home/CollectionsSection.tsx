'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiChevronRight } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchPublicCategories } from '@/lib/slices/categorySlice';

interface Category {
    _id: string;
    name: string;
    slug: string;
    image?: string;
    productCount?: number;
}

const fallbackImages: Record<string, string> = {
    'Bracelets': 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800',
    'Necklaces': 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&q=80&w=800',
    'Rings': 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800',
    'Earrings': 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&q=80&w=800',
    'default': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800'
};

export default function CollectionsSection() {
    const dispatch = useAppDispatch();
    const { categories, isLoading: loading } = useAppSelector((state) => state.category);

    useEffect(() => {
        dispatch(fetchPublicCategories());
    }, [dispatch]);

    if (loading) return null;

    return (
        <section className="w-full bg-white py-20 overflow-hidden">
            <div className="max-w-[1440px] mx-auto px-6">
                {/* Header */}
                <div className="flex flex-col items-center mb-16 space-y-4">
                    <h3 className="text-[10px] md:text-sm tracking-[0.3em] font-normal text-gray-500 uppercase text-center max-w-2xl px-4">
                        MODERN AND TRENDY LOOKS FOR EVERYDAY AND YOUR SPECIAL OCCASIONS
                    </h3>
                    <div className="w-12 h-[1px] bg-gray-300"></div>
                </div>

                {/* Categories Scrollable Container */}
                <div className="relative group/scroll">
                    <div className="flex gap-4 overflow-x-auto pb-8 pt-4 custom-scrollbar scroll-smooth snap-x snap-mandatory">
                        {categories.filter(cat => cat && cat._id).map((category, index) => {
                            const displayImage = category.image || fallbackImages[category.name] || fallbackImages.default;

                            return (
                                <motion.div
                                    key={category._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="relative flex-none w-[85%] sm:w-[45%] lg:w-[23.5%] aspect-[3/4] overflow-hidden bg-gray-100 snap-start active:cursor-grabbing group"
                                >
                                    <img
                                        src={displayImage}
                                        alt={category.name}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                    />

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-all duration-500"></div>

                                    {/* Content Overlay */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
                                        {/* Product Count (Top) */}
                                        <span className="text-[10px] md:text-xs tracking-[0.2em] font-normal uppercase mb-auto pt-4 opacity-0 group-hover:opacity-100 translate-y-[-10px] group-hover:translate-y-0 transition-all duration-700">
                                            {category.productCount} PRODUCTS
                                        </span>

                                        {/* Category Name (Center) */}
                                        <h4 className="text-4xl md:text-5xl lg:text-5xl font-light serif mb-4 tracking-wide text-center group-hover:scale-105 transition-transform duration-700">
                                            {category.name}
                                        </h4>

                                        {/* View Collection (Bottom) */}
                                        <Link
                                            href={`/categories/${category.slug}`}
                                            className="mt-auto pb-4 flex items-center gap-2 text-[10px] md:text-xs tracking-[0.2em] uppercase font-normal opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-700"
                                        >
                                            View the collection
                                            <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>

                                    {/* Internal Glow Effect */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 bg-gradient-to-t from-cyan-900/40 via-transparent to-transparent pointer-events-none"></div>
                                </motion.div>
                            );
                        })}
                    </div>

                    <style jsx>{`
            /* Custom Scrollbar Styling */
            .custom-scrollbar::-webkit-scrollbar {
              height: 3px;
              background-color: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background-color: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background-color: #e5e7eb;
              border-radius: 9999px;
              transition: background-color 0.3s ease;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background-color: #d1d5db;
            }
            
            /* Hide on mobile/tablet */
            @media (max-width: 1024px) {
              .custom-scrollbar::-webkit-scrollbar {
                display: none;
                width: 0px;
                background: transparent;
              }
            }
          `}</style>
                </div>
            </div>
        </section>
    );
}
