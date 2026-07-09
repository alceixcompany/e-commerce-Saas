import { Category } from '@/types/category';

export interface ProductVariation {
  _id?: string;
  label: string;
  price: number;
  image?: string;
}

export interface ProductFormVariation {
  _id?: string;
  label: string;
  price: string;
  image?: string;
}

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
  variations?: ProductVariation[];
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
    variations: ProductFormVariation[];
    shippingWeight: string;
    status: 'active' | 'inactive';
    rating?: string;
    isNewArrival: boolean;
    isBestSeller: boolean;
}
