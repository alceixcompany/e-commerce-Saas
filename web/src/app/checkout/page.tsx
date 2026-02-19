'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { FiLock, FiShield, FiMapPin, FiCreditCard, FiCheck } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { createOrder, payOrder, resetOrder } from '@/lib/slices/orderSlice';

export default function CheckoutPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { items, getTotalPrice, clearCart, discount, getFinalPrice } = useCart();
    const { user } = useAppSelector((state) => state.auth);
    const { success, order, error } = useAppSelector((state) => state.order);

    const [shippingAddress, setShippingAddress] = useState({
        address: '',
        city: '',
        postalCode: '',
        country: '',
    });

    const [isProcessing, setIsProcessing] = useState(false);

    const subtotal = getTotalPrice();
    const finalPrice = getFinalPrice();
    const shipping = 0;
    const tax = 0;
    const total = finalPrice + shipping + tax;

    const initialOptions = {
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
        currency: "USD",
        intent: "capture",
    };

    useEffect(() => {
        if (items.length === 0 && !success) {
            router.push('/cart');
        }
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

    if (!user) {
        return (
            <div className="min-h-screen pt-40 px-6 text-center animate-in fade-in">
                <p className="font-serif text-xl">Please log in to checkout.</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen pt-24 md:pt-32 pb-20 bg-white animate-in fade-in duration-700">
            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">

                <div className="flex items-center justify-between mb-12 border-b border-gray-100 pb-8">
                    <h1 className="text-2xl md:text-3xl font-serif text-[#164e63]">Secure Checkout</h1>
                    <div className="flex items-center gap-2 text-[#C5A059]">
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
                                <div className="w-8 h-8 rounded-full bg-[#164e63] text-white flex items-center justify-center font-serif text-sm">1</div>
                                <h2 className="text-xl font-serif text-gray-900">Shipping Details</h2>
                            </div>

                            <div className="bg-[#FBFBFB] p-4 md:p-8 border border-gray-100">
                                <form className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Address Line</label>
                                        <div className="relative border-b border-gray-200 focus-within:border-[#164e63] transition-colors group bg-white px-3">
                                            <input
                                                type="text"
                                                name="address"
                                                value={shippingAddress.address}
                                                onChange={handleAddressChange}
                                                placeholder="123 Ocean Drive"
                                                required
                                                className="w-full bg-transparent py-4 text-sm text-gray-900 focus:outline-none placeholder:text-gray-300"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">City</label>
                                            <div className="relative border-b border-gray-200 focus-within:border-[#164e63] transition-colors group bg-white px-3">
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={shippingAddress.city}
                                                    onChange={handleAddressChange}
                                                    placeholder="New York"
                                                    required
                                                    className="w-full bg-transparent py-4 text-sm text-gray-900 focus:outline-none placeholder:text-gray-300"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Postal Code</label>
                                            <div className="relative border-b border-gray-200 focus-within:border-[#164e63] transition-colors group bg-white px-3">
                                                <input
                                                    type="text"
                                                    name="postalCode"
                                                    value={shippingAddress.postalCode}
                                                    onChange={handleAddressChange}
                                                    placeholder="10001"
                                                    required
                                                    className="w-full bg-transparent py-4 text-sm text-gray-900 focus:outline-none placeholder:text-gray-300"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Country</label>
                                        <div className="relative border-b border-gray-200 focus-within:border-[#164e63] transition-colors group bg-white px-3">
                                            <input
                                                type="text"
                                                name="country"
                                                value={shippingAddress.country}
                                                onChange={handleAddressChange}
                                                placeholder="United States"
                                                required
                                                className="w-full bg-transparent py-4 text-sm text-gray-900 focus:outline-none placeholder:text-gray-300"
                                            />
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Step 2: Payment */}
                        <div>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-8 h-8 rounded-full bg-[#164e63] text-white flex items-center justify-center font-serif text-sm">2</div>
                                <h2 className="text-xl font-serif text-gray-900">Payment Method</h2>
                            </div>

                            <div className="bg-[#FBFBFB] p-4 md:p-8 border border-gray-100">
                                {isProcessing && <div className="text-center text-[#C5A059] mb-4 text-sm font-bold tracking-widest animate-pulse">PROCESSING PAYMENT...</div>}
                                {error && <div className="text-center text-red-500 mb-4 text-sm">{error}</div>}

                                {shippingAddress.address && shippingAddress.city && shippingAddress.postalCode && shippingAddress.country ? (
                                    <div className="mt-4">
                                        <PayPalScriptProvider options={initialOptions}>
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
                                        <div className="mt-4 flex items-center justify-center gap-2 text-gray-400">
                                            <FiShield size={12} />
                                            <span className="text-[10px] uppercase tracking-widest">Payments processed securely by PayPal</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 px-4 border border-dashed border-gray-300 bg-white">
                                        <FiMapPin className="mx-auto mb-3 text-gray-300" size={24} />
                                        <p className="text-sm text-gray-500 font-light">Please complete your shipping details above to unlock payment.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:sticky lg:top-32 h-fit">
                        <div className="bg-white border border-gray-100 shadow-xl p-6 md:p-8 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-[#C5A059]"></div>

                            <h2 className="text-2xl font-serif text-gray-900 mb-8 pb-4 border-b border-gray-100 flex justify-between items-center">
                                Your Order
                                <span className="text-sm font-sans font-normal text-gray-400">{items.length} Items</span>
                            </h2>

                            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar mb-8">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4 group">
                                        <div className="w-16 h-20 bg-gray-50 overflow-hidden shrink-0 border border-gray-100">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className="text-sm font-medium text-gray-900 font-serif line-clamp-2 pr-2">{item.name}</h3>
                                                <p className="text-sm font-medium text-gray-900">${(item.price * item.quantity).toLocaleString()}</p>
                                            </div>
                                            <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 pt-6 border-t border-gray-100">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-light">Subtotal</span>
                                    <span className="text-gray-900">${subtotal.toLocaleString()}</span>
                                </div>
                                {discount && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-green-600 font-light">Discount ({discount.code})</span>
                                        <span className="text-green-600">-${discount.discountAmount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-light">Shipping</span>
                                    <span className="text-[#C5A059] font-bold text-xs uppercase tracking-widest">Free</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-light">Tax</span>
                                    <span className="text-gray-900">$0.00</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-end mt-8 pt-6 border-t border-gray-100">
                                <span className="text-lg font-serif text-gray-900">Total</span>
                                <div className="text-right">
                                    <span className="text-xs text-gray-400 block mb-1">USD</span>
                                    <span className="text-3xl font-serif text-[#164e63] font-medium">${total.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="mt-8 bg-gray-50 p-4 text-center">
                                <p className="text-[10px] text-gray-400 leading-relaxed">
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
