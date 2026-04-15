'use client';

import { store } from '@/lib/store';
import { Provider } from 'react-redux';
import FaviconUpdater from '@/components/FaviconUpdater';
import MetaUpdater from '@/components/MetaUpdater';
import { Toaster } from 'sonner';
import InitialDataHydrator from '@/components/InitialDataHydrator';
import { BootstrapConfig } from '@/types/content';
import { CustomPage } from '@/types/page';

export function Providers({ children, initialData }: { children: React.ReactNode; initialData?: BootstrapConfig & { pageData?: CustomPage } }) {
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
