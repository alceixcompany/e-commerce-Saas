'use client';

// --- Hooks & Logic ---
import { useCheckout } from './_hooks/useCheckout';

// --- Components ---
import CheckoutHeader from './_components/CheckoutHeader';
import ShippingForm from './_components/ShippingForm';
import { useTranslation } from '@/hooks/useTranslation';
import PaymentSection from './_components/PaymentSection';
import OrderSummary from './_components/OrderSummary';
import MissingInfoModal from './_components/MissingInfoModal';
import { PublicPaymentSettings } from '@/types/payment-settings';
import { GlobalSettings } from '@/types/content';

interface CheckoutClientProps {
    initialPaymentSettings?: PublicPaymentSettings | null;
    initialGlobalSettings?: GlobalSettings | null;
}

export default function CheckoutClient({ initialPaymentSettings, initialGlobalSettings }: CheckoutClientProps) {
    const { t } = useTranslation();
    const {
        isMounted,
        user,
        items,
        subtotal,
        discount,
        shipping,
        tax,
        total,
        currencySymbol,
        shippingAddress,
        isProcessing,
        paymentSettings,
        isPaymentLoading,
        iyzicoFormContent,
        error,
        globalSettings,
        isAddressComplete,

        // Modal State
        showMissingInfoModal,
        setShowMissingInfoModal,

        // Handlers
        handleAddressChange,
        createOrderForPayPal,
        onPayPalApprove,
        handleIyzicoPayment,
        refreshUserStatus
    } = useCheckout({ initialPaymentSettings, initialGlobalSettings });

    if (!isMounted) return null;

    if (!user) {
        return (
            <div className="min-h-screen pt-40 px-6 text-center animate-in fade-in bg-background">
                <p className="font-serif text-xl text-foreground">{t('checkout.loginNotice')}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 md:pt-32 pb-20 bg-background animate-in fade-in duration-700">
            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">

                <CheckoutHeader />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 xl:gap-24">
                    {/* Left Column: Shipping & Details */}
                    <div className="space-y-12">
                        <ShippingForm
                            shippingAddress={shippingAddress}
                            handleAddressChange={handleAddressChange}
                        />

                        <PaymentSection
                            isProcessing={isProcessing}
                            error={error}
                            isAddressComplete={isAddressComplete}
                            isPaymentLoading={isPaymentLoading}
                            paymentSettings={paymentSettings}
                            globalSettings={globalSettings}
                            createOrderForPayPal={createOrderForPayPal}
                            onPayPalApprove={onPayPalApprove}
                            handleIyzicoPayment={handleIyzicoPayment}
                            iyzicoFormContent={iyzicoFormContent}
                        />
                    </div>

                    {/* Right Column: Order Summary */}
                    <OrderSummary
                        items={items}
                        currencySymbol={currencySymbol}
                        subtotal={subtotal}
                        discount={discount}
                        shipping={shipping}
                        tax={tax}
                        total={total}
                        currency={globalSettings?.currency || 'USD'}
                    />
                </div>
            </div>

            <MissingInfoModal
                isOpen={showMissingInfoModal}
                onClose={() => setShowMissingInfoModal(false)}
                user={user}
                onRefresh={async () => { await refreshUserStatus(); }}
            />
        </div>
    );
}
