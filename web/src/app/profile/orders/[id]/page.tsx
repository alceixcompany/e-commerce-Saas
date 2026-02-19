'use client';

import { useEffect, use, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { getOrderDetails } from '@/lib/slices/orderSlice';
import { FiArrowLeft, FiPackage, FiMapPin, FiCreditCard, FiCheckCircle, FiTruck, FiActivity, FiInfo, FiChevronRight } from 'react-icons/fi';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const dispatch = useAppDispatch();
    const { order, isLoading, error } = useAppSelector((state) => state.order);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            dispatch(getOrderDetails(id));
        }
    }, [dispatch, id, mounted]);

    if (!mounted) return null;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[80vh] bg-[#FAFAFA]">
                <div className="w-10 h-10 border-b-2 border-zinc-900 animate-spin rounded-full"></div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-[80vh] bg-[#FAFAFA] flex flex-col items-center justify-center px-6 text-center space-y-8">
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
                    <FiInfo size={30} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Acquisition Registry Not Found</h2>
                    <p className="text-gray-500 mt-2">The requested order record could not be located in our system.</p>
                </div>
                <Link href="/profile?tab=orders" className="bg-black text-white px-8 py-3 rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-lg">
                    Return to Registry
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] pt-24 md:pt-[120px] pb-40 font-sans">
            <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-20 space-y-8 md:space-y-12 animate-in fade-in duration-700">

                {/* Breadcrumb & Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 border-b border-gray-100 pb-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Link href="/profile?tab=orders" className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 hover:text-black transition-colors">Registry</Link>
                            <FiChevronRight className="text-gray-300" size={12} />
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-black">Acquisition Detail</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Order Receipt</h1>
                        <p className="text-gray-500 font-medium">Record Reference: <span className="font-mono text-black">#{order._id.toUpperCase()}</span></p>
                    </div>
                    <div className="flex gap-1 bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
                        <div className="px-6 py-4 text-center border-r border-gray-50">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                            <div className="flex items-center justify-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${order.isDelivered ? 'bg-blue-600' : 'bg-orange-400 animate-pulse'}`}></div>
                                <span className="text-xs font-bold uppercase tracking-widest text-gray-900">{order.isDelivered ? 'Fulfilled' : 'Processing'}</span>
                            </div>
                        </div>
                        <div className="px-6 py-4 text-center">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Payment</p>
                            <div className="flex items-center justify-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${order.isPaid ? 'bg-green-600' : 'bg-red-500 animate-pulse'}`}></div>
                                <span className="text-xs font-bold uppercase tracking-widest text-gray-900">{order.isPaid ? 'Settled' : 'Awaiting'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-6 lg:gap-10">

                    {/* Left side: Timeline and Product List */}
                    <div className="lg:col-span-8 space-y-6 md:space-y-12">

                        {/* Status Timeline */}
                        <div className="bg-white p-4 md:p-6 lg:p-10 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-8 md:mb-12">Acquisition Journey</h3>
                            <div className="relative flex justify-between items-start pt-4">
                                <div className="absolute top-[32px] left-[10%] right-[10%] h-[1px] bg-gray-50"></div>
                                {[
                                    { title: 'Registry', date: order.createdAt, done: true, icon: FiPackage },
                                    { title: 'Security', date: order.paidAt, done: order.isPaid, icon: FiCheckCircle },
                                    { title: 'Logistics', date: order.deliveredAt, done: order.isDelivered, icon: FiTruck },
                                    { title: 'Destination', date: order.deliveredAt, done: order.isDelivered, icon: FiMapPin },
                                ].map((step, i) => (
                                    <div key={i} className="relative z-10 flex flex-col items-center gap-4 text-center">
                                        <div className={`w-4 h-4 rounded-full transition-all duration-1000 flex items-center justify-center ${step.done ? 'bg-zinc-900 ring-4 ring-zinc-50' : 'bg-gray-100'}`}>
                                            {step.done && <FiCheckCircle className="text-white bg-black rounded-full" size={10} />}
                                        </div>
                                        <div className={`space-y-1 ${step.done ? 'opacity-100' : 'opacity-30'}`}>
                                            <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-gray-900">{step.title}</p>
                                            <p className="text-[8px] md:text-[9px] font-mono text-gray-400">{step.date ? new Date(step.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }) : '---'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Product List */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-4 md:p-8 border-b border-gray-50">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900">Registry Artifacts</h3>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {order.orderItems.map((item: any, idx: number) => (
                                    <div key={idx} className="p-4 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-10 group">
                                        <div className="w-full md:w-32 h-40 bg-gray-50 p-4 rounded-xl border border-gray-100 relative group-hover:border-black transition-colors">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg">
                                                {item.qty}
                                            </div>
                                        </div>
                                        <div className="flex-1 text-center md:text-left space-y-2">
                                            <h4 className="text-xl font-bold text-gray-900 leading-tight">{item.name}</h4>
                                            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                                <span>REF #OC-{item.product.substring(item.product.length - 4).toUpperCase()}</span>
                                                <span className="text-gray-200">|</span>
                                                <span className="text-gray-900">Unit Cost: ${item.price.toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900">
                                            ${(item.qty * item.price).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right side: Financial & Logistics Summary */}
                    <aside className="lg:col-span-4 space-y-6 md:space-y-10">
                        {/* Financial Registry */}
                        <div className="bg-white p-4 md:p-6 lg:p-10 rounded-2xl border border-gray-100 shadow-sm space-y-8">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400">Financial Registry</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                                    <span>Base Value</span>
                                    <span className="text-gray-900 font-mono">${(order.itemsPrice || (order.totalPrice - (order.shippingPrice || 0) - (order.taxPrice || 0) + (order.coupon?.discountAmount || 0))).toLocaleString()}</span>
                                </div>
                                {order.coupon && order.coupon.code && (
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-green-600">
                                        <span>Discount ({order.coupon.code})</span>
                                        <span className="font-mono">-${order.coupon.discountAmount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                                    <span>Logistics Fee</span>
                                    <span className="text-gray-900 font-mono">${order.shippingPrice?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                                    <span>Registry Duty</span>
                                    <span className="text-gray-900 font-mono">${order.taxPrice?.toLocaleString()}</span>
                                </div>
                                <div className="pt-8 mt-8 border-t border-gray-100 flex flex-col items-end">
                                    <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-gray-300 mb-2">Total Combined Acquisition</p>
                                    <p className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tighter">${order.totalPrice.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Logistical Destination */}
                        <div className="bg-white p-4 md:p-6 lg:p-10 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400">Destination Point</h3>
                                <FiMapPin className="text-gray-300" />
                            </div>
                            <div className="space-y-4">
                                <p className="font-bold text-gray-900 text-lg">{order.shippingAddress?.fullName || 'Identity Registry'}</p>
                                <div className="text-sm font-medium text-gray-500 space-y-1 leading-relaxed">
                                    <p>{order.shippingAddress?.address}</p>
                                    <p>{order.shippingAddress?.district}, {order.shippingAddress?.city}</p>
                                    <div className="flex items-center gap-2 pt-4">
                                        <span className="bg-gray-50 px-2 py-1 rounded text-[10px] font-mono border border-gray-100">{order.shippingAddress?.postalCode}</span>
                                        <span className="bg-gray-50 px-2 py-1 rounded text-[10px] font-mono border border-gray-100">{order.shippingAddress?.phone}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security Notice Card */}
                        <div className="bg-zinc-900 p-8 rounded-2xl text-white shadow-xl relative overflow-hidden">
                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center gap-3">
                                    <FiActivity className="text-green-400" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest">Digital Certificate Verified</p>
                                </div>
                                <p className="text-[10px] font-medium leading-relaxed opacity-60">
                                    This document confirms your acquisition into the Ocean Gem collection. Registry reference ID recognized across all international locations.
                                </p>
                            </div>
                            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
