import { isRejectedWithValue, Middleware } from '@reduxjs/toolkit';
import { toast } from 'sonner';

/**
 * Global Error Middleware
 * Intercepts all rejected actions from createAsyncThunk and shows a toast notification if a message is present.
 */
export const errorMiddleware: Middleware = () => (next) => (action) => {
  // Check if the action is a rejected action from createAsyncThunk
  if (isRejectedWithValue(action)) {
    const errorMsg = (action.payload as string) || (action.error?.message) || 'An unexpected error occurred';
    
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
