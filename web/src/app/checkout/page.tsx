'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { FiLock, FiShield, FiMapPin, FiCreditCard, FiCheck, FiAlertCircle } from 'react-icons/fi';

import { useCart } from '@/contexts/CartContext';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { createOrder, payOrder, resetOrder } from '@/lib/slices/orderSlice';

export default function CheckoutPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { items, getTotalPrice, clearCart, discount, getFinalPrice } = useCart();
    const { user } = useAppSelector((state) => state.auth);
    const { globalSettings } = useAppSelector((state) => state.content);
    const { success, order, error } = useAppSelector((state) => state.order);

    const currencySymbol = globalSettings.currency === 'TRY' ? '₺' : 
                          globalSettings.currency === 'EUR' ? '€' : 
                          globalSettings.currency === 'GBP' ? '£' : '$';

    const [shippingAddress, setShippingAddress] = useState({
        address: '',
        city: '',
        postalCode: '',
        country: '',
    });
    
    // New state for selected payment method ('paypal' or 'iyzico')
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'paypal' | 'iyzico'>('paypal');

    // Add order state local representation if redux order object typing is missing token
    // The Redux state returns isAuthenticated and user, token is also in state.auth
    const { token: authStateToken } = useAppSelector((state) => state.auth);
    const orderAuthToken = authStateToken;

    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentSettings, setPaymentSettings] = useState<any>(null);
    const [isPaymentLoading, setIsPaymentLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    const subtotal = getTotalPrice();
    const finalPrice = getFinalPrice();
    const shipping = 0;
    const tax = 0;
    const total = finalPrice + shipping + tax;

    useEffect(() => {
        const fetchPaymentSettings = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/public/section-content/payment_settings`);
                const result = await res.json();
                if (result.success) {
                    const settings = result.data.content;
                    setPaymentSettings(settings);
                    // Default logic for semantic tab highlight
                    if (settings?.paypal?.active && !settings?.iyzico?.active) {
                        setSelectedPaymentMethod('paypal');
                    } else if (!settings?.paypal?.active && settings?.iyzico?.active) {
                        setSelectedPaymentMethod('iyzico');
                    }
                }
            } catch (err) {
                console.error('Failed to fetch payment settings:', err);
            } finally {
                setIsPaymentLoading(false);
            }
        };
        fetchPaymentSettings();
        
        if (items.length === 0 && !success) {
            router.push('/cart');
        }

        setIsMounted(true);
    }, [items, router, success]);




    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setShippingAddress({
            ...shippingAddress,
            [e.target.name]: e.target.value,
        });
    };

    const createOrderForPayPal = async (data: any, actions: any) => {
        return actions.order.create({
            purchase_units: [
                {
                    amount: {
                        value: total.toFixed(2),
                    },
                },
            ],
        });
    };

    const onApprove = async (data: any, actions: any) => {
        try {
            setIsProcessing(true);
            const details = await actions.order.capture();

            const orderData = {
                orderItems: items.map(item => ({
                    name: item.name,
                    qty: item.quantity,
                    image: item.image,
                    price: item.price,
                    product: item.id
                })),
                shippingAddress,
                paymentMethod: 'PayPal',
                itemsPrice: subtotal,
                taxPrice: tax,
                shippingPrice: shipping,
                totalPrice: total,
                coupon: discount ? {
                    code: discount.code,
                    discountAmount: discount.discountAmount
                } : undefined
            };

            // 1. Create Order
            const createResult = await dispatch(createOrder(orderData));

            if (createOrder.fulfilled.match(createResult)) {
                const createdOrder = createResult.payload;

                // 2. Pay Order
                const payResult = await dispatch(payOrder({
                    orderId: createdOrder._id,
                    paymentResult: {
                        id: details.id,
                        status: details.status,
                        update_time: details.update_time,
                        email_address: details.payer.email_address,
                    }
                }));

                if (payOrder.fulfilled.match(payResult)) {
                    alert('Order placed successfully!');
                    clearCart();
                    dispatch(resetOrder());
                    router.push('/profile?tab=orders');
                } else {
                    console.error('Payment update failed', payResult);
                    alert('Payment recorded failed, but order created. Please check your orders.');
                    router.push('/profile?tab=orders');
                }
            }
            setIsProcessing(false);
        } catch (err) {
            console.error('Payment Error: ', err);
            setIsProcessing(false);
            alert('Payment failed. Please try again.');
        }
    };

    const [iyzicoFormContent, setIyzicoFormContent] = useState('');

    useEffect(() => {
        // Script to ensure Iyzico form scripts execute after innerHTML is set
        if (iyzicoFormContent) {
            const scriptElements = document.getElementById('iyzipay-checkout-form')?.getElementsByTagName('script');
            if (scriptElements && scriptElements.length > 0) {
                for (let i = 0; i < scriptElements.length; i++) {
                    const newScript = document.createElement('script');
                    newScript.text = scriptElements[i].text;
                    document.body.appendChild(newScript).parentNode?.removeChild(newScript);
                }
            }
        }
    }, [iyzicoFormContent]);

    const handleIyzicoPayment = async () => {
        try {
            setIsProcessing(true);
            setIyzicoFormContent(''); // Reset if clicking again

            const orderData = {
                orderItems: items.map(item => ({
                    name: item.name,
                    qty: item.quantity,
                    image: item.image,
                    price: item.price,
                    product: item.id
                })),
                shippingAddress,
                paymentMethod: 'Iyzico',
                itemsPrice: subtotal,
                taxPrice: tax,
                shippingPrice: shipping,
                totalPrice: total,
                coupon: discount ? {
                    code: discount.code,
                    discountAmount: discount.discountAmount
                } : undefined
            };

            // 1. Create Order (Unpaid initially)
            const createResult = await dispatch(createOrder(orderData));

            if (createOrder.fulfilled.match(createResult)) {
                const createdOrder = createResult.payload;

                // 2. Initialize Iyzico Checkout Form
                const token = orderAuthToken; // Redux auth token
                if(!token) throw new Error("Authentication required");

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/orders/iyzico/initialize`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ orderId: createdOrder._id })
                });

                const data = await res.json();
                
                if (data.success) {
                    setIyzicoFormContent(data.checkoutFormContent);
                } else {
                    throw new Error(data.message || 'Failed to initialize payment gateway.');
                }
            }
            setIsProcessing(false);
        } catch (err: any) {
            console.error('Iyzico Init Error: ', err);
            setIsProcessing(false);
            alert(`Payment initialization failed: ${err.message || 'Please try again.'}`);
        }
    };

    if (!isMounted) return null;

    if (!user) {
        return (
            <div className="min-h-screen pt-40 px-6 text-center animate-in fade-in bg-background">
                <p className="font-serif text-xl text-foreground">Please log in to checkout.</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen pt-24 md:pt-32 pb-20 bg-background animate-in fade-in duration-700">
            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">

                <div className="flex items-center justify-between mb-12 border-b border-foreground/10 pb-8">
                    <h1 className="text-2xl md:text-3xl font-serif text-foreground">Secure Checkout</h1>
                    <div className="flex items-center gap-2 text-primary">
                        <FiLock size={16} />
                        <span className="text-xs font-bold uppercase tracking-widest">Encrypted & Safe</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 xl:gap-24">

                    {/* Left Column: Shipping & Details */}
                    <div className="space-y-12">

                        {/* Step 1: Shipping */}
                        <div>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center font-serif text-sm">1</div>
                                <h2 className="text-xl font-serif text-foreground">Shipping Details</h2>
                            </div>

                            <div className="bg-foreground/5 p-4 md:p-8 border border-foreground/10">
                                <form className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-1">Address Line</label>
                                        <div className="relative border-b border-foreground/10 focus-within:border-foreground transition-colors group bg-background px-3">
                                            <input
                                                type="text"
                                                name="address"
                                                value={shippingAddress.address}
                                                onChange={handleAddressChange}
                                                placeholder="123 Ocean Drive"
                                                required
                                                className="w-full bg-transparent py-4 text-sm text-foreground focus:outline-none placeholder:text-foreground/20"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-1">City</label>
                                            <div className="relative border-b border-foreground/10 focus-within:border-foreground transition-colors group bg-background px-3">
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={shippingAddress.city}
                                                    onChange={handleAddressChange}
                                                    placeholder="New York"
                                                    required
                                                    className="w-full bg-transparent py-4 text-sm text-foreground focus:outline-none placeholder:text-foreground/20"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-1">Postal Code</label>
                                            <div className="relative border-b border-foreground/10 focus-within:border-foreground transition-colors group bg-background px-3">
                                                <input
                                                    type="text"
                                                    name="postalCode"
                                                    value={shippingAddress.postalCode}
                                                    onChange={handleAddressChange}
                                                    placeholder="10001"
                                                    required
                                                    className="w-full bg-transparent py-4 text-sm text-foreground focus:outline-none placeholder:text-foreground/20"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-1">Country</label>
                                        <div className="relative border-b border-foreground/10 focus-within:border-foreground transition-colors group bg-background px-3">
                                            <input
                                                type="text"
                                                name="country"
                                                value={shippingAddress.country}
                                                onChange={handleAddressChange}
                                                placeholder="United States"
                                                required
                                                className="w-full bg-transparent py-4 text-sm text-foreground focus:outline-none placeholder:text-foreground/20"
                                            />
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Step 2: Payment */}
                        <div>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center font-serif text-sm">2</div>
                                <h2 className="text-xl font-serif text-foreground">Payment Method</h2>
                            </div>

                            <div className="bg-foreground/5 p-4 md:p-8 border border-foreground/10">
                                {isProcessing && <div className="text-center text-primary mb-4 text-sm font-bold tracking-widest animate-pulse">PROCESSING PAYMENT...</div>}
                                {error && <div className="text-center text-red-500 mb-4 text-sm">{error}</div>}

                                {shippingAddress.address && shippingAddress.city && shippingAddress.postalCode && shippingAddress.country ? (
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
                                                                    onApprove={onApprove}
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
                                                            
                                                            {iyzicoFormContent && (
                                                                <div 
                                                                    className="mt-4"
                                                                    id="iyzipay-checkout-form"
                                                                >
                                                                    <div dangerouslySetInnerHTML={{ __html: iyzicoFormContent }} />
                                                                </div>
                                                            )}
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

                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:sticky lg:top-32 h-fit">
                        <div className="bg-background border border-foreground/10 shadow-xl p-6 md:p-8 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>

                            <h2 className="text-2xl font-serif text-foreground mb-8 pb-4 border-b border-foreground/10 flex justify-between items-center">
                                Your Order
                                <span className="text-sm font-sans font-normal text-foreground/40">{items.length} Items</span>
                            </h2>

                            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar mb-8">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4 group">
                                        <div className="w-16 h-20 bg-foreground/5 overflow-hidden shrink-0 border border-foreground/10">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className="text-sm font-medium text-foreground font-serif line-clamp-2 pr-2">{item.name}</h3>
                                                <p className="text-sm font-medium text-foreground">{currencySymbol}{(item.price * item.quantity).toLocaleString()}</p>
                                            </div>
                                            <p className="text-xs text-foreground/40">Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 pt-6 border-t border-foreground/10">
                                <div className="flex justify-between text-sm">
                                    <span className="text-foreground/50 font-light">Subtotal</span>
                                    <span className="text-foreground">{currencySymbol}{subtotal.toLocaleString()}</span>
                                </div>
                                {discount && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-green-600 font-light">Discount ({discount.code})</span>
                                        <span className="text-green-600">-{currencySymbol}{discount.discountAmount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-foreground/50 font-light">Shipping</span>
                                    <span className="text-primary font-bold text-xs uppercase tracking-widest">Free</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-foreground/50 font-light">Tax</span>
                                    <span className="text-foreground">{currencySymbol}0.00</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-end mt-8 pt-6 border-t border-foreground/10">
                                <span className="text-lg font-serif text-foreground">Total</span>
                                <div className="text-right">
                                    <span className="text-xs text-foreground/40 block mb-1">{globalSettings.currency || 'USD'}</span>
                                    <span className="text-3xl font-serif text-foreground font-medium">{currencySymbol}{total.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="mt-8 bg-foreground/5 p-4 text-center">
                                <p className="text-[10px] text-foreground/40 leading-relaxed">
                                    By proceeding with the payment, you agree to our Terms of Service and Privacy Policy. All transactions are secure and encrypted.
                                </p>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
