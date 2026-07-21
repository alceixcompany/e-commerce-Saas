import React from 'react';
import { Metadata } from 'next';
import CartClient from './CartClient';
import { serverProductService } from '@/lib/server/services/productService';

export const metadata: Metadata = {
  title: 'Your Cart',
  description: 'View your shopping cart and complete your purchase.',
};

export default async function CartPage() {
  // Fetch recommended products on the server
  // We fetch a larger set of products and filter them in the client based on cart contents
  const products = await serverProductService.getPublicProducts();
  
  return (
    <CartClient serverRecommendations={products.data} />
  );
}
