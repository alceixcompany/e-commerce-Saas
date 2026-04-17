import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import OrderDetailsClient from '@/app/admin/orders/[id]/OrderDetailsClient';
import { serverAdminService } from '@/lib/server/services/adminService';

export const metadata: Metadata = {
  title: 'Order Details - Alceix Group Admin',
  description: 'View and manage individual order information, tracking, and fulfillment.',
};

export default async function AdminOrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // Fetch order data on the server
  const order = await serverAdminService.getAdminOrderById(id);

  if (!order) {
    return notFound();
  }

  return <OrderDetailsClient initialOrder={order} />;
}
