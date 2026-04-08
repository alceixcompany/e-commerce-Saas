'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { setUser, setVerifying } from '@/lib/slices/authSlice';
import { fetchProfile } from '@/lib/slices/profileSlice';
import { motion } from 'framer-motion';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { token, isVerifying } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const initAuth = async () => {
      if (!isVerifying) return;

      try {
        // Always verify once on app boot to sync cookie session -> Redux state.
        const resultAction = await dispatch(fetchProfile({ silent: true }));

        if (fetchProfile.fulfilled.match(resultAction)) {
          dispatch(setUser({
            id: resultAction.payload._id,
            name: resultAction.payload.name,
            email: resultAction.payload.email,
            role: resultAction.payload.role as 'user' | 'admin'
          }));
        } else {
          dispatch(setUser(null));
        }
      } catch (error) {
        console.error('Initial auth verification failed', error);
        dispatch(setUser(null));
      } finally {
        dispatch(setVerifying(false));
      }
    };

    initAuth();
  }, [dispatch, isVerifying]);

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
