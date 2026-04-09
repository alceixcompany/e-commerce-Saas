import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { FiAlertCircle, FiShield, FiMapPin } from 'react-icons/fi';
import IyzicoForm from './IyzicoForm';

interface PaymentSectionProps {
    isProcessing: boolean;
    error: string | null;
    isAddressComplete: boolean;
    isPaymentLoading: boolean;
    paymentSettings: any;
    selectedPaymentMethod: 'paypal' | 'iyzico';
    setSelectedPaymentMethod: (method: 'paypal' | 'iyzico') => void;
    globalSettings: any;
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
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    globalSettings,
    createOrderForPayPal,
    onPayPalApprove,
    handleIyzicoPayment,
    iyzicoFormContent
}: PaymentSectionProps) {
    return (
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center font-serif text-sm">2</div>
                <h2 className="text-xl font-serif text-foreground">Payment Method</h2>
            </div>

            <div className="bg-foreground/5 p-4 md:p-8 border border-foreground/10">
                {isProcessing && <div className="text-center text-primary mb-4 text-sm font-bold tracking-widest animate-pulse">PROCESSING PAYMENT...</div>}
                {error && <div className="text-center text-red-500 mb-4 text-sm">{error}</div>}

                {isAddressComplete ? (
                    <div className="mt-4">
                        {isPaymentLoading ? (
                            <div className="h-12 bg-foreground/5 animate-pulse rounded-lg"></div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid gap-6">

                                    {/* Tabs for Payment Selection */}
                                    {(paymentSettings?.paypal?.active && paymentSettings?.iyzico?.active) && (
                                        <div className="flex border-b border-foreground/10 mb-4">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedPaymentMethod('paypal')}
                                                className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${selectedPaymentMethod === 'paypal' ? 'border-b-2 border-primary text-foreground' : 'text-foreground/40 hover:text-foreground'}`}
                                            >
                                                PayPal
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedPaymentMethod('iyzico')}
                                                className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${selectedPaymentMethod === 'iyzico' ? 'border-b-2 border-primary text-foreground' : 'text-foreground/40 hover:text-foreground'}`}
                                            >
                                                Credit Card
                                            </button>
                                        </div>
                                    )}

                                    {paymentSettings?.paypal?.active && paymentSettings?.paypal?.clientId && selectedPaymentMethod === 'paypal' && (
                                        <div className="border border-foreground/10 p-4 rounded-xl hover:border-foreground transition-colors bg-background">
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
                                    )}

                                    {paymentSettings?.iyzico?.active && selectedPaymentMethod === 'iyzico' && (
                                        <div className="border border-foreground/10 p-4 rounded-xl hover:border-foreground transition-colors text-center bg-background">
                                            <button
                                                onClick={handleIyzicoPayment}
                                                disabled={isProcessing}
                                                className="w-full bg-foreground text-background py-4 rounded-lg font-bold tracking-widest text-sm hover:bg-foreground/90 transition-colors disabled:opacity-50"
                                            >
                                                PAY WITH CREDIT CARD (IYZICO)
                                            </button>

                                            <IyzicoForm content={iyzicoFormContent} />
                                        </div>
                                    )}
                                </div>

                                {!paymentSettings?.paypal?.active && !paymentSettings?.iyzico?.active && (
                                    <div className="text-center py-6 px-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-lg">
                                        <FiAlertCircle className="mx-auto mb-2" size={20} />
                                        <p className="text-xs font-medium uppercase tracking-wider">No Payment Methods Available</p>
                                        <p className="text-[10px] mt-1 opacity-75">Please contact support for alternative payment methods.</p>
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="mt-4 flex items-center justify-center gap-2 text-foreground/40">
                            <FiShield size={12} />
                            <span className="text-[10px] uppercase tracking-widest">Payments processed securely</span>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 px-4 border border-dashed border-foreground/20 bg-background">
                        <FiMapPin className="mx-auto mb-3 text-foreground/30" size={24} />
                        <p className="text-sm text-foreground/50 font-light">Please complete your shipping details above to unlock payment.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
