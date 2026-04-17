import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import UserDetailsClient from '@/app/admin/users/[id]/UserDetailsClient';
import { serverAdminService } from '@/lib/server/services/adminService';

export const metadata: Metadata = {
  title: 'User Dossier - Alceix Group Admin',
  description: 'Examine detailed member profile, contact information, and acquisition history.',
};

export default async function AdminUserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // Fetch user data on the server
  const user = await serverAdminService.getAdminUserById(id);

  if (!user) {
    return notFound();
  }

  // Fetch initial orders for the user on the server
  // Note: Backend might need a specific endpoint or params for this.
  // Assuming getAdminOrders can take a userId or search query.
  // For now, let's assume getAdminUserById returns some initial orders or we fetch them.
  // In the legacy code, it used a combined endpoint for detail + orders.
  // Assuming the user object contains orders or we fetch them separately.
  
  // Fetch orders separately if not included
  const ordersResponse = await serverAdminService.getAdminOrders({ q: user.email, limit: 10 });

  return (
    <UserDetailsClient 
      initialUser={user} 
      initialOrders={ordersResponse.data || []}
      initialMetadata={ordersResponse.metadata || { page: 1, pages: 1, total: 0 }}
    />
  );
}
