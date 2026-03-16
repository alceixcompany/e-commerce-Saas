'use client';

import { store } from '@/lib/store';
import { Provider } from 'react-redux';
import FaviconUpdater from '@/components/FaviconUpdater';
import MetaUpdater from '@/components/MetaUpdater';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <FaviconUpdater />
      <MetaUpdater />
      {children}
    </Provider>
  );
}
