import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import EditProductClient from '@/app/admin/products/edit/[id]/EditProductClient';
import { serverAdminService } from '@/lib/server/services/adminService';

export const metadata: Metadata = {
  title: 'Edit Product - Alceix Group Admin',
  description: 'Modify product specifications, pricing, and availability.',
};

export default async function AdminEditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // Pre-fetch data on the server
  const [product, categories] = await Promise.all([
    serverAdminService.getAdminProductById(id),
    serverAdminService.getCategories()
  ]);

  if (!product) {
    return notFound();
  }

  return (
    <EditProductClient 
      productId={id} 
      initialData={{ product, categories }} 
    />
  );
}
