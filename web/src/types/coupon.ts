export interface Coupon {
    _id: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    amount: number;
    expirationDate: string;
    usageLimit: number | null;
    usedCount: number;
    isActive: boolean;
}
