'use client';

import { useEffect, use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import {
    fetchUserDetails,
    updateUserRole,
    deleteUser,
    clearSelectedUser
} from '@/lib/slices/adminSlice';
import {
    FiArrowLeft,
    FiPackage,
    FiMapPin,
    FiShield,
    FiMail,
    FiCalendar,
    FiTrash2,
    FiCheckCircle,
    FiXCircle,
    FiExternalLink,
    FiChevronRight
} from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function UserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { isAuthenticated, user: adminUser } = useAppSelector((state) => state.auth);
    const { selectedUser, selectedUserOrders, isLoading, error } = useAppSelector((state) => state.admin);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        if (!isAuthenticated || adminUser?.role !== 'admin') {
            router.push('/');
            return;
        }
        dispatch(fetchUserDetails(id));

        return () => {
            dispatch(clearSelectedUser());
        };
    }, [id, isAuthenticated, adminUser, router, dispatch, mounted]);

    const handleRoleChange = async (newRole: 'user' | 'admin') => {
        try {
            await dispatch(updateUserRole({ userId: id, role: newRole })).unwrap();
        } catch (err: any) {
            alert(err || 'Failed to update role');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
        try {
            await dispatch(deleteUser(id)).unwrap();
            router.push('/admin/users');
        } catch (err: any) {
            alert(err || 'Failed to delete user');
        }
    };

    if (!mounted) return null;

    if (isLoading && !selectedUser) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 mx-auto"></div>
            </div>
        );
    }

    if (error || !selectedUser) {
        return (
            <div className="space-y-12">
                <Link href="/admin/users" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.4em] text-gray-300 hover:text-black">
                    <FiArrowLeft /> Return to Registry
                </Link>
                <div className="text-center py-40 border border-dashed border-gray-100 italic text-gray-400 font-light">
                    Record not found in elite member registry.
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
            {/* Header / Breadcrumb */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <Link href="/admin/users" className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 hover:text-black transition-colors">Client Registry</Link>
                        <FiChevronRight className="text-gray-300" size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-black">Profile Deep-Dive</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-gray-50 flex items-center justify-center text-gray-900 text-xl font-bold border border-gray-100 rounded-xl">
                            {selectedUser.name.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{selectedUser.name}</h1>
                            <p className="text-[10px] font-mono text-gray-400 mt-1 tracking-widest uppercase">ID: {selectedUser._id}</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-4">
                    {selectedUser._id !== adminUser?.id && (
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-6 py-3 border border-red-100 text-red-500 text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 transition-all rounded-lg"
                        >
                            <FiTrash2 /> Revoke Membership
                        </button>
                    )}
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">

                {/* Left: General Info & Status */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-8">
                        <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-900">Account Registry</h2>
                            <FiShield size={16} className="text-gray-300" />
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Identity Email</label>
                                <p className="text-sm font-medium text-gray-900 flex items-center gap-2">{selectedUser.email} <FiMail className="opacity-20 text-black" size={12} /></p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Registration Date</label>
                                <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                                    <FiCalendar className="opacity-20 text-black" size={12} />
                                </p>
                            </div>
                            <div className="pt-6 border-t border-gray-50 space-y-4">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Authorization Tier</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleRoleChange('user')}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${selectedUser.role === 'user' ? 'bg-black text-white border-black shadow-lg shadow-black/10' : 'text-gray-400 border-gray-100 hover:border-black hover:text-black'}`}
                                    >
                                        MEMBER
                                    </button>
                                    <button
                                        onClick={() => handleRoleChange('admin')}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${selectedUser.role === 'admin' ? 'bg-zinc-900 text-white border-zinc-900 shadow-lg shadow-black/10' : 'text-gray-400 border-gray-100 hover:border-black hover:text-black'}`}
                                    >
                                        ADMIN
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Log */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-8">
                        <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-900">Destination Grid</h2>
                            <FiMapPin size={16} className="text-gray-300" />
                        </div>
                        <div className="space-y-4">
                            {(selectedUser as any).addresses?.length > 0 ? (selectedUser as any).addresses.map((addr: any, idx: number) => (
                                <div key={idx} className="p-5 bg-gray-50 border border-gray-50 rounded-xl flex items-start gap-4">
                                    <div className={`mt-1 w-2 h-2 rounded-full ${addr.isDefault ? 'bg-black' : 'bg-gray-200'}`}></div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-900">{addr.title}</p>
                                        <p className="text-sm text-gray-500 mt-1 font-medium leading-relaxed">
                                            {addr.fullAddress}, {addr.district}, {addr.city}
                                        </p>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-10 text-center text-gray-300 italic text-xs border border-dashed border-gray-100 rounded-xl">No destinations registered.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Acquisition History */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex-1">
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-900">Acquisition History</h2>
                            <div className="bg-gray-50 px-3 py-1 rounded-full text-[10px] font-bold text-gray-500 uppercase">
                                Volume: {selectedUserOrders.length}
                            </div>
                        </div>

                        {selectedUserOrders.length > 0 ? (
                            <div className="divide-y divide-gray-50">
                                {selectedUserOrders.map((order) => (
                                    <div key={order._id} className="p-8 flex flex-col md:flex-row items-center gap-10 group hover:bg-gray-50/50 transition-all duration-500">
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center gap-4">
                                                <p className="text-[10px] font-mono text-gray-300 uppercase">REF: {order._id.substring(order._id.length - 8).toUpperCase()}</p>
                                                <div className="w-1 h-1 rounded-full bg-gray-200"></div>
                                                <p className="text-[10px] text-gray-400 font-bold">{new Date(order.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                {order.orderItems.slice(0, 4).map((item: any, i: number) => (
                                                    <div key={i} className="w-10 h-12 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                                                        <img src={item.image} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                                                    </div>
                                                ))}
                                                {order.orderItems.length > 4 && (
                                                    <div className="w-10 h-10 border border-gray-100 rounded-lg flex items-center justify-center text-[10px] font-bold text-gray-400">
                                                        +{order.orderItems.length - 4}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-10">
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-gray-900">${order.totalPrice.toLocaleString()}</p>
                                                <p className="text-[9px] font-bold uppercase text-gray-300 tracking-widest">Grand Total</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1.5 min-w-[100px]">
                                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${order.isPaid ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                                                    {order.isPaid ? 'Settled' : 'Unpaid'}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${order.isDelivered ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                                                    {order.isDelivered ? 'Fulfilled' : 'Pending'}
                                                </span>
                                            </div>
                                            <Link href={`/admin/orders/${order._id}`} className="w-10 h-10 rounded-lg border border-gray-100 flex items-center justify-center text-gray-400 hover:border-black hover:text-black transition-all">
                                                <FiExternalLink />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-32 text-center text-gray-300 italic text-sm font-medium">
                                No acquisition records found for this member.
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
