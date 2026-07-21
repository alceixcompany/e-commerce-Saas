import React from 'react';
import { Metadata } from 'next';
import OrderListingClient from './OrderListingClient';
import { serverAdminService } from '@/lib/server/services/adminService';

export const metadata: Metadata = {
  title: 'Order Management - Admin',
  description: 'View and manage customer orders from the admin panel.',
};

export default async function AdminOrdersPage() {
  // Fetch initial orders on the server
  const ordersResponse = await serverAdminService.getAdminOrders({ page: 1, limit: 10 });

  return (
    <OrderListingClient 
      initialOrders={ordersResponse.data} 
      initialMetadata={ordersResponse.metadata} 
    />
  );
}
