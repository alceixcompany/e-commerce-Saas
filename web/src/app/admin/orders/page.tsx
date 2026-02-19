'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { listOrders, deliverOrder, deleteOrder } from '@/lib/slices/orderSlice';
import { FiCheck, FiX, FiTrash2, FiEye, FiShoppingBag, FiDollarSign, FiClock, FiSearch } from 'react-icons/fi';
import Link from 'next/link';

export default function AdminOrdersPage() {
    const dispatch = useAppDispatch();
    const { orders, isLoading, error } = useAppSelector((state) => state.order);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        dispatch(listOrders({ filter, q: search }));
    }, [dispatch, filter, search]);

    const handleDeliver = async (id: string) => {
        if (confirm('Are you sure you want to mark this order as delivered?')) {
            await dispatch(deliverOrder(id));
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
            await dispatch(deleteOrder(id));
        }
    };

    // Derived State for Stats
    const stats = useMemo(() => {
        if (!orders) return { total: 0, revenue: 0, pending: 0 };
        return {
            total: orders.length,
            revenue: orders.reduce((acc, order) => acc + (order.isPaid ? order.totalPrice : 0), 0),
            pending: orders.filter(o => !o.isDelivered && o.isPaid).length
        };
    }, [orders]);

    // Orders are now filtered and searched by the backend
    const displayOrders = orders || [];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#164e63]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center">
                <div className="text-red-500 mb-4">Error: {error}</div>
                <button onClick={() => dispatch(listOrders())} className="text-[#164e63] underline">Retry</button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_20px_-10px_rgba(0,0,0,0.1)] relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-[#164e63]/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-2 text-[#164e63]">
                            <div className="p-2 bg-[#164e63]/10 rounded-lg"><FiShoppingBag /></div>
                            <span className="text-xs font-bold uppercase tracking-widest">Total Orders</span>
                        </div>
                        <div className="text-3xl font-serif text-gray-900">{stats.total}</div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_20px_-10px_rgba(0,0,0,0.1)] relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-[#C5A059]/10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-2 text-[#C5A059]">
                            <div className="p-2 bg-[#C5A059]/10 rounded-lg"><FiDollarSign /></div>
                            <span className="text-xs font-bold uppercase tracking-widest">Total Revenue</span>
                        </div>
                        <div className="text-3xl font-serif text-gray-900">${stats.revenue.toFixed(2)}</div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_20px_-10px_rgba(0,0,0,0.1)] relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-orange-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-2 text-orange-600">
                            <div className="p-2 bg-orange-50 rounded-lg"><FiClock /></div>
                            <span className="text-xs font-bold uppercase tracking-widest">Pending Shipments</span>
                        </div>
                        <div className="text-3xl font-serif text-gray-900">{stats.pending}</div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex bg-gray-50 p-1 rounded-lg self-start">
                        {['all', 'pending', 'delivered', 'unpaid'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-all ${filter === f ? 'bg-white text-[#164e63] shadow-sm' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-64">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-[#164e63]/20 transition-all font-medium"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[#f8fafc] text-gray-500 uppercase tracking-wider text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {displayOrders.length > 0 ? displayOrders.map((order: any) => (
                                <tr key={order._id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <Link href={`/admin/orders/${order._id}`} className="font-mono text-xs text-gray-500 hover:text-[#164e63] hover:underline">
                                            #{order._id.substring(order._id.length - 8).toUpperCase()}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#164e63] to-[#0e3a4b] text-white flex items-center justify-center text-xs font-bold">
                                                {order.user?.name?.[0] || '?'}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{order.user?.name || 'Deleted User'}</div>
                                                <div className="text-xs text-gray-400">{order.user?.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-xs">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1 items-start">
                                            {order.isPaid ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-widest border border-green-100">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                    Paid
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-[10px] font-bold uppercase tracking-widest border border-red-100">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                                    Unpaid
                                                </span>
                                            )}

                                            {order.isDelivered ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-widest border border-blue-100">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                                    Delivered
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 text-[10px] font-bold uppercase tracking-widest border border-yellow-100">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
                                                    Processing
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-serif font-medium text-gray-900">
                                        ${order.totalPrice.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {!order.isDelivered && order.isPaid && (
                                                <button
                                                    onClick={() => handleDeliver(order._id)}
                                                    className="p-2 text-[#164e63] bg-blue-50 hover:bg-[#164e63] hover:text-white rounded-lg transition-all"
                                                    title="Mark as Delivered"
                                                >
                                                    <FiCheck size={16} />
                                                </button>
                                            )}

                                            <Link
                                                href={`/admin/orders/${order._id}`}
                                                className="p-2 text-gray-400 hover:text-[#164e63] hover:bg-gray-100 rounded-lg transition-all"
                                                title="View Details"
                                            >
                                                <FiEye size={16} />
                                            </Link>

                                            <button
                                                onClick={() => handleDelete(order._id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                title="Delete Order"
                                            >
                                                <FiTrash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                <FiSearch size={24} />
                                            </div>
                                            <p className="text-sm font-medium">No orders found</p>
                                            <p className="text-xs mt-1">Try adjusting your search or filter</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
