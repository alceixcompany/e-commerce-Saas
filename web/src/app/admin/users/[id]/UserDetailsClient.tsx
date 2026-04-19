'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAdminStore } from '@/lib/store/useAdminStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useContentStore } from '@/lib/store/useContentStore';
import {
    FiPackage,
    FiMapPin,
    FiShield,
    FiMail,
    FiCalendar,
    FiTrash2,
    FiExternalLink,
    FiChevronRight,
    FiTrendingUp,
    FiDollarSign,
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrencySymbol } from '@/utils/currency';
import { useTranslation } from '@/hooks/useTranslation';
import AdminPagination from '@/components/admin/AdminPagination';
import type { AdminUserDetails } from '@/types/admin';
import type { PaginationData } from '@/types/common';
import type { Order, OrderItem } from '@/types/order';

interface UserDetailsClientProps {
    initialUser: AdminUserDetails;
    initialOrders: Order[];
    initialMetadata: PaginationData;
}

export default function UserDetailsClient({ initialUser, initialOrders, initialMetadata }: UserDetailsClientProps) {
    const { t } = useTranslation();
    const tUnsafe = useCallback((key: string, variables?: Record<string, string | number>) => t(key as never, variables), [t]);
    const router = useRouter();

    const { user: adminUser } = useAuthStore();
    const { updateUserRole, deleteUser } = useAdminStore();
    const { globalSettings } = useContentStore();
    const currencySymbol = getCurrencySymbol(globalSettings?.currency);

    const [selectedUser, setSelectedUser] = useState(initialUser);
    const [selectedUserOrders] = useState(initialOrders);
    const [selectedUserOrdersMetadata, setSelectedUserOrdersMetadata] = useState(initialMetadata);
    void setSelectedUserOrdersMetadata;
    const [orderPage, setOrderPage] = useState(initialMetadata.page);
    void orderPage;
    const orderLimit = 10;
    const userAddresses = selectedUser.addresses ?? [];
    const displayName = useMemo(() => {
        const trimmedName = selectedUser.name?.trim();
        if (trimmedName) return trimmedName;

        const emailPrefix = selectedUser.email?.split('@')[0]?.trim();
        if (emailPrefix) return emailPrefix;

        return tUnsafe('admin.management.users.roles.member') || 'User';
    }, [selectedUser.email, selectedUser.name, tUnsafe]);
    const displayInitial = displayName.charAt(0).toUpperCase();
    const displayUserId = selectedUser._id ? `#${selectedUser._id.substring(selectedUser._id.length - 8).toUpperCase()}` : '#UNKNOWN';

    // Derived Stats
    const stats = useMemo(() => {
        if (!selectedUserOrders || selectedUserOrders.length === 0) return { total: 0, count: 0, avg: 0 };
        const total = selectedUserOrders.reduce((acc, order) => acc + (order.isPaid ? order.totalPrice : 0), 0);
        const count = selectedUserOrdersMetadata?.total || selectedUserOrders.length;
        const avg = total / (selectedUserOrders.filter((order) => order.isPaid).length || 1);
        return { total, count, avg };
    }, [selectedUserOrders, selectedUserOrdersMetadata]);

    const handleRoleChange = async (newRole: 'user' | 'admin') => {
        try {
            await updateUserRole(selectedUser._id, newRole);
            setSelectedUser({ ...selectedUser, role: newRole });
        } catch (err: unknown) {
            alert(typeof err === 'string' ? err : t('admin.management.users.errors.roleUpdate'));
        }
    };

    const handleDelete = async () => {
        if (!confirm(tUnsafe('common.confirmDelete') || 'Are you sure?')) return;
        try {
            await deleteUser(selectedUser._id);
            router.push('/admin/users');
        } catch (err: unknown) {
            alert(typeof err === 'string' ? err : 'Failed to delete user');
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700 font-sans">
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <nav className="flex items-center gap-3">
                        <Link href="/admin/users" className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-zinc-900 transition-colors">
                            {t('admin.management.users.detail.breadcrumbs.registry')}
                        </Link>
                        <FiChevronRight className="text-zinc-200" size={12} />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-900">
                            {t('admin.management.users.detail.breadcrumbs.profile')}
                        </span>
                    </nav>

                    <AnimatePresence>
                        {selectedUser._id !== adminUser?.id && (
                            <motion.button
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                onClick={handleDelete}
                                className="group flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all rounded-xl border border-red-100"
                            >
                                <FiTrash2 className="group-hover:rotate-12 transition-transform" />
                                {t('admin.management.users.detail.actions.revoke')}
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 bg-zinc-50 rounded-[2.5rem] p-8 text-zinc-900 border border-zinc-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-zinc-200/50 to-transparent rounded-full -mr-48 -mt-48 blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-1000"></div>

                    <div className="flex items-center gap-8 relative z-10">
                        <div className="w-20 h-20 bg-white shadow-xl shadow-zinc-200/50 rounded-3xl flex items-center justify-center text-3xl font-black border border-zinc-100">
                            {displayInitial}
                        </div>
                        <div className="space-y-3">
                            <div>
                                <h1 className="text-4xl font-black tracking-tighter mb-2 text-zinc-900">{displayName}</h1>
                                <div className="flex items-center gap-3">
                                    <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${selectedUser.role === 'admin' ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-zinc-200/50 text-zinc-500 border-zinc-200'}`}>
                                        {tUnsafe(`admin.management.users.roles.${selectedUser.role === 'admin' ? 'admin' : 'member'}`)}
                                    </span>
                                    <span className="text-zinc-300 text-[10px] font-mono tracking-wider font-bold">{displayUserId}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-8 relative z-10">
                        <div className="text-right border-r border-zinc-200 pr-8">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">{t('admin.management.users.detail.stats.totalSpent')}</p>
                            <p className="text-2xl font-black tracking-tight text-zinc-900">{currencySymbol}{stats.total.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">{t('admin.management.users.detail.stats.orderCount')}</p>
                            <p className="text-2xl font-black tracking-tight text-zinc-900">{stats.count}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {[
                    { label: t('admin.management.users.detail.stats.totalSpent'), value: `${currencySymbol}${stats.total.toLocaleString()}`, icon: FiDollarSign, trend: '+12%', color: 'zinc' },
                    { label: t('admin.management.users.detail.stats.orderCount'), value: stats.count, icon: FiPackage, trend: stats.count > 0 ? 'Active' : 'Dormant', color: stats.count > 0 ? 'green' : 'zinc' },
                    { label: t('admin.management.users.detail.stats.avgOrderValue'), value: `${currencySymbol}${stats.avg.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: FiTrendingUp, trend: 'Global Avg', color: 'blue' }
                ].map((kpi, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-xl hover:shadow-zinc-100 transition-all duration-500 group"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-900 group-hover:bg-zinc-900 group-hover:text-white transition-all duration-500">
                                <kpi.icon size={20} />
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${kpi.trend === 'Active' ? 'bg-green-50 text-green-600' : 'bg-zinc-50 text-zinc-400'}`}>
                                {kpi.trend}
                            </span>
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-1">{kpi.label}</p>
                        <p className="text-3xl font-black tracking-tight text-zinc-900">{kpi.value}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-4 space-y-8">
                    <section className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-zinc-50 flex items-center justify-between">
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-900">{t('admin.management.users.detail.sections.identity')}</h2>
                            <FiShield className="text-zinc-200" size={18} />
                        </div>
                        <div className="p-8 space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-300">{tUnsafe('common.email') || 'Email'}</label>
                                <div className="flex items-center gap-3 p-4 bg-zinc-50 rounded-2xl border border-zinc-50 group hover:border-zinc-200 transition-all">
                                    <FiMail className="text-zinc-400" />
                                    <span className="text-sm font-bold text-zinc-900 flex-1 truncate">{selectedUser.email}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-300">{t('admin.management.users.detail.sections.identity')} Date</label>
                                <div className="flex items-center gap-3 p-4 bg-zinc-50 rounded-2xl border border-zinc-50">
                                    <FiCalendar className="text-zinc-400" />
                                    <span className="text-sm font-bold text-zinc-900">{new Date(selectedUser.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-zinc-50">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Access Protocol</label>
                                <div className="flex gap-2 p-1.5 bg-zinc-50 rounded-2xl border border-zinc-100">
                                    <button
                                        onClick={() => handleRoleChange('user')}
                                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedUser.role === 'user' ? 'bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200/50' : 'text-zinc-400 hover:text-zinc-600'}`}
                                    >
                                        Member
                                    </button>
                                    <button
                                        onClick={() => handleRoleChange('admin')}
                                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedUser.role === 'admin' ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-200' : 'text-zinc-400 hover:text-zinc-600'}`}
                                    >
                                        Admin
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-zinc-50 flex items-center justify-between">
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-900">{t('admin.management.users.detail.sections.address')}</h2>
                            <FiMapPin className="text-zinc-200" size={18} />
                        </div>
                        <div className="p-8 space-y-4">
                            {userAddresses.length > 0 ? userAddresses.map((addr, idx: number) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ x: 5 }}
                                    className="p-5 bg-zinc-50 border border-zinc-50 rounded-2xl flex items-start gap-4 transition-all hover:bg-white hover:border-zinc-200 hover:shadow-xl hover:shadow-zinc-50"
                                >
                                    <div className="mt-1 w-10 h-10 bg-white rounded-xl flex items-center justify-center text-zinc-400 shadow-sm border border-zinc-100">
                                        <FiMapPin size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-900">{addr.title}</p>
                                            {addr.isDefault && <span className="bg-zinc-900 text-white text-[7px] font-black uppercase px-2 py-0.5 rounded-full tracking-tighter">Primary</span>}
                                        </div>
                                        <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                                            {addr.fullAddress}, {addr.district}, {addr.city}
                                        </p>
                                    </div>
                                </motion.div>
                            )) : (
                                <div className="py-12 text-center rounded-2xl border border-dashed border-zinc-200 space-y-3">
                                    <FiMapPin className="mx-auto text-zinc-200" size={24} />
                                    <p className="text-zinc-400 italic font-medium text-[10px] uppercase tracking-widest">{t('admin.management.users.detail.empty.addresses')}</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                <div className="lg:col-span-8 space-y-8">
                    <section className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                        <div className="p-8 border-b border-zinc-50 flex items-center justify-between">
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-900">{t('admin.management.users.detail.sections.orders')}</h2>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 bg-zinc-50 px-4 py-1.5 rounded-full border border-zinc-100">
                                {t('admin.commerce.orders.table.volume')}: {selectedUserOrdersMetadata?.total || 0}
                            </span>
                        </div>

                        <div className="flex-1">
                            {selectedUserOrders.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-zinc-50/50 border-b border-zinc-50">
                                            <tr>
                                                <th className="px-8 py-5 text-left text-[10px] font-black text-zinc-400 uppercase tracking-widest">{t('admin.commerce.orders.table.registry')}</th>
                                                <th className="px-8 py-5 text-left text-[10px] font-black text-zinc-400 uppercase tracking-widest">{t('admin.commerce.orders.table.date')}</th>
                                                <th className="px-8 py-5 text-center text-[10px] font-black text-zinc-400 uppercase tracking-widest">{t('admin.commerce.orders.table.status')}</th>
                                                <th className="px-8 py-5 text-right text-[10px] font-black text-zinc-400 uppercase tracking-widest">{t('admin.commerce.orders.table.volume')}</th>
                                                <th className="px-8 py-5 text-right text-[10px] font-black text-zinc-400 uppercase tracking-widest">{t('admin.commerce.orders.table.operations')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-50">
                                            {selectedUserOrders.map((order) => {
                                                const isPaid = order.paymentStatus === 'paid' || order.isPaid;
                                                return (
                                                    <tr key={order._id} className="group hover:bg-zinc-50/50 transition-colors duration-500">
                                                        <td className="px-8 py-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 bg-zinc-900 text-white rounded-xl flex items-center justify-center text-[10px] font-black shadow-lg shadow-zinc-100">
                                                                    #{order._id.substring(order._id.length - 4).toUpperCase()}
                                                                </div>
                                                                <div className="flex -space-x-3 overflow-hidden font-sans">
                                                                    {order.orderItems.slice(0, 3).map((item: OrderItem, idx: number) => (
                                                                        <div key={idx} className="w-8 h-8 rounded-full border-2 border-white bg-white shadow-sm overflow-hidden relative">
                                                                            <Image src={item.image} alt="" fill className="object-cover" />
                                                                        </div>
                                                                    ))}
                                                                    {order.orderItems.length > 3 && (
                                                                        <div className="w-8 h-8 rounded-full border-2 border-white bg-zinc-100 flex items-center justify-center text-[8px] font-black text-zinc-400">
                                                                            +{order.orderItems.length - 3}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-bold text-zinc-900">{new Date(order.createdAt).toLocaleDateString('tr-TR')}</span>
                                                                <span className="text-[10px] text-zinc-400 font-medium">{new Date(order.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="flex flex-col items-center gap-1.5">
                                                                <div className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${isPaid ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                                                    {isPaid ? t('admin.commerce.orders.status.paid') : t('admin.commerce.orders.status.unpaid')}
                                                                </div>
                                                                <div className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest bg-zinc-50 text-zinc-400 border border-zinc-100`}>
                                                                    {tUnsafe(`admin.commerce.orders.status.${order.status}`)}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6 text-right">
                                                            <span className="text-sm font-black text-zinc-900">{currencySymbol}{order.totalPrice.toLocaleString()}</span>
                                                        </td>
                                                        <td className="px-8 py-6 text-right">
                                                            <Link
                                                                href={`/admin/orders/${order._id}`}
                                                                className="inline-flex items-center justify-center w-9 h-9 border border-zinc-100 rounded-xl text-zinc-400 hover:text-zinc-900 hover:border-zinc-900 hover:bg-zinc-50 transition-all group"
                                                            >
                                                                <FiExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="py-40 text-center space-y-4">
                                    <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mx-auto text-zinc-200">
                                        <FiPackage size={32} />
                                    </div>
                                    <p className="text-zinc-400 italic font-medium text-[10px] uppercase tracking-[0.2em]">{t('admin.management.users.detail.empty.orders')}</p>
                                </div>
                            )}
                        </div>

                        {selectedUserOrdersMetadata && selectedUserOrdersMetadata.pages > 1 && (
                            <div className="p-8 border-t border-zinc-50">
                                <AdminPagination
                                    currentPage={selectedUserOrdersMetadata.page ?? 1}
                                    totalPages={selectedUserOrdersMetadata.pages ?? 1}
                                    totalItems={selectedUserOrdersMetadata.total ?? 0}
                                    limit={orderLimit}
                                    onPageChange={(p) => setOrderPage(p)}
                                    isLoading={false}
                                />
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
