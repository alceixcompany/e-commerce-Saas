'use client';
import { useEffect, useState, useCallback } from 'react';
import { useOrderStore } from '@/lib/store/useOrderStore';
import { useContentStore } from '@/lib/store/useContentStore';
import { FiX, FiTrash2, FiEye, FiShoppingBag, FiDollarSign, FiClock, FiSearch, FiTruck, FiBox, FiPackage, FiCheckCircle } from 'react-icons/fi';
import Link from 'next/link';
import { getCurrencySymbol } from '@/utils/currency';
import AdminPagination from '@/components/admin/AdminPagination';
import { useTranslation } from '@/hooks/useTranslation';
import type { Order } from '@/types/order';

interface OrderListingClientProps {
    initialOrders?: Order[];
    initialMetadata?: {
        page?: number;
        pages?: number;
        total?: number;
        stats?: {
            total?: number;
            revenue?: number;
            pending?: number;
        };
    };
}

export default function OrderListingClient({ initialOrders = [], initialMetadata }: OrderListingClientProps) {
    const { t } = useTranslation();
    const tUnsafe = useCallback(
        (key: string, variables?: Record<string, string | number>) => t(key as never, variables),
        [t]
    );
    
    const { 
        orders: storeOrders, 
        isLoading: storeLoading, 
        error, 
        metadata: storeMetadata,
        listOrders,
        deleteOrder,
        bulkUpdateStatus
    } = useOrderStore();
    
    const { globalSettings } = useContentStore();
    const currencySymbol = getCurrencySymbol(globalSettings?.currency);
    
    const orders = storeOrders.length > 0 ? storeOrders : initialOrders;
    const stats = storeMetadata.stats || initialMetadata?.stats || { total: 0, revenue: 0, pending: 0 };
    const metadata = storeMetadata.total > 0 ? storeMetadata : (initialMetadata || { page: 1, pages: 1, total: 0 });

    const isLoading = storeLoading;
    
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
    const [updatingBulk, setUpdatingBulk] = useState(false);
    const [hasInitialized, setHasInitialized] = useState(false);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        if (hasInitialized) {
            listOrders({ filter, q: debouncedSearch, page, limit });
        } else {
            setHasInitialized(true);
        }
    }, [listOrders, filter, debouncedSearch, page, limit, hasInitialized]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setPage(1);
    }, [filter, debouncedSearch]);

    const handleDelete = async (id: string) => {
        if (confirm(t('admin.commerce.orders.confirm.delete'))) {
            try {
                await deleteOrder(id);
                listOrders({ filter, q: search, page, limit });
            } catch (err: unknown) {
                console.error('Failed to delete order:', err);
            }
        }
    };

    const handleBulkUpdate = async (status: string) => {
        if (selectedOrderIds.length === 0) return;

        if (confirm(tUnsafe('admin.commerce.orders.bulk.confirmUpdate', { count: selectedOrderIds.length, status: tUnsafe(`admin.commerce.orders.status.${status}`) }))) {
            setUpdatingBulk(true);
            try {
                await bulkUpdateStatus(selectedOrderIds, status);
                setSelectedOrderIds([]);
                listOrders({ filter, q: search, page, limit });
            } finally {
                setUpdatingBulk(false);
            }
        }
    };

    const toggleSelectAll = () => {
        if (selectedOrderIds.length === orders.length) {
            setSelectedOrderIds([]);
        } else {
            setSelectedOrderIds(orders.map((o) => o._id));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedOrderIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleBulkDelete = async () => {
        if (selectedOrderIds.length === 0) return;

        if (confirm(t('admin.commerce.orders.bulk.confirmDelete', { count: selectedOrderIds.length }))) {
            setUpdatingBulk(true);
            try {
                for (const id of selectedOrderIds) {
                    await deleteOrder(id);
                }
                setSelectedOrderIds([]);
                listOrders({ filter, q: search, page, limit });
            } catch (err: unknown) {
                console.error('Failed to bulk delete orders:', err);
            } finally {
                setUpdatingBulk(false);
            }
        }
    };

    if (error && orders.length === 0) {
        return (
            <div className="p-8 text-center animate-in fade-in duration-500">
                <div className="bg-red-500/5 text-red-500 p-8 rounded-2xl border border-red-500/10">
                    <FiX size={32} className="mx-auto mb-4" />
                    <p className="text-sm font-bold uppercase tracking-widest">{t('admin.common.error')}: {error}</p>
                </div>
                <button onClick={() => listOrders()} className="mt-8 px-6 py-2 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-foreground/80 transition-all">
                    {t('admin.common.reset')}
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 relative pb-24">
            {/* Stats */}
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
                            <div className="p-2 bg-orange-500/10 rounded-lg"><FiBox /></div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{t('admin.commerce.orders.stats.pending')}</span>
                        </div>
                        <div className="text-3xl font-bold text-foreground">{stats.pending}</div>
                    </div>
                </div>

            </div>

            {/* Main Content */}
            <div className="bg-background rounded-2xl border border-foreground/10 shadow-sm overflow-hidden pb-12">
                <div className="p-6 border-b border-foreground/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex bg-foreground/5 p-1 rounded-lg self-start flex-wrap gap-1">
                            {['all', 'received', 'preparing', 'shipped', 'delivered'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${filter === f
                                        ? 'bg-background text-foreground shadow-sm'
                                        : 'text-foreground/40 hover:text-foreground'
                                        }`}
                                >
                                    {tUnsafe(`admin.commerce.orders.filters.${f}`)}
                                </button>
                            ))}
                        </div>

                        {selectedOrderIds.length > 0 && (
                            <div className="flex items-center gap-1 bg-foreground/5 p-1 rounded-lg animate-in zoom-in-95 duration-200">
                                <button
                                    disabled={updatingBulk}
                                    onClick={handleBulkDelete}
                                    title={t('admin.common.delete')}
                                    className="p-2 w-10 h-10 flex items-center justify-center rounded-md hover:bg-background text-red-500 hover:text-red-600 transition-all disabled:opacity-50"
                                >
                                    <FiTrash2 size={18} />
                                </button>
                                <div className="px-3 text-[10px] font-black text-foreground/40 uppercase tracking-widest border-l border-foreground/10 ml-1">
                                    {selectedOrderIds.length} {t('admin.common.selected')}
                                </div>
                            </div>
                        )}
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

                <div className="overflow-x-auto relative min-h-[300px]">
                    {isLoading && (
                        <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center z-10 transition-all">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
                        </div>
                    )}
                    <table className="w-full text-left text-sm">
                        <thead className="bg-foreground/5 border-b border-foreground/5 text-foreground/40 uppercase tracking-[0.2em] text-[10px] font-bold">
                            <tr>
                                <th className="px-6 py-4 text-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedOrderIds.length === orders.length && orders.length > 0}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 rounded border-foreground/20 bg-background text-foreground focus:ring-foreground/10 transition-all cursor-pointer mx-auto"
                                    />
                                </th>
                                <th className="px-6 py-4">{t('admin.commerce.orders.table.registry')}</th>
                                <th className="px-6 py-4">{t('admin.commerce.orders.table.client')}</th>
                                <th className="px-6 py-4">{t('admin.commerce.orders.table.date')}</th>
                                <th className="px-6 py-4">{t('admin.commerce.orders.table.status')}</th>
                                <th className="px-6 py-4 text-right">{t('admin.commerce.orders.table.volume')}</th>
                                <th className="px-6 py-4 text-center">{t('admin.commerce.orders.table.operations')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-foreground/5 text-foreground font-medium">
                            {orders.length > 0 ? orders.map((order) => (
                                <tr key={order._id} className={`group hover:bg-foreground/5 transition-colors ${selectedOrderIds.includes(order._id) ? 'bg-primary/5' : ''}`}>
                                    <td className="px-6 py-4 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedOrderIds.includes(order._id)}
                                            onChange={() => toggleSelect(order._id)}
                                            className="w-4 h-4 rounded border-foreground/20 bg-background text-foreground focus:ring-foreground/10 transition-all cursor-pointer mx-auto"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link href={`/admin/orders/${order._id}`} className="font-mono text-[11px] text-foreground/50 hover:text-primary transition-colors uppercase tracking-[0.1em]">
                                            #{order._id.substring(order._id.length - 8)}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-[10px] font-black shadow-sm">
                                                {typeof order.user === 'object' ? order.user?.name?.[0] || '?' : '?'}
                                            </div>
                                            <div>
                                                <div className="font-bold text-foreground leading-tight">
                                                    {typeof order.user === 'object' ? order.user?.name || 'Deleted Client' : 'ID: ' + order.user}
                                                </div>
                                                <div className="text-[10px] text-foreground/40 font-bold tracking-wider">
                                                    {typeof order.user === 'object' ? order.user?.email : ''}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-foreground/40 text-[10px] font-black uppercase tracking-widest leading-none">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1 items-start">
                                            {order.paymentStatus === 'failed' ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 text-red-600 text-[9px] font-black uppercase tracking-[0.2em] border border-red-500/20">
                                                    <span className="w-1 h-1 rounded-full bg-red-600 animate-pulse"></span>
                                                    {t('admin.commerce.orders.filters.failed')}
                                                </span>
                                            ) : order.status === 'delivered' ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 text-[9px] font-black uppercase tracking-[0.2em] border border-green-500/20">
                                                    <FiCheckCircle className="text-green-600" />
                                                    {t('admin.commerce.orders.status.delivered')}
                                                </span>
                                            ) : order.status === 'shipped' ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 text-[9px] font-black uppercase tracking-[0.2em] border border-blue-500/20">
                                                    <FiTruck className="text-blue-600 animate-pulse" />
                                                    {t('admin.commerce.orders.status.shipped')}
                                                </span>
                                            ) : order.status === 'preparing' ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-600 text-[9px] font-black uppercase tracking-[0.2em] border border-orange-500/20">
                                                    <FiPackage className="text-orange-600 animate-pulse" />
                                                    {t('admin.commerce.orders.status.preparing')}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-600 text-[9px] font-black uppercase tracking-[0.2em] border border-cyan-500/20">
                                                    <span className="w-1 h-1 rounded-full bg-cyan-600 animate-pulse"></span>
                                                    {t('admin.commerce.orders.status.received')}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-foreground text-base tracking-tighter">
                                        {getCurrencySymbol(order.currency || globalSettings?.currency)}{order.totalPrice.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Link
                                                href={`/admin/orders/${order._id}`}
                                                className="p-2.5 text-foreground/30 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                                            >
                                                <FiEye size={18} />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(order._id)}
                                                className="p-2.5 text-foreground/30 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                            >
                                                <FiTrash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-32 text-center text-foreground/20 italic tracking-widest">
                                        No entries found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <AdminPagination
                    currentPage={metadata.page ?? 1}
                    totalPages={metadata.pages ?? 1}
                    totalItems={metadata.total ?? 0}
                    limit={limit}
                    onPageChange={(p) => setPage(p)}
                    isLoading={isLoading}
                />
            </div>

            {/* Floating Bulk Status Bar */}
            {selectedOrderIds.length > 0 && (
                <div className="sticky bottom-10 left-0 right-0 z-50 flex justify-center animate-in slide-in-from-bottom-10 duration-500 cubic-bezier(0.4, 0, 0.2, 1)">
                    <div className="bg-zinc-950/95 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[2rem] px-8 py-4 flex items-center gap-8">
                        <div className="flex flex-col border-r border-white/10 pr-8">
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 leading-none mb-1.5 font-mono">
                                Selected
                            </span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-white leading-none">
                                    {selectedOrderIds.length}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                disabled={updatingBulk}
                                onClick={() => handleBulkUpdate('received')}
                                className="flex flex-col items-center gap-2 group px-4 py-2 rounded-2xl transition-all opacity-40 hover:opacity-100 disabled:opacity-20 translate-y-1 hover:translate-y-0"
                            >
                                <div className="p-2 bg-white/5 text-white rounded-xl shadow-sm">
                                    <FiClock size={20} />
                                </div>
                                <span className="text-[8px] font-black uppercase tracking-[0.15em] text-white/60">
                                    {t('admin.commerce.orders.status.received')}
                                </span>
                            </button>

                            <button
                                disabled={updatingBulk}
                                onClick={() => handleBulkUpdate('preparing')}
                                className="flex flex-col items-center gap-2 group px-4 py-2 rounded-2xl transition-all opacity-40 hover:opacity-100 disabled:opacity-20 translate-y-1 hover:translate-y-0"
                            >
                                <div className="p-2 bg-white/5 text-white rounded-xl shadow-sm">
                                    <FiPackage size={20} />
                                </div>
                                <span className="text-[8px] font-black uppercase tracking-[0.15em] text-white/60">
                                    {t('admin.commerce.orders.status.preparing')}
                                </span>
                            </button>

                            <button
                                disabled={updatingBulk}
                                onClick={() => handleBulkUpdate('shipped')}
                                className="flex flex-col items-center gap-2 group px-4 py-2 rounded-2xl transition-all opacity-40 hover:opacity-100 disabled:opacity-20 translate-y-1 hover:translate-y-0"
                            >
                                <div className="p-2 bg-white/5 text-white rounded-xl shadow-sm">
                                    <FiTruck size={20} />
                                </div>
                                <span className="text-[8px] font-black uppercase tracking-[0.15em] text-white/60">
                                    {t('admin.commerce.orders.status.shipped')}
                                </span>
                            </button>

                            <button
                                disabled={updatingBulk}
                                onClick={() => handleBulkUpdate('delivered')}
                                className="flex flex-col items-center gap-2 group px-4 py-2 rounded-2xl transition-all opacity-40 hover:opacity-100 disabled:opacity-20 translate-y-1 hover:translate-y-0"
                            >
                                <div className="p-2 bg-white/5 text-white rounded-xl shadow-sm">
                                    <FiCheckCircle size={20} />
                                </div>
                                <span className="text-[8px] font-black uppercase tracking-[0.15em] text-white/60">
                                    {t('admin.commerce.orders.status.delivered')}
                                </span>
                            </button>
                        </div>

                        <div className="border-l border-white/10 pl-8">
                            <button
                                onClick={() => setSelectedOrderIds([])}
                                className="p-4 text-white/20 hover:text-white transition-all group"
                                title={t('admin.common.reset')}
                            >
                                <FiX size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
