export interface PayPalSettings {
    active: boolean;
    clientId: string;
    clientSecret: string;
    mode: 'sandbox' | 'live';
}

export interface IyzicoSettings {
    active: boolean;
    apiKey: string;
    secretKey: string;
    baseUrl: string;
}

export interface PaymentSettings {
    paypal: PayPalSettings;
    iyzico: IyzicoSettings;
    storeUrl?: string;
}

export interface PublicPayPalSettings {
    active: boolean;
    clientId: string;
    mode: 'sandbox' | 'live';
}

export interface PublicIyzicoSettings {
    active: boolean;
}

export interface PublicPaymentSettings {
    paypal: PublicPayPalSettings;
    iyzico: PublicIyzicoSettings;
    storeUrl?: string;
}

export interface PaymentSettingsResponse {
    success: boolean;
    data: PaymentSettings;
    message?: string;
}

export interface IyzicoInitializeResponse {
    success: boolean;
    checkoutFormContent: string;
    token: string;
    paymentPageUrl: string;
    message?: string;
}
