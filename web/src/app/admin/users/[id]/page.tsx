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

  const details = await serverAdminService.getAdminUserDetails(id, { page: 1, limit: 10 });

  if (!details) {
    return notFound();
  }

  return (
    <UserDetailsClient 
      initialUser={details.user} 
      initialOrders={details.orders || []}
      initialMetadata={details.metadata || { page: 1, pages: 1, total: 0 }}
    />
  );
}
