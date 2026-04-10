import api from '../api';
import { PaymentSettings, PaymentSettingsResponse } from '@/types/payment-settings';

export const paymentSettingsService = {
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
