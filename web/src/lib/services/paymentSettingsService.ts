import api from '../api';
import { PaymentSettings, PaymentSettingsResponse, PublicPaymentSettings } from '@/types/payment-settings';

export const paymentSettingsService = {
    getPublicPaymentSettings: async (): Promise<PublicPaymentSettings | null> => {
        const response = await api.get('/public/section-content/payment_settings');
        const content = response.data?.data?.content;

        if (response.data.success) {
            return content || null;
        }

        throw new Error(response.data.message || 'Failed to fetch public payment settings');
    },

    /**
     * Fetch current payment settings (PayPal, Iyzico)
     * Admin only.
     */
    getPaymentSettings: async (): Promise<PaymentSettings> => {
        const response = await api.get<PaymentSettingsResponse>('/admin/payment-settings');
        if (response.data.success) {
            return response.data.data;
        }
        throw new Error(response.data.message || 'Failed to fetch payment settings');
    },

    /**
     * Update payment gateway configurations
     * @param settings The configuration object for all providers
     */
    updatePaymentSettings: async (settings: PaymentSettings): Promise<boolean> => {
        const response = await api.put<PaymentSettingsResponse>('/admin/payment-settings', settings);
        if (response.data.success) {
            return true;
        }
        throw new Error(response.data.message || 'Failed to update payment settings');
    }
};
