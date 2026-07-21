import React from 'react';
import { Metadata } from 'next';
import UserManagementClient from './UserManagementClient';
import { serverAdminService } from '@/lib/server/services/adminService';

export const metadata: Metadata = {
  title: 'User Management - Admin',
  description: 'Manage your members and administrators from the admin panel.',
};

export default async function AdminUsersPage() {
  // Fetch initial users on the server (by default spent/desc)
  const users = await serverAdminService.getAdminUsers({ sort: 'spent' });

  return (
    <UserManagementClient initialUsers={users} />
  );
}
