import { Middleware, UnknownAction } from '@reduxjs/toolkit';

/**
 * Diagnostic middleware to detect and alert on 'Request Storms' (Infinite Loops).
 * Tracks the frequency of actions and logs a high-priority warning to the console
 * if it detects an abnormal pattern.
 */
const requestDebugger: Middleware = () => (next) => {
  const actionCounts: Record<string, { count: number; firstTime: number }> = {};
  const CYCLE_MS = 10000; // 10 seconds
  const THRESHOLD = 10;   // Warn if more than 10 times in 10 seconds

  return (action: unknown) => {
    const typedAction = action as UnknownAction;
    // Only track async thunk actions (pending/fulfilled/rejected usually)
    if (typeof typedAction.type === 'string' && (typedAction.type.includes('/') || typedAction.type.endsWith('/pending'))) {
      const now = Date.now();
      const stats = actionCounts[typedAction.type];

      if (!stats || (now - stats.firstTime > CYCLE_MS)) {
        actionCounts[typedAction.type] = { count: 1, firstTime: now };
      } else {
        stats.count++;
        if (stats.count > THRESHOLD) {
          console.group('%c ⚠️ REQUEST STORM DETECTED ⚠️', 'background: red; color: white; border-radius: 4px; padding: 2px 6px; font-weight: bold;');
          console.warn(`Action "${typedAction.type}" has been dispatched ${stats.count} times in the last 10 seconds.`);
          console.info('Potential Infinite Loop in a useEffect or global component detected.');
          console.trace('Dispatch Trace:');
          console.groupEnd();
          
          // Reset after warning to avoid spamming the console too hard
          stats.count = 0;
          stats.firstTime = now;
        }
      }
    }

    return next(action);
  };
};

export default requestDebugger;