import { publicServerFetch } from '../api';
import { PublicPaymentSettings } from '@/types/payment-settings';
import { SectionContentPayload } from '../serviceTypes';

const REVALIDATE_INTERVAL = 60; // seconds

export const serverPaymentService = {
    getPublicSettings: async (): Promise<PublicPaymentSettings | null> => {
        try {
            const response = await publicServerFetch<SectionContentPayload<PublicPaymentSettings>>('/public/section-content/payment_settings', {
                next: { revalidate: REVALIDATE_INTERVAL }
            });
            return response?.content || null;
        } catch {
            return null;
        }
    }
};
