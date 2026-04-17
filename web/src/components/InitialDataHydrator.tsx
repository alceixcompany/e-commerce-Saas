'use client';

import { useEffect } from 'react';
import { useCmsStore } from '@/lib/store/useCmsStore';
import { useContentStore } from '@/lib/store/useContentStore';
import { BootstrapConfig } from '@/types/content';
import { CustomPage } from '@/types/page';

interface InitialDataHydratorProps {
  data: BootstrapConfig & { pageData?: CustomPage };
}

export default function InitialDataHydrator({ data }: InitialDataHydratorProps) {
  const { setGlobalSettings } = useContentStore();

  useEffect(() => {
    if (!data) return;

    if (data.pageData) {
      useCmsStore.setState((state) => ({
        pages: state.pages.find(p => p._id === data.pageData!._id)
          ? state.pages.map(p => p._id === data.pageData!._id ? data.pageData! : p)
          : [...state.pages, data.pageData!]
      }));
    }

    // Pass everything except pageData as content configuration
    const { pageData, ...contentSettings } = data;
    if (contentSettings.global_settings) {
        setGlobalSettings(contentSettings.global_settings);
    }
  }, [data, setGlobalSettings]);

  return null;
}
