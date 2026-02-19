'use client';

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchBlogBySlug, fetchBlogs } from '@/lib/slices/blogSlice';
import { FiCalendar, FiUser, FiArrowLeft, FiShare2, FiArrowRight } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function JournalDetailPage({ params }: { params: any }) {
    // Handling params as both promise and object for Next.js 14/15 compatibility
    const resolvedParams = params instanceof Promise || (params && typeof params.then === 'function')
        ? React.use(params)
        : params;

    const slug = resolvedParams?.slug;
    const dispatch = useAppDispatch();
    const { blog, blogs, isLoading, error } = useAppSelector((state) => state.blog);

    useEffect(() => {
        if (slug) {
            dispatch(fetchBlogBySlug(slug));
        }
        if (blogs.length === 0) {
            dispatch(fetchBlogs());
        }
    }, [dispatch, slug, blogs.length]);

    const recommendedBlogs = blogs
        .filter(b => b.slug !== slug)
        .slice(0, 3);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (isLoading || (!blog && !error)) {
        return (
            <div className="min-h-screen bg-white pt-[120px] flex justify-center items-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-b-2 border-[#C5A059] rounded-full animate-spin"></div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Loading Story</span>
                </div>
            </div>
        );
    }

    if (error || !blog) {
        return (
            <div className="min-h-screen bg-white pt-[120px] pb-20 px-6 text-center">
                <div className="max-w-md mx-auto space-y-8 mt-20">
                    <span className="text-[80px] font-light serif text-gray-100 block">404</span>
                    <h1 className="text-3xl font-light serif text-gray-900 mb-4">{error || 'The story has drifted away.'}</h1>
                    <p className="text-gray-400 font-light italic mb-12">We couldn't find the perspective you were looking for.</p>
                    <Link href="/journal" className="inline-flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.4em] text-black border-b border-black pb-2">
                        <FiArrowLeft /> Return to Journal
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <article className="min-h-screen bg-white pb-32 animate-in fade-in duration-700">
            {/* Hero Section */}
            <div className="relative h-[70vh] min-h-[500px] w-full bg-gray-900 overflow-hidden">
                {blog.image ? (
                    <div className="absolute inset-0">
                        <img
                            src={blog.image}
                            alt={blog.title}
                            className="w-full h-full object-cover opacity-60 scale-105 animate-subtle-zoom"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-white"></div>
                    </div>
                ) : (
                    <div className="absolute inset-0 bg-zinc-900"></div>
                )}

                <div className="relative h-full max-w-[1440px] mx-auto px-6 lg:px-20 flex flex-col justify-end pb-20">
                    <div className="max-w-4xl">
                        {/* Navigation over hero */}
                        <Link href="/journal" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/70 hover:text-white transition-colors mb-12">
                            <FiArrowLeft size={14} /> Back to Journal
                        </Link>

                        <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.3em] text-white/50 mb-6">
                            <div className="flex items-center gap-2">
                                <FiCalendar size={14} />
                                {blog.createdAt && formatDate(blog.createdAt)}
                            </div>
                            <div className="w-1 h-1 bg-white/30 rounded-full"></div>
                            <div className="flex items-center gap-2">
                                <FiUser size={14} />
                                {blog.author?.name || 'Editorial'}
                            </div>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-light serif text-white leading-[1.1] mb-8 drop-shadow-sm">
                            {blog.title}
                        </h1>

                        <p className="text-lg md:text-xl font-light text-white/80 italic max-w-2xl leading-relaxed">
                            {blog.excerpt}
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-[1440px] mx-auto px-6 lg:px-20 mt-28">
                {/* Main Content Area */}
                <div className="max-w-4xl mx-auto">
                    <div className="prose prose-neutral prose-lg lg:prose-xl max-w-none prose-headings:font-light prose-headings:serif prose-p:font-light prose-p:text-gray-600 prose-a:text-black hover:prose-a:opacity-70 prose-img:rounded-sm prose-blockquote:border-l-black prose-blockquote:font-serif prose-blockquote:italic">
                        <div dangerouslySetInnerHTML={{ __html: blog.content }} />
                    </div>

                    {/* Tags & Share */}
                    <div className="mt-24 pt-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex flex-wrap justify-center gap-2">
                            {blog.tags?.map((tag: string) => (
                                <span key={tag} className="px-4 py-1.5 bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black hover:bg-gray-100 transition-all cursor-default">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                        <button className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-black hover:opacity-60 transition-opacity px-8 py-3 bg-white border border-black/10 shadow-sm">
                            <FiShare2 size={16} /> Share This Story
                        </button>
                    </div>
                </div>
            </div>

            {/* Recommended Section - Redesigned */}
            {recommendedBlogs.length > 0 && (
                <section className="mt-40 border-t border-gray-100 bg-[#fafafa] py-32 overflow-hidden">
                    <div className="max-w-[1440px] mx-auto px-6 lg:px-20">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-20 gap-8">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#C5A059] mb-4 block">Editorial Curation</span>
                                <h2 className="text-4xl md:text-5xl font-light serif text-gray-900 leading-tight">You may also indulge in</h2>
                            </div>
                            <Link href="/journal" className="group/nav inline-flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-black">
                                Explore Journal
                                <span className="w-12 h-[1px] bg-black/10 group-hover/nav:w-16 group-hover/nav:bg-black transition-all duration-500"></span>
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12">
                            {recommendedBlogs.map((item, idx) => (
                                <motion.div
                                    key={item._id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                                >
                                    <Link href={`/journal/${item.slug}`} className="group block relative">
                                        <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 p-3 md:p-4 border border-gray-200/50 group-hover:border-black/10 transition-colors duration-700 mb-8">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-white/10 serif italic text-[10px]">
                                                    Ocean Gem
                                                </div>
                                            )}
                                            <span className="absolute -bottom-10 -left-6 text-[80px] font-light serif text-black/[0.03] group-hover:text-black/[0.08] transition-colors duration-700 select-none z-0">
                                                {(idx + 1).toString().padStart(2, '0')}
                                            </span>
                                        </div>

                                        <div className="space-y-4 relative z-10 px-2">
                                            <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-gray-400">
                                                <span>{item.author?.name || 'Editorial'}</span>
                                                <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                                                <span className="text-[#C5A059]">{item.tags?.[0] || 'Perspective'}</span>
                                            </div>

                                            <h3 className="text-xl md:text-2xl font-light serif leading-snug text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-2">
                                                {item.title}
                                            </h3>

                                            <div className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.3em] text-black pt-2">
                                                Read Entry
                                                <span className="w-6 h-[1px] bg-black/10 group-hover:w-10 group-hover:bg-black transition-all duration-500"></span>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </article>
    );
}
