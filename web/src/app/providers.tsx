'use client';

import { store } from '@/lib/store';
import { Provider } from 'react-redux';
import FaviconUpdater from '@/components/FaviconUpdater';
import MetaUpdater from '@/components/MetaUpdater';
import { Toaster } from 'sonner';
import InitialDataHydrator from '@/components/InitialDataHydrator';

export function Providers({ children, initialData }: { children: React.ReactNode; initialData?: any }) {
  return (
    <Provider store={store}>
      {initialData && <InitialDataHydrator data={initialData} />}
      <Toaster position="top-right" richColors closeButton />
      <FaviconUpdater />
      <MetaUpdater />
      {children}
    </Provider>
  );
}
