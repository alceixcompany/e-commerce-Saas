export interface Coupon {
    _id: string;
    id: string; // Redux normalization
    code: string;
    discountType: 'percentage' | 'fixed';
    amount: number;
    expirationDate: string;
    usageLimit: number | null;
    usedCount: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
