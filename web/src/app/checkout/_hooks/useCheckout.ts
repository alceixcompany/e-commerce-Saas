import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { createOrder, payOrder, resetOrder } from '@/lib/slices/orderSlice';
import api from '@/lib/api';
import { ShippingAddress } from '@/types/order';

export function useCheckout() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { items, getTotalPrice, clearCart, discount, getFinalPrice } = useCart();
    const { user } = useAppSelector((state) => state.auth);
    const { globalSettings } = useAppSelector((state) => state.content);
    const { success, error } = useAppSelector((state) => state.order);

    const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
        address: '',
        city: '',
        postalCode: '',
        country: '',
    });

    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'paypal' | 'iyzico'>('paypal');
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentSettings, setPaymentSettings] = useState<any>(null);
    const [isPaymentLoading, setIsPaymentLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const [iyzicoFormContent, setIyzicoFormContent] = useState('');

    const subtotal = getTotalPrice();
    const finalPrice = getFinalPrice();
    const shipping = 0;
    const tax = 0;
    const total = finalPrice + shipping + tax;

    const currencySymbol = globalSettings.currency === 'TRY' ? '₺' :
        globalSettings.currency === 'EUR' ? '€' :
            globalSettings.currency === 'GBP' ? '£' : '$';

    useEffect(() => {
        const fetchPaymentSettings = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/public/section-content/payment_settings`);
                const result = await res.json();
                if (result.success) {
                    const settings = result.data.content;
                    setPaymentSettings(settings);
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

    const onPayPalApprove = async (data: any, actions: any) => {
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

            const createResult = await dispatch(createOrder(orderData));

            if (createOrder.fulfilled.match(createResult)) {
                const createdOrder = createResult.payload;
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
                    alert('Payment recorded failed, but order created. Please check your orders.');
                    router.push('/profile?tab=orders');
                }
            }
            setIsProcessing(false);
        } catch (err) {
            console.error('PayPal Payment Error: ', err);
            setIsProcessing(false);
            alert('Payment failed. Please try again.');
        }
    };

    const handleIyzicoPayment = async () => {
        try {
            setIsProcessing(true);
            setIyzicoFormContent('');

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

            const createResult = await dispatch(createOrder(orderData));

            if (createOrder.fulfilled.match(createResult)) {
                const createdOrder = createResult.payload;
                const res = await api.post('/orders/iyzico/initialize', { orderId: createdOrder._id });
                if (res.data.success) {
                    setIyzicoFormContent(res.data.checkoutFormContent);
                } else {
                    throw new Error(res.data.message || 'Failed to initialize payment gateway.');
                }
            }
            setIsProcessing(false);
        } catch (err: any) {
            console.error('Iyzico Init Error: ', err);
            setIsProcessing(false);
            alert(`Payment initialization failed: ${err.message || 'Please try again.'}`);
        }
    };

    const isAddressComplete = !!(shippingAddress.address && shippingAddress.city && shippingAddress.postalCode && shippingAddress.country);

    return {
        // State
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
    };
}
