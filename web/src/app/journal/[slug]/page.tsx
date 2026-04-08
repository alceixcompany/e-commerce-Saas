'use client';

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchBlogBySlug, fetchBlogs } from '@/lib/slices/blogSlice';
import { fetchGlobalSettings } from '@/lib/slices/contentSlice';
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
    const { blog, blogs, loading, error } = useAppSelector((state) => state.blog);
    const isLoading = loading.fetchOne;
    const { globalSettings } = useAppSelector((state) => state.content);

    useEffect(() => {
        dispatch(fetchGlobalSettings());
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
            <div className="min-h-screen bg-background pt-[120px] flex justify-center items-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-b-2 border-primary rounded-full animate-spin"></div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/40">Loading Story</span>
                </div>
            </div>
        );
    }

    if (error || !blog) {
        return (
            <div className="min-h-screen bg-background pt-[120px] pb-20 px-6 text-center">
                <div className="max-w-md mx-auto space-y-8 mt-20">
                    <span className="text-[80px] font-light serif text-foreground/5 block">404</span>
                    <h1 className="text-3xl font-light serif text-foreground mb-4">{error || 'The story has drifted away.'}</h1>
                    <p className="text-foreground/40 font-light italic mb-12">We couldn't find the perspective you were looking for.</p>
                    <Link href="/journal" className="inline-flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.4em] text-foreground border-b border-foreground pb-2">
                        <FiArrowLeft /> Return to Journal
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <article className="min-h-screen bg-background pb-32 animate-in fade-in duration-700">
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
                    <div className="prose prose-neutral prose-lg lg:prose-xl max-w-none prose-headings:font-light prose-headings:serif prose-p:font-light prose-p:text-foreground/70 prose-a:text-foreground hover:prose-a:opacity-70 prose-img:rounded-sm prose-blockquote:border-l-foreground prose-blockquote:font-serif prose-blockquote:italic text-foreground">
                        <div dangerouslySetInnerHTML={{ __html: blog.content }} />
                    </div>

                    {/* Tags & Share */}
                    <div className="mt-24 pt-10 border-t border-foreground/10 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex flex-wrap justify-center gap-2">
                            {blog.tags?.map((tag: string) => (
                                <span key={tag} className="px-4 py-1.5 bg-foreground/5 text-[10px] font-bold uppercase tracking-widest text-foreground/40 hover:text-foreground hover:bg-foreground/10 transition-all cursor-default">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                        <button className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground hover:opacity-60 transition-opacity px-8 py-3 bg-background border border-foreground/10 shadow-sm">
                            <FiShare2 size={16} /> Share This Story
                        </button>
                    </div>
                </div>
            </div>

            {/* Recommended Section - Redesigned */}
            {recommendedBlogs.length > 0 && (
                <section className="mt-40 border-t border-foreground/10 bg-foreground/5 py-32 overflow-hidden">
                    <div className="max-w-[1440px] mx-auto px-6 lg:px-20">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-20 gap-8">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary mb-4 block">Editorial Curation</span>
                                <h2 className="text-4xl md:text-5xl font-light serif text-foreground leading-tight">You may also indulge in</h2>
                            </div>
                            <Link href="/journal" className="group/nav inline-flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
                                Explore Journal
                                <span className="w-12 h-[1px] bg-foreground/10 group-hover/nav:w-16 group-hover/nav:bg-foreground transition-all duration-500"></span>
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
                                        <div className="relative aspect-[4/5] overflow-hidden bg-foreground/5 p-3 md:p-4 border border-foreground/5 group-hover:border-foreground/10 transition-colors duration-700 mb-8">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-foreground text-background/20 serif italic text-[10px]">
                                                    {globalSettings.siteName || 'Alceix Group'}
                                                </div>
                                            )}
                                            <span className="absolute -bottom-10 -left-6 text-[80px] font-light serif text-foreground/[0.03] group-hover:text-foreground/[0.08] transition-colors duration-700 select-none z-0">
                                                {(idx + 1).toString().padStart(2, '0')}
                                            </span>
                                        </div>

                                        <div className="space-y-4 relative z-10 px-2">
                                            <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-foreground/40">
                                                <span>{item.author?.name || 'Editorial'}</span>
                                                <div className="w-1 h-1 bg-foreground/20 rounded-full"></div>
                                                <span className="text-primary">{item.tags?.[0] || 'Perspective'}</span>
                                            </div>

                                            <h3 className="text-xl md:text-2xl font-light serif leading-snug text-foreground group-hover:text-foreground/60 transition-colors line-clamp-2">
                                                {item.title}
                                            </h3>

                                            <div className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.3em] text-foreground pt-2">
                                                Read Entry
                                                <span className="w-6 h-[1px] bg-foreground/10 group-hover:w-10 group-hover:bg-foreground transition-all duration-500"></span>
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
