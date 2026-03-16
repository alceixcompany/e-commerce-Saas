'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';
import { useAppDispatch } from '@/lib/hooks';
import { resetOrder } from '@/lib/slices/orderSlice';

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { clearCart } = useCart();
    const dispatch = useAppDispatch();
    
    const [status, setStatus] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        const urlStatus = searchParams.get('status');
        const urlMessage = searchParams.get('message');
        
        setStatus(urlStatus);
        setMessage(urlMessage);

        if (urlStatus === 'success') {
            // Payment was successful, clear cart and redirect to orders
            clearCart();
            dispatch(resetOrder());
            
            // Redirect after a short delay so user sees the success message
            setTimeout(() => {
                router.push('/profile?tab=orders');
            }, 3000);
        } else if (urlStatus === 'error') {
            // Error handling, redirect back to checkout
            setTimeout(() => {
                router.push('/checkout');
            }, 4000);
        }
    }, [searchParams, clearCart, dispatch, router]);

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
