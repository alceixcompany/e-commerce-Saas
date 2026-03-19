import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { useEffect, useState } from 'react';
import { fetchBanners } from '@/lib/slices/contentSlice';
import { useTranslation } from '@/hooks/useTranslation';

export default function HeroSection() {
  const dispatch = useAppDispatch();
  const { homeSettings, banners, isLoading, globalSettings } = useAppSelector((state) => state.content);
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    dispatch(fetchBanners());
  }, [dispatch]);

  const layout = homeSettings?.heroLayout || 'video';
  const heroTitle = homeSettings?.heroTitle || t('hero.title');
  const heroVideo = homeSettings?.heroVideoUrl || "";
  const heroImage = homeSettings?.heroImageUrl || "/image/alceix/hero.png";
  const heroDescription = homeSettings?.heroDescription || t('hero.desc');
  const heroButtonText = homeSettings?.heroButtonText || t('hero.btn');
  const heroButtonUrl = homeSettings?.heroButtonUrl || "/collections";

  // Filter banners based on layout
  const sliderBanners = banners.filter(b => b.section === 'hero' && b.status === 'active').sort((a,b) => (a.order || 0) - (b.order || 0));
  const splitBanners = banners.filter(b => b.section === 'hero_split' && b.status === 'active').sort((a,b) => (a.order || 0) - (b.order || 0));

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % sliderBanners.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + sliderBanners.length) % sliderBanners.length);

  useEffect(() => {
    if (layout === 'slider' && sliderBanners.length > 1) {
      const timer = setInterval(nextSlide, 5000);
      return () => clearInterval(timer);
    }
  }, [layout, sliderBanners.length]);

  const renderBackground = (videoUrl?: string, imageUrl?: string, title?: string) => (
    <div className="absolute inset-0 z-0">
      {layout === 'video' || (!imageUrl && videoUrl) ? (
        <video
          key={videoUrl}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          src={videoUrl || heroVideo}
        />
      ) : (
        <img
          src={imageUrl || heroImage}
          alt={title || heroTitle}
          className="w-full h-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-black/30"></div>
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

        {/* Loading Spinner Optional Overlay */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20">
            <svg className="animate-spin h-24 w-24" style={{ color: skeletonAccent }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
      </div>
    );
  }

  if (layout === 'slider' && sliderBanners.length > 0) {
    return (
      <div className="relative h-[80vh] md:h-screen w-full overflow-hidden bg-background">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <img 
              src={sliderBanners[currentSlide].image} 
              alt={sliderBanners[currentSlide].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40"></div>
            
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center text-white px-6">
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="max-w-4xl"
              >
                <h1 className="text-5xl md:text-9xl font-light serif italic mb-8 tracking-tighter leading-none">
                  {sliderBanners[currentSlide].title}
                </h1>
                <p className="text-sm md:text-xl font-light tracking-[0.4em] mb-12 opacity-80 max-w-2xl mx-auto uppercase">
                  {sliderBanners[currentSlide].description}
                </p>
                <Link
                  href={sliderBanners[currentSlide].buttonUrl || '#'}
                  className="inline-block bg-white text-black px-12 py-5 transition-all duration-300 font-bold tracking-[0.3em] uppercase text-[10px] md:text-xs hover:bg-primary hover:text-white"
                >
                  {sliderBanners[currentSlide].buttonText || t('hero.discoverMore')}
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {sliderBanners.length > 1 && (
          <>
            <button onClick={prevSlide} className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-4 text-white hover:bg-white/10 rounded-full transition-all">
              <FiChevronLeft size={32} />
            </button>
            <button onClick={nextSlide} className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-4 text-white hover:bg-white/10 rounded-full transition-all">
              <FiChevronRight size={32} />
            </button>
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-3">
              {sliderBanners.map((_, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${currentSlide === idx ? 'bg-white w-8' : 'bg-white/40'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  if (layout === 'split') {
    const splitContent = splitBanners.length > 0 ? splitBanners[0] : null;
    const displayTitle = splitContent?.title || heroTitle;
    const displayDesc = splitContent?.description || heroDescription;
    const displayBtn = splitContent?.buttonText || heroButtonText;
    const displayUrl = splitContent?.buttonUrl || heroButtonUrl;
    const displayImage = splitContent?.image;

    return (
      <div className="relative w-full h-[80vh] md:h-screen flex flex-col md:flex-row bg-background overflow-hidden">
        <div className="w-full md:w-1/2 h-full relative">
           {renderBackground(undefined, displayImage)}
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

