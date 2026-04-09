'use client';

// --- Hooks & Logic ---
import { useCheckout } from './_hooks/useCheckout';

// --- Components ---
import CheckoutHeader from './_components/CheckoutHeader';
import ShippingForm from './_components/ShippingForm';
import PaymentSection from './_components/PaymentSection';
import OrderSummary from './_components/OrderSummary';

export default function CheckoutPage() {
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
        selectedPaymentMethod,
        setSelectedPaymentMethod,
        isProcessing,
        paymentSettings,
        isPaymentLoading,
        iyzicoFormContent,
        error,
        globalSettings,
        isAddressComplete,

        // Handlers
        handleAddressChange,
        createOrderForPayPal,
        onPayPalApprove,
        handleIyzicoPayment
    } = useCheckout();

    if (!isMounted) return null;

    if (!user) {
        return (
            <div className="min-h-screen pt-40 px-6 text-center animate-in fade-in bg-background">
                <p className="font-serif text-xl text-foreground">Please log in to checkout.</p>
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
                            selectedPaymentMethod={selectedPaymentMethod}
                            setSelectedPaymentMethod={setSelectedPaymentMethod}
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
                        currency={globalSettings.currency || 'USD'}
                    />
                </div>
            </div>
        </div>
    );
}
