import React from 'react';
import { Metadata } from 'next';
import NewProductClient from '@/app/admin/products/new/NewProductClient';
import { serverAdminService } from '@/lib/server/services/adminService';

export const metadata: Metadata = {
  title: 'Add New Product - Alceix Group Admin',
  description: 'Create a new product entry in the global catalog.',
};

export default async function AdminNewProductPage() {
  // Pre-fetch categories on the server
  const categories = await serverAdminService.getCategories();

  return <NewProductClient initialCategories={categories} />;
}
