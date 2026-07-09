export interface CartDiscount {
  code: string;
  amount: number;
  discountType: 'percentage' | 'fixed';
  discountAmount: number;
  _id: string;
}

export interface CartItem {
  id: string;
  productId?: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variationId?: string;
  variationLabel?: string;
  material?: string;
}
