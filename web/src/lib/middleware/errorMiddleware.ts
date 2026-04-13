import { isRejectedWithValue, Middleware } from '@reduxjs/toolkit';
import { toast } from 'sonner';

/**
 * Global Error Middleware
 * Intercepts all rejected actions from createAsyncThunk and shows a toast notification if a message is present.
 */
export const errorMiddleware: Middleware = () => (next) => (action) => {
  // Check if the action is a rejected action from createAsyncThunk
  if (isRejectedWithValue(action)) {
    // Allow thunks to opt out from global error toasts by passing an arg like:
    // `dispatch(thunk({ silent: true }))`
    const metaArg = (action as { meta?: { arg?: unknown } }).meta?.arg;
    const isSilent = (() => {
      if (!metaArg || typeof metaArg !== 'object') return false;
      const arg = metaArg as Record<string, unknown>;
      return arg.silent === true || arg.skipToast === true || arg.skipErrorToast === true;
    })();
    if (isSilent) {
      return next(action);
    }

    const errorMsg = (action.payload as string) || (action.error?.message) || 'An unexpected error occurred';
    const normalizedError = String(errorMsg).toLowerCase();
    const isTransientAuthError =
      normalizedError.includes('401') ||
      normalizedError.includes('unauthorized') ||
      normalizedError.includes('jwt expired') ||
      normalizedError.includes('token expired') ||
      normalizedError.includes('session expired');

    if (isTransientAuthError) {
      return next(action);
    }
    
    // Avoid showing toasts for specific "silent" actions if needed
    // You can check action.type here if you want to exclude some slices
    
    // Show toast notification
    toast.error(errorMsg, {
      description: 'Please try again or contact support if the issue persists.',
      duration: 5000,
    });
    
    console.error(`[Redux Error] ${action.type}:`, errorMsg);
  }

  return next(action);
};
