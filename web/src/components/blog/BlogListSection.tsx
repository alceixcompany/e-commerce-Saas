'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchBlogs } from '@/lib/slices/blogSlice';
import { getBlogPlaceholder } from '@/lib/image-utils';
import Link from 'next/link';
import { FiArrowRight, FiSearch } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface BlogListSectionProps {
    instanceId?: string;
    data?: {
        title?: string;
        subtitle?: string;
        description?: string;
        variant?: 'editorial' | 'magazine' | 'minimal' | 'zigzag' | 'masonry' | 'grid_compact';
        itemsPerPage?: number;
    };
}

export default function BlogListSection({ data: sectionData }: BlogListSectionProps) {
    const dispatch = useAppDispatch();
    const { blogs, loading, metadata } = useAppSelector((state) => state.blog);
    const isLoading = loading.fetchList;
    
    const [activeFilter, setActiveFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    const variant = sectionData?.variant || 'editorial';
    const limit = sectionData?.itemsPerPage || 10;

    useEffect(() => {
        const loadInitialBlogs = async () => {
            setIsInitialLoading(true);
            await dispatch(fetchBlogs({ page: 1, limit, sort: activeFilter }));
            setIsInitialLoading(false);
        };
        loadInitialBlogs();
    }, [dispatch, activeFilter, limit]);

    const loadMore = async () => {
        if (isLoading || page >= metadata.pages) return;
        const nextPage = page + 1;
        setPage(nextPage);
        await dispatch(fetchBlogs({ page: nextPage, limit, sort: activeFilter }));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 100) {
            loadMore();
        }
    };

    const featuredBlog = blogs.length > 0 ? blogs[0] : null;
    const listBlogs = variant === 'editorial' && featuredBlog ? blogs.slice(1) : blogs;

    // --- Render Variations ---

    const RenderEditorial = () => (
        <div className="space-y-20 md:space-y-40">
            {/* Featured Hero */}
            {featuredBlog && (
                <div className="animate-in fade-in zoom-in-95 duration-1000">
                    <Link href={`/journal/${featuredBlog.slug}`} className="group block relative overflow-hidden bg-foreground/5 aspect-[4/5] sm:aspect-[4/3] md:aspect-[21/9] min-h-[400px]">
                        {featuredBlog.image && (
                            <img
                                src={featuredBlog.image}
                                alt={featuredBlog.title}
                                className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110"
                            />
                        )}
                        <div className="absolute inset-0 bg-background/30 group-hover:bg-background/20 transition-colors duration-700"></div>
                        
                        <div className="absolute top-10 left-10 z-20">
                            <span className="bg-background text-foreground px-6 py-2 text-[9px] font-bold uppercase tracking-[0.3em] shadow-2xl">
                                Featured Story
                            </span>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-10 md:p-20 bg-gradient-to-t from-background/90 via-background/20 to-transparent">
                            <div className="max-w-3xl space-y-6">
                                <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-widest text-foreground/70">
                                    <span>{formatDate(featuredBlog.createdAt)}</span>
                                    <div className="w-8 h-[1px] bg-foreground/20"></div>
                                    <span>By {featuredBlog.author?.name || 'Editorial'}</span>
                                </div>
                                <h2 className="text-4xl md:text-6xl font-light serif text-foreground leading-tight">
                                    {featuredBlog.title}
                                </h2>
                                <p className="hidden sm:block text-lg font-light text-foreground/70 max-w-xl line-clamp-2 italic">
                                    {featuredBlog.excerpt}
                                </p>
                                <div className="pt-4">
                                    <div className="inline-flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.3em] text-foreground group-hover:gap-6 transition-all">
                                        Read feature <FiArrowRight size={14} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            )}

            {/* Grid List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-32">
                {listBlogs.map((blog, index) => (
                    <motion.article
                        key={blog._id}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="group"
                    >
                        <Link href={`/journal/${blog.slug}`} className="block relative mb-10">
                             <div className="relative aspect-[16/10] overflow-hidden bg-foreground/5 p-4 border border-foreground/10 group-hover:border-foreground/20 transition-all duration-700 shadow-sm">
                                <img
                                    src={blog.image || getBlogPlaceholder()}
                                    alt={blog.title}
                                    className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                                />
                                <div className="absolute top-8 -right-4 bg-foreground text-background px-4 py-2 text-[8px] font-bold uppercase tracking-[0.3em] rotate-90 origin-bottom-right z-20 shadow-xl">
                                    {formatDate(blog.createdAt)}
                                </div>
                             </div>
                        </Link>
                        <div className="pl-6 border-l border-foreground/10 group-hover:border-foreground transition-colors duration-700">
                             <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-4">
                                {blog.tags?.[0] || 'Perspective'} — By {blog.author?.name || 'Editorial'}
                             </p>
                             <Link href={`/journal/${blog.slug}`}>
                                <h3 className="text-3xl font-light serif text-foreground leading-tight mb-4 hover:text-foreground/60 transition-colors">
                                    {blog.title}
                                </h3>
                             </Link>
                             <p className="text-sm font-light text-foreground/50 leading-relaxed italic mb-8 line-clamp-2">
                                {blog.excerpt}
                             </p>
                             <Link href={`/journal/${blog.slug}`} className="group/link inline-flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.4em] text-foreground">
                                Explore Article <span className="w-12 h-[1px] bg-foreground/10 group-hover/link:w-20 group-hover/link:bg-foreground transition-all duration-500"></span>
                             </Link>
                        </div>
                    </motion.article>
                ))}
            </div>
        </div>
    );

    const RenderMagazine = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
            {blogs.map((blog, idx) => (
                <motion.div
                    key={blog._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                >
                    <Link href={`/journal/${blog.slug}`} className="group block space-y-6">
                        <div className="aspect-[3/4] overflow-hidden bg-foreground/5">
                            <img 
                                src={blog.image || getBlogPlaceholder()} 
                                alt={blog.title}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                        </div>
                        <div className="space-y-4 px-2">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-primary">
                                {blog.tags?.[0] || 'Story'}
                            </span>
                            <h3 className="text-2xl font-light serif text-foreground leading-tight group-hover:text-foreground/60 transition-colors">
                                {blog.title}
                            </h3>
                            <div className="flex items-center justify-between pt-4 border-t border-foreground/5 text-[8px] font-bold uppercase tracking-widest text-foreground/40">
                                <span>{blog.author?.name}</span>
                                <span>{formatDate(blog.createdAt)}</span>
                            </div>
                        </div>
                    </Link>
                </motion.div>
            ))}
        </div>
    );

    const RenderMinimal = () => (
        <div className="max-w-4xl mx-auto space-y-16">
            {blogs.map((blog) => (
                <motion.article 
                    key={blog._id}
                    className="group flex flex-col md:flex-row md:items-center justify-between gap-8 pb-16 border-b border-foreground/10"
                >
                    <div className="flex-1 space-y-4">
                        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-foreground/40">
                            {formatDate(blog.createdAt)} — {blog.tags?.[0] || 'Article'}
                        </span>
                        <Link href={`/journal/${blog.slug}`}>
                            <h3 className="text-3xl md:text-4xl font-light serif text-foreground group-hover:text-primary transition-colors">
                                {blog.title}
                            </h3>
                        </Link>
                        <p className="text-sm font-light text-foreground/50 max-w-xl italic">
                            {blog.excerpt}
                        </p>
                    </div>
                    <Link href={`/journal/${blog.slug}`} className="w-24 h-24 md:w-32 md:h-32 shrink-0 bg-foreground/5 overflow-hidden rounded-full border border-foreground/10 group-hover:border-primary transition-all duration-700">
                        <img src={blog.image || getBlogPlaceholder()} alt="" className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                    </Link>
                </motion.article>
            ))}
        </div>
    );

    const RenderZigZag = () => (
        <div className="space-y-32 md:space-y-48">
            {blogs.map((blog, idx) => (
                <motion.article 
                    key={blog._id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`flex flex-col ${idx % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 md:gap-24`}
                >
                    <div className="w-full md:w-1/2">
                        <Link href={`/journal/${blog.slug}`} className="group block relative aspect-[4/5] md:aspect-[3/4] overflow-hidden">
                            <img 
                                src={blog.image || getBlogPlaceholder()} 
                                alt={blog.title}
                                className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-colors duration-700"></div>
                        </Link>
                    </div>
                    <div className="w-full md:w-1/2 space-y-8">
                        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/30">
                            <span>{formatDate(blog.createdAt)}</span>
                            <div className="w-12 h-[1px] bg-foreground/10"></div>
                            <span>{blog.tags?.[0] || 'STORY'}</span>
                        </div>
                        <Link href={`/journal/${blog.slug}`}>
                            <h2 className="text-4xl md:text-6xl font-light serif text-foreground leading-[1.1] hover:text-primary transition-colors">
                                {blog.title}
                            </h2>
                        </Link>
                        <p className="text-lg font-light text-foreground/50 leading-relaxed italic max-w-lg">
                            {blog.excerpt}
                        </p>
                        <Link href={`/journal/${blog.slug}`} className="inline-flex items-center gap-6 group/btn">
                            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground">Read perspective</span>
                            <div className="w-12 h-12 rounded-full border border-foreground/10 flex items-center justify-center group-hover/btn:bg-foreground group-hover/btn:text-background transition-all duration-500">
                                <FiArrowRight size={16} />
                            </div>
                        </Link>
                    </div>
                </motion.article>
            ))}
        </div>
    );

    const RenderMasonry = () => (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {blogs.map((blog, idx) => (
                <motion.div 
                    key={blog._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="break-inside-avoid mb-8 group"
                >
                    <Link href={`/journal/${blog.slug}`} className="block bg-foreground/5 border border-foreground/10 p-4 space-y-6 hover:shadow-2xl transition-all duration-700">
                        <div className="relative overflow-hidden">
                            <img 
                                src={blog.image || getBlogPlaceholder()} 
                                alt={blog.title}
                                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-1000"
                            />
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-widest text-foreground/40">
                                <span>{formatDate(blog.createdAt)}</span>
                                <span>{blog.tags?.[0]}</span>
                            </div>
                            <h3 className="text-2xl font-light serif leading-tight">
                                {blog.title}
                            </h3>
                            <p className="text-xs font-light text-foreground/50 line-clamp-3 italic">
                                {blog.excerpt}
                            </p>
                        </div>
                    </Link>
                </motion.div>
            ))}
        </div>
    );

    const RenderGridCompact = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {blogs.map((blog) => (
                <Link key={blog._id} href={`/journal/${blog.slug}`} className="group space-y-6">
                    <div className="aspect-square overflow-hidden bg-foreground/5 flex items-center justify-center p-2">
                         <img 
                            src={blog.image || getBlogPlaceholder()} 
                            alt={blog.title}
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                        />
                    </div>
                    <div className="space-y-2">
                        <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-foreground/40">
                            {formatDate(blog.createdAt)}
                        </p>
                        <h4 className="text-xl font-light serif text-foreground leading-tight group-hover:text-primary transition-colors">
                            {blog.title}
                        </h4>
                    </div>
                </Link>
            ))}
        </div>
    );

    return (
        <div className="max-w-[1440px] mx-auto px-6 lg:px-20 py-24 md:py-32" onScroll={handleScroll}>
            {/* Filter Navigation */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 border-b border-foreground/10 pb-12 gap-10">
                <div className="max-w-2xl">
                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary mb-6 block">
                        {sectionData?.subtitle || 'Reflections & Perspectives'}
                    </span>
                    <h1 className="text-5xl md:text-8xl font-light serif mb-8 tracking-tighter text-foreground leading-[0.9]">
                        {sectionData?.title || 'The Journal'}
                    </h1>
                    <p className="text-lg md:text-xl font-light text-foreground/50 max-w-lg leading-relaxed italic">
                        {sectionData?.description || 'A curated space for the aesthetics of modern living and jewelry craft.'}
                    </p>
                </div>
                
                <div className="flex gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">
                    {['all', 'new', 'best-read'].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => {
                                setActiveFilter(filter);
                                setPage(1);
                            }}
                            className={`${activeFilter === filter ? 'text-foreground border-b border-foreground pb-1' : 'hover:text-foreground transition-colors'}`}
                        >
                            {filter.replace('-', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Rendering */}
            {isInitialLoading ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="animate-pulse space-y-6">
                            <div className="aspect-video bg-foreground/5"></div>
                            <div className="h-4 bg-foreground/5 w-1/4"></div>
                            <div className="h-10 bg-foreground/5 w-3/4"></div>
                        </div>
                    ))}
                 </div>
            ) : (
                <>
                    {variant === 'editorial' && <RenderEditorial />}
                    {variant === 'magazine' && <RenderMagazine />}
                    {variant === 'minimal' && <RenderMinimal />}
                    {variant === 'zigzag' && <RenderZigZag />}
                    {variant === 'masonry' && <RenderMasonry />}
                    {variant === 'grid_compact' && <RenderGridCompact />}

                    {blogs.length === 0 && !isLoading && (
                        <div className="py-40 text-center italic text-foreground/30 serif text-2xl">
                            The journal is being curated. Please return shortly.
                        </div>
                    )}

                    {page < metadata.pages && (
                        <div className="mt-32 flex justify-center">
                            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/40">
                                <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                Loading more stories
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
