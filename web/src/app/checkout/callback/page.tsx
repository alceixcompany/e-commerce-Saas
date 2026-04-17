'use client';

import { useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';
import { useOrderStore } from '@/lib/store/useOrderStore';
import { useUserStore } from '@/lib/store/useUserStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useTranslation } from '@/hooks/useTranslation';

const PAYMENT_CALLBACK_ERROR_KEYS = {
    gateway_connection_failed: 'checkout.callback.errors.gateway_connection_failed',
    invalid_order_id: 'checkout.callback.errors.invalid_order_id',
    order_not_found: 'checkout.callback.errors.order_not_found',
    invalid_payment_amount: 'checkout.callback.errors.invalid_payment_amount',
    amount_mismatch: 'checkout.callback.errors.amount_mismatch',
    currency_mismatch: 'checkout.callback.errors.currency_mismatch',
    payment_rejected: 'checkout.callback.errors.payment_rejected',
    callback_processing_failed: 'checkout.callback.errors.callback_processing_failed',
    server_error: 'checkout.callback.errors.server_error',
} as const;

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { clearCart } = useCart();
    const { resetOrder } = useOrderStore();
    const { fetchProfile } = useUserStore();
    const { setUser } = useAuthStore();
    const { t } = useTranslation();
    
    const isFinalizedRef = useRef(false);
    const status = searchParams.get('status');
    const message = searchParams.get('message');

    useEffect(() => {
        if (isFinalizedRef.current) return;

        let cancelled = false;

        const finalizeSuccessfulPayment = async () => {
            isFinalizedRef.current = true;
            const targetUrl = '/profile?tab=orders&fromPayment=1';

            clearCart();
            resetOrder();

            // Mobile browsers can arrive here before cookie-backed auth is fully restored.
            // Retry a silent profile fetch a few times so we can land on orders instead of login.
            let profileRecovered = false;
            for (let attempt = 0; attempt < 3; attempt += 1) {
                try {
                    const profile = await fetchProfile(true);
                    if (cancelled) return;
                    
                    if (profile) {
                        profileRecovered = true;
                        setUser({
                            id: profile._id,
                            name: profile.name,
                            email: profile.email,
                            role: profile.role as 'user' | 'admin',
                        });
                        break;
                    }
                } catch (e) {
                    // continue to next attempt
                }

                if (attempt < 2) {
                    await new Promise((resolve) => setTimeout(resolve, 1200));
                }
            }

            if (cancelled) return;

            setTimeout(() => {
                if (!cancelled) {
                    if (typeof window !== 'undefined') {
                        if (profileRecovered) {
                            window.location.replace(targetUrl);
                            return;
                        }

                        window.location.replace(`/login?returnUrl=${encodeURIComponent(targetUrl)}`);
                        return;
                    }

                    router.replace(targetUrl);
                }
            }, 3000);
        };

        if (status === 'success') {
            void finalizeSuccessfulPayment();
        } else if (status === 'error') {
            isFinalizedRef.current = true;
            setTimeout(() => {
                router.push('/checkout');
            }, 4000);
        }

        return () => {
            cancelled = true;
        };
    }, [status, clearCart, router, fetchProfile, resetOrder, setUser]);

    const translatedErrorMessage = (() => {
        if (!message) return t('checkout.callback.errors.generic');
        const decodedMessage = decodeURIComponent(message);
        const translationKey = PAYMENT_CALLBACK_ERROR_KEYS[decodedMessage as keyof typeof PAYMENT_CALLBACK_ERROR_KEYS];
        return translationKey ? t(translationKey) : decodedMessage;
    })();

    if (!status) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-[#164e63]/20 border-t-[#164e63] rounded-full animate-spin"></div>
                <h2 className="text-xl font-serif text-gray-900">{t('checkout.callback.verifyingTitle')}</h2>
                <p className="text-sm text-gray-500">{t('checkout.callback.verifyingDesc')}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
            <div className="bg-white p-8 md:p-12 border border-gray-100 shadow-xl max-w-md w-full text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
                {status === 'success' ? (
                    <>
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FiCheckCircle className="text-green-500" size={40} />
                        </div>
                        <h1 className="text-3xl font-serif text-gray-900">{t('checkout.callback.successTitle')}</h1>
                        <p className="text-gray-500 leading-relaxed">
                            {t('checkout.callback.successDesc')}
                        </p>
                        <p className="text-xs font-bold tracking-widest text-[#164e63] uppercase">
                            {t('checkout.callback.successRedirect')}
                        </p>
                    </>
                ) : (
                    <>
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FiAlertCircle className="text-red-500" size={40} />
                        </div>
                        <h1 className="text-3xl font-serif text-gray-900">{t('checkout.callback.errorTitle')}</h1>
                        <p className="text-gray-500 leading-relaxed">
                            {translatedErrorMessage}
                        </p>
                        <p className="text-xs font-bold tracking-widest text-red-600 uppercase">
                            {t('checkout.callback.errorRedirect')}
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}

export default function IyzicoCallbackPage() {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen pt-32 pb-20 bg-gray-50">
            <Suspense fallback={
                <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-400 rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-500">{t('checkout.callback.loadingStatus')}</p>
                </div>
            }>
                <CallbackContent />
            </Suspense>
        </div>
    );
}
