'use client';

import { useEffect, use, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { getOrderDetails } from '@/lib/slices/orderSlice';
import { 
    FiArrowLeft, FiPackage, FiMapPin, FiCreditCard, 
    FiCheckCircle, FiTruck, FiActivity, FiInfo, 
    FiChevronRight, FiBox, FiCalendar, FiShoppingBag,
    FiUser, FiSmartphone, FiDollarSign, FiDownload
} from 'react-icons/fi';
import type { IconType } from 'react-icons';
import { getProductPlaceholder } from '@/lib/image-utils';
import Link from 'next/link';
import { getCurrencySymbol } from '@/utils/currency';
import { useTranslation } from '@/hooks/useTranslation';
import type { OrderItem } from '@/types/order';
import type { GlobalSettings } from '@/types/content';

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const dispatch = useAppDispatch();
    const { t } = useTranslation();
    const { order, loading, error } = useAppSelector((state) => state.order);
    const isLoading = loading.fetchOne;
    const { globalSettings } = useAppSelector((state) => state.content);
    const currencySymbol = getCurrencySymbol(globalSettings?.currency);
    const [mounted, setMounted] = useState(false);
    const [isDownloadingReceipt, setIsDownloadingReceipt] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            dispatch(getOrderDetails(id));
        }
    }, [dispatch, id, mounted]);

    const statusConfig: Record<string, { label: string, color: string, icon: IconType }> = useMemo(() => ({
        received: { label: t('admin.commerce.orders.status.received'), color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20', icon: FiPackage },
        preparing: { label: t('admin.commerce.orders.status.preparing'), color: 'bg-orange-500/10 text-orange-600 border-orange-500/20', icon: FiBox },
        shipped: { label: t('admin.commerce.orders.status.shipped'), color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: FiTruck },
        delivered: { label: t('admin.commerce.orders.status.delivered'), color: 'bg-green-500/10 text-green-600 border-green-500/20', icon: FiCheckCircle },
        failed: { label: t('admin.commerce.orders.filters.failed'), color: 'bg-red-500/10 text-red-600 border-red-500/20', icon: FiCheckCircle },
    }), [t]);

    if (!mounted) return null;

    if (isLoading && !order) {
        return (
            <div className="flex items-center justify-center min-h-[80vh] bg-background">
                <div className="w-10 h-10 border-b-2 border-foreground animate-spin rounded-full"></div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-[80vh] bg-background flex flex-col items-center justify-center px-6 text-center space-y-8 animate-in fade-in duration-700">
                <div className="w-20 h-20 bg-red-500/5 text-red-500 rounded-2xl flex items-center justify-center shadow-xl shadow-red-500/5 border border-red-500/10">
                    <FiInfo size={32} />
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-foreground tracking-tight">{t('profile.orderDetails.notFound')}</h2>
                    <p className="text-foreground/40 font-medium max-w-xs mx-auto">{t('profile.orderDetails.notFoundDesc')}</p>
                </div>
                <Link href="/profile?tab=orders" className="bg-foreground text-background px-10 py-4 rounded-2xl text-[10px] font-semibold uppercase tracking-[0.2em] hover:bg-foreground/80 transition-all shadow-2xl shadow-foreground/20">
                    {t('profile.orderDetails.return')}
                </Link>
            </div>
        );
    }

    const currentStatus = (order.paymentStatus === 'failed' ? statusConfig.failed : statusConfig[order.status || 'received']) || statusConfig.received;

    const handleReceiptDownload = async () => {
        if (!order || isDownloadingReceipt) return;

        try {
            setIsDownloadingReceipt(true);

            const [{ pdf }, receiptModule] = await Promise.all([
                import('@react-pdf/renderer'),
                import('../_components/OrderReceipt'),
            ]);

            const ReceiptComponent = receiptModule.default;
            const blob = await pdf(
                <ReceiptComponent
                    order={order}
                    globalSettings={globalSettings as GlobalSettings}
                    currencySymbol={currencySymbol}
                />
            ).toBlob();

            const blobUrl = URL.createObjectURL(blob);
            const fileName = `receipt-${order._id}.pdf`;
            const isIOS = /iPad|iPhone|iPod/.test(window.navigator.userAgent);
            const isAndroid = /Android/i.test(window.navigator.userAgent);
            const isMobile = isIOS || isAndroid;

            if (isMobile) {
                const opened = window.open(blobUrl, '_blank', 'noopener,noreferrer');
                if (!opened) {
                    window.location.href = blobUrl;
                }
            } else {
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                link.remove();
            }

            setTimeout(() => {
                URL.revokeObjectURL(blobUrl);
            }, 60_000);
        } catch (downloadError) {
            console.error('Failed to generate receipt PDF', downloadError);
        } finally {
            setIsDownloadingReceipt(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pt-24 md:pt-[140px] pb-40 relative overflow-x-hidden">
            {/* Ambient Background Accents */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-foreground/[0.02] rounded-full blur-[120px] -mr-40 -mt-20"></div>
            <div className="absolute bottom-40 left-0 w-[300px] h-[300px] bg-foreground/[0.01] rounded-full blur-[100px] -ml-20"></div>

            <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-20 space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                
                {/* Registry Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-foreground/5 pb-10">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Link href="/profile?tab=orders" className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/40 hover:text-foreground transition-all">{t('profile.tabs.orders.title')}</Link>
                            <FiChevronRight className="text-foreground/20" size={10} />
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground">{t('profile.tabs.orders.view')}</span>
                        </div>
                        <div className="space-y-4">
                            <h1 className="text-3xl font-bold text-foreground tracking-tight leading-none">{t('profile.orderDetails.receipt')}</h1>
                            <div className="flex items-center gap-4">
                                <span className="text-foreground/20 font-mono text-lg font-medium tracking-tighter decoration-1 underline underline-offset-8 decoration-foreground/5 break-all">
                                    #{order._id.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 md:justify-end">
                        {order.isPaid && (
                            <button
                                type="button"
                                onClick={handleReceiptDownload}
                                disabled={isDownloadingReceipt}
                                className={`px-4 py-2 bg-foreground text-background rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-foreground/80 transition-all shadow-lg shadow-foreground/10 ${isDownloadingReceipt ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <FiDownload size={14} className={isDownloadingReceipt ? 'animate-bounce' : ''} />
                                {isDownloadingReceipt ? 'Preparing PDF...' : t('profile.orderDetails.downloadReceipt')}
                            </button>
                        )}
                        <div className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border flex items-center gap-2 shadow-sm ${currentStatus.color}`}>
                            <currentStatus.icon size={12} className={order.status === 'delivered' ? '' : 'animate-pulse'} />
                            {currentStatus.label}
                        </div>
                    </div>
                </div>

                {/* KPI Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-background p-6 rounded-2xl border border-foreground/10 shadow-sm relative overflow-hidden group">
                        <div className="absolute right-0 top-0 w-24 h-24 bg-foreground/[0.02] rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                        <div className="relative">
                            <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-1 leading-none">{t('admin.commerce.orders.table.volume')}</p>
                            <h3 className="text-2xl font-bold text-foreground tracking-tight">{currencySymbol}{order.totalPrice.toLocaleString()}</h3>
                        </div>
                    </div>
                    <div className="bg-background p-6 rounded-2xl border border-foreground/10 shadow-sm relative overflow-hidden group">
                        <div className="absolute right-0 top-0 w-24 h-24 bg-foreground/[0.02] rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                        <div className="relative">
                            <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-1 leading-none">Artifact Count</p>
                            <h3 className="text-2xl font-bold text-foreground tracking-tight">{order.orderItems.length} <span className="text-sm font-medium opacity-40 uppercase tracking-widest ml-1">{t('common.products')}</span></h3>
                        </div>
                    </div>
                    <div className="bg-background p-6 rounded-2xl border border-foreground/10 shadow-sm relative overflow-hidden group">
                        <div className="absolute right-0 top-0 w-24 h-24 bg-foreground/[0.02] rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                        <div className="relative">
                            <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-1 leading-none">{t('admin.commerce.orders.table.date')}</p>
                            <h3 className="text-2xl font-bold text-foreground tracking-tight">{new Date(order.createdAt).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}</h3>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Main Content: Artifacts & Timeline */}
                    <div className="lg:col-span-2 space-y-12">
                        
                        {/* Artifact Listing */}
                        <div className="bg-background rounded-2xl border border-foreground/10 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-foreground/5 flex items-center justify-between">
                                <h3 className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] flex items-center gap-3">
                                    <div className="p-1.5 bg-foreground/5 rounded-lg"><FiShoppingBag size={14} /></div>
                                    {t('profile.orderDetails.artifacts')}
                                </h3>
                            </div>
                            <div className="divide-y divide-foreground/5">
                                {order.orderItems.map((item: OrderItem, idx: number) => (
                                    <div key={idx} className="p-6 flex flex-col md:flex-row items-center gap-8 group transition-all hover:bg-foreground/[0.01]">
                                        <div className="w-16 h-20 bg-foreground/5 rounded-xl overflow-hidden shrink-0 border border-foreground/5 p-4 flex items-center justify-center relative group-hover:border-foreground/10 transition-colors">
                                            <img src={item.image || getProductPlaceholder()} alt={item.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700" />
                                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-foreground text-background rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg">
                                                {item.qty}
                                            </div>
                                        </div>
                                        <div className="flex-1 text-center md:text-left space-y-2">
                                            <h4 className="text-sm font-bold text-foreground tracking-tight leading-tight">{item.name}</h4>
                                            <div className="flex flex-wrap justify-center md:justify-start gap-4 items-center">
                                                <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest py-1 px-3 bg-foreground/5 rounded-full">REF #ALX-{item.product.substring(item.product.length - 4).toUpperCase()}</span>
                                                <span className="text-[10px] font-bold text-foreground/20 leading-none">/</span>
                                                <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Unit Price: {currencySymbol}{item.price.toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <div className="text-sm font-bold text-foreground tracking-tighter text-right">
                                            {currencySymbol}{(item.qty * item.price).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Detailed Fiscal Breakdown */}
                            <div className="p-8 bg-foreground/[0.02] border-t border-foreground/5">
                                <div className="max-w-xs ml-auto space-y-4">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-foreground/40">
                                        <span>Initial Valuation</span>
                                        <span className="text-foreground">{currencySymbol}{(order.itemsPrice || (order.totalPrice - (order.shippingPrice || 0) - (order.taxPrice || 0) + (order.coupon?.discountAmount || 0))).toLocaleString()}</span>
                                    </div>
                                    {order.coupon && order.coupon.code && (
                                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-green-500">
                                            <span>Incentive ({order.coupon.code})</span>
                                            <span>-{currencySymbol}{order.coupon.discountAmount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-foreground/40">
                                        <span>Logistics Fee</span>
                                        <span className="text-foreground">{currencySymbol}{order.shippingPrice?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-foreground/40 pb-4">
                                        <span>Registry Duty</span>
                                        <span className="text-foreground">{currencySymbol}{order.taxPrice?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between pt-6 border-t border-foreground/10 items-baseline">
                                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/30">Final Settlement</span>
                                        <span className="text-2xl font-bold text-foreground tracking-tighter leading-none">{currencySymbol}{order.totalPrice.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status Timeline */}
                        <div className="bg-background rounded-2xl border border-foreground/10 shadow-sm p-8">
                            <h3 className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] flex items-center gap-3 mb-10">
                                <div className="p-1.5 bg-foreground/5 rounded-lg"><FiActivity size={14} /></div>
                                {t('profile.orderDetails.journey')}
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
                                        title: t('profile.orderDetails.authorizationTimeline'), 
                                        date: order.paidAt, 
                                        done: order.isPaid, 
                                        icon: FiCreditCard, 
                                        active: order.isPaid && order.status === 'received' 
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
                                    <div key={i} className={`flex gap-10 relative transition-all duration-700 ${step.done ? 'opacity-100' : 'opacity-20'}`}>
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center z-10 shrink-0 shadow-sm border-2 transition-all duration-500 ${
                                            step.done 
                                                ? 'bg-foreground border-foreground text-background' 
                                                : 'bg-background border-foreground/10 text-foreground/40'
                                        }`}>
                                            <step.icon size={12} className={step.active ? 'animate-pulse' : ''} />
                                        </div>
                                        <div className="flex flex-col pt-1">
                                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground leading-none">{step.title}</h4>
                                            <p className="text-[10px] text-foreground/40 mt-1 font-medium tracking-wide">
                                                {step.date ? new Date(step.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Awaiting confirmation...'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <aside className="space-y-10">
                        
                        {/* Midnight Zinc Payment Card */}
                        <div className="bg-zinc-950 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                            <div className="relative z-10 space-y-6">
                                <div>
                                    <h3 className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-500 mb-6 flex items-center gap-2">
                                        <FiCreditCard size={12} /> Diagnostic Infrastructure
                                    </h3>
                                    
                                    <div className="flex items-center gap-4 py-2 border-b border-white/5 pb-6">
                                                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                                            <FiCreditCard className="text-white/60" size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 leading-none mb-1">{t('profile.orderDetails.paymentMethod')}</p>
                                            <p className="text-sm font-bold text-white leading-none">{order.paymentMethod}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest opacity-40">
                                        <span>{t('profile.orderDetails.authorizationStatus')}</span>
                                        {order.isPaid ? (
                                            <span className="text-green-400 font-mono">{t('profile.orderDetails.authorizationApproved')}</span>
                                        ) : order.paymentStatus === 'failed' ? (
                                            <span className="text-red-400 font-mono">{t('profile.orderDetails.authorizationRejected')}</span>
                                        ) : (
                                            <span className="text-orange-400 font-mono">{t('profile.orderDetails.authorizationPending')}</span>
                                        )}
                                    </div>
                                </div>

                                {order.isPaid ? (
                                    <div className="pt-4 border-t border-white/5 mt-4">
                                        <div className="p-4 bg-white/5 rounded-xl border border-white/5 backdrop-blur-sm">
                                            <div className="flex items-center gap-3 mb-2 text-white/30">
                                                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)] animate-pulse"></div>
                                                <span className="text-[9px] font-bold uppercase tracking-[0.2em]">{t('profile.orderDetails.transactionId')}</span>
                                            </div>
                                            <p className="text-[10px] font-mono break-all text-white/80 font-medium selection:bg-white selection:text-black leading-relaxed">
                                                {order.paymentResult?.id || 'AUTH_TOKEN_GENERIC_ALX'}
                                            </p>
                                        </div>
                                    </div>
                                ) : (order.paymentStatus === 'failed') ? (
                                    <div className="pt-4">
                                        <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-red-500 mb-1">{t('profile.orderDetails.failureReport')}</p>
                                            <p className="text-[10px] text-red-100 leading-relaxed font-bold tracking-tight">{order.paymentFailureReason || t('profile.orderDetails.genericFailure')}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-6 bg-white/5 rounded-xl border border-white/5 text-center mt-6">
                                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/20 italic animate-pulse">{t('profile.orderDetails.awaitingGateway')}</p>
                                    </div>
                                )}
                            </div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-12 translate-x-12 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                        </div>

                        {/* Shipping info */}
                        <div className="bg-background rounded-2xl border border-foreground/10 shadow-sm p-8">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/30 mb-6 flex items-center gap-2 border-b border-foreground/5 pb-4">
                                <FiMapPin size={12} /> Logistics Destination
                            </h3>
                            <div className="space-y-4">
                                <p className="font-bold text-foreground text-sm tracking-tight leading-none">{order.shippingAddress?.fullName || 'Anonymous Registry'}</p>
                                <div className="space-y-4 pt-2">
                                    <div className="p-4 bg-foreground/5 rounded-xl border border-foreground/5">
                                        <p className="text-[11px] font-bold text-foreground leading-relaxed whitespace-pre-wrap">
                                            {order.shippingAddress?.address}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 bg-foreground/5 rounded-xl border border-foreground/5">
                                            <span className="text-[8px] font-bold uppercase tracking-widest text-foreground/20 block mb-1">Sector</span>
                                            <span className="text-[10px] font-bold text-foreground truncate">{order.shippingAddress?.district}, {order.shippingAddress?.city}</span>
                                        </div>
                                        <div className="p-3 bg-foreground/5 rounded-xl border border-foreground/5">
                                            <span className="text-[8px] font-bold uppercase tracking-widest text-foreground/20 block mb-1">Zip Node</span>
                                            <span className="text-[10px] font-mono font-bold text-foreground">{order.shippingAddress?.postalCode}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security Protocol card */}
                        <div className="bg-foreground p-6 md:p-10 rounded-[2.5rem] text-background shadow-2xl relative overflow-hidden group">
                           <div className="relative z-10 space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-background/10 flex items-center justify-center border border-background/20 group-hover:scale-110 transition-transform">
                                        <FiActivity className="text-background" size={16} />
                                    </div>
                                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] leading-none">Security Protocol</p>
                                </div>
                                <p className="text-[11px] font-bold leading-relaxed text-background/60 tracking-tight">
                                    {t('profile.orderDetails.securityNote', { siteName: globalSettings.siteName || 'Alceix Group' })}
                                </p>
                           </div>
                           <div className="absolute top-0 right-0 w-32 h-32 bg-background/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
