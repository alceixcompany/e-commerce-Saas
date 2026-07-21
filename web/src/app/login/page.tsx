import React from 'react';
import { Metadata } from 'next';
import LoginClient from './LoginClient';
import { serverContentService } from '@/lib/server/services/contentService';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to your account to manage your orders and profile.',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const isPreview = resolvedSearchParams?.preview === 'true';
  const authSettings = await serverContentService.getAuthSettings(isPreview);
  
  return (
    <LoginClient initialAuthSettings={authSettings} />
  );
}
