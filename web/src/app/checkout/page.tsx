import React from 'react';
import { Metadata } from 'next';
import CheckoutClient from './CheckoutClient';
import { serverPaymentService } from '@/lib/server/services/paymentService';
import { serverContentService } from '@/lib/server/services/contentService';

export const metadata: Metadata = {
  title: 'Secure Checkout - Alceix Group',
  description: 'Complete your purchase securely at Alceix Group.',
};

export default async function CheckoutPage() {
  // Parallel fetch of global settings and payment settings on the server
  const [bootstrapData, paymentSettings] = await Promise.all([
    serverContentService.getBootstrapData('home'),
    serverPaymentService.getPublicSettings()
  ]);

  return (
    <CheckoutClient 
      initialPaymentSettings={paymentSettings} 
      initialGlobalSettings={bootstrapData?.global_settings} 
    />
  );
}
