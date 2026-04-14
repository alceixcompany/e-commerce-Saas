import { isRejectedWithValue, Middleware } from '@reduxjs/toolkit';
import { toast } from 'sonner';

export const errorMiddleware: Middleware = () => (next) => (action) => {
  if (isRejectedWithValue(action)) {

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

    toast.error(errorMsg, {
      description: 'Please try again or contact support if the issue persists.',
      duration: 5000,
    });

    console.error(`[Redux Error] ${action.type}:`, errorMsg);
  }

  return next(action);
};
