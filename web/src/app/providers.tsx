'use client';

import { store } from '@/lib/store';
import { Provider } from 'react-redux';
import FaviconUpdater from '@/components/FaviconUpdater';
import MetaUpdater from '@/components/MetaUpdater';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <Toaster position="top-right" richColors closeButton />
      <FaviconUpdater />
      <MetaUpdater />
      {children}
    </Provider>
  );
}
