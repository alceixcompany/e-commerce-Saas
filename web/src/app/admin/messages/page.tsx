import React from 'react';
import { Metadata } from 'next';
import MessageListingClient from './MessageListingClient';
import { serverAdminService } from '@/lib/server/services/adminService';

export const metadata: Metadata = {
  title: 'Messages - Alceix Group Admin',
  description: 'View and manage customer messages from the contact form.',
};

export default async function AdminMessagesPage() {
  // Fetch messages on the server
  const messagesResponse = await serverAdminService.getMessages({ page: 1, limit: 50 });

  return (
    <MessageListingClient initialMessages={messagesResponse.data || []} />
  );
}
