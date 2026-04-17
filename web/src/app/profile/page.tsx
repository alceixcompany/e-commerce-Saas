import React, { Suspense } from 'react';
import { Metadata } from 'next';
import ProfileClient from './ProfileClient';

export const metadata: Metadata = {
  title: 'My Profile - Alceix Group',
  description: 'Manage your Alceix Group account, view orders, and update your profile.',
};

export default function ProfilePage() {
  return (
    <Suspense fallback={
        <div className="min-h-screen bg-background pt-24 md:pt-[120px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
                <p className="text-xs font-bold uppercase tracking-widest text-foreground/40">Loading your profile...</p>
            </div>
        </div>
    }>
        <ProfileClient />
    </Suspense>
  );
}
