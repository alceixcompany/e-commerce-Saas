'use client';

import { useRef } from 'react';
import { store } from '@/lib/store';
import { Provider } from 'react-redux';
import FaviconUpdater from '@/components/FaviconUpdater';
import MetaUpdater from '@/components/MetaUpdater';
import { Toaster } from 'sonner';
import { BootstrapConfig } from '@/types/content';
import { CustomPage } from '@/types/page';
import { hydratePage } from '@/lib/slices/pageSlice';
import { hydrateContent } from '@/lib/slices/contentSlice';

export function Providers({ children, initialData }: { children: React.ReactNode; initialData?: BootstrapConfig & { pageData?: CustomPage } }) {
  const hydratedRef = useRef(false);

  if (!hydratedRef.current && initialData) {
    if (initialData.pageData) {
      store.dispatch(hydratePage(initialData.pageData));
    }

    store.dispatch(hydrateContent(initialData));
    hydratedRef.current = true;
  }

  return (
    <Provider store={store}>
      <Toaster position="top-right" richColors closeButton />
      <FaviconUpdater />
      <MetaUpdater />
      {children}
    </Provider>
  );
}
