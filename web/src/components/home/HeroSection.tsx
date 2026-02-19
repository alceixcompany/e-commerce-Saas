'use client';

import Link from 'next/link';
import { FiSearch } from 'react-icons/fi';

export default function HeroSection() {
  return (
    <div className="relative h-[80vh] md:h-[85vh] min-h-[500px] md:min-h-[600px] w-full flex items-center justify-center overflow-hidden bg-white">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
        {/* Subtle overlay if needed */}
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-end pb-20 md:pb-32 text-center text-white">
        <div className="max-w-2xl px-6">
          <p className="text-sm md:text-lg font-light tracking-wide mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Our rich collection of timeless and classic styles all in one place
          </p>

          <Link
            href="/collections"
            className="inline-block bg-[#1a1a1a] text-white px-8 py-3 md:px-10 md:py-4 transition-all duration-300 font-light tracking-[0.2em] uppercase text-[10px] md:text-xs hover:bg-black"
          >
            SHOP THE NYC COLLECTION
          </Link>
        </div>
      </div>

      {/* Side Icons / Search Icon from image */}
      <div className="absolute right-4 bottom-8 md:right-10 md:bottom-24 z-20">
        <button
          onClick={() => window.dispatchEvent(new Event('open-search'))}
          className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/95 flex items-center justify-center shadow-xl hover:bg-white transition-all hover:scale-105 active:scale-95 group"
          aria-label="Search"
        >
          <FiSearch className="text-gray-400 w-5 h-5 md:w-6 md:h-6 group-hover:text-[#C5A059] transition-colors" strokeWidth={1.5} />
        </button>
      </div>
    </div>

  );
}

