import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { useEffect, useState } from 'react';
import { fetchBanners } from '@/lib/slices/contentSlice';
import { useTranslation } from '@/hooks/useTranslation';
import { useCachedVideo } from '@/hooks/useCachedVideo';

export default function HeroSection({ instanceId, data: passedData }: { instanceId?: string, data?: any }) {
  const dispatch = useAppDispatch();
  const { instances } = useAppSelector(state => state.component);
  const { homeSettings, banners, isLoading, globalSettings } = useAppSelector((state) => state.content);
  const { t } = useTranslation();
 
  const instance = instanceId ? instances.find(i => i._id === instanceId) : null;
  const instanceData = passedData || instance?.data;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [scaleImage, setScaleImage] = useState(false);

  useEffect(() => {
    const isPreview = typeof window !== 'undefined' && window.location.search.includes('preview=true');
    dispatch(fetchBanners(isPreview));
    // Trigger image zoom animation slightly after mount
    setTimeout(() => setScaleImage(true), 50);
  }, [dispatch]);

  const layout = instanceData?.heroLayout ?? homeSettings?.heroLayout ?? 'video';
  const heroTitle = instanceData?.heroTitle ?? homeSettings?.heroTitle ?? t('hero.title');
  const heroVideo = instanceData?.heroVideoUrl || homeSettings?.heroVideoUrl || "";
  const heroImage = instanceData?.heroImageUrl || homeSettings?.heroImageUrl || "/image/alceix/hero.png";
  const heroDescription = instanceData?.heroDescription ?? homeSettings?.heroDescription ?? t('hero.desc');
  const heroButtonText = instanceData?.heroButtonText ?? homeSettings?.heroButtonText ?? t('hero.btn');
  const heroButtonUrl = instanceData?.heroButtonUrl ?? homeSettings?.heroButtonUrl ?? "/collections";

  // Filter banners based on layout and instance
  const targetSection = instanceId ? `instance_${instanceId}` : (layout === 'split' ? 'hero_split' : 'hero');
  const activeBanners = banners.filter(b => b.section === targetSection && b.status === 'active').sort((a,b) => (a.order || 0) - (b.order || 0));

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);

  useEffect(() => {
    if (layout === 'slider' && activeBanners.length > 1) {
      const timer = setInterval(nextSlide, 5000);
      return () => clearInterval(timer);
    }
  }, [layout, activeBanners.length]);

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
               <img 
                 src={heroImage}
                 alt={heroTitle}
                 className="w-full h-full object-cover"
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
          <img
            src={imageUrl || heroImage}
            alt={title || heroTitle}
            className="w-full h-full object-cover"
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
               <img 
                 src={activeBanners[currentSlide].image || heroImage}
                 alt={activeBanners[currentSlide].title || heroTitle}
                 className="w-full h-full object-cover transform scale-105"
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
                <h1 className="text-5xl md:text-8xl lg:text-9xl font-light serif italic mb-8 tracking-tighter leading-none shadow-sm">
                  {activeBanners[currentSlide].title || heroTitle}
                </h1>
                <p className="text-sm md:text-xl font-light tracking-[0.4em] mb-12 opacity-90 max-w-2xl mx-auto uppercase drop-shadow-md">
                  {activeBanners[currentSlide].description || heroDescription}
                </p>
                <Link
                  href={activeBanners[currentSlide].buttonUrl || heroButtonUrl}
                  className="inline-block bg-white text-black px-12 py-5 transition-all duration-300 font-bold tracking-[0.3em] uppercase text-[10px] md:text-xs hover:bg-primary hover:text-white shadow-xl"
                >
                  {activeBanners[currentSlide].buttonText || heroButtonText}
                </Link>
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

    return (
      <div className="relative w-full h-[80vh] md:h-screen flex flex-col md:flex-row bg-background overflow-hidden">
        <div className="w-full md:w-1/2 h-full relative">
           {renderBackground(heroVideo, displayImage)}
        </div>
        <div className="w-full md:w-1/2 h-full flex flex-col items-center justify-center text-center p-12 lg:p-24 space-y-8 bg-muted/30">
          <motion.h1 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-7xl font-light serif italic leading-tight"
          >
            {displayTitle}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm md:text-base tracking-[0.3em] uppercase opacity-60"
          >
            {displayDesc}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link
              href={displayUrl}
              className="inline-block bg-foreground text-background px-10 py-4 font-bold tracking-[0.3em] uppercase text-[10px] hover:bg-primary transition-colors"
            >
              {displayBtn}
            </Link>
          </motion.div>
        </div>
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
          <h1 className="text-5xl md:text-9xl font-light serif italic mb-8 tracking-tighter leading-none">
            {heroTitle}
          </h1>
          <p className="text-sm md:text-xl font-light tracking-[0.5em] mb-12 opacity-80 max-w-2xl mx-auto uppercase">
            {heroDescription}
          </p>

          <Link
            href={heroButtonUrl}
            className="inline-block bg-white text-black px-12 py-5 transition-all duration-300 font-bold tracking-[0.3em] uppercase text-[10px] md:text-xs hover:bg-primary hover:text-white shadow-2xl"
          >
            {heroButtonText}
          </Link>
        </motion.div>
      </div>

      {/* Side Icons / Search Icon */}
      <div className="absolute right-4 bottom-8 md:right-10 md:bottom-24 z-20">
        <button
          onClick={() => window.dispatchEvent(new Event('open-search'))}
          className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-background/95 flex items-center justify-center shadow-xl hover:bg-background transition-all hover:scale-105 active:scale-95 group"
          aria-label="Search"
        >
          <FiSearch className="text-foreground/50 w-5 h-5 md:w-6 md:h-6 group-hover:text-primary transition-colors" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}

