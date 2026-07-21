import React from 'react';
import { Metadata } from 'next';
import JournalManagementClient from './JournalManagementClient';
import { serverAdminService } from '@/lib/server/services/adminService';

export const metadata: Metadata = {
  title: 'Journal Management - Admin',
  description: 'Manage your blog posts and editorial content from the admin panel.',
};

export default async function AdminJournalPage() {
  // Fetch initial blogs on the server
  const blogs = await serverAdminService.getAdminBlogs();

  return (
    <JournalManagementClient initialBlogs={blogs} />
  );
}
