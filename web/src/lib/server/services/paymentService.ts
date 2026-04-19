import { publicServerFetch } from '../api';
import { PublicPaymentSettings } from '@/types/payment-settings';
import { SectionContentPayload } from '../serviceTypes';
import { buildTaggedFetchOptions } from '../cache';

const REVALIDATE_INTERVAL = 60; // seconds

export const serverPaymentService = {
    getPublicSettings: async (): Promise<PublicPaymentSettings | null> => {
        try {
            const response = await publicServerFetch<SectionContentPayload<PublicPaymentSettings>>('/public/section-content/payment_settings', {
                ...buildTaggedFetchOptions(['content', 'content:section:payment_settings'], REVALIDATE_INTERVAL)
            });
            return response?.content || null;
        } catch {
            return null;
        }
    }
};
