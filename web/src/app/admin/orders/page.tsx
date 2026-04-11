'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { listOrders, deliverOrder, deleteOrder } from '@/lib/slices/orderSlice';
import { FiCheck, FiX, FiTrash2, FiEye, FiShoppingBag, FiDollarSign, FiClock, FiSearch, FiTruck } from 'react-icons/fi';
import Link from 'next/link';
import { getCurrencySymbol } from '@/utils/currency';
import AdminPagination from '@/components/admin/AdminPagination';
import { useTranslation } from '@/hooks/useTranslation';

export default function AdminOrdersPage() {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { orders, loading, error, metadata } = useAppSelector((state) => state.order);
    const { globalSettings } = useAppSelector((state) => state.content);
    const currencySymbol = getCurrencySymbol(globalSettings?.currency);
    const isLoading = loading.listOrders;
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit] = useState(10);

    useEffect(() => {
        dispatch(listOrders({ filter, q: search, page, limit }));
    }, [dispatch, filter, search, page, limit]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setPage(1);
    }, [filter, search]);

    const handleDeliver = async (id: string) => {
        if (confirm(t('admin.commerce.orders.confirm.deliver'))) {
            await dispatch(deliverOrder(id));
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm(t('admin.commerce.orders.confirm.delete'))) {
            await dispatch(deleteOrder(id));
        }
    };

    // Stats now come directly from the backend for accuracy across the entire database
    const stats = metadata.stats;

    // Orders are now filtered and searched by the backend
    const displayOrders = orders || [];

    if (isLoading && page === 1) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center">
                <div className="text-red-500 mb-4">{t('admin.common.error')}: {error}</div>
                <button onClick={() => dispatch(listOrders())} className="text-foreground underline">{t('admin.common.reset')}</button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-background p-6 rounded-2xl border border-foreground/10 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-foreground/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-2 text-foreground/70">
                            <div className="p-2 bg-foreground/5 rounded-lg"><FiShoppingBag /></div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">{t('admin.commerce.orders.stats.total')}</span>
                        </div>
                        <div className="text-3xl font-bold text-foreground">{stats.total}</div>
                    </div>
                </div>

                <div className="bg-background p-6 rounded-2xl border border-foreground/10 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-primary/10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-2 text-primary">
                            <div className="p-2 bg-primary/10 rounded-lg"><FiDollarSign /></div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{t('admin.commerce.orders.stats.revenue')}</span>
                        </div>
                        <div className="text-3xl font-bold text-foreground">{currencySymbol}{stats.revenue.toFixed(2)}</div>
                    </div>
                </div>

                <div className="bg-background p-6 rounded-2xl border border-foreground/10 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-orange-500/10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-2 text-orange-500">
                            <div className="p-2 bg-orange-500/10 rounded-lg"><FiClock /></div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{t('admin.commerce.orders.stats.pending')}</span>
                        </div>
                        <div className="text-3xl font-bold text-foreground">{stats.pending}</div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-background rounded-2xl border border-foreground/10 shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="p-6 border-b border-foreground/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex bg-foreground/5 p-1 rounded-lg self-start flex-wrap gap-1">
                        {['all', 'pending', 'delivered', 'unpaid', 'failed'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${
                                    filter === f 
                                        ? f === 'failed' 
                                            ? 'bg-red-500 text-white shadow-sm'
                                            : 'bg-background text-foreground shadow-sm'
                                        : f === 'failed'
                                            ? 'text-red-400 hover:text-red-500'
                                            : 'text-foreground/40 hover:text-foreground'
                                }`}
                            >
                                {f === 'failed' ? '⚠ Failed' : t(`admin.commerce.orders.filters.${f}` as any)}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-64">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
                        <input
                            type="text"
                            placeholder={t('admin.commerce.orders.searchPlaceholder')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-foreground/5 border-none rounded-lg text-sm text-foreground focus:ring-2 focus:ring-foreground/5 transition-all font-medium placeholder:text-foreground/30"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-foreground/5 border-b border-foreground/5 text-foreground/40 uppercase tracking-[0.2em] text-[10px] font-bold">
                            <tr>
                                <th className="px-6 py-4">{t('admin.commerce.orders.table.registry')}</th>
                                <th className="px-6 py-4">{t('admin.commerce.orders.table.client')}</th>
                                <th className="px-6 py-4">{t('admin.commerce.orders.table.date')}</th>
                                <th className="px-6 py-4">{t('admin.commerce.orders.table.status')}</th>
                                <th className="px-6 py-4 text-right">{t('admin.commerce.orders.table.volume')}</th>
                                <th className="px-6 py-4 text-center">{t('admin.commerce.orders.table.operations')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-foreground/5 text-foreground">
                            {displayOrders.length > 0 ? displayOrders.map((order: any) => (
                                <tr key={order._id} className="group hover:bg-foreground/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <Link href={`/admin/orders/${order._id}`} className="font-mono text-[10px] text-foreground/40 hover:text-foreground transition-colors uppercase tracking-widest">
                                            #{order._id.substring(order._id.length - 8)}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-[10px] font-bold">
                                                {order.user?.name?.[0] || '?'}
                                            </div>
                                            <div>
                                                <div className="font-bold text-foreground">{order.user?.name || 'Deleted Client'}</div>
                                                <div className="text-[10px] text-foreground/40 font-medium">{order.user?.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-foreground/40 text-[10px] font-bold uppercase tracking-wider">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1 items-start">
                                            {order.paymentStatus === 'failed' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 text-red-600 text-[10px] font-bold uppercase tracking-[0.15em] border border-red-500/30">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                                                    Payment Failed
                                                </span>
                                            ) : !order.isPaid ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-600 text-[10px] font-bold uppercase tracking-[0.15em] border border-yellow-500/20">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
                                                    {t('admin.commerce.orders.status.unpaid')}
                                                </span>
                                            ) : order.isDelivered ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase tracking-[0.15em] border border-blue-500/20">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                                    {t('admin.commerce.orders.status.delivered')}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-bold uppercase tracking-[0.15em] border border-orange-500/20">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                                                    {t('admin.commerce.orders.status.processing')}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-foreground">
                                        {currencySymbol}{order.totalPrice.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-right transition-all">
                                        <div className="flex items-center justify-center gap-2">
                                            {!order.isDelivered && order.isPaid && (
                                                <button
                                                    onClick={() => handleDeliver(order._id)}
                                                    className="p-2 text-foreground/40 hover:text-green-500 hover:bg-green-500/10 rounded-lg transition-all"
                                                    title={t('admin.commerce.orders.actions.deliver')}
                                                >
                                                    <FiTruck size={16} />
                                                </button>
                                            )}
                                            <Link
                                                href={`/admin/orders/${order._id}`}
                                                className="p-2 text-foreground/40 hover:text-foreground hover:bg-foreground/5 rounded-lg transition-all"
                                                title={t('admin.commerce.orders.actions.view')}
                                            >
                                                <FiEye size={16} />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(order._id)}
                                                className="p-2 text-foreground/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                title={t('admin.commerce.orders.actions.delete')}
                                            >
                                                <FiTrash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center justify-center text-foreground/20">
                                            <div className="w-16 h-16 bg-foreground/5 rounded-full flex items-center justify-center mb-4">
                                                <FiSearch size={24} />
                                            </div>
                                            <p className="text-sm font-bold text-foreground/40">{t('admin.commerce.orders.empty.title')}</p>
                                            <p className="text-xs mt-1">{t('admin.commerce.orders.empty.desc')}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <AdminPagination 
                    currentPage={metadata.page}
                    totalPages={metadata.pages}
                    totalItems={metadata.total}
                    limit={limit}
                    onPageChange={(p) => setPage(p)}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
}
