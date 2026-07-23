'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useBlogStore } from '@/lib/store/useBlogStore';
import { getBlogPlaceholder } from '@/lib/image-utils';
import { useTranslation } from '@/hooks/useTranslation';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';
import { motion } from 'framer-motion';

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
    const { blogs, isLoading, metadata, fetchBlogs } = useBlogStore();
    const { t, locale } = useTranslation();
    
    const [activeFilter, setActiveFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    const variant = sectionData?.variant || 'editorial';
    const limit = sectionData?.itemsPerPage || 10;

    useEffect(() => {
        const loadInitialBlogs = async () => {
            setIsInitialLoading(true);
            await fetchBlogs({ page: 1, limit });
            setIsInitialLoading(false);
        };
        loadInitialBlogs();
    }, [fetchBlogs, limit]);

    const loadMore = async () => {
        if (isLoading || page >= (metadata?.pages || 0)) return;
        const nextPage = page + 1;
        setPage(nextPage);
        await fetchBlogs({ page: nextPage, limit });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
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
    
    const renderAuthorName = (author: unknown) => {
        if (!author) return t('journal.fallbackAuthor');
        if (typeof author === 'string') return author;
        if (typeof author === 'object' && author !== null && 'name' in author) {
            const name = (author as { name?: unknown }).name;
            if (typeof name === 'string' && name.trim()) return name;
        }
        return t('journal.fallbackAuthor');
    };

    const featuredBlog = blogs.length > 0 ? blogs[0] : null;
    const listBlogs = variant === 'editorial' && featuredBlog ? blogs.slice(1) : blogs;

    // --- Render Variations ---

    const renderEditorial = () => (
        <div className="space-y-20 md:space-y-28">
            {/* Featured Hero */}
            {featuredBlog && (
                <div className="animate-in fade-in zoom-in-95 duration-1000">
                    <Link
                        href={`/journal/${featuredBlog.slug}`}
                        className="group relative block min-h-[520px] overflow-hidden rounded-[2rem] bg-foreground/5 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.45)] md:aspect-[16/8] md:min-h-[560px]"
                    >
                        {featuredBlog.image && (
                            <Image
                                src={featuredBlog.image}
                                alt={featuredBlog.title}
                                fill
                                priority
                                className="object-cover transition-transform duration-[2s] ease-out group-hover:scale-105"
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/10 transition-opacity duration-700 group-hover:opacity-95" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/15" />

                        <div className="absolute inset-0 z-10 flex items-end p-6 sm:p-10 md:p-14 lg:p-16">
                            <div className="w-full max-w-4xl">
                                <div className="mb-6 flex flex-wrap items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
                                    <span className="rounded-full border border-white/25 bg-white/15 px-4 py-2 text-white backdrop-blur-md">
                                        {t('journal.featured')}
                                    </span>
                                    <span>{formatDate(featuredBlog.createdAt)}</span>
                                    <span className="h-1 w-1 rounded-full bg-white/50" />
                                    <span>{t('journal.by')} {renderAuthorName(featuredBlog.author)}</span>
                                </div>

                                <h2 className="max-w-[17ch] text-balance font-heading text-[clamp(2.25rem,5vw,4.75rem)] font-medium leading-[0.98] tracking-[-0.035em] text-white drop-shadow-sm">
                                    {featuredBlog.title}
                                </h2>

                                <p className="mt-6 hidden max-w-2xl text-sm font-normal leading-7 text-white/75 sm:line-clamp-2 sm:block md:text-base">
                                    {featuredBlog.excerpt}
                                </p>

                                <div className="mt-8">
                                    <div className="inline-flex items-center gap-3 rounded-full bg-white px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-black shadow-xl transition-all duration-300 group-hover:gap-5 group-hover:bg-primary group-hover:text-white">
                                        {t('journal.readFeature')}
                                        <FiArrowRight size={15} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            )}

            {/* Grid List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-32">
                {listBlogs.map((blog) => (
                    <motion.article
                        key={blog._id}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="group"
                    >
                        <Link href={`/journal/${blog.slug}`} className="block relative mb-10">
                             <div className="relative aspect-[16/10] overflow-hidden bg-foreground/5 p-4 border border-foreground/10 group-hover:border-foreground/20 transition-all duration-700 shadow-sm">
                                <Image
                                    src={blog.image || getBlogPlaceholder()}
                                    alt={blog.title}
                                    fill
                                    className="object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                                />
                                <div className="absolute top-8 -right-4 bg-foreground text-background px-4 py-2 text-[8px] font-bold uppercase tracking-[0.3em] rotate-90 origin-bottom-right z-20 shadow-xl">
                                    {formatDate(blog.createdAt)}
                                </div>
                             </div>
                        </Link>
                        <div className="pl-6 border-l border-foreground/10 group-hover:border-foreground transition-colors duration-700">
                             <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-4">
                                {blog.tags?.[0] || t('journal.fallbackTag')} — {t('journal.by')} {renderAuthorName(blog.author)}
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
                                {t('journal.exploreArticle')} <span className="w-12 h-[1px] bg-foreground/10 group-hover/link:w-20 group-hover/link:bg-foreground transition-all duration-500"></span>
                             </Link>
                        </div>
                    </motion.article>
                ))}
            </div>
        </div>
    );

    const renderMagazine = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
            {blogs.map((blog, _idx) => (
                <motion.div
                    key={blog._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: _idx * 0.1 }}
                >
                    <Link href={`/journal/${blog.slug}`} className="group block space-y-6">
                        <div className="aspect-[3/4] overflow-hidden bg-foreground/5 relative">
                            <Image 
                                src={blog.image || getBlogPlaceholder()} 
                                alt={blog.title}
                                fill
                                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                        </div>
                        <div className="space-y-4 px-2">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-primary">
                                {blog.tags?.[0] || t('journal.story')}
                            </span>
                            <h3 className="text-2xl font-light serif text-foreground leading-tight group-hover:text-foreground/60 transition-colors">
                                {blog.title}
                            </h3>
                            <div className="flex items-center justify-between pt-4 border-t border-foreground/5 text-[8px] font-bold uppercase tracking-widest text-foreground/40">
                                <span>{renderAuthorName(blog.author)}</span>
                                <span>{formatDate(blog.createdAt)}</span>
                            </div>
                        </div>
                    </Link>
                </motion.div>
            ))}
        </div>
    );

    const renderMinimal = () => (
        <div className="max-w-4xl mx-auto space-y-16">
            {blogs.map((blog, _idx) => (
                <motion.article 
                    key={blog._id}
                    className="group flex flex-col md:flex-row md:items-center justify-between gap-8 pb-16 border-b border-foreground/10"
                >
                    <div className="flex-1 space-y-4">
                        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-foreground/40">
                            {formatDate(blog.createdAt)} — {blog.tags?.[0] || t('journal.fallbackTag')}
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
                    <Link href={`/journal/${blog.slug}`} className="w-24 h-24 md:w-32 md:h-32 shrink-0 bg-foreground/5 overflow-hidden rounded-full border border-foreground/10 group-hover:border-primary transition-all duration-700 relative">
                        <Image src={blog.image || getBlogPlaceholder()} alt={blog.title} fill className="object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                    </Link>
                </motion.article>
            ))}
        </div>
    );

    const renderZigZag = () => (
        <div className="space-y-32 md:space-y-48">
            {blogs.map((blog, _idx) => (
                <motion.article 
                    key={blog._id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`flex flex-col ${_idx % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 md:gap-24`}
                >
                    <div className="w-full md:w-1/2">
                        <Link href={`/journal/${blog.slug}`} className="group block relative aspect-[4/5] md:aspect-[3/4] overflow-hidden">
                            <Image 
                                src={blog.image || getBlogPlaceholder()} 
                                alt={blog.title}
                                fill
                                className="object-cover transition-transform duration-[2s] group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-colors duration-700"></div>
                        </Link>
                    </div>
                    <div className="w-full md:w-1/2 space-y-8">
                        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/30">
                            <span>{formatDate(blog.createdAt)}</span>
                            <div className="w-12 h-[1px] bg-foreground/10"></div>
                            <span>{blog.tags?.[0] || t('journal.fallbackTag').toUpperCase()}</span>
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
                            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground">{t('journal.readPerspective')}</span>
                            <div className="w-12 h-12 rounded-full border border-foreground/10 flex items-center justify-center group-hover/btn:bg-foreground group-hover/btn:text-background transition-all duration-500">
                                <FiArrowRight size={16} />
                            </div>
                        </Link>
                    </div>
                </motion.article>
            ))}
        </div>
    );

    const renderMasonry = () => (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {blogs.map((blog, _idx) => (
                <motion.div 
                    key={blog._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="break-inside-avoid mb-8 group"
                >
                    <Link href={`/journal/${blog.slug}`} className="block bg-foreground/5 border border-foreground/10 p-4 space-y-6 hover:shadow-2xl transition-all duration-700">
                        <div className="relative overflow-hidden">
                            <Image 
                                src={blog.image || getBlogPlaceholder()} 
                                alt={blog.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-1000"
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

    const renderGridCompact = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {blogs.map((blog) => (
                <Link key={blog._id} href={`/journal/${blog.slug}`} className="group space-y-6">
                    <div className="aspect-square overflow-hidden bg-foreground/5 flex items-center justify-center p-2 relative">
                         <Image 
                            src={blog.image || getBlogPlaceholder()} 
                            alt={blog.title}
                            fill
                            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
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
            <div className="mb-14 flex flex-col justify-between gap-10 border-b border-foreground/10 pb-10 md:mb-16 md:flex-row md:items-end">
                <div className="max-w-2xl">
                    <span className="mb-4 block text-[10px] font-bold uppercase tracking-[0.32em] text-primary">
                        {sectionData?.subtitle || t('journal.subtitle')}
                    </span>
                    <h1 className="mb-5 max-w-[14ch] text-balance font-heading text-4xl font-medium leading-[0.98] tracking-[-0.04em] text-foreground sm:text-5xl md:text-7xl">
                        {sectionData?.title || t('journal.title')}
                    </h1>
                    <p className="max-w-xl text-base font-normal leading-7 text-foreground/55 md:text-lg">
                        {sectionData?.description || t('journal.tagline')}
                    </p>
                </div>
                
                <div className="flex w-fit flex-wrap gap-1 rounded-full border border-foreground/10 bg-foreground/[0.03] p-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/50">
                    {['all', 'new', 'best-read'].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => {
                                setActiveFilter(filter);
                                setPage(1);
                            }}
                            className={`rounded-full px-4 py-2.5 transition-all ${
                                activeFilter === filter
                                    ? 'bg-foreground text-background shadow-sm'
                                    : 'hover:bg-background hover:text-foreground'
                            }`}
                        >
                            {t(`common.${filter}` as Parameters<typeof t>[0])}
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
                    {variant === 'editorial' && renderEditorial()}
                    {variant === 'magazine' && renderMagazine()}
                    {variant === 'minimal' && renderMinimal()}
                    {variant === 'zigzag' && renderZigZag()}
                    {variant === 'masonry' && renderMasonry()}
                    {variant === 'grid_compact' && renderGridCompact()}

                    {blogs.length === 0 && !isLoading && (
                        <div className="py-40 text-center italic text-foreground/30 serif text-2xl">
                            {t('journal.empty')}
                        </div>
                    )}

                    {page < (metadata?.pages || 0) && (
                        <div className="mt-32 flex justify-center">
                            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/40">
                                <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                {t('journal.loadingMore')}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
