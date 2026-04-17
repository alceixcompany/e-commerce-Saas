import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useUserStore } from '@/lib/store/useUserStore';
import { useContentStore } from '@/lib/store/useContentStore';
import { useOrderStore } from '@/lib/store/useOrderStore';
import api from '@/lib/api';
import { ShippingAddress, Order as OrderType } from '@/types/order';
import { PublicPaymentSettings, IyzicoInitializeResponse } from '@/types/payment-settings';
import { getCurrencySymbol } from '@/utils/currency';
import { UserProfile } from '@/types/profile';

const createCheckoutAttemptKey = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    return `checkout_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
};

const mapProfileToAuthUser = (profile: UserProfile) => ({
    id: profile._id,
    name: profile.name,
    email: profile.email,
    role: profile.role as 'user' | 'admin',
    phone: profile.phone,
});

import type { CreateOrderActions, CreateOrderData, OnApproveActions, OnApproveData } from '@paypal/paypal-js';
import { GlobalSettings } from '@/types/content';

interface UseCheckoutProps {
    initialPaymentSettings?: PublicPaymentSettings | null;
    initialGlobalSettings?: GlobalSettings | null;
}

export function useCheckout({ initialPaymentSettings, initialGlobalSettings }: UseCheckoutProps = {}) {
    const router = useRouter();
    const { items, getTotalPrice, clearCart, discount, getFinalPrice } = useCart();
    
    // Zustand Stores
    const { user: authUser, setUser } = useAuthStore();
    const { profile: user, fetchProfile } = useUserStore();
    const { globalSettings: storeGlobalSettings } = useContentStore();
    const { 
        createOrder, 
        payOrder, 
        resetOrder, 
        error 
    } = useOrderStore();

    const globalSettings = initialGlobalSettings || storeGlobalSettings;

    const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
        address: '',
        city: '',
        postalCode: '',
        country: '',
    });

    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentSettings, setPaymentSettings] = useState<PublicPaymentSettings | null>(initialPaymentSettings || null);
    const [isPaymentLoading, setIsPaymentLoading] = useState(!initialPaymentSettings);
    const [isMounted, setIsMounted] = useState(false);
    const [iyzicoFormContent, setIyzicoFormContent] = useState('');
    const [showMissingInfoModal, setShowMissingInfoModal] = useState(false);
    const iyzicoInitInFlightRef = useRef(false);
    const activeIyzicoOrderIdRef = useRef<string | null>(null);
    const checkoutAttemptKeyRef = useRef<string>(createCheckoutAttemptKey());
    const checkoutSignatureRef = useRef<string>('');

    const subtotal = getTotalPrice();
    const finalPrice = getFinalPrice();
    const shipping = globalSettings?.shippingFee || 0;
    const tax = Math.round(((finalPrice * (globalSettings?.taxRate || 0)) / 100) * 100) / 100;
    const total = finalPrice + shipping + tax;

    const currencySymbol = getCurrencySymbol(globalSettings?.currency);

    useEffect(() => {
        if (!paymentSettings && isPaymentLoading) {
            const fetchPaymentSettings = async () => {
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/public/section-content/payment_settings`);
                    const result = await res.json();
                    if (result.success) {
                        setPaymentSettings(result.data.content);
                    }
                } catch (err) {
                    console.error('Failed to fetch payment settings:', err);
                } finally {
                    setIsPaymentLoading(false);
                }
            };
            fetchPaymentSettings();
        } else {
            setIsPaymentLoading(false);
        }

        // We check isMounted here to prevent redirect during hydration
        if (isMounted && items.length === 0) {
            router.push('/cart');
        }

        setIsMounted(true);
    }, [items, router, isMounted, paymentSettings, isPaymentLoading]);

    useEffect(() => {
        const nextSignature = JSON.stringify({
            items: items.map((item) => ({
                id: item.id,
                quantity: item.quantity,
                price: item.price,
            })),
            shippingAddress,
            couponCode: discount?.code || null,
            couponDiscountAmount: discount?.discountAmount || 0,
            shipping,
            tax,
            total,
        });

        if (checkoutSignatureRef.current && checkoutSignatureRef.current !== nextSignature) {
            checkoutAttemptKeyRef.current = createCheckoutAttemptKey();
            activeIyzicoOrderIdRef.current = null;
            setIyzicoFormContent('');
        }

        checkoutSignatureRef.current = nextSignature;
    }, [items, shippingAddress, discount, shipping, tax, total]);

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setShippingAddress({
            ...shippingAddress,
            [e.target.name]: e.target.value,
        });
    };

    const refreshUserStatus = async () => {
        try {
            const freshUser = await fetchProfile(true);
            if (freshUser) {
                setUser(mapProfileToAuthUser(freshUser));
            }
            return freshUser;
        } catch (err) {
            console.error('Failed to refresh user status:', err);
            return null;
        }
    };

    const validateUserProfile = () => {
        const currentUser = {
            ...(authUser || {}),
            ...(user || {}),
            phone: user?.phone || authUser?.phone || '',
        };

        if (!currentUser?.phone || currentUser?.phone === '') {
            setShowMissingInfoModal(true);
            return false;
        }

        return true;
    };

    const createOrderForPayPal = async (_data: CreateOrderData, actions: CreateOrderActions): Promise<string> => {
        if (!validateUserProfile()) {
            throw new Error('User profile is incomplete');
        }
        if (!actions.order) {
            throw new Error('PayPal Actions Order is undefined');
        }
        return actions.order.create({
            intent: "CAPTURE",
            purchase_units: [
                {
                    amount: {
                        currency_code: globalSettings?.currency || 'USD',
                        value: total.toFixed(2),
                    },
                },
            ],
        });
    };

    const onPayPalApprove = async (_data: OnApproveData, actions: OnApproveActions) => {
        try {
            setIsProcessing(true);
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
                idempotencyKey: checkoutAttemptKeyRef.current,
                itemsPrice: subtotal,
                taxPrice: tax,
                shippingPrice: shipping,
                totalPrice: total,
                coupon: discount ? {
                    code: discount.code,
                    discountAmount: discount.discountAmount
                } : undefined
            };

            const createdOrder = await createOrder(orderData);

            if (createdOrder) {
                if (!actions.order) throw new Error('PayPal Actions Order is undefined');
                const details = await actions.order.capture();
                
                try {
                    await payOrder(createdOrder._id, {
                        id: details.id || '',
                        status: details.status || '',
                        update_time: details.update_time || '',
                        email_address: details.payer?.email_address || '',
                    });
                    
                    clearCart();
                    resetOrder();
                    checkoutAttemptKeyRef.current = createCheckoutAttemptKey();
                    router.push('/profile?tab=orders');
                } catch (payErr) {
                    console.error('PayPal Capture/Pay Sync Error:', payErr);
                    router.push('/profile?tab=orders');
                }
            }
            setIsProcessing(false);
        } catch (err) {
            console.error('PayPal Payment Error: ', err);
            setIsProcessing(false);
        }
    };

    const handleIyzicoPayment = async () => {
        if (!validateUserProfile()) return;
        if (iyzicoInitInFlightRef.current || activeIyzicoOrderIdRef.current || iyzicoFormContent) {
            return;
        }

        iyzicoInitInFlightRef.current = true;
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
                idempotencyKey: checkoutAttemptKeyRef.current,
                itemsPrice: subtotal,
                taxPrice: tax,
                shippingPrice: shipping,
                totalPrice: total,
                coupon: discount ? {
                    code: discount.code,
                    discountAmount: discount.discountAmount
                } : undefined
            };

            const createdOrder = await createOrder(orderData);

            if (createdOrder) {
                activeIyzicoOrderIdRef.current = createdOrder._id;
                const res = await api.post<IyzicoInitializeResponse>('/orders/iyzico/initialize', { orderId: createdOrder._id });
                if (res.data.success) {
                    setIyzicoFormContent(res.data.checkoutFormContent);
                } else {
                    activeIyzicoOrderIdRef.current = null;
                    throw new Error(res.data.message || 'Failed to initialize payment gateway.');
                }
            }
        } catch (err: unknown) {
            console.error('Iyzico Init Error: ', err);
            activeIyzicoOrderIdRef.current = null;
            setIyzicoFormContent('');
        } finally {
            iyzicoInitInFlightRef.current = false;
            setIsProcessing(false);
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
    };
}
