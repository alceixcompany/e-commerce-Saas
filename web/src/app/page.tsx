'use client';

import HeroSection from '@/components/home/HeroSection';
import FeaturedCollection from '@/components/home/FeaturedCollection';
import CollectionsSection from '@/components/home/CollectionsSection';
import HomeBanner from '@/components/home/HomeBanner';
import PopularCollections from '@/components/home/PopularCollections';

export default function Home() {

  return (
    <div className="min-h-screen bg-white selection:bg-[#C5A059]/30">
      <main className="pt-0">
        <HeroSection />
        <FeaturedCollection />
        <CollectionsSection />
        <HomeBanner />
        <PopularCollections />


      </main>
    </div>
  );
}
