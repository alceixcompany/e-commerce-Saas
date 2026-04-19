import React from 'react';
import { Metadata } from 'next';
import RegisterClient from './RegisterClient';
import { serverContentService } from '@/lib/server/services/contentService';

export const metadata: Metadata = {
  title: 'Register - Alceix Group',
  description: 'Create an Alceix Group account to track your orders and save your favorite fine jewelry.',
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const isPreview = resolvedSearchParams?.preview === 'true';
  const authSettings = await serverContentService.getAuthSettings(isPreview);
  
  return (
    <RegisterClient initialAuthSettings={authSettings} />
  );
}
