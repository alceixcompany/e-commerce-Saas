'use client';

import { useState } from 'react';
import FaviconUpdater from '@/components/FaviconUpdater';
import MetaUpdater from '@/components/MetaUpdater';
import { Toaster } from 'sonner';
import { BootstrapConfig } from '@/types/content';
import { CustomPage } from '@/types/page';
import { ComponentInstance } from '@/types/component';
import { useContentStore } from '@/lib/store/useContentStore';
import { useCmsStore } from '@/lib/store/useCmsStore';
import { hydrateInitialStores } from './bootstrap/hydrateInitialStores';

export function Providers({ children, initialData }: { children: React.ReactNode; initialData?: BootstrapConfig & { pageData?: CustomPage; components?: ComponentInstance[] } }) {
  const { 
    setGlobalSettings, 
    setHomeSettings, 
    setProductSettings, 
    setAboutSettings, 
    setContactSettings,
    setAuthSettings,
    setBanners,
    setPopularCollections 
  } = useContentStore();
  const { hydratePage, setInstances } = useCmsStore();

  useState(() => {
    hydrateInitialStores({
      initialData,
      setGlobalSettings,
      hydratePage,
      setInstances,
      setHomeSettings,
      setProductSettings,
      setAboutSettings,
      setContactSettings,
      setAuthSettings,
      setBanners,
      setPopularCollections,
    });

    return true;
  });

  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      <FaviconUpdater />
      <MetaUpdater />
      {children}
    </>
  );
}
