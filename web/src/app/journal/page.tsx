'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchBlogs } from '@/lib/slices/blogSlice';
import { FiArrowRight, FiCalendar, FiUser, FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function JournalPage() {
    const dispatch = useAppDispatch();
    const { blogs, isLoading, metadata } = useAppSelector((state) => state.blog);
    const [activeFilter, setActiveFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    useEffect(() => {
        const loadInitialBlogs = async () => {
            setIsInitialLoading(true);
            await dispatch(fetchBlogs({ page: 1, limit: 10, sort: activeFilter }));
            setIsInitialLoading(false);
        };
        loadInitialBlogs();
    }, [dispatch]);

    const loadMore = async () => {
        if (isLoading || page >= metadata.pages) return;
        const nextPage = page + 1;
        setPage(nextPage);
        await dispatch(fetchBlogs({ page: nextPage, limit: 10, sort: activeFilter }));
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 100) {
            loadMore();
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Blogs are now sorted and filtered by the backend
    const displayBlogs = blogs;

    const featuredBlog = displayBlogs.length > 0 ? displayBlogs[0] : null;
    const listBlogs = featuredBlog ? displayBlogs.slice(1) : displayBlogs;

    // Reset when filter changes
    useEffect(() => {
        if (isInitialLoading) return;
        setPage(1);
        dispatch(fetchBlogs({ page: 1, limit: 10, sort: activeFilter }));
    }, [activeFilter, dispatch]);

    return (
        <div
            className="min-h-screen bg-white pt-[90px] md:pt-[120px] pb-16 md:pb-32 overflow-x-hidden"
            onScroll={handleScroll}
        >
            {/* Magazine Header */}
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 mb-12 md:mb-24 animate-in fade-in slide-in-from-top-4 duration-1000">
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-100 pb-8 md:pb-12 gap-8">
                    <div className="max-w-2xl">
                        <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] text-[#C5A059] mb-4 md:mb-6 block">Reflections & Perspectives</span>
                        <h1 className="text-4xl sm:text-6xl md:text-8xl font-light serif mb-6 md:mb-8 tracking-tighter text-gray-900 leading-[0.9]">
                            The <br className="hidden md:block" /> Journal
                        </h1>
                        <p className="text-lg md:text-xl font-light text-gray-400 max-w-lg leading-relaxed italic">
                            A curated space for the aesthetics of modern living, jewelry craft, and the stories that define us.
                        </p>
                    </div>
                    {/* Editorial Filters */}
                    <div className="flex flex-wrap gap-x-6 gap-y-4 md:gap-8 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                        {['all', 'new', 'best-read'].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`${activeFilter === filter ? 'text-black border-b border-black pb-1' : 'hover:text-black transition-colors'}`}
                            >
                                {filter === 'all' ? 'All Stories' : filter === 'best-read' ? 'Best Read' : 'New'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Featured Story - Large Hero */}
            {!isLoading && featuredBlog && (
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 mb-20 md:mb-40 animate-in fade-in zoom-in-95 duration-1000 delay-200">
                    <Link href={`/journal/${featuredBlog.slug}`} className="group block relative overflow-hidden bg-gray-50 aspect-[4/5] sm:aspect-[4/3] md:aspect-[21/9] min-h-[400px]">
                        {featuredBlog.image && (
                            <img
                                src={featuredBlog.image}
                                alt={featuredBlog.title}
                                className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110"
                            />
                        )}
                        <div className="absolute inset-0 bg-black/50 md:bg-black/30 group-hover:bg-black/20 transition-colors duration-700"></div>

                        {/* Featured Label */}
                        <div className="absolute top-4 md:top-10 left-4 md:left-10 z-20">
                            <span className="bg-white text-black px-3 md:px-6 py-1.5 md:py-2 text-[8px] md:text-[9px] font-bold uppercase tracking-[0.3em] shadow-2xl">
                                {activeFilter === 'best-read' ? 'Most Popular' : 'Featured Story'}
                            </span>
                        </div>

                        {/* Story Info */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-20 bg-gradient-to-t from-black/90 via-black/20 to-transparent">
                            <div className="max-w-3xl space-y-4 md:space-y-6">
                                <div className="flex items-center gap-3 md:gap-4 text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-white/70">
                                    <span>{formatDate(featuredBlog.createdAt)}</span>
                                    {featuredBlog.views > 0 && (
                                        <>
                                            <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                                            <span>{featuredBlog.views} Views</span>
                                        </>
                                    )}
                                    <div className="w-6 md:w-8 h-[1px] bg-white/20"></div>
                                    <span className="truncate max-w-[120px] sm:max-w-none">By {featuredBlog.author?.name || 'Editorial'}</span>
                                </div>
                                <h2 className="text-3xl sm:text-4xl md:text-6xl font-light serif text-white leading-tight">
                                    {featuredBlog.title}
                                </h2>
                                <p className="hidden sm:block text-base md:text-lg font-light text-white/70 max-w-xl line-clamp-2 italic">
                                    {featuredBlog.excerpt}
                                </p>
                                <div className="pt-2 md:pt-4">
                                    <div className="inline-flex items-center gap-3 md:gap-4 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-white group-hover:gap-6 transition-all">
                                        Read feature
                                        <FiArrowRight size={14} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            )}

            {/* Content Grid */}
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20">
                {isInitialLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-20 md:gap-y-32">
                        {[1, 2, 4].map((i) => (
                            <div key={i} className="animate-pulse space-y-6">
                                <div className="aspect-[16/10] bg-gray-100 rounded-sm"></div>
                                <div className="h-4 bg-gray-100 w-1/4"></div>
                                <div className="h-8 bg-gray-100 w-3/4"></div>
                                <div className="h-20 bg-gray-100 w-full"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {listBlogs.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-20 md:gap-y-32">
                                {listBlogs.map((blog, index) => (
                                    <motion.article
                                        key={blog._id}
                                        initial={{ opacity: 0, y: 40 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: "-100px" }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                        className="group flex flex-col"
                                    >
                                        <Link href={`/journal/${blog.slug}`} className="block relative mb-8 md:mb-10 px-2 sm:px-0">
                                            <span className="absolute -top-4 md:-top-10 -left-2 md:-left-6 text-[40px] md:text-[80px] font-light serif text-gray-100 opacity-0 sm:group-hover:opacity-100 group-hover:-translate-y-4 transition-all duration-1000 select-none z-0">
                                                {(index + 2).toString().padStart(2, '0')}
                                            </span>
                                            {/* ... rest of the article content unchanged ... */}
                                            <div className="relative aspect-[16/10] overflow-hidden bg-gray-50 p-2 md:p-4 border border-gray-100 group-hover:border-black/5 transition-colors duration-700 z-10 shadow-sm">
                                                <div className="w-full h-full overflow-hidden relative">
                                                    {blog.image ? (
                                                        <img
                                                            src={blog.image}
                                                            alt={blog.title}
                                                            className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-white/20 serif italic text-xs">
                                                            Ocean Gem
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="absolute top-4 md:top-8 -right-1 sm:-right-4 bg-black text-white px-3 md:px-4 py-1.5 md:py-2 text-[7px] md:text-[8px] font-bold uppercase tracking-[0.3em] rotate-90 origin-bottom-right z-20 shadow-xl whitespace-nowrap">
                                                {blog.createdAt && formatDate(blog.createdAt)}
                                            </div>
                                        </Link>

                                        <div className="pl-4 md:pl-6 border-l border-gray-100 group-hover:border-black transition-colors duration-700">
                                            <div className="flex items-center justify-between mb-3 md:mb-4">
                                                <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-[#C5A059]">
                                                    {blog.tags?.[0] || 'Perspective'} — By {blog.author?.name || 'Editorial'}
                                                </p>
                                                {blog.views > 0 && (
                                                    <span className="text-[8px] md:text-[9px] text-gray-300 font-bold uppercase tracking-widest">{blog.views} Views</span>
                                                )}
                                            </div>

                                            <Link href={`/journal/${blog.slug}`}>
                                                <h2 className="text-2xl md:text-4xl font-light serif text-gray-900 leading-tight mb-4 md:mb-6 hover:text-gray-600 transition-colors">
                                                    {blog.title}
                                                </h2>
                                            </Link>

                                            <p className="text-xs md:text-sm font-light text-gray-500 leading-relaxed mb-6 md:mb-8 max-w-lg line-clamp-2 italic">
                                                {blog.excerpt}
                                            </p>

                                            <Link
                                                href={`/journal/${blog.slug}`}
                                                className="group/link inline-flex items-center gap-3 md:gap-4 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] text-black"
                                            >
                                                Explore Article
                                                <span className="w-8 md:w-12 h-[1px] bg-black/10 group-hover/link:w-16 md:group-hover/link:w-20 group-hover/link:bg-black transition-all duration-500"></span>
                                            </Link>
                                        </div>
                                    </motion.article>
                                ))}
                            </div>
                        ) : (
                            !isLoading && !featuredBlog && (
                                <div className="py-20 md:py-40 text-center border-t border-b border-gray-100">
                                    <p className="text-gray-400 font-light italic serif text-xl md:text-2xl px-6 text-balance">The collection is currently being curated.</p>
                                </div>
                            )
                        )}

                        {/* Pagination UI - Replaced with Infinite Scroll message */}
                        {page < metadata.pages && (
                            <div className="mt-20 md:mt-32 flex justify-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 border-2 border-[#C5A059]/30 border-t-[#C5A059] rounded-full animate-spin"></div>
                                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Loading more stories</span>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>


        </div>
    );
}
