import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowUpRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useEffect, useState, useCallback } from 'react';
import { useContentStore } from '@/lib/store/useContentStore';
import { useCmsStore } from '@/lib/store/useCmsStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useCachedVideo } from '@/hooks/useCachedVideo';

import * as Sections from '@/types/sections';

export default function HeroSection({ instanceId, data: passedData }: { instanceId?: string, data?: Sections.HeroData }) {
  const { instances } = useCmsStore();
  const { homeSettings, banners, hasFetchedBanners, isLoading: contentLoading, globalSettings, fetchBanners } = useContentStore();
  const isLoading = contentLoading;
  const { t } = useTranslation();
 
  const instance = instanceId ? instances.find(i => i._id === instanceId) : null;
  const instanceData = passedData || (instance?.data as Sections.HeroData);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [scaleImage, setScaleImage] = useState(false);

  useEffect(() => {
    const isPreview = typeof window !== 'undefined' && window.location.search.includes('preview=true');
    if (isPreview || (!hasFetchedBanners && banners.length === 0)) {
      fetchBanners(isPreview);
    }
    // Trigger image zoom animation slightly after mount
    setTimeout(() => setScaleImage(true), 50);
  }, [banners.length, hasFetchedBanners, fetchBanners]);

  const layout = instanceData?.heroLayout ?? homeSettings?.heroLayout ?? 'video';
  const heroTitle = instanceData?.heroTitle ?? homeSettings?.heroTitle ?? t('hero.title');
  const heroVideo = instanceData?.heroVideoUrl || homeSettings?.heroVideoUrl || "";
  const heroImage = instanceData?.heroImageUrl || homeSettings?.heroImageUrl || "/image/alceix/hero.png";
  const heroDescription = instanceData?.heroDescription ?? homeSettings?.heroDescription ?? t('hero.desc');
  const heroButtonText = instanceData?.heroButtonText ?? homeSettings?.heroButtonText ?? t('hero.btn');
  const heroButtonUrl = instanceData?.heroButtonUrl ?? homeSettings?.heroButtonUrl ?? "/collections";
  const showHeroTitle = (instanceData?.heroShowTitle ?? homeSettings?.heroShowTitle) !== false;
  const showHeroDescription = (instanceData?.heroShowDescription ?? homeSettings?.heroShowDescription) !== false;
  const showHeroButton = (instanceData?.heroShowButton ?? homeSettings?.heroShowButton) !== false;

  // Filter banners based on layout and instance
  const targetSection = instanceId ? `instance_${instanceId}` : (layout === 'split' ? 'hero_split' : 'hero');
  const activeBanners = (banners || [])
    .filter(b => b.section === targetSection && b.status === 'active')
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const nextSlide = useCallback(() => setCurrentSlide((prev) => (prev + 1) % activeBanners.length), [activeBanners.length]);
  const prevSlide = useCallback(() => setCurrentSlide((prev) => (prev - 1 + activeBanners.length) % activeBanners.length), [activeBanners.length]);

  useEffect(() => {
      if (layout === 'slider' && activeBanners.length > 1) {
          const timer = setInterval(nextSlide, 5000);
          return () => clearInterval(timer);
      }
  }, [layout, activeBanners.length, nextSlide]);

  // Fetch and cache the video URL
  const { cachedUrl } = useCachedVideo(heroVideo);

  const renderBackground = (videoUrl?: string, imageUrl?: string, title?: string) => (
    <div className="absolute inset-0 z-0 bg-background overflow-hidden">
      {layout === 'video' || (!imageUrl && videoUrl) ? (
        <>
          {/* Sinematografik (Ken Burns) Image Mask */}
          <div 
             className={`absolute inset-0 z-10 transition-opacity duration-[1500ms] pointer-events-none ${
               isVideoPlaying ? 'opacity-0' : 'opacity-100'
             }`}
          >
             {heroImage && (
               <Image 
                 src={heroImage}
                 alt={heroTitle}
                 fill
                 priority
                 className="object-cover"
                 style={{
                   transform: scaleImage ? 'scale(1.1)' : 'scale(1)',
                   transition: 'transform 12s ease-out'
                 }}
               />
             )}
             <div className="absolute inset-0 bg-black/20"></div>
          </div>

          {(cachedUrl || videoUrl) && (
            <video
              key={cachedUrl || videoUrl}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              onCanPlay={() => setIsVideoPlaying(true)}
              className="w-full h-full object-cover absolute inset-0 z-0"
              src={cachedUrl || videoUrl}
            />
          )}
        </>
      ) : (
        (imageUrl || heroImage) ? (
          <Image
            src={imageUrl || heroImage}
            alt={title || heroTitle}
            fill
            priority
            className="object-cover"
          />
        ) : null
      )}
      <div className="absolute inset-0 bg-black/30 z-0 pointer-events-none"></div>
    </div>
  );

  if (isLoading) {
    const skeletonBg = globalSettings?.theme?.backgroundColor || '#ffffff';
    const skeletonAccent = globalSettings?.theme?.primaryColor || '#000000';

    return (
      <div 
        className="relative h-[80vh] md:h-screen w-full overflow-hidden flex flex-col justify-center items-center px-6"
        style={{ backgroundColor: skeletonBg }}
      >
        {/* Pulsating background - using a mix of accent color for subtle branding */}
        <div 
          className="absolute inset-0 animate-pulse opacity-10"
          style={{ backgroundColor: skeletonAccent }}
        ></div>
        
        {/* Soft gradient overlay to blend */}
        <div 
          className="absolute inset-0"
          style={{ background: `linear-gradient(to top, ${skeletonBg}, transparent)` }}
        ></div>

        {/* Skeleton Content */}
        <div className="relative z-10 w-full max-w-4xl flex flex-col items-center justify-center text-center">
          {/* Title Skeleton */}
          <div 
            className="w-3/4 max-w-2xl h-16 md:h-32 animate-pulse rounded-md mb-8 opacity-20"
            style={{ backgroundColor: skeletonAccent }}
          ></div>
          {/* Description Skeleton */}
          <div 
            className="w-1/2 max-w-lg h-4 md:h-6 animate-pulse rounded-md mb-4 opacity-20"
            style={{ backgroundColor: skeletonAccent }}
          ></div>
          <div 
            className="w-1/3 max-w-sm h-4 md:h-6 animate-pulse rounded-md mb-12 opacity-20"
            style={{ backgroundColor: skeletonAccent }}
          ></div>
          {/* Button Skeleton */}
          <div 
            className="w-40 md:w-48 h-12 md:h-14 animate-pulse rounded-sm opacity-30"
            style={{ backgroundColor: skeletonAccent }}
          ></div>
        </div>

      </div>
    );
  }

  if (layout === 'slider' && activeBanners.length > 0) {
    return (
      <div className="relative h-[80vh] md:h-screen w-full overflow-hidden bg-background">
        <AnimatePresence>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Slide Background */}
            <div className="absolute inset-0 w-full h-full overflow-hidden">
               <Image 
                 src={activeBanners[currentSlide].image || heroImage}
                 alt={activeBanners[currentSlide].title || heroTitle}
                 fill
                 priority
                 className="object-cover transform scale-105"
               />
               <div className="absolute inset-0 bg-black/40"></div>
            </div>
            
            {/* Slide Content */}
            <div className="relative z-30 w-full h-full flex flex-col items-center justify-center text-center text-white px-6">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="max-w-4xl"
              >
                {showHeroTitle && (
                  <h1 className="text-5xl md:text-8xl lg:text-9xl font-light serif italic mb-8 tracking-tighter leading-none shadow-sm">
                    {activeBanners[currentSlide].title || heroTitle}
                  </h1>
                )}
                {showHeroDescription && (
                  <p className="text-sm md:text-xl font-light tracking-[0.4em] mb-12 opacity-90 max-w-2xl mx-auto uppercase drop-shadow-md">
                    {activeBanners[currentSlide].description || heroDescription}
                  </p>
                )}
                {showHeroButton && (
                  <Link
                    href={activeBanners[currentSlide].buttonUrl || heroButtonUrl}
                    className="inline-block bg-white text-black px-12 py-5 transition-all duration-300 font-bold tracking-[0.3em] uppercase text-[10px] md:text-xs hover:bg-primary hover:text-white shadow-xl"
                  >
                    {activeBanners[currentSlide].buttonText || heroButtonText}
                  </Link>
                )}
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {activeBanners.length > 1 && (
          <div className="absolute inset-0 pointer-events-none">
            <button 
              onClick={(e) => { e.stopPropagation(); prevSlide(); }} 
              className="absolute left-6 top-1/2 -translate-y-1/2 z-40 p-4 text-white hover:bg-white/10 rounded-full transition-all pointer-events-auto"
            >
              <FiChevronLeft size={32} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); nextSlide(); }} 
              className="absolute right-6 top-1/2 -translate-y-1/2 z-40 p-4 text-white hover:bg-white/10 rounded-full transition-all pointer-events-auto"
            >
              <FiChevronRight size={32} />
            </button>
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40 flex gap-3 pointer-events-auto">
              {activeBanners.map((_, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${currentSlide === idx ? 'bg-white w-8' : 'bg-white/40 hover:bg-white/60'}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (layout === 'split') {
    const splitContent = activeBanners.length > 0 ? activeBanners[0] : null;
    const displayTitle = heroTitle || splitContent?.title;
    const displayDesc = heroDescription || splitContent?.description;
    const displayBtn = heroButtonText || splitContent?.buttonText;
    const displayUrl = heroButtonUrl || splitContent?.buttonUrl;
    const displayImage = heroImage || splitContent?.image;
    const hasSplitContent = showHeroTitle || showHeroDescription || showHeroButton;

    return (
      <div
        className={`relative grid min-h-[760px] w-full overflow-hidden bg-background md:h-screen md:min-h-[700px] ${
          hasSplitContent
            ? 'grid-rows-[minmax(360px,48vh)_auto] md:grid-cols-[minmax(0,1.15fr)_minmax(400px,0.85fr)] md:grid-rows-1'
            : 'grid-cols-1'
        }`}
      >
        <div className="group relative min-h-[360px] overflow-hidden">
          {renderBackground(heroVideo, displayImage)}
          <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/35 via-transparent to-black/5 md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-black/10" />
          <div className="pointer-events-none absolute inset-5 z-20 rounded-[1.5rem] border border-white/20 transition-all duration-700 group-hover:inset-7 md:inset-8 md:rounded-[2rem] md:group-hover:inset-10" />
        </div>

        {hasSplitContent && (
          <div className="relative flex items-center overflow-hidden bg-background px-7 py-14 sm:px-12 md:px-12 md:py-16 lg:px-16 xl:px-20">
            <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full border border-foreground/[0.06]" />
            <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full border border-foreground/[0.06]" />

            <div className="relative z-10 w-full max-w-xl">
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.7 }}
                className="mb-8 h-px w-16 origin-left bg-primary"
              />

              {showHeroTitle && (
                <motion.h1
                  initial={{ opacity: 0, x: 28 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className="max-w-[12ch] text-balance font-heading text-[clamp(2.75rem,5vw,5.75rem)] font-medium leading-[0.94] tracking-[-0.045em] text-foreground"
                >
                  {displayTitle}
                </motion.h1>
              )}

              {showHeroDescription && (
                <motion.p
                  initial={{ opacity: 0, x: 28 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15, duration: 0.7, ease: 'easeOut' }}
                  className={`max-w-lg text-base font-normal leading-7 text-foreground/60 md:text-lg ${
                    showHeroTitle ? 'mt-7' : ''
                  }`}
                >
                  {displayDesc}
                </motion.p>
              )}

              {showHeroButton && (
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className={showHeroTitle || showHeroDescription ? 'mt-10' : ''}
                >
                  <Link
                    href={displayUrl || '#'}
                    className="group/btn inline-flex items-center gap-4 rounded-full bg-foreground px-7 py-4 text-[10px] font-bold uppercase tracking-[0.22em] text-background shadow-lg transition-all duration-300 hover:bg-primary hover:text-white hover:shadow-xl"
                  >
                    <span>{displayBtn}</span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-background/10 transition-transform duration-300 group-hover/btn:rotate-45">
                      <FiArrowUpRight size={14} />
                    </span>
                  </Link>
                </motion.div>
              )}

              <div className="mt-12 flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.28em] text-foreground/30">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>01</span>
                <span className="h-px w-10 bg-foreground/15" />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative h-[80vh] md:h-screen min-h-[600px] w-full flex items-center justify-center overflow-hidden bg-background">
      {renderBackground(heroVideo)}

      {/* Content Overlay */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center text-white px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="max-w-4xl"
        >
          {showHeroTitle && (
            <h1 className="text-5xl md:text-9xl font-light serif italic mb-8 tracking-tighter leading-none">
              {heroTitle}
            </h1>
          )}
          {showHeroDescription && (
            <p className="text-sm md:text-xl font-light tracking-[0.5em] mb-12 opacity-80 max-w-2xl mx-auto uppercase">
              {heroDescription}
            </p>
          )}
          {showHeroButton && (
            <Link
              href={heroButtonUrl}
              className="inline-block bg-white text-black px-12 py-5 transition-all duration-300 font-bold tracking-[0.3em] uppercase text-[10px] md:text-xs hover:bg-primary hover:text-white shadow-2xl"
            >
              {heroButtonText}
            </Link>
          )}
        </motion.div>
      </div>

    </div>
  );
}
