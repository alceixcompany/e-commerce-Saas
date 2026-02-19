'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function AboutPage() {
    return (
        <div className="bg-white min-h-screen font-sans selection:bg-[#C5A059]/30">

            {/* Video Hero Section */}
            <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">
                <div className="absolute inset-0 z-0 opacity-60">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                    >
                        <source src="/videos/about_hero.mp4" type="video/mp4" />
                    </video>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 z-10" />

                <div className="relative z-20 w-full h-full flex flex-col items-center justify-center text-center text-white px-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="space-y-4"
                    >
                        <span className="text-[10px] md:text-xs tracking-[0.5em] font-light uppercase opacity-80">The Essence of Elegance</span>
                        <h1 className="text-6xl md:text-9xl font-light serif tracking-tighter mb-4 italic">
                            Our Story
                        </h1>
                        <div className="h-[1px] w-24 bg-white/30 mx-auto"></div>
                    </motion.div>
                </div>

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce text-white/50">
                    <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent"></div>
                </div>
            </section>

            {/* Authenticity Section */}
            <section className="w-full bg-white py-32 relative overflow-hidden">
                <div className="max-w-[1440px] mx-auto px-6 lg:px-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1 }}
                            viewport={{ once: true }}
                            className="space-y-8"
                        >
                            <div className="space-y-4">
                                <span className="text-[10px] tracking-[0.4em] font-bold text-zinc-400 uppercase">CRAFTSMANSHIP</span>
                                <h2 className="text-4xl md:text-6xl font-light text-zinc-900 serif leading-tight italic">
                                    Captured in <br />
                                    <span className="text-zinc-400">the Moment</span>
                                </h2>
                            </div>
                            <p className="text-lg text-zinc-500 font-light leading-relaxed max-w-md italic">
                                "Beauty is not just in the final piece, but in the meticulous journey of its creation. We capture every spark, every carve, and every reflection."
                            </p>
                            <div className="flex items-center gap-6 pt-4">
                                <div className="h-[1px] w-12 bg-zinc-200"></div>
                                <span className="text-xs tracking-widest uppercase font-medium text-zinc-900">Behind the scenes</span>
                            </div>
                        </motion.div>

                        <div className="relative group">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1 }}
                                viewport={{ once: true }}
                                className="aspect-[4/5] md:aspect-[3/4] overflow-hidden rounded-3xl shadow-2xl relative"
                            >
                                <img
                                    src="/image/customer/WhatsApp Image 2026-02-06 at 01.01.21.jpeg"
                                    alt="Artisan process"
                                    className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Video Showcase Section */}
            <section className="w-full bg-zinc-950 py-32" >
                <div className="max-w-[1440px] mx-auto px-6 lg:px-20 text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="text-white text-3xl md:text-5xl font-light serif italic mb-4"
                    >
                        Pure Reflections
                    </motion.h2>
                    <p className="text-zinc-500 tracking-[0.2em] uppercase text-[10px]">Real moments, real beauty</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-zinc-900/50">
                    <div className="aspect-square md:aspect-video relative overflow-hidden group">
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000"
                        >
                            <source src="/videos/about_video.mp4" type="video/mp4" />
                        </video>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-black/40">
                            <span className="text-white text-xs tracking-widest uppercase font-light border border-white/30 px-6 py-2">The Glow</span>
                        </div>
                    </div>
                    <div className="aspect-square md:aspect-video relative overflow-hidden group">
                        <img
                            src="/image/customer/WhatsApp Image 2026-02-06 at 01.01.19n.jpeg"
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000"
                            alt="Collection showcase"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-black/40">
                            <span className="text-white text-xs tracking-widest uppercase font-light border border-white/30 px-6 py-2">The Craft</span>
                        </div>
                    </div>
                </div>
            </section >

            {/* Final Detail Section */}
            < section className="py-32 bg-white relative overflow-hidden" >
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative z-10"
                    >
                        <div className="w-24 h-[1px] bg-zinc-200 mx-auto mb-12"></div>
                        <img
                            src="/image/customer/WhatsApp Image 2026-02-06 at 01.01.20.jpeg"
                            className="w-32 h-32 md:w-48 md:h-48 rounded-full mx-auto object-cover mb-12 shadow-xl border-4 border-white"
                            alt="Process detail"
                        />
                        <blockquote className="text-2xl md:text-5xl font-serif font-light text-zinc-900 mb-10 leading-[1.3] italic">
                            "Real elegance is found in the raw, personal moments of craftsmanship."
                        </blockquote>
                        <div className="text-[10px] font-bold tracking-[0.4em] text-zinc-400 uppercase">
                            OUR PHILOSOPHY
                        </div>
                    </motion.div>
                </div>

                {/* Background Decorative Text */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-0 pointer-events-none opacity-[0.03] text-[20vw] font-serif italic whitespace-nowrap select-none">
                    Exquisite
                </div>
            </section >
        </div >
    );
}
