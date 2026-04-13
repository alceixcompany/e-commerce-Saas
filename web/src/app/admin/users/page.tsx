'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import {
    fetchUsers,
    updateUserRole,
    deleteUser,
    bulkDeleteUsers
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
import { getCurrencySymbol } from '@/utils/currency';
import { useTranslation } from '@/hooks/useTranslation';

export default function UsersManagementPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { isAuthenticated, user: currentUser } = useAppSelector((state) => state.auth);
    const { users, loading, error, metadata } = useAppSelector((state) => state.admin);
    const { globalSettings } = useAppSelector((state) => state.content);
    const currencySymbol = getCurrencySymbol(globalSettings?.currency);
    const isLoading = loading.fetchUsers;
    const isDeleting = loading.deleteUser;

    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'spent' | 'newest'>('spent');
    const [filterRole, setFilterRole] = useState<string>(''); // '' means all
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

    useEffect(() => {
        if (!isAuthenticated || currentUser?.role !== 'admin') {
            router.push('/');
            return;
        }
        dispatch(fetchUsers({ q: searchTerm, sort: sortBy, role: filterRole }));
    }, [isAuthenticated, currentUser, router, dispatch, searchTerm, sortBy, filterRole]);

    const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
        try {
            await dispatch(updateUserRole({ userId, role: newRole })).unwrap();
        } catch (err: any) {
            alert(err || t('admin.management.users.errors.roleUpdate'));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedUserIds.length === 0) return;

        if (confirm(t('admin.management.users.bulk.confirmDelete', { count: selectedUserIds.length }))) {
            try {
                await dispatch(bulkDeleteUsers(selectedUserIds)).unwrap();
                setSelectedUserIds([]);
                dispatch(fetchUsers({ q: searchTerm, sort: sortBy, role: filterRole }));
            } catch (err: any) {
                console.error('Failed to bulk delete users:', err);
            }
        }
    };

    const toggleSelectAll = () => {
        if (selectedUserIds.length === displayUsers.length) {
            setSelectedUserIds([]);
        } else {
            setSelectedUserIds(displayUsers.map((u: any) => u._id));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedUserIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    // Users are now filtered and sorted by the backend
    const displayUsers = users;

    if (isLoading && users.length === 0) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-foreground/10 pb-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Link href="/admin" className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/40 hover:text-foreground transition-all">{t('admin.management.users.breadcrumbs.summary')}</Link>
                        <FiChevronRight className="text-foreground/20" size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground">{t('admin.management.users.breadcrumbs.registry')}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">{t('admin.management.users.title')}</h1>
                    <p className="text-foreground/50 font-medium">{t('admin.management.users.subtitle')}</p>
                </div>
            </div>

            {/* Utility Bar */}
            <div className="bg-background border border-foreground/10 rounded-2xl p-4 flex flex-col md:flex-row gap-4 shadow-sm items-center">
                <div className="flex-1 relative w-full">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" />
                    <input
                        type="text"
                        placeholder={t('admin.management.users.searchPlaceholder')}
                        className="w-full pl-12 pr-4 py-2.5 bg-foreground/5 border-0 rounded-xl text-sm text-foreground placeholder:text-foreground/30 focus:ring-2 focus:ring-foreground/5 transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {selectedUserIds.length > 0 && (
                    <button
                        onClick={handleBulkDelete}
                        disabled={isDeleting}
                        className="flex items-center gap-2 px-6 py-2.5 bg-red-500 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-all rounded-xl shadow-lg hover:shadow-red-500/20 disabled:opacity-50"
                    >
                        <FiTrash2 size={16} />
                        {selectedUserIds.length}
                    </button>
                )}
                <div className="flex gap-2 w-full md:w-auto border-l border-foreground/10 pl-4 ml-4">
                    <button
                        onClick={() => setFilterRole('')}
                        className={`px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all rounded-xl ${filterRole === '' ? 'bg-foreground/10 text-foreground' : 'text-foreground/30 hover:text-foreground'}`}
                    >
                        {t('common.all' as any) || 'All'}
                    </button>
                    <button
                        onClick={() => setFilterRole('admin')}
                        className={`px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all rounded-xl ${filterRole === 'admin' ? 'bg-foreground/10 text-foreground' : 'text-foreground/30 hover:text-foreground'}`}
                    >
                        {t('admin.management.users.roles.admin')}
                    </button>
                    <button
                        onClick={() => setFilterRole('user')}
                        className={`px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all rounded-xl ${filterRole === 'user' ? 'bg-foreground/10 text-foreground' : 'text-foreground/30 hover:text-foreground'}`}
                    >
                        {t('admin.management.users.roles.member')}
                    </button>
                 </div>
                 <div className="flex gap-2 w-full md:w-auto">
                    <button
                        onClick={() => setSortBy('spent')}
                        className={`flex-1 md:flex-none px-6 py-2.5 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 border transition-all rounded-xl ${sortBy === 'spent' ? 'bg-foreground text-background border-foreground shadow-lg shadow-foreground/10' : 'text-foreground/40 border-foreground/10 hover:border-foreground/30 hover:text-foreground hover:bg-foreground/5'}`}
                    >
                        <FiDollarSign /> {t('admin.management.users.sortBy.spent')}
                    </button>
                    <button
                        onClick={() => setSortBy('newest')}
                        className={`flex-1 md:flex-none px-6 py-2.5 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 border transition-all rounded-xl ${sortBy === 'newest' ? 'bg-foreground text-background border-foreground shadow-lg shadow-foreground/10' : 'text-foreground/40 border-foreground/10 hover:border-foreground/30 hover:text-foreground hover:bg-foreground/5'}`}
                    >
                        <FiCalendar /> {t('admin.management.users.sortBy.newest')}
                    </button>
                </div>
            </div>

            {/* User List Table */}
            <div className="bg-background border border-foreground/10 rounded-2xl shadow-sm overflow-hidden text-foreground">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-foreground/5 border-b border-foreground/5">
                            <tr>
                                <th className="px-6 py-5 text-center w-12">
                                    <input
                                        type="checkbox"
                                        checked={selectedUserIds.length === displayUsers.length && displayUsers.length > 0}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 rounded border-foreground/20 bg-background text-foreground focus:ring-foreground/10 transition-all cursor-pointer mx-auto"
                                    />
                                </th>
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{t('admin.management.users.table.identity')}</th>
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{t('admin.management.users.table.role')}</th>
                                <th className="px-8 py-5 text-center text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{t('admin.management.users.table.orders')}</th>
                                <th className="px-8 py-5 text-right text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{t('admin.management.users.table.value')}</th>
                                <th className="px-8 py-5 text-right text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{t('admin.management.users.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-foreground/5">
                             {displayUsers.map((client) => (
                                <tr key={client._id} className={`group hover:bg-foreground/5 transition-colors ${selectedUserIds.includes(client._id) ? 'bg-foreground/[0.02]' : ''}`}>
                                     <td className="px-6 py-6 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedUserIds.includes(client._id)}
                                            onChange={() => toggleSelect(client._id)}
                                            className="w-4 h-4 rounded border-foreground/20 bg-background text-foreground focus:ring-foreground/10 transition-all cursor-pointer mx-auto"
                                            disabled={client._id === currentUser?.id}
                                        />
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-foreground text-background rounded-lg flex items-center justify-center border border-foreground/10 group-hover:border-foreground/30 transition-all font-bold">
                                                {client.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-foreground leading-tight">{client.name}</div>
                                                <div className="text-xs text-foreground/40 font-medium">{client.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                     <td className="px-8 py-6">
                                        <select
                                            value={client.role}
                                            onChange={(e) => handleRoleChange(client._id, e.target.value as 'user' | 'admin')}
                                            className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-transparent border-0 cursor-pointer focus:ring-0 ${client.role === 'admin' ? 'text-foreground' : 'text-foreground/40 font-medium'}`}
                                            disabled={client._id === currentUser?.id}
                                        >
                                            <option value="user" className="bg-background">{t('admin.management.users.roles.member')}</option>
                                            <option value="admin" className="bg-background">{t('admin.management.users.roles.admin')}</option>
                                        </select>
                                    </td>
                                     <td className="px-8 py-6 text-center">
                                        <span className="text-xs font-mono font-bold text-foreground bg-foreground/5 px-2 py-1 rounded border border-foreground/10">{client.orderCount || 0}</span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <span className="text-sm font-bold text-foreground">{currencySymbol}{client.totalSpent?.toLocaleString() || '0.00'}</span>
                                    </td>
                                     <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <Link
                                                href={`/admin/users/${client._id}`}
                                                className="p-2 border border-foreground/10 rounded-lg hover:border-foreground/30 text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-all"
                                                title={t('admin.management.users.actions.profile')}
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
                        <div className="w-12 h-12 bg-foreground/5 rounded-full flex items-center justify-center mx-auto text-foreground/20">
                            <FiSearch size={20} />
                        </div>
                        <p className="text-foreground/30 font-bold uppercase tracking-widest text-[10px] italic">{t('admin.management.users.empty')}</p>
                    </div>
                 )}
            </div>
        </div>
    );
}
