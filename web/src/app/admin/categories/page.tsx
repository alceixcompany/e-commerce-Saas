import React from 'react';
import { Metadata } from 'next';
import CategoryListingClient from './CategoryListingClient';
import { serverAdminService } from '@/lib/server/services/adminService';

export const metadata: Metadata = {
  title: 'Category Management - Alceix Group Admin',
  description: 'Manage your product categories from the Alceix Group Admin Panel.',
};

export default async function AdminCategoriesPage() {
  // Use existing service logic to fetch categories
  // Note: Category management typically uses a slightly different API but serverAdminService can handle it.
  // Actually, categories are usually fetched without complex filters for the initial list.
  const categories = await serverAdminService.getCategories();

  return (
    <CategoryListingClient initialCategories={categories} />
  );
}
