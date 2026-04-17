import React from 'react';
import { Metadata } from 'next';
import CouponListingClient from './CouponListingClient';
import { serverAdminService } from '@/lib/server/services/adminService';

export const metadata: Metadata = {
  title: 'Coupon Management - Alceix Group Admin',
  description: 'Manage your promotional codes and discounts from the Alceix Group Admin Panel.',
};

export default async function AdminCouponsPage() {
  // Fetch initial coupons on the server
  const couponsResponse = await serverAdminService.getCoupons({ page: 1, limit: 10 });

  return (
    <CouponListingClient 
      initialCoupons={couponsResponse.data} 
      initialMetadata={couponsResponse.metadata} 
    />
  );
}
