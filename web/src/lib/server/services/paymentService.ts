import { serverFetch } from '../api';
import { PublicPaymentSettings } from '@/types/payment-settings';

const REVALIDATE_INTERVAL = 60; // seconds

export const serverPaymentService = {
    getPublicSettings: async (): Promise<PublicPaymentSettings | null> => {
        try {
            const response = await serverFetch<{ content: PublicPaymentSettings }>('/public/section-content/payment_settings', {
                next: { revalidate: REVALIDATE_INTERVAL }
            });
            return response?.content || null;
        } catch {
            return null;
        }
    }
};
