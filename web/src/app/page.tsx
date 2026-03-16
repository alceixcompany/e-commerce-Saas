'use client';

import HeroSection from '@/components/home/HeroSection';
import FeaturedCollection from '@/components/home/FeaturedCollection';
import CollectionsSection from '@/components/home/CollectionsSection';
import HomeBanner from '@/components/home/HomeBanner';
import PopularCollections from '@/components/home/PopularCollections';
import HomeJournal from '@/components/home/HomeJournal';
import AdvantageSection from '@/components/home/AdvantageSection';
import CampaignSection from '@/components/home/CampaignSection';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { useEffect } from 'react';
import { fetchHomeSettings } from '@/lib/slices/contentSlice';

export default function Home() {
  const dispatch = useAppDispatch();
  const { homeSettings } = useAppSelector((state) => state.content);

  useEffect(() => {
    dispatch(fetchHomeSettings());
  }, [dispatch]);

  // If homeSettings is null, it means it hasn't loaded yet.
  // In this case, we don't want to render any sections based on potentially stale or default data
  // that might then "flicker" when the actual settings load.
  // We wait until homeSettings is available before determining visible sections.
  if (homeSettings === null) {
    return null; // Or a loading spinner/skeleton
  }

  const sectionOrder = homeSettings?.sectionOrder || ['hero', 'advantages', 'campaigns', 'featured', 'collections', 'banner', 'popular', 'journal'];
  const hiddenSections = homeSettings?.hiddenSections || [];

  // Ensure strictly that we only show what's NOT hidden
  const visibleSections = sectionOrder.filter(id => !hiddenSections.includes(id));

  const renderSection = (id: string) => {
    switch (id) {
      case 'hero': return <HeroSection key={id} />;
      case 'featured': return <FeaturedCollection key={id} />;
      case 'collections': return <CollectionsSection key={id} />;
      case 'banner': return <HomeBanner key={id} />;
      case 'popular': return <PopularCollections key={id} />;
      case 'journal': return <HomeJournal key={id} />;
      case 'advantages': return <AdvantageSection key={id} data={homeSettings?.advantageSection} />;
      case 'campaigns': return <CampaignSection key={id} data={homeSettings?.campaignSection} />;
      // Even if these are rare on home, they should render if added
      case 'product_details': return null; // Needs product context, skip or placeholder
      case 'related_products': return <div key={id} className="mb-24"><PopularCollections /></div>; // Similar feel
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30">
      <main className="pt-0">
        {visibleSections.map(renderSection)}
      </main>
    </div>
  );
}
