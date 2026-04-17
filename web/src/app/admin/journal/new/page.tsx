import React from 'react';
import { Metadata } from 'next';
import BlogEditor from '@/components/admin/BlogEditor';

export const metadata: Metadata = {
  title: 'Draft New Story - Alceix Group Admin',
  description: 'Compose a new narrative for the Alceix Group Journal.',
};

export default function AdminNewJournalPage() {
  return <BlogEditor />;
}
