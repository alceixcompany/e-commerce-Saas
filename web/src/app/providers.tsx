'use client';

import { useState } from 'react';
import FaviconUpdater from '@/components/FaviconUpdater';
import MetaUpdater from '@/components/MetaUpdater';
import { Toaster } from 'sonner';
import { BootstrapConfig } from '@/types/content';
import { CustomPage } from '@/types/page';
import { useContentStore } from '@/lib/store/useContentStore';
import { useCmsStore } from '@/lib/store/useCmsStore';

export function Providers({ children, initialData }: { children: React.ReactNode; initialData?: BootstrapConfig & { pageData?: CustomPage; components?: any[] } }) {
  const setGlobalSettings = useContentStore((state) => state.setGlobalSettings);
  const { hydratePage, setInstances } = useCmsStore();

  useState(() => {
    if (initialData) {
      if (initialData.pageData) {
        // Zustand (New)
        hydratePage(initialData.pageData);
      }
      
      // Hydrate Zustand stores
      if (initialData.global_settings) {
        setGlobalSettings(initialData.global_settings);
      }
      
      if (initialData.components) {
        setInstances(initialData.components);
      }
    }
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
