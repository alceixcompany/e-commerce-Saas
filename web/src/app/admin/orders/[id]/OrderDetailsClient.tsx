'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useOrderStore } from '@/lib/store/useOrderStore';
import { useContentStore } from '@/lib/store/useContentStore';
import { 
    FiArrowLeft, FiPackage, FiMapPin, FiUser,
    FiX, FiTruck, FiActivity,
    FiClock,
    FiBox, FiCheckCircle, FiChevronDown
} from 'react-icons/fi';
import type { IconType } from 'react-icons';
import Link from 'next/link';
import { getCurrencySymbol } from '@/utils/currency';
import { useTranslation } from '@/hooks/useTranslation';
import { Order, OrderItem } from '@/types/order';

const UPDATABLE_ORDER_STATUSES = ['received', 'preparing', 'shipped', 'delivered'] as const;

interface OrderDetailsClientProps {
    initialOrder: Order;
}

export default function OrderDetailsClient({ initialOrder }: OrderDetailsClientProps) {
    const { t } = useTranslation();
    const { currentOrder: storeOrder, bulkUpdateStatus } = useOrderStore();
    const { globalSettings } = useContentStore();
    
    // Fallback to initialOrder if store is empty
    const order = storeOrder?._id === initialOrder._id ? storeOrder : initialOrder;
    const currencySymbol = getCurrencySymbol(order.currency || globalSettings?.currency);
    
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [showStatusMenu, setShowStatusMenu] = useState(false);

    const handleStatusUpdate = async (status: 'received' | 'preparing' | 'shipped' | 'delivered') => {
        if (!order) return;
        
        const statusLabel = t(`admin.commerce.orders.status.${status}`);
        if (confirm(t('admin.commerce.orders.bulk.confirmUpdate', { count: 1, status: statusLabel }))) {
            setIsUpdatingStatus(true);
            try {
                await bulkUpdateStatus([order._id], status);
                setShowStatusMenu(false);
            } finally {
                setIsUpdatingStatus(false);
            }
        }
    };

    const statusConfig: Record<string, { label: string, color: string, icon: IconType }> = {
        pending: { label: t('admin.commerce.orders.status.pending'), color: 'bg-zinc-500/10 text-zinc-600 border-zinc-500/20', icon: FiClock },
        received: { label: t('admin.commerce.orders.status.received'), color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20', icon: FiPackage },
        preparing: { label: t('admin.commerce.orders.status.preparing'), color: 'bg-orange-500/10 text-orange-600 border-orange-500/20', icon: FiBox },
        shipped: { label: t('admin.commerce.orders.status.shipped'), color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: FiTruck },
        delivered: { label: t('admin.commerce.orders.status.delivered'), color: 'bg-green-500/10 text-green-600 border-green-500/20', icon: FiCheckCircle },
        failed: { label: t('admin.commerce.orders.filters.failed'), color: 'bg-red-500/10 text-red-600 border-red-500/20', icon: FiX },
    };

    const currentStatus = (order.paymentStatus === 'failed' ? statusConfig.failed : statusConfig[order.status || 'received']) || statusConfig.received;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Minimal Breadcrumb & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <Link href="/admin/orders" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 hover:text-foreground mb-4 transition-all">
                        <FiArrowLeft /> {t('admin.commerce.orders.table.registry')}
                    </Link>
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold text-foreground tracking-tight">{t('admin.commerce.orders.table.operations')}</h1>
                        <span className="text-foreground/20 font-mono text-lg font-medium selection:bg-foreground selection:text-background tracking-tighter decoration-1 underline underline-offset-8 decoration-foreground/5">
                            #{order._id.substring(order._id.length - 8).toUpperCase()}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3 relative">
                    {order.isPaid && (
                        <div className="relative">
                            <button
                                onClick={() => setShowStatusMenu(!showStatusMenu)}
                                disabled={isUpdatingStatus}
                                className={`px-6 py-3 bg-foreground text-background text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-foreground/80 transition-all rounded-xl shadow-lg shadow-foreground/10 flex items-center gap-3 ${isUpdatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <FiActivity size={14} /> 
                                {t('admin.commerce.orders.table.operations')}
                                <FiChevronDown className={`transition-transform duration-300 ${showStatusMenu ? 'rotate-180' : ''}`} />
                            </button>

                            {showStatusMenu && (
                                <>
                                    <div 
                                        className="fixed inset-0 z-10" 
                                        onClick={() => setShowStatusMenu(false)}
                                    ></div>
                                    <div className="absolute right-0 mt-2 w-48 bg-background border border-foreground/10 rounded-xl shadow-2xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                        {UPDATABLE_ORDER_STATUSES.map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => handleStatusUpdate(status)}
                                                disabled={order.status === status}
                                                className={`w-full px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-left transition-all flex items-center gap-3 ${
                                                    order.status === status 
                                                        ? 'bg-foreground/5 text-foreground/20 cursor-not-allowed' 
                                                        : 'text-foreground/60 hover:bg-foreground hover:text-background'
                                                }`}
                                            >
                                                {status === 'received' && <FiPackage size={12} />}
                                                {status === 'preparing' && <FiBox size={12} />}
                                                {status === 'shipped' && <FiTruck size={12} />}
                                                {status === 'delivered' && <FiCheckCircle size={12} />}
                                                {t(`admin.commerce.orders.status.${status}`)}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                    <div className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border flex items-center gap-2 ${currentStatus.color}`}>
                        <currentStatus.icon size={12} className={order.status === 'delivered' ? '' : 'animate-pulse'} />
                        {currentStatus.label}
                    </div>
                </div>
            </div>

            {/* Quick KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-background p-6 rounded-2xl border border-foreground/10 shadow-sm relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-foreground/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                    <div className="relative">
                        <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-1">{t('admin.commerce.orders.table.volume')}</p>
                        <h3 className="text-2xl font-bold text-foreground">{currencySymbol}{order.totalPrice.toFixed(2)}</h3>
                    </div>
                </div>
                <div className="bg-background p-6 rounded-2xl border border-foreground/10 shadow-sm relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-foreground/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                    <div className="relative">
                        <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-1">{t('common.quantity')}</p>
                        <h3 className="text-2xl font-bold text-foreground">{order.orderItems.length} {t('common.products')}</h3>
                    </div>
                </div>
                <div className="bg-background p-6 rounded-2xl border border-foreground/10 shadow-sm relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-foreground/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                    <div className="relative">
                        <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-1">{t('admin.commerce.orders.table.date')}</p>
                        <h3 className="text-2xl font-bold text-foreground">{new Date(order.createdAt).toLocaleDateString()}</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Product List */}
                    <div className="bg-background rounded-2xl border border-foreground/10 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-foreground/5 flex items-center justify-between">
                            <h3 className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] flex items-center gap-3">
                                <div className="p-1.5 bg-foreground/5 rounded-lg"><FiPackage size={14} /></div>
                                {t('admin.commerce.orders.table.registry')}
                            </h3>
                        </div>
                        <div className="divide-y divide-foreground/5">
                            {order.orderItems.map((item: OrderItem, idx: number) => (
                                <div key={idx} className="p-6 flex gap-6 items-center group transition-all hover:bg-foreground/[0.02]">
                                    <div className="w-16 h-20 bg-foreground/5 rounded-xl overflow-hidden shrink-0 border border-foreground/5 p-2 flex items-center justify-center">
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                unoptimized
                                                sizes="64px"
                                                className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <h4 className="text-sm font-bold text-foreground tracking-tight">{item.name}</h4>
                                        <div className="flex items-center gap-3 pt-1">
                                            <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest py-1 px-3 bg-foreground/5 rounded-full">
                                                {t('common.quantity')}: {item.qty}
                                            </span>
                                            <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">
                                                {currencySymbol}{item.price.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold text-foreground">
                                        {currencySymbol}{(item.qty * item.price).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Totals Breakdown */}
                        <div className="p-8 bg-foreground/[0.02] border-t border-foreground/5">
                            <div className="max-w-xs ml-auto space-y-3">
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-foreground/40">
                                    <span>Subtotal</span>
                                    <span className="text-foreground">{currencySymbol}{(order.itemsPrice || (order.totalPrice - (order.shippingPrice || 0) - (order.taxPrice || 0) + (order.coupon?.discountAmount || 0))).toFixed(2)}</span>
                                </div>
                                {order.coupon && order.coupon.code && (
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-green-500">
                                        <span>Discount ({order.coupon.code})</span>
                                        <span>-{currencySymbol}{order.coupon.discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-foreground/40">
                                    <span>Shipping</span>
                                    <span className="text-foreground">{currencySymbol}{order.shippingPrice?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-foreground/40 pb-4">
                                    <span>Tax</span>
                                    <span className="text-foreground">{currencySymbol}{order.taxPrice?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between pt-4 border-t border-foreground/10 items-baseline">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/30">Grand Total</span>
                                    <span className="text-2xl font-bold text-foreground tracking-tighter">{currencySymbol}{order.totalPrice?.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-background rounded-2xl border border-foreground/10 shadow-sm p-8">
                        <h3 className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] flex items-center gap-3 mb-10">
                            <div className="p-1.5 bg-foreground/5 rounded-lg"><FiActivity size={14} /></div>
                            {t('admin.commerce.orders.table.timeline')}
                        </h3>
                        <div className="space-y-12 relative before:absolute before:left-[13px] before:top-2 before:bottom-2 before:w-[2px] before:bg-foreground/5">
                            {[
                                { 
                                    title: t('admin.commerce.orders.status.received'), 
                                    date: order.createdAt, 
                                    done: true, 
                                    icon: FiPackage, 
                                    active: order.status === 'received' 
                                },
                                { 
                                    title: t('admin.commerce.orders.status.preparing'), 
                                    date: ['preparing', 'shipped', 'delivered'].includes(order.status || '') ? (order.status === 'preparing' ? new Date().toISOString() : null) : null, 
                                    done: ['preparing', 'shipped', 'delivered'].includes(order.status || ''), 
                                    icon: FiBox, 
                                    active: order.status === 'preparing' 
                                },
                                { 
                                    title: t('admin.commerce.orders.status.shipped'), 
                                    date: ['shipped', 'delivered'].includes(order.status || '') ? (order.status === 'shipped' ? new Date().toISOString() : null) : null, 
                                    done: ['shipped', 'delivered'].includes(order.status || ''), 
                                    icon: FiTruck, 
                                    active: order.status === 'shipped' 
                                },
                                { 
                                    title: t('admin.commerce.orders.status.delivered'), 
                                    date: order.deliveredAt, 
                                    done: order.status === 'delivered', 
                                    icon: FiCheckCircle, 
                                    active: order.status === 'delivered' 
                                }
                            ].map((step, i) => (
                                <div key={i} className={`flex gap-8 relative transition-all duration-500 ${step.done ? 'opacity-100' : 'opacity-20'}`}>
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center z-10 shrink-0 shadow-sm border-2 transition-all ${
                                        step.done 
                                            ? 'bg-foreground border-foreground text-background' 
                                            : 'bg-background border-foreground/10 text-foreground/40'
                                    }`}>
                                        {step.icon ? <step.icon size={12} className={step.active ? 'animate-pulse' : ''} /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                                    </div>
                                    <div className="flex flex-col">
                                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">{step.title}</h4>
                                        <p className="text-[10px] text-foreground/40 mt-1 font-medium tracking-wide">
                                            {step.date ? new Date(step.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : t('admin.commerce.orders.status.awaiting')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">
                    {/* Customer Card */}
                    <div className="bg-background rounded-2xl border border-foreground/10 shadow-sm p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-foreground/[0.03] rounded-bl-[100px] transition-transform group-hover:scale-110"></div>
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/30 mb-6 flex items-center gap-2">
                            <FiUser size={12} /> {t('admin.commerce.orders.table.client')}
                        </h3>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-foreground text-background flex items-center justify-center text-sm font-bold shadow-lg shadow-foreground/10">
                                {typeof order.user !== 'string' ? (order.user?.name?.[0] || '?') : '?'}
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-foreground tracking-tight">{typeof order.user !== 'string' ? order.user?.name : 'User ID: ' + order.user}</h4>
                                <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest mt-0.5">Verified Client</p>
                            </div>
                        </div>
                        <div className="pt-6 border-t border-foreground/5 flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/30">Email Address</span>
                                <span className="text-[11px] font-bold text-foreground truncate">{typeof order.user !== 'string' ? order.user?.email : 'N/A'}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/30">Phone Number</span>
                                <span className="text-[11px] font-bold text-foreground">{typeof order.user !== 'string' ? (order.user?.phone || 'Not provided') : 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Shipping info */}
                    <div className="bg-background rounded-2xl border border-foreground/10 shadow-sm p-8">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/30 mb-6 flex items-center gap-2">
                            <FiMapPin size={12} /> Delivery Destination
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-foreground/5 rounded-xl border border-foreground/5">
                                <p className="text-[11px] font-bold text-foreground leading-relaxed whitespace-pre-wrap">
                                    {order.shippingAddress?.address}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-foreground/5 rounded-xl border border-foreground/5">
                                    <span className="text-[8px] font-bold uppercase tracking-widest text-foreground/30 block mb-1">City</span>
                                    <span className="text-[10px] font-bold text-foreground">{order.shippingAddress?.district}, {order.shippingAddress?.city}</span>
                                </div>
                                <div className="p-3 bg-foreground/5 rounded-xl border border-foreground/5">
                                    <span className="text-[8px] font-bold uppercase tracking-widest text-foreground/30 block mb-1">Postal</span>
                                    <span className="text-[10px] font-bold text-foreground font-mono">{order.shippingAddress?.postalCode}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Status (Sleek Dark Style) */}
                    <div className="bg-zinc-900 rounded-3xl p-8 text-zinc-100 shadow-2xl relative overflow-hidden group">
                        <div className="relative z-10 space-y-6">
                            <h3 className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-500 mb-2">{t('admin.commerce.orders.paymentCard.title')}</h3>
                            
                            <div className="space-y-4 pt-2">
                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest opacity-60">
                                    <span>{t('admin.commerce.orders.paymentCard.method')}</span>
                                    <span className="text-white font-black">{order.paymentMethod}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest opacity-60">
                                    <span>{t('admin.commerce.orders.paymentCard.authorizationStatus')}</span>
                                    {order.isPaid ? (
                                        <span className="text-green-400 font-mono">{t('admin.commerce.orders.paymentCard.authorized')}</span>
                                    ) : order.paymentStatus === 'failed' ? (
                                        <span className="text-red-400 font-mono">{t('admin.commerce.orders.paymentCard.rejected')}</span>
                                    ) : (
                                        <span className="text-orange-400 font-mono">{t('admin.commerce.orders.paymentCard.pending')}</span>
                                    )}
                                </div>
                            </div>

                            {order.isPaid ? (
                                <div className="pt-6 border-t border-white/5 mt-6 animate-in slide-in-from-top-1 duration-700">
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]"></div>
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">{t('admin.commerce.orders.paymentCard.transactionId')}</span>
                                        </div>
                                        <p className="text-[10px] font-mono break-all text-white font-medium">{order.paymentResult?.id}</p>
                                    </div>
                                </div>
                            ) : order.paymentStatus === 'failed' ? (
                                <div className="pt-6 border-t border-white/5 mt-6">
                                    <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20">
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-red-400 mb-1">{t('admin.commerce.orders.paymentCard.failureReport')}</p>
                                        <p className="text-[10px] text-red-200 leading-relaxed font-medium">{order.paymentFailureReason || t('admin.commerce.orders.paymentCard.genericFailure')}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6 bg-white/5 rounded-2xl border border-white/5 text-center mt-6">
                                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500 italic">{t('admin.commerce.orders.paymentCard.awaitingGateway')}</p>
                                </div>
                            )}
                        </div>
                        {/* Interactive glow effect */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-12 translate-x-12 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
