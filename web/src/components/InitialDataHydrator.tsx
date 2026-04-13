'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import { hydratePage } from '@/lib/slices/pageSlice';
import { hydrateContent } from '@/lib/slices/contentSlice';

interface InitialDataHydratorProps {
  data: any;
}

export default function InitialDataHydrator({ data }: InitialDataHydratorProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!data) return;

    if (data.pageData) {
      dispatch(hydratePage(data.pageData));
    }

    // Pass everything except pageData as content configuration
    const { pageData, ...contentSettings } = data;
    dispatch(hydrateContent(contentSettings));
  }, [data, dispatch]);

  return null;
}
