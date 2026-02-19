'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import {
    fetchUsers,
    updateUserRole,
    deleteUser
} from '@/lib/slices/adminSlice';
import {
    FiUsers,
    FiSearch,
    FiFilter,
    FiTrendingUp,
    FiArrowRight,
    FiTrash2,
    FiDollarSign,
    FiCalendar,
    FiMoreHorizontal,
    FiShield,
    FiChevronRight
} from 'react-icons/fi';

export default function UsersManagementPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { isAuthenticated, user: currentUser } = useAppSelector((state) => state.auth);
    const { users, isLoading, error } = useAppSelector((state) => state.admin);

    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'spent' | 'newest'>('spent');

    useEffect(() => {
        if (!isAuthenticated || currentUser?.role !== 'admin') {
            router.push('/');
            return;
        }
        dispatch(fetchUsers({ q: searchTerm, sort: sortBy }));
    }, [isAuthenticated, currentUser, router, dispatch, searchTerm, sortBy]);

    const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
        try {
            await dispatch(updateUserRole({ userId, role: newRole })).unwrap();
        } catch (err: any) {
            alert(err || 'Failed to update user role');
        }
    };

    // Users are now filtered and sorted by the backend
    const displayUsers = users;

    if (isLoading && users.length === 0) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 mx-auto"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Link href="/admin" className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 hover:text-black transition-colors">Admin Summary</Link>
                        <FiChevronRight className="text-gray-300" size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-black">Client Registry</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">System Members</h1>
                    <p className="text-gray-500 font-medium">Managing client accounts and authorization tiers.</p>
                </div>
            </div>

            {/* Utility Bar */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col md:flex-row gap-4 shadow-sm items-center">
                <div className="flex-1 relative w-full">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or email archive..."
                        className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border-0 rounded-lg text-sm text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-black/5"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button
                        onClick={() => setSortBy('spent')}
                        className={`flex-1 md:flex-none px-6 py-2.5 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 border transition-all rounded-lg ${sortBy === 'spent' ? 'bg-black text-white border-black shadow-lg shadow-black/10' : 'text-gray-400 border-gray-100 hover:border-black hover:text-black hover:bg-white'}`}
                    >
                        <FiDollarSign /> Top Spenders
                    </button>
                    <button
                        onClick={() => setSortBy('newest')}
                        className={`flex-1 md:flex-none px-6 py-2.5 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 border transition-all rounded-lg ${sortBy === 'newest' ? 'bg-black text-white border-black shadow-lg shadow-black/10' : 'text-gray-400 border-gray-100 hover:border-black hover:text-black hover:bg-white'}`}
                    >
                        <FiCalendar /> New Members
                    </button>
                </div>
            </div>

            {/* User List Table */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Member Identity</th>
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Registry Role</th>
                                <th className="px-8 py-5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Orders</th>
                                <th className="px-8 py-5 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Value</th>
                                <th className="px-8 py-5 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {displayUsers.map((client) => (
                                <tr key={client._id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-900 border border-gray-100 group-hover:border-black transition-all font-bold">
                                                {client.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-900">{client.name}</div>
                                                <div className="text-xs text-gray-500 font-medium">{client.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <select
                                            value={client.role}
                                            onChange={(e) => handleRoleChange(client._id, e.target.value as 'user' | 'admin')}
                                            className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-transparent border-0 cursor-pointer focus:ring-0 ${client.role === 'admin' ? 'text-zinc-900 font-black' : 'text-gray-400 font-medium'}`}
                                            disabled={client._id === currentUser?.id}
                                        >
                                            <option value="user">Member</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className="text-xs font-mono font-bold text-gray-900 bg-gray-50 px-2 py-1 rounded border border-gray-100">{client.orderCount || 0}</span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <span className="text-sm font-bold text-gray-900">${client.totalSpent?.toLocaleString() || '0.00'}</span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <Link
                                                href={`/admin/users/${client._id}`}
                                                className="p-2 border border-gray-100 rounded-lg hover:border-black text-gray-400 hover:text-black transition-all"
                                                title="Full Profile"
                                            >
                                                <FiArrowRight />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {displayUsers.length === 0 && (
                    <div className="py-32 text-center space-y-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                            <FiSearch size={20} />
                        </div>
                        <p className="text-gray-400 font-medium italic">No client records match your search criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
