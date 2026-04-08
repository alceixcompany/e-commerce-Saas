export interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  bannerImage?: string;
  status: 'active' | 'inactive';
  description?: string;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}
