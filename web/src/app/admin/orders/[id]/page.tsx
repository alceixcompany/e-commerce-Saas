'use client';

import { useEffect, use } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { getOrderDetails, deliverOrder } from '@/lib/slices/orderSlice';
import { FiArrowLeft, FiPackage, FiMapPin, FiUser, FiCreditCard, FiCheck, FiInfo, FiTruck, FiActivity } from 'react-icons/fi';
import Link from 'next/link';

export default function AdminOrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const dispatch = useAppDispatch();
    const { order, isLoading, error } = useAppSelector((state) => state.order);

    useEffect(() => {
        dispatch(getOrderDetails(id));
    }, [dispatch, id]);

    const handleDeliver = async () => {
        if (order && confirm('Are you sure you want to mark this order as delivered?')) {
            await dispatch(deliverOrder(order._id));
            dispatch(getOrderDetails(id));
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#164e63]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-12 text-center max-w-2xl mx-auto">
                <div className="bg-red-50 text-red-600 p-8 rounded-2xl border border-red-100 italic">
                    <FiInfo size={32} className="mx-auto mb-4" />
                    Error loading order: {error}
                </div>
                <Link href="/admin/orders" className="mt-8 inline-block text-[#164e63] font-medium hover:underline">
                    Back to Orders
                </Link>
            </div>
        );
    }

    if (!order) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header / Page Title */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <Link href="/admin/orders" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-[#164e63] mb-4 transition-colors">
                        <FiArrowLeft /> Back to List
                    </Link>
                    <div className="flex items-baseline gap-4">
                        <h1 className="text-4xl font-serif text-gray-900">Order Details</h1>
                        <span className="text-gray-400 font-mono text-lg">#{order._id.substring(order._id.length - 8).toUpperCase()}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {!order.isDelivered && order.isPaid && (
                        <button
                            onClick={handleDeliver}
                            className="px-8 py-3 bg-[#164e63] text-white text-xs font-bold uppercase tracking-[0.2em] hover:bg-black transition-all shadow-lg shadow-[#164e63]/20 rounded-lg flex items-center gap-2"
                        >
                            <FiTruck /> Mark as Shipped
                        </button>
                    )}
                    <span className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border ${order.isPaid ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                        }`}>
                        {order.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                    <span className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border ${order.isDelivered ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                        }`}>
                        {order.isDelivered ? 'Delivered' : 'Processing'}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                {/* Product List Area */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_30px_-10px_rgba(0,0,0,0.05)] overflow-hidden">
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                            <h3 className="text-lg font-serif text-gray-900 flex items-center gap-3">
                                <div className="p-2 bg-[#164e63]/5 rounded-xl text-[#164e63]"><FiPackage /></div>
                                Ordered Items
                            </h3>
                            <span className="text-sm font-medium text-gray-400">{order.orderItems.length} Products</span>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {order.orderItems.map((item: any, idx: number) => (
                                <div key={idx} className="p-8 flex gap-6 items-center group transition-colors">
                                    <div className="w-24 h-28 bg-[#FAFAFA] rounded-2xl overflow-hidden shrink-0 border border-gray-100 p-2">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <h4 className="text-base font-medium text-gray-900">{item.name}</h4>
                                        <p className="text-xs text-gray-400 font-mono">ID: {item.product}</p>
                                        <div className="pt-2 flex items-center gap-4">
                                            <span className="text-sm font-medium py-1 px-3 bg-gray-50 rounded-full border border-gray-100">Qty: {item.qty}</span>
                                            <span className="text-sm text-gray-500">Price: ${item.price.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <div className="text-lg font-serif font-bold text-[#164e63]">
                                        ${(item.qty * item.price).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-8 bg-gray-50 text-right space-y-2">
                            <div className="flex justify-end gap-12 text-sm text-gray-500">
                                <span>Subtotal:</span>
                                <span className="font-medium text-gray-900">${(order.itemsPrice || (order.totalPrice - (order.shippingPrice || 0) - (order.taxPrice || 0) + (order.coupon?.discountAmount || 0))).toFixed(2)}</span>
                            </div>
                            {order.coupon && order.coupon.code && (
                                <div className="flex justify-end gap-12 text-sm text-green-600 font-medium">
                                    <span>Discount ({order.coupon.code}):</span>
                                    <span>-${order.coupon.discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-end gap-12 text-sm text-gray-500">
                                <span>Shipping:</span>
                                <span className="font-medium text-gray-900">${order.shippingPrice?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-end gap-12 text-sm text-gray-500">
                                <span>Tax:</span>
                                <span className="font-medium text-gray-900">${order.taxPrice?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-end gap-12 pt-4 border-t border-gray-200 text-xl font-serif font-bold text-[#164e63]">
                                <span>Total:</span>
                                <span>${order.totalPrice?.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Timeline / Activity Simulation */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_30px_-10px_rgba(0,0,0,0.05)] p-8">
                        <h3 className="text-lg font-serif text-gray-900 flex items-center gap-3 mb-8">
                            <div className="p-2 bg-[#164e63]/5 rounded-xl text-[#164e63]"><FiActivity /></div>
                            Activity Timeline
                        </h3>
                        <div className="space-y-8 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-gray-100">
                            {[
                                {
                                    title: 'Order Placed',
                                    date: order.createdAt,
                                    done: true,
                                    icon: FiPackage,
                                    color: 'bg-green-500'
                                },
                                {
                                    title: 'Payment Confirmed',
                                    date: order.paidAt,
                                    done: order.isPaid,
                                    icon: FiCreditCard,
                                    color: order.isPaid ? 'bg-green-500' : 'bg-gray-200'
                                },
                                {
                                    title: 'Shipped to Customer',
                                    date: order.deliveredAt,
                                    done: order.isDelivered,
                                    icon: FiTruck,
                                    color: order.isDelivered ? 'bg-green-500' : 'bg-gray-200'
                                }
                            ].map((step, i) => (
                                <div key={i} className={`flex gap-6 relative transition-opacity ${step.done ? 'opacity-100' : 'opacity-40'}`}>
                                    <div className={`w-7 h-7 rounded-full ${step.color} text-white flex items-center justify-center z-10 shrink-0 shadow-lg`}>
                                        <step.icon size={14} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold uppercase tracking-widest text-gray-900">{step.title}</h4>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {step.date ? new Date(step.date).toLocaleString() : 'Pending'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Info Area */}
                <div className="space-y-8">
                    {/* Customer Card */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_30px_-10px_rgba(0,0,0,0.05)] p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#164e63]/5 rounded-bl-[100px]"></div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-[#164e64] mb-8 flex items-center gap-2">
                            <FiUser /> Customer Information
                        </h3>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-[#164e63] text-white flex items-center justify-center text-xl font-serif">
                                {order.user?.name?.[0] || '?'}
                            </div>
                            <div>
                                <h4 className="font-serif text-lg text-gray-900">{order.user?.name}</h4>
                                <p className="text-xs text-gray-400">Customer since {new Date(order.user?.createdAt || Date.now()).getFullYear()}</p>
                            </div>
                        </div>
                        <div className="space-y-3 pt-6 border-t border-gray-50">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Email</span>
                                <span className="font-medium text-gray-900">{order.user?.email}</span>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_30px_-10px_rgba(0,0,0,0.05)] p-8">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-[#164e63] mb-8 flex items-center gap-2">
                            <FiMapPin /> Delivery Address
                        </h3>
                        <div className="space-y-1 text-gray-600">
                            <p className="font-serif text-lg text-gray-900 mb-2">{order.shippingAddress?.fullName || order.user?.name}</p>
                            <p className="text-sm leading-relaxed">{order.shippingAddress?.address}</p>
                            <p className="text-sm">{order.shippingAddress?.district}, {order.shippingAddress?.city}</p>
                            <p className="text-sm font-mono tracking-tighter text-gray-400">{order.shippingAddress?.postalCode}</p>
                            <p className="text-sm font-medium text-gray-900 pt-2">{order.shippingAddress?.country || order.shippingAddress?.phone}</p>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_30px_-10px_rgba(0,0,0,0.05)] p-8">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-[#164e63] mb-8 flex items-center gap-2">
                            <FiCreditCard /> Payment Status
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Method</span>
                                <span className="text-sm font-medium text-gray-900 uppercase">{order.paymentMethod}</span>
                            </div>
                            {order.isPaid ? (
                                <div className="space-y-4">
                                    <div className="p-4 bg-green-50 rounded-2xl border border-green-100 text-center">
                                        <FiCheck className="mx-auto mb-1 text-green-500" size={20} />
                                        <p className="text-[10px] uppercase font-bold tracking-widest text-green-700">Payment Confirmed</p>
                                    </div>
                                    <div className="text-[10px] text-gray-400 font-mono text-center space-y-1">
                                        <p>TXN: {order.paymentResult?.id}</p>
                                        <p>DATE: {new Date(order.paidAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 bg-red-50 rounded-2xl border border-red-100 text-center italic text-xs text-red-600">
                                    Awaiting payment confirmation
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
