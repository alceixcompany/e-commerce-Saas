'use client';

import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { useEffect } from 'react';
import { fetchPageBySlug } from '@/lib/slices/pageSlice';

import SectionRenderer from '@/components/SectionRenderer';
import { PageSection } from '@/types/page';

export default function Home() {
  const dispatch = useAppDispatch();
  const { currentPage, loading: pageLoading, hasLoadedOnce } = useAppSelector((state) => state.pages);
  const isLoading = pageLoading.fetchOne && !hasLoadedOnce;
  const { instances } = useAppSelector((state) => state.component);

  useEffect(() => {
    const isPreview = typeof window !== 'undefined' && window.location.search.includes('preview=true');

    if (!currentPage || currentPage.slug !== 'home' || isPreview) {
      dispatch(fetchPageBySlug('home'));
    }
  }, [dispatch, currentPage]);

  if (isLoading && !currentPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentPage) return null;

  const sections = currentPage.sections || [];
  const visibleSections = sections.filter((s: string | PageSection) => {
    if (typeof s === 'string') return true;
    return s.isActive !== false;
  });

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30">
      <main className="pt-0">
        <div className="w-full flex flex-col">
          {visibleSections.map((section: string | PageSection) => (
            <SectionRenderer
              key={typeof section === 'string' ? section : section.id}
              section={section}
              instances={instances}
              currentPage={currentPage}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
