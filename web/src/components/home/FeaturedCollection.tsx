'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function FeaturedCollection() {
    return (
        <section className="w-full bg-white py-24 md:py-40 relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-50/30 -z-0 rounded-l-[100px] transform translate-x-20"></div>

            <div className="max-w-[1440px] mx-auto px-6 lg:px-20 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">

                    {/* Left: Interactive Media Container */}
                    <div className="lg:col-span-7 group">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            viewport={{ once: true }}
                            className="relative aspect-[16/10] overflow-hidden rounded-2xl shadow-2xl"
                        >
                            {/* Main Video */}
                            <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover grayscale-[0.2] transition-transform duration-[2000ms] group-hover:scale-105"
                            >
                                <source src="/videos/video2.mp4" type="video/mp4" />
                            </video>

                            {/* Glassmorphism Overlay Info */}
                            <div className="absolute bottom-10 left-10 right-10 p-8 pt-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl opacity-0 translate-y-10 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700">
                                <p className="text-white text-xs tracking-[0.3em] font-medium uppercase mb-2">Ocean Gem Artisans</p>
                                <p className="text-white/80 text-sm font-light italic">"Every wave tells a story, every gem captures an ocean dream."</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right: Content */}
                    <div className="lg:col-span-5 flex flex-col items-start space-y-12">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-[1px] bg-cyan-800"></div>
                                <span className="text-[10px] md:text-xs tracking-[0.4em] font-bold text-cyan-900 uppercase">
                                    Featured Treasures
                                </span>
                            </div>

                            <h2 className="text-4xl md:text-6xl font-light text-gray-900 serif leading-[1.1]">
                                Mastery in <br />
                                <span className="italic relative inline-block">
                                    Diamond-Cut
                                    <svg className="absolute -bottom-2 left-0 w-full h-2 text-cyan-100 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                        <path d="M0 5 Q 25 0, 50 5 T 100 5 L 100 10 L 0 10 Z" fill="currentColor" />
                                    </svg>
                                </span>
                                <br /> Patterns
                            </h2>

                            <p className="text-sm md:text-base text-gray-500 font-light leading-relaxed tracking-wide max-w-sm">
                                Our signature hand-engraved collection reflects the rhythmic beauty of the tides, transformed into timeless gold and diamond masterpieces.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            viewport={{ once: true }}
                            className="relative group"
                        >
                            <Link
                                href="/collections"
                                className="relative z-10 inline-block bg-gray-900 text-white px-20 py-6 transition-all duration-500 font-bold tracking-[0.3em] uppercase text-[10px] hover:bg-cyan-950 shadow-2xl"
                            >
                                DISCOVER THE DEEP
                            </Link>
                            {/* Decorative shadow line */}
                            <div className="absolute -bottom-2 -right-2 w-full h-full border border-cyan-800 transition-all duration-300 group-hover:bottom-0 group-hover:right-0"></div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
}
