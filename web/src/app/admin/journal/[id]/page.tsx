import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogEditor from '@/components/admin/BlogEditor';
import { serverAdminService } from '@/lib/server/services/adminService';

export const metadata: Metadata = {
  title: 'Edit Story - Alceix Group Admin',
  description: 'Refine your editorial content and design narrative.',
};

export default async function AdminEditJournalPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // Fetch blog data on the server
  const blog = await serverAdminService.getAdminBlogById(id);

  if (!blog) {
    return notFound();
  }

  return <BlogEditor id={id} initialBlog={blog} />;
}
