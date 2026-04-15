'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowRight, FiClock } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchBlogs } from '@/lib/slices/blogSlice';
import { useTranslation } from '@/hooks/useTranslation';

import * as Sections from '@/types/sections';

export default function HomeJournal({ instanceId, data: passedData }: { instanceId?: string, data?: Sections.HomeJournalData }) {
    const dispatch = useAppDispatch();
    const { blogs, loading: blogLoading } = useAppSelector((state) => state.blog);
    const isLoading = blogLoading.fetchList;
    const { homeSettings } = useAppSelector((state) => state.content);
    const { instances } = useAppSelector((state) => state.component);
    const { t, locale } = useTranslation();
 
    const instance = instanceId ? instances.find(i => i._id === instanceId) : null;
    const instanceData = passedData || (instance?.data as Sections.HomeJournalData);

    useEffect(() => {
        if (blogs.length < 3) {
            dispatch(fetchBlogs({ limit: 3 }));
        }
    }, [dispatch, blogs.length]);

    if (isLoading && blogs.length === 0) return null;
    if (blogs.length === 0) return null;

    // We take up to 3 posts for display
    const latestPosts = blogs.slice(0, 3);
    const layout = instanceData?.journalLayout || homeSettings?.journalLayout || 'grid';

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const renderGrid = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {latestPosts.map((post, idx) => (
                <motion.article
                    key={post._id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    className="group cursor-pointer flex flex-col"
                >
                    <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 bg-muted/80">
                        <Image
                            src={post.image || '/image/alceix/hero.png'}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-[2s] group-hover:scale-105"
                        />
                    </div>
                    <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                        <span className="flex items-center gap-1.5"><FiClock size={12} /> {formatDate(post.publishedAt || post.createdAt)}</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-heading text-foreground mb-4 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                        <Link href={`/journal/${post.slug}`}>
                            {post.title}
                        </Link>
                    </h3>
                    <p className="text-sm text-foreground/50 line-clamp-3 mb-6 flex-1">
                        {post.excerpt}
                    </p>
                    <Link href={`/journal/${post.slug}`} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest border-b border-foreground pb-1 self-start hover:text-primary hover:border-primary transition-colors">
                        {t('journal.readStory')} <FiArrowRight />
                    </Link>
                </motion.article>
            ))}
        </div>
    );

    const renderList = () => (
        <div className="flex flex-col gap-10 max-w-4xl mx-auto">
            {latestPosts.map((post, idx) => (
                <motion.article
                    key={post._id}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    className="group flex flex-col md:flex-row gap-8 items-center border-b border-border pb-10 last:border-0"
                >
                    <div className="w-full md:w-[40%] aspect-[3/2] rounded-2xl overflow-hidden bg-muted/80 shrink-0 relative">
                        <Image
                            src={post.image || '/image/alceix/hero.png'}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-[2s] group-hover:scale-105"
                        />
                    </div>
                    <div className="w-full md:w-[60%] flex flex-col justify-center">
                        <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
                            <span className="flex items-center gap-1.5"><FiClock size={12} /> {formatDate(post.publishedAt || post.createdAt)}</span>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-heading text-foreground mb-5 leading-tight group-hover:text-primary transition-colors">
                            <Link href={`/journal/${post.slug}`}>
                                {post.title}
                            </Link>
                        </h3>
                        <p className="text-sm text-foreground/50 line-clamp-3 mb-6 leading-relaxed">
                            {post.excerpt}
                        </p>
                        <Link href={`/journal/${post.slug}`} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors">
                            {t('journal.readFullStory')} <FiArrowRight />
                        </Link>
                    </div>
                </motion.article>
            ))}
        </div>
    );

    const renderMagazine = () => {
        if (latestPosts.length === 0) return null;
        const mainPost = latestPosts[0];
        const sidePosts = latestPosts.slice(1);

        return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                {/* Main Post */}
                <motion.article
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="lg:col-span-7 group cursor-pointer"
                >
                    <div className="relative w-full aspect-[4/3] rounded-[2rem] overflow-hidden mb-8 bg-muted/80">
                        <Image
                            src={mainPost.image || '/image/alceix/hero.png'}
                            alt={mainPost.title}
                            fill
                            className="object-cover transition-transform duration-[2s] group-hover:scale-105"
                        />
                    </div>
                    <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
                        <span className="flex items-center gap-1.5"><FiClock size={12} /> {formatDate(mainPost.publishedAt || mainPost.createdAt)}</span>
                    </div>
                    <h3 className="text-3xl md:text-5xl font-heading text-foreground mb-6 leading-tight group-hover:text-primary transition-colors">
                        <Link href={`/journal/${mainPost.slug}`}>{mainPost.title}</Link>
                    </h3>
                    <p className="text-base text-foreground/50 line-clamp-3 mb-8 leading-relaxed max-w-2xl">
                        {mainPost.excerpt}
                    </p>
                    <Link href={`/journal/${mainPost.slug}`} className="inline-flex items-center gap-3 bg-primary text-background border border-primary px-8 py-4 text-[10px] md:text-xs tracking-[0.2em] font-bold uppercase hover:bg-transparent hover:text-primary transition-colors">
                        {t('journal.readFeaturedStory')} <FiArrowRight />
                    </Link>
                </motion.article>

                {/* Side Posts */}
                <div className="lg:col-span-5 flex flex-col gap-8 md:gap-10">
                    {sidePosts.map((post, idx) => (
                        <motion.article
                            key={post._id}
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: (idx + 1) * 0.1 }}
                            viewport={{ once: true }}
                            className="group cursor-pointer flex flex-col sm:flex-row lg:flex-col gap-6"
                        >
                            <div className="w-full sm:w-1/2 lg:w-full aspect-[16/9] rounded-2xl overflow-hidden bg-muted/80 shrink-0 relative">
                                <Image
                                    src={post.image || '/image/alceix/hero.png'}
                                    alt={post.title}
                                    fill
                                    className="object-cover transition-transform duration-[2s] group-hover:scale-105"
                                />
                            </div>
                            <div className="w-full sm:w-1/2 lg:w-full flex flex-col justify-center">
                                <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground/80 mb-3">
                                    <span className="flex items-center gap-1.5"><FiClock size={12} /> {formatDate(post.publishedAt || post.createdAt)}</span>
                                </div>
                                <h3 className="text-xl md:text-2xl font-heading text-foreground mb-3 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                                    <Link href={`/journal/${post.slug}`}>{post.title}</Link>
                                </h3>
                                <p className="text-sm text-foreground/40 line-clamp-2 mb-4">
                                    {post.excerpt}
                                </p>
                            </div>
                        </motion.article>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <section className="w-full bg-background">
            <div className="max-w-[1440px] mx-auto px-6 lg:px-20 py-16 md:py-24">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="max-w-2xl"
                    >
                        <h2 className="text-3xl md:text-5xl font-light font-heading text-foreground mb-4 tracking-tight">
                            {t('journal.title')}
                        </h2>
                        <p className="text-foreground/50 text-sm md:text-base leading-relaxed">
                            {t('journal.subtitle')}
                        </p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        viewport={{ once: true }}
                    >
                        <Link href="/journal" className="inline-flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest border-b-2 border-transparent pb-1 hover:border-foreground transition-colors shrink-0">
                            {t('journal.viewAll')} <FiArrowRight size={14} />
                        </Link>
                    </motion.div>
                </div>

                {layout === 'grid' && renderGrid()}
                {layout === 'list' && renderList()}
                {layout === 'magazine' && renderMagazine()}
            </div>
        </section>
    );
}
