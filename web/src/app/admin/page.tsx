import React from 'react';
import { Metadata } from 'next';
import DashboardClient from './DashboardClient';
import { serverAdminService } from '@/lib/server/services/adminService';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Manage your e-commerce operations from the admin dashboard.',
};

export default async function AdminDashboardPage() {
  // Fetch initial stats on the server
  const stats = await serverAdminService.getDashboardStats();
  
  return (
    <DashboardClient initialStats={stats} />
  );
}
