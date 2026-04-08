'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { setUser, setVerifying, logout } from '@/lib/slices/authSlice';
import { fetchProfile } from '@/lib/slices/profileSlice';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const { token, isVerifying } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const initAuth = async () => {
      const isAuthPage = pathname?.includes('/login') || pathname?.includes('/register');
      
      // Don't verify session on auth pages to avoid redirect loops
      if (isVerifying && !isAuthPage) {
        try {
          // Fetch latest profile to ensure role/status/token is valid
          const resultAction = await dispatch(fetchProfile());
          
          if (fetchProfile.fulfilled.match(resultAction)) {
            // Update auth user with full profile data (ensures role is correct)
            dispatch(setUser({
              id: resultAction.payload._id,
              name: resultAction.payload.name,
              email: resultAction.payload.email,
              role: resultAction.payload.role as 'user' | 'admin'
            }));
          } else {
            // Profile fetch failed (invalid token or server error)
            // We don't necessarily logout if it's just a network error, 
            // but if it's a 401, axios interceptor would have handled it.
            // Still, for robustness, we clear if forbidden.
            if (resultAction.payload === 'Unauthorized' || resultAction.payload === 'Failed to fetch profile') {
               // dispatch(logout()); // Let axios handle it or force it here if needed
            }
          }
        } catch (error) {
          console.error("Initial auth verification failed", error);
        } finally {
          dispatch(setVerifying(false));
        }
      } else {
        // No token, no verification needed
        dispatch(setVerifying(false));
      }
    };

    initAuth();
  }, [dispatch, token, isVerifying]);

  // Show a premium loading screen while verifying the session for already-logged-in users
  // This prevents layout jumps and unauthorized flashes
  if (isVerifying && token) {
    return (
      <div className="fixed inset-0 bg-background z-[9999] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <div className="text-[10px] font-bold tracking-[0.4em] text-foreground/40 uppercase">
              Verifying Session
            </div>
          </motion.div>
          <div className="w-24 h-px bg-foreground/10" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
