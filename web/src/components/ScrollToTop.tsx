'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * A utility component that resets the scroll position to the top of the window
 * whenever the pathname changes. This fixes issues where Next.js scroll restoration
 * fails due to dynamic content loading (e.g., swapping a loader for a long page).
 */
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // We use a small timeout to ensure the browser has finished the initial
    // layout of the new page's shell. This helps bypass race conditions
    // between Next.js scroll restoration and our manual reset.
    const resetScroll = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant' // 'instant' ensures no weird jumping animations during navigation
      });
    };

    resetScroll();
    
    // Some browsers or Next.js versions might try to restore scroll 
    // a microtask later after the first render. This second call ensures it stays at top.
    const timeoutId = setTimeout(resetScroll, 0);

    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return null; // This component doesn't render anything
}
