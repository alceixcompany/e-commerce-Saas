'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useUserStore } from '@/lib/store/useUserStore';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isVerifying, setUser, setVerifying } = useAuthStore();
  const { fetchProfile } = useUserStore();

  useEffect(() => {
    const initAuth = async () => {
      if (!isVerifying) return;

      try {
        const profile = await fetchProfile();

        if (profile) {
          const userData = {
            id: profile._id,
            name: profile.name,
            email: profile.email,
            role: profile.role as 'user' | 'admin'
          };
          
          // Sync to Zustand Auth Store
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Initial auth verification failed', error);
        setUser(null);
      } finally {
        setVerifying(false);
      }
    };

    initAuth();
  }, [isVerifying, setUser, setVerifying, fetchProfile]);

  // Use Zustand local state for display logic
  if (isVerifying && !user) {
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
