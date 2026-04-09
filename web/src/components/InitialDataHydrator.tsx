'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import { hydratePage } from '@/lib/slices/pageSlice';
import { hydrateContent } from '@/lib/slices/contentSlice';

interface InitialDataHydratorProps {
  data: any;
}

export default function InitialDataHydrator({ data }: InitialDataHydratorProps) {
  const dispatch = useAppDispatch();
  const hydrated = useRef(false);

  // We hydrate during the first render to avoid waterfall
  // but we use a ref to ensure it only happens once
  if (!hydrated.current && data) {
    if (data.pageData) {
      dispatch(hydratePage(data.pageData));
    }
    
    // Pass everything except pageData as content configuration
    const { pageData, ...contentSettings } = data;
    dispatch(hydrateContent(contentSettings));
    
    hydrated.current = true;
  }

  return null;
}
