import React from 'react';
import { Metadata } from 'next';
import PaymentSettingsClient from './PaymentSettingsClient';
import { serverAdminService } from '@/lib/server/services/adminService';
import type { PaymentSettings } from '@/types/payment-settings';

export const metadata: Metadata = {
  title: 'Payment Settings - Alceix Group Admin',
  description: 'Manage your payment providers and store URL from the Alceix Group Admin Panel.',
};

export default async function AdminPaymentSettingsPage() {
  // Fetch initial payment settings on the server
  const settings = await serverAdminService.getPaymentSettings();

  const defaultSettings: PaymentSettings = {
    paypal: {
        active: false,
        clientId: '',
        clientSecret: '',
        mode: 'sandbox'
    },
    iyzico: {
        active: false,
        apiKey: '',
        secretKey: '',
        baseUrl: 'https://sandbox-api.iyzipay.com'
    },
    storeUrl: ''
  };

  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Payment Gateways</h1>
            <p className="text-foreground/50 mt-2">Manage your connection to PayPal and Iyzico.</p>
        </div>
        
        <PaymentSettingsClient initialSettings={settings || defaultSettings} />
    </div>
  );
}
