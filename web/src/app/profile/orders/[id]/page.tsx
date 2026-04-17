import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import UserOrderDetailClient from '@/app/profile/orders/[id]/UserOrderDetailClient';
import { serverOrderService } from '@/lib/server/services/orderService';

export const metadata: Metadata = {
  title: 'Order Tracking - Alceix Group',
  description: 'Track your shipment, view rewards, and download official receipts.',
};

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // Fetch order data on the server using the customer-facing orderService
  const order = await serverOrderService.getUserOrderById(id);

  if (!order) {
    return notFound();
  }

  return <UserOrderDetailClient initialOrder={order} />;
}
