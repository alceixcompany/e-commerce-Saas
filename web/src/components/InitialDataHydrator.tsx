'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import { hydratePage } from '@/lib/slices/pageSlice';
import { hydrateContent } from '@/lib/slices/contentSlice';
import { BootstrapConfig } from '@/types/content';
import { CustomPage } from '@/types/page';

interface InitialDataHydratorProps {
  data: BootstrapConfig & { pageData?: CustomPage };
}

export default function InitialDataHydrator({ data }: InitialDataHydratorProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!data) return;

    if (data.pageData) {
      dispatch(hydratePage(data.pageData));
    }

    // Pass everything except pageData as content configuration
    const { ...contentSettings } = data;
    dispatch(hydrateContent(contentSettings));
  }, [data, dispatch]);

  return null;
}
