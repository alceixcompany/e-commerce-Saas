import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchBlogBySlug, fetchBlogs } from '@/lib/slices/blogSlice';
import { FiCalendar, FiUser, FiArrowLeft, FiShare2, FiArrowRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getBlogPlaceholder } from '@/lib/image-utils';
import { Blog } from '@/types/blog';
import { useTranslation } from '@/hooks/useTranslation';

interface BlogDetailSectionProps {
    instanceId?: string;
    data?: {
        variant?: 'editorial' | 'focused' | 'wide' | 'immersive' | 'modern_sidebar' | 'minimalist';
        showRecommended?: boolean;
        recommendedTitle?: string;
    };
    extraData?: {
        slug: string;
    };
}

const MOCK_BLOG: Blog = {
    _id: 'mock-1',
    id: 'mock-1',
    title: 'The Art of Timeless Perspective',
    slug: 'mock-post',
    excerpt: 'Exploring the delicate balance between modern minimalism and classical heritage in contemporary jewelry design.',
    content: `
        <p class="lead">In a world driven by fleeting trends, the true essence of jewelry lies in its ability to transcend time. Our latest collection explores the intersection of artisan heritage and modern aesthetic principles.</p>
        
        <h3>The Philosophy of Design</h3>
        <p>Every piece tells a story of meticulous craftsmanship. From the initial sketch to the final polish, our artisans pour their soul into each creation. We believe that fine jewelry is a form of wearable art, a personal statement that evolves with its wearer. It's not just about the sparkle; it's about the connection between the object and the individual.</p>
        
        <blockquote>"Timelessness is not about ignoring the present, but rather about creating something that will always be relevant, regardless of the era."</blockquote>
        
        <p>The choice of materials is equally important. We source only the finest ethically-obtained gemstones and precious metals, ensuring that each piece not only looks stunning but also carries a legacy of responsibility.</p>
        
        <h3>Artisan Craftsmanship</h3>
        <p>Our workshop in the heart of the city remains a sanctuary for traditional techniques. We use centuries-old methods and combine them with modern precision tools to achieve a level of detail that machine-made jewelry simply cannot replicate.</p>
        
        <img src="/image/alceix/defaults/bracelet.png" alt="Craftsmanship Detail" class="my-12 rounded-3xl shadow-2xl" />
        
        <ul>
            <li>Hand-selected ethically sourced diamonds</li>
            <li>Recycled 18k solid gold</li>
            <li>Limited edition artisan collections</li>
        </ul>

        <p>As we move forward, our commitment remains the same: to create beauty that lasts a lifetime. We invite you to explore this new perspective on heritage and innovation.</p>
    `,
    image: '/image/alceix/defaults/bracelet.png',
    author: { _id: 'author-1', name: 'Editorial Team' },
    createdAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    isPublished: true,
    views: 0,
    tags: ['Heritage', 'Design', 'Ethics']
};

export default function BlogDetailSection({ data: sectionData, extraData }: BlogDetailSectionProps) {
    const slug = extraData?.slug;
    const searchParams = useSearchParams();
    const isPreview = searchParams.get('preview') === 'true';
    const dispatch = useAppDispatch();
    
    const { blog: reduxBlog, blogs, loading } = useAppSelector((state) => state.blog);
    const { t, i18n } = useTranslation();
    const isLoading = loading.fetchOne;

    // Use mock data if no slug is provided (editor preview) or if it's explicitly a dummy slug in preview
    const isDemoMode = !slug || slug === 'demo' || slug === 'mock-post';
    const blog = (isPreview && isDemoMode) ? MOCK_BLOG : reduxBlog;

    const variant = sectionData?.variant || 'editorial';
    const showRecommended = sectionData?.showRecommended !== false;

    useEffect(() => {
        // Prevent 404 errors in preview/demo mode by skipping fetch for mock slugs
        const isDemoSlug = slug === 'demo' || slug === 'mock-post';
        if (slug && !(isPreview && isDemoSlug)) {
            dispatch(fetchBlogBySlug(slug));
        }
        if (blogs.length === 0) {
            dispatch(fetchBlogs({ limit: 4 }));
        }
    }, [dispatch, slug, blogs.length, isPreview]);

    const recommendedBlogs = blogs
        .filter(b => b.slug !== slug)
        .slice(0, 3);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (isLoading && !blog) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
                <div className="w-12 h-12 border-b-2 border-primary rounded-full animate-spin"></div>
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/40">{t('journal.loading')}</span>
            </div>
        );
    }

    if (!blog && !isLoading) {
        return (
            <div className="py-40 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <span className="text-[120px] font-light serif text-foreground/5 block mb-8">404</span>
                <h1 className="text-4xl font-light serif text-foreground mb-6">{t('journal.error.title')}</h1>
                <p className="text-lg font-light text-foreground/40 italic mb-16">{t('journal.error.desc')}</p>
                <Link href="/journal" className="inline-flex items-center gap-6 text-[11px] font-bold uppercase tracking-[0.4em] text-foreground border-b border-foreground/20 pb-4 hover:border-foreground transition-all">
                    <FiArrowLeft /> {t('journal.error.btn')}
                </Link>
            </div>
        );
    }

    // After these checks, blog is definitely not null for the rest of the render
    const activeBlog = blog!;

    const renderEditorialHeader = () => (
        <div className="relative h-[80vh] min-h-[600px] w-full bg-zinc-900 overflow-hidden">
            {activeBlog.image && (
                <div className="absolute inset-0">
                    <Image
                        src={activeBlog.image}
                        alt={activeBlog.title}
                        fill
                        priority
                        className="object-cover opacity-70 scale-105 animate-subtle-zoom"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-background"></div>
                </div>
            )}
            <div className="relative h-full max-w-[1440px] mx-auto px-6 lg:px-20 flex flex-col justify-end pb-24">
                <div className="max-w-4xl">
                    <Link href="/journal" className="inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-white/70 hover:text-white transition-colors mb-16">
                        <FiArrowLeft size={16} /> {isPreview ? t('journal.previewMode') : t('journal.title')}
                    </Link>
                    <div className="flex items-center gap-8 text-[11px] font-bold uppercase tracking-[0.3em] text-white/50 mb-10">
                        <div className="flex items-center gap-3">
                            <FiCalendar size={16} /> {formatDate(activeBlog.createdAt)}
                        </div>
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        <div className="flex items-center gap-3">
                            <FiUser size={16} /> {activeBlog.author?.name || t('journal.fallbackAuthor')}
                        </div>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-light serif text-white leading-[0.9] mb-12 tracking-tighter">
                        {activeBlog.title}
                    </h1>
                    <p className="text-xl md:text-2xl font-light text-white/80 italic max-w-2xl leading-relaxed">
                        {activeBlog.excerpt}
                    </p>
                </div>
            </div>
        </div>
    );

    const renderFocusedHeader = () => (
        <div className="pt-20 md:pt-40 max-w-4xl mx-auto px-6 pb-20 text-center">
            <Link href="/journal" className="inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.4em] text-primary mb-16">
                <FiArrowLeft /> {t('journal.error.btn')}
            </Link>
            <div className="flex items-center justify-center gap-6 text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/40 mb-10">
                <span>{formatDate(activeBlog.createdAt)}</span>
                <div className="w-1 h-1 bg-foreground/20 rounded-full"></div>
                <span>{t('journal.by')} {activeBlog.author?.name || t('journal.fallbackAuthor')}</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-light serif text-foreground leading-tight mb-12">
                {activeBlog.title}
            </h1>
            <p className="text-xl font-light text-foreground/50 italic leading-relaxed max-w-2xl mx-auto mb-20 border-l-2 border-primary/20 pl-8 text-left">
                {activeBlog.excerpt}
            </p>
            {activeBlog.image && (
                <div className="aspect-video relative rounded-2xl overflow-hidden shadow-2xl">
                    <Image src={activeBlog.image} alt={activeBlog.title} fill className="object-cover" />
                </div>
            )}
        </div>
    );

    const renderImmersiveHeader = () => (
        <div className="relative h-screen w-full bg-black flex items-center justify-center p-6 md:p-20 overflow-hidden">
             {activeBlog.image && (
                <div className="absolute inset-0 opacity-60">
                    <Image src={activeBlog.image} alt="" fill className="object-cover animate-pulse-slow" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                </div>
            )}
            <div className="relative z-10 max-w-5xl text-center space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                <span className="text-[10px] font-bold uppercase tracking-[0.8em] text-primary">{t('journal.fallbackTag').toUpperCase()}</span>
                <h1 className="text-5xl md:text-9xl font-light serif text-white leading-tight tracking-tighter">
                   {activeBlog.title.split(' ').map((word, i) => (
                       <span key={i} className={i % 2 === 1 ? 'italic pl-2' : ''}>{word} </span>
                   ))}
                </h1>
                <div className="flex flex-col items-center gap-8">
                    <div className="w-px h-24 bg-gradient-to-b from-primary to-transparent"></div>
                    <div className="flex items-center gap-12 text-[9px] font-bold uppercase tracking-[0.4em] text-white/40">
                        <span>{formatDate(activeBlog.createdAt)}</span>
                        <span>{t('journal.writtenBy')} {activeBlog.author?.name || t('journal.fallbackAuthor')}</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderModernSidebarHeader = () => (
        <div className="max-w-[1440px] mx-auto px-6 lg:px-20 pt-40 md:pt-60 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                <div className="lg:col-span-8 space-y-10">
                     <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary block">{t('journal.title')}</span>
                     <h1 className="text-5xl md:text-8xl font-light serif text-foreground leading-[0.9] tracking-tighter">
                        {activeBlog.title}
                     </h1>
                     <div className="aspect-[21/9] rounded-2xl overflow-hidden shadow-xl border border-foreground/5 relative">
                        <Image src={activeBlog.image} alt="" fill className="object-cover" />
                     </div>
                </div>
                <div className="lg:col-span-4 flex flex-col justify-end pb-4 space-y-8 border-l border-foreground/5 pl-10">
                    <div className="space-y-4">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/30">{t('journal.curator')}</span>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center text-[10px] font-bold serif">AL</div>
                            <span className="text-lg font-light serif">{activeBlog.author?.name}</span>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/30">{t('journal.released')}</span>
                        <p className="text-lg font-light italic">{formatDate(activeBlog.createdAt)}</p>
                    </div>
                    <div className="pt-10 flex gap-4">
                         <button className="w-10 h-10 rounded-full border border-foreground/10 flex items-center justify-center hover:bg-foreground hover:text-background transition-all">
                            <FiShare2 size={14} />
                         </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderContentWrapper = (children: React.ReactNode) => (
        <div className="max-w-[1440px] mx-auto px-6 lg:px-20 py-24 md:py-32">
            <div className={`${['focused', 'minimalist'].includes(variant) ? 'max-w-3xl' : 'max-w-4xl'} mx-auto`}>
                {children}
            </div>
        </div>
    );

    return (
        <article className="bg-background overflow-hidden min-h-screen">
            <AnimatePresence mode="wait">
                <motion.div
                    key={variant}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    {variant === 'editorial' && renderEditorialHeader()}
                    {variant === 'focused' && renderFocusedHeader()}
                    {variant === 'wide' && renderEditorialHeader()}
                    {variant === 'immersive' && renderImmersiveHeader()}
                    {variant === 'modern_sidebar' && renderModernSidebarHeader()}
                    {variant === 'minimalist' && (
                        <div className="pt-40 max-w-3xl mx-auto px-6 text-center space-y-12">
                            <h1 className="text-4xl md:text-6xl font-light serif text-foreground">{activeBlog.title}</h1>
                            <div className="w-12 h-[1px] bg-primary mx-auto"></div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/30">{formatDate(activeBlog.createdAt)} — {t('journal.by')} {activeBlog.author?.name || t('journal.fallbackAuthor')}</p>
                        </div>
                    )}

                    {renderContentWrapper(
                        <>
                            <div className="prose prose-neutral prose-lg lg:prose-xl max-w-none prose-headings:font-light prose-headings:serif prose-p:font-light prose-p:text-foreground/70 prose-blockquote:italic prose-blockquote:border-l-primary prose-img:rounded-2xl text-foreground selection:bg-primary/20">
                                <div dangerouslySetInnerHTML={{ __html: activeBlog.content }} />
                            </div>

                            <div className="mt-24 pt-10 border-t border-foreground/10 flex flex-col md:flex-row justify-between items-center gap-10">
                                <div className="flex flex-wrap justify-center gap-3">
                                    {activeBlog.tags?.map((tag: string) => (
                                        <span key={tag} className="px-6 py-2 bg-foreground/5 text-[10px] font-bold uppercase tracking-widest text-foreground/40 hover:text-foreground hover:bg-foreground/10 transition-all cursor-default rounded-full border border-foreground/5">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                                <button className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.3em] text-foreground hover:bg-foreground hover:text-background transition-all px-10 py-4 border border-foreground/10 rounded-full shadow-lg group">
                                    <FiShare2 className="group-hover:scale-110 transition-transform" /> {t('journal.share')}
                                </button>
                            </div>
                        </>
                    )}
                </motion.div>
            </AnimatePresence>

            {showRecommended && recommendedBlogs.length > 0 && (
                <section className="bg-foreground/[0.02] py-32 border-t border-foreground/5">
                    <div className="max-w-[1440px] mx-auto px-6 lg:px-20">
                        <div className="flex items-end justify-between mb-20">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary mb-4 block">{t('journal.recommended')}</span>
                                <h2 className="text-4xl serif font-light text-foreground">{sectionData?.recommendedTitle || t('journal.continueReading')}</h2>
                            </div>
                            <Link href="/journal" className="hidden md:flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.3em] text-foreground group">
                                {t('journal.viewFull')} <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {recommendedBlogs.map((item, idx) => (
                                <motion.article
                                    key={item._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="group"
                                >
                                    <Link href={`/journal/${item.slug}`}>
                                        <div className="aspect-[4/5] overflow-hidden mb-6 bg-foreground/5 relative rounded-xl border border-foreground/5">
                                            <Image 
                                                src={item.image || getBlogPlaceholder()} 
                                                alt={item.title} 
                                                fill
                                                className="object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" 
                                            />
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                                        </div>
                                        <div className="space-y-4">
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-primary">{item.tags?.[0] || t('journal.fallbackTag')}</span>
                                            <h3 className="text-xl serif font-light text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">{item.title}</h3>
                                            <div className="text-[9px] font-bold uppercase tracking-widest text-foreground/30 flex items-center gap-2">
                                                <span>{formatDate(item.createdAt)}</span>
                                                <div className="w-1 h-1 bg-foreground/10 rounded-full"></div>
                                                <span>{t('journal.by')} {item.author?.name || t('journal.fallbackAuthor')}</span>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.article>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </article>
    );
}
