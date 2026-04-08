'use client';

import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { useEffect, lazy, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchPageBySlug } from '@/lib/slices/pageSlice';
import { fetchComponentInstances } from '@/lib/slices/componentSlice';

import SectionRenderer from '@/components/SectionRenderer';

export default function Home() {
  const dispatch = useAppDispatch();
  const { currentPage, loading: pageLoading } = useAppSelector((state) => state.pages);
  const isLoading = pageLoading.fetchOne;
  const { instances } = useAppSelector((state) => state.component);

  useEffect(() => {
    dispatch(fetchPageBySlug('home'));
  }, [dispatch]);

  if (isLoading || !currentPage) {
    return null;
  }

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
