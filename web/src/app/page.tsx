'use client';

import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { useEffect, lazy, Suspense } from 'react';
import { fetchPageBySlug } from '@/lib/slices/pageSlice';
import { fetchComponentInstances } from '@/lib/slices/componentSlice';

import SectionRenderer from '@/components/SectionRenderer';

export default function Home() {
  const dispatch = useAppDispatch();
  const { currentPage, loading: pageLoading, hasLoadedOnce } = useAppSelector((state) => state.pages);
  const isLoading = pageLoading.fetchOne && !hasLoadedOnce;
  const { instances } = useAppSelector((state) => state.component);

  useEffect(() => {
    // Only fetch if data is not already hydrated from server
    if (!currentPage || currentPage.slug !== 'home') {
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
  const visibleSections = sections.filter((s: any) => s.isActive !== false);

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30">
      <main className="pt-0">
        <div className="w-full flex flex-col">
          {visibleSections.map((section: any) => (
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
