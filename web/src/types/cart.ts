export interface CartDiscount {
  code: string;
  amount: number;
  discountType: 'percentage' | 'fixed';
  discountAmount: number;
  _id: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  material?: string;
}
