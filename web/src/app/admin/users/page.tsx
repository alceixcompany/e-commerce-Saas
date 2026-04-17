import React from 'react';
import { Metadata } from 'next';
import UserManagementClient from './UserManagementClient';
import { serverAdminService } from '@/lib/server/services/adminService';

export const metadata: Metadata = {
  title: 'User Management - Alceix Group Admin',
  description: 'Manage your members and administrators from the Alceix Group Admin Panel.',
};

export default async function AdminUsersPage() {
  // Fetch initial users on the server (by default spent/desc)
  const users = await serverAdminService.getAdminUsers({ sort: 'spent' });

  return (
    <UserManagementClient initialUsers={users} />
  );
}
