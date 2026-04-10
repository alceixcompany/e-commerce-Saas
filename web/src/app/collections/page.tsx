'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchPublicProducts } from '@/lib/slices/productSlice';
import { fetchPublicCategories } from '@/lib/slices/categorySlice';
import { fetchPageBySlug } from '@/lib/slices/pageSlice';
import SectionRenderer from '@/components/SectionRenderer';
import { fetchComponentInstances } from '@/lib/slices/componentSlice';
import { useTranslation } from '@/hooks/useTranslation';

export default function CollectionsPage() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { pages, currentPage: reduxPage, loading: pagesLoadingState } = useAppSelector((state) => state.pages);
  const pagesLoading = pagesLoadingState.fetchAll;
  const { categories, loading } = useAppSelector((state) => state.category);
  const categoriesLoading = loading.fetchPublic;
  const { instances } = useAppSelector((state) => state.component);

  // Preference for the specifically fetched page by slug
  const fetchedPage = (reduxPage && reduxPage.slug === 'categories') ? reduxPage : null;
  const listPage = pages.find((p: any) => p.slug === 'categories');
  const currentPage = fetchedPage || listPage;

  console.log('CollectionsPage DEBUG:', { 
    fetchedSlug: reduxPage?.slug, 
    listSlug: listPage?.slug,
    currentPageSections: currentPage?.sections?.length,
    pagesCount: pages.length 
  });

  useEffect(() => {
    // If preview=true is in URL, bypass cache or force refetch
    const searchParams = new URL(window.location.href).searchParams;
    const isPreview = searchParams.get('preview') === 'true';
    
    if (isPreview) {
        dispatch(fetchPublicCategories(true));
        dispatch(fetchPageBySlug('categories'));
        dispatch(fetchComponentInstances(undefined));
    }
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchPublicCategories());
    dispatch(fetchPublicProducts({ minimal: true }));
    dispatch(fetchPageBySlug('categories'));
  }, [dispatch]);

  const isLoading = categoriesLoading || pagesLoading;

  if (isLoading && !currentPage) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-foreground/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  // Fallback if no sections are defined yet
  if (!currentPage || !currentPage.sections || currentPage.sections.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-background font-sans">
        <div className="max-w-7xl mx-auto px-6 py-12 text-center">
            <h1 className="text-4xl font-light tracking-[0.1em] uppercase text-foreground mb-4">{t('product.archive.collections.title')}</h1>
            <p className="text-foreground/50 mb-8 italic">{t('product.archive.collections.empty')}</p>
            <Link href="/" className="inline-block px-8 py-3 bg-foreground text-background text-xs uppercase tracking-widest font-bold hover:bg-primary transition-colors">
                {t('product.archive.collections.backHome')}
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans pt-16">
      {currentPage.sections.map((section: any) => (
        <SectionRenderer
          key={typeof section === 'string' ? section : section.id}
          section={section}
          instances={instances}
          currentPage={currentPage}
        />
      ))}
    </div>
  );
}
