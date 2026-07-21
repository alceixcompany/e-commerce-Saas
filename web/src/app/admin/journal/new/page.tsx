import React from 'react';
import { Metadata } from 'next';
import BlogEditor from '@/components/admin/BlogEditor';

export const metadata: Metadata = {
  title: 'Draft New Story - Admin',
  description: 'Compose a new journal article.',
};

export default function AdminNewJournalPage() {
  return <BlogEditor />;
}
