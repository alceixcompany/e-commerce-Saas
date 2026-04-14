import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { FiAlertCircle, FiShield, FiMapPin } from 'react-icons/fi';
import IyzicoForm from './IyzicoForm';

import { GlobalSettings } from '@/types/content';
import { PublicPaymentSettings } from '@/types/payment-settings';
import { useTranslation } from '@/hooks/useTranslation';

interface PaymentSectionProps {
    isProcessing: boolean;
    error: string | null;
    isAddressComplete: boolean;
    isPaymentLoading: boolean;
    paymentSettings: PublicPaymentSettings | null;
    globalSettings: GlobalSettings;
    createOrderForPayPal: (data: any, actions: any) => Promise<any>;
    onPayPalApprove: (data: any, actions: any) => Promise<void>;
    handleIyzicoPayment: () => Promise<void>;
    iyzicoFormContent: string;
}

export default function PaymentSection({
    isProcessing,
    error,
    isAddressComplete,
    isPaymentLoading,
    paymentSettings,
    globalSettings,
    createOrderForPayPal,
    onPayPalApprove,
    handleIyzicoPayment,
    iyzicoFormContent
}: PaymentSectionProps) {
    const { t } = useTranslation();
    return (
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center font-serif text-sm">2</div>
                <h2 className="text-xl font-serif text-foreground">{t('checkout.payment.title')}</h2>
            </div>

            <div className="bg-foreground/5 p-4 md:p-8 border border-foreground/10">
                {isProcessing && <div className="text-center text-primary mb-4 text-sm font-bold tracking-widest animate-pulse">{t('checkout.payment.processing').toUpperCase()}</div>}
                {error && <div className="text-center text-red-500 mb-4 text-sm">{error || t('checkout.payment.error')}</div>}

                {isAddressComplete ? (
                    <div className="mt-4">
                        {isPaymentLoading ? (
                            <div className="h-12 bg-foreground/5 animate-pulse rounded-lg"></div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid gap-6">

                                    <div className="space-y-8">
                                        {/* PayPal Section */}
                                        {paymentSettings?.paypal?.active && paymentSettings?.paypal?.clientId && (
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/60">{t('checkout.payment.paypal.title')}</span>
                                                </div>
                                                <div className="border border-foreground/10 p-6 rounded-2xl hover:border-foreground transition-colors bg-background shadow-sm">
                                                    <PayPalScriptProvider options={{
                                                        clientId: paymentSettings.paypal.clientId,
                                                        currency: globalSettings.currency || "USD",
                                                        intent: "capture",
                                                    }}>
                                                        <PayPalButtons
                                                            fundingSource="paypal"
                                                            style={{
                                                                layout: "vertical",
                                                                color: "gold",
                                                                shape: "rect",
                                                                label: "pay",
                                                                height: 48
                                                            }}
                                                            createOrder={createOrderForPayPal}
                                                            onApprove={onPayPalApprove}
                                                        />
                                                    </PayPalScriptProvider>
                                                </div>
                                            </div>
                                        )}

                                        {/* Iyzico Section */}
                                        {paymentSettings?.iyzico?.active && (
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/60">{t('checkout.payment.iyzico.title')}</span>
                                                </div>
                                                <div className="border border-foreground/10 p-6 rounded-2xl hover:border-foreground transition-all text-center bg-background shadow-sm group">
                                                    <button
                                                        onClick={handleIyzicoPayment}
                                                        disabled={isProcessing || !!iyzicoFormContent}
                                                        className="w-full bg-foreground text-background py-4 rounded-xl font-bold tracking-widest text-sm hover:bg-foreground/90 transition-all disabled:opacity-50 shadow-lg shadow-foreground/5 group-hover:scale-[1.01] active:scale-[0.99]"
                                                    >
                                                        {t('checkout.payment.placeOrder').toUpperCase()}
                                                    </button>

                                                    <IyzicoForm content={iyzicoFormContent} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {!paymentSettings?.paypal?.active && !paymentSettings?.iyzico?.active && (
                                    <div className="text-center py-6 px-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-lg">
                                        <FiAlertCircle className="mx-auto mb-2" size={20} />
                                        <p className="text-xs font-medium uppercase tracking-wider">{t('checkout.payment.noMethods')}</p>
                                        <p className="text-[10px] mt-1 opacity-75">{t('checkout.payment.noMethodsDesc')}</p>
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="mt-4 flex items-center justify-center gap-2 text-foreground/40">
                            <FiShield size={12} />
                            <span className="text-[10px] uppercase tracking-widest">{t('checkout.payment.securePayment')}</span>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 px-4 border border-dashed border-foreground/20 bg-background">
                        <FiMapPin className="mx-auto mb-3 text-foreground/30" size={24} />
                        <p className="text-sm text-foreground/50 font-light">{t('checkout.payment.chooseMethod')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
