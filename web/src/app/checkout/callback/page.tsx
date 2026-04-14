'use client';

import { useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';
import { useAppDispatch } from '@/lib/hooks';
import { resetOrder } from '@/lib/slices/orderSlice';
import { fetchProfile } from '@/lib/slices/profileSlice';
import { setUser } from '@/lib/slices/authSlice';

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { clearCart } = useCart();
    const dispatch = useAppDispatch();
    
    const isFinalizedRef = useRef(false);
    const status = searchParams.get('status');
    const message = searchParams.get('message');

    useEffect(() => {
        if (isFinalizedRef.current) return;

        let cancelled = false;

        const finalizeSuccessfulPayment = async () => {
            isFinalizedRef.current = true;

            clearCart();
            dispatch(resetOrder());

            // Mobile browsers can arrive here before cookie-backed auth is fully restored.
            // Retry a silent profile fetch a few times so we can land on orders instead of login.
            for (let attempt = 0; attempt < 3; attempt += 1) {
                const result = await dispatch(fetchProfile({ silent: true, forceRefresh: true }));

                if (cancelled) return;

                if (fetchProfile.fulfilled.match(result)) {
                    dispatch(setUser({
                        id: result.payload._id,
                        name: result.payload.name,
                        email: result.payload.email,
                        role: result.payload.role as 'user' | 'admin',
                    }));
                    break;
                }

                if (attempt < 2) {
                    await new Promise((resolve) => setTimeout(resolve, 1200));
                }
            }

            if (cancelled) return;

            setTimeout(() => {
                if (!cancelled) {
                    router.replace('/profile?tab=orders&fromPayment=1');
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
    }, [status, clearCart, dispatch, router]);

    if (!status) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-[#164e63]/20 border-t-[#164e63] rounded-full animate-spin"></div>
                <h2 className="text-xl font-serif text-gray-900">Verifying Payment...</h2>
                <p className="text-sm text-gray-500">Please do not close or refresh this page.</p>
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
                        <h1 className="text-3xl font-serif text-gray-900">Payment Successful!</h1>
                        <p className="text-gray-500 leading-relaxed">
                            Your order has been placed successfully and your payment has been verified. 
                        </p>
                        <p className="text-xs font-bold tracking-widest text-[#164e63] uppercase">
                            Redirecting to your orders...
                        </p>
                    </>
                ) : (
                    <>
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FiAlertCircle className="text-red-500" size={40} />
                        </div>
                        <h1 className="text-3xl font-serif text-gray-900">Payment Failed</h1>
                        <p className="text-gray-500 leading-relaxed">
                            {message ? decodeURIComponent(message) : 'We could not process your payment at this time.'}
                        </p>
                        <p className="text-xs font-bold tracking-widest text-red-600 uppercase">
                            Redirecting back to checkout...
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}

export default function IyzicoCallbackPage() {
    return (
        <div className="min-h-screen pt-32 pb-20 bg-gray-50">
            <Suspense fallback={
                <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-400 rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-500">Loading payment status...</p>
                </div>
            }>
                <CallbackContent />
            </Suspense>
        </div>
    );
}
