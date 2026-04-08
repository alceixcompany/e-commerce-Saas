import { Category } from '@/types/category';

export interface Product {
  _id: string;
  id: string; // Satisfy Redux Toolkit EntityAdapter constraint
  name: string;
  category: Category | string;
  shortDescription?: string;
  price: number;
  discountedPrice?: number;
  stock: number;
  sku: string;
  image: string;
  mainImage?: string;
  images?: string[];
  shippingWeight: number;
  status: 'active' | 'inactive';
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  material?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
    name: string;
    category: string;
    shortDescription: string;
    price: string;
    discountedPrice: string;
    stock: string;
    sku: string;
    mainImage: string;
    images: string[];
    shippingWeight: string;
    status: 'active' | 'inactive';
    rating?: string;
    isNewArrival: boolean;
    isBestSeller: boolean;
}
