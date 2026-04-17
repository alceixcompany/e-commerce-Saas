import React from 'react';
import { Metadata } from 'next';
import ProductListingClient from './ProductListingClient';
import { serverAdminService } from '@/lib/server/services/adminService';

export const metadata: Metadata = {
  title: 'Manage Products - Alceix Group Admin',
  description: 'View and manage your product catalog from the Alceix Group Admin Panel.',
};

export default async function AdminProductsPage() {
  // Parallel fetch of initial products and categories on the server
  const [productsResponse, categories] = await Promise.all([
    serverAdminService.getAdminProducts({ page: 1, limit: 10 }),
    serverAdminService.getCategories()
  ]);

  return (
    <ProductListingClient 
      initialProducts={productsResponse.data} 
      initialMetadata={productsResponse.metadata} 
      categories={categories} 
    />
  );
}
