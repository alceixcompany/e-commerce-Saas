import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { createOrder, payOrder, resetOrder } from '@/lib/slices/orderSlice';
import { fetchProfile } from '@/lib/slices/profileSlice';
import api from '@/lib/api';
import { ShippingAddress, Order } from '@/types/order';
import { PublicPaymentSettings, IyzicoInitializeResponse } from '@/types/payment-settings';
import { profileService } from '@/lib/services/profileService';
import { setUser } from '@/lib/slices/authSlice';
import { getCurrencySymbol } from '@/utils/currency';
import { UserProfile } from '@/types/profile';

const mapProfileToAuthUser = (profile: UserProfile) => ({
    id: profile._id,
    name: profile.name,
    email: profile.email,
    role: profile.role as 'user' | 'admin',
    phone: profile.phone,
});

export function useCheckout() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { items, getTotalPrice, clearCart, discount, getFinalPrice } = useCart();
    const { user: authUser } = useAppSelector((state) => state.auth);
    const { profile: user } = useAppSelector((state) => state.profile);
    const { globalSettings } = useAppSelector((state) => state.content);
    const { success, error } = useAppSelector((state) => state.order);

    const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
        address: '',
        city: '',
        postalCode: '',
        country: '',
    });

    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentSettings, setPaymentSettings] = useState<PublicPaymentSettings | null>(null);
    const [isPaymentLoading, setIsPaymentLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const [iyzicoFormContent, setIyzicoFormContent] = useState('');
    const [showMissingInfoModal, setShowMissingInfoModal] = useState(false);
    const iyzicoInitInFlightRef = useRef(false);
    const activeIyzicoOrderIdRef = useRef<string | null>(null);

    const subtotal = getTotalPrice();
    const finalPrice = getFinalPrice();
    const shipping = globalSettings?.shippingFee || 0;
    const tax = Math.round(((finalPrice * (globalSettings?.taxRate || 0)) / 100) * 100) / 100;
    const total = finalPrice + shipping + tax;

    const currencySymbol = getCurrencySymbol(globalSettings.currency);

    useEffect(() => {
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

    const refreshUserStatus = async () => {
        try {
            const refreshResult = await dispatch(fetchProfile({ forceRefresh: true }));
            if (fetchProfile.fulfilled.match(refreshResult)) {
                dispatch(setUser(mapProfileToAuthUser(refreshResult.payload)));
                return refreshResult.payload;
            }

            const freshUser = await profileService.fetchProfile({ silent: true });
            dispatch(setUser(mapProfileToAuthUser(freshUser)));
            return freshUser;
        } catch (err) {
            console.error('Failed to refresh user status:', err);
            return null;
        }
    };

    const validateUserProfile = () => {
        // Merge profile and auth state so a stale slice does not hide fresh phone updates.
        const currentUser = {
            ...(authUser || {}),
            ...(user || {}),
            phone: user?.phone || authUser?.phone || '',
        };

        // 1. Phone is ALWAYS mandatory
        if (!currentUser?.phone || currentUser?.phone === '') {
            setShowMissingInfoModal(true);
            return false;
        }

        return true;
    };

    const createOrderForPayPal = async (data: any, actions: any) => {
        if (!validateUserProfile()) return;
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
                    clearCart();
                    dispatch(resetOrder());
                    router.push('/profile?tab=orders');
                } else {
                    // Fail silently or handle via global order error
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
                const createdOrder = createResult.payload as Order;
                activeIyzicoOrderIdRef.current = createdOrder._id;
                const res = await api.post<IyzicoInitializeResponse>('/orders/iyzico/initialize', { orderId: createdOrder._id });
                if (res.data.success) {
                    setIyzicoFormContent(res.data.checkoutFormContent);
                } else {
                    activeIyzicoOrderIdRef.current = null;
                    throw new Error(res.data.message || 'Failed to initialize payment gateway.');
                }
            }
        } catch (err: any) {
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
