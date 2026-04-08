'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiTag } from 'react-icons/fi';
import api from '@/lib/api';
import { Coupon } from '@/types/coupon';

export default function AdminCouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'percentage',
        amount: '',
        expirationDate: '',
        usageLimit: ''
    });

    const fetchCoupons = async () => {
        try {
            const response = await api.get('/coupons');
            setCoupons(response.data.data);
        } catch (error) {
            console.error('Failed to fetch coupons:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this coupon?')) return;

        try {
            await api.delete(`/coupons/${id}`);
            setCoupons(coupons.filter(c => c._id !== id));
        } catch (error) {
            console.error('Failed to delete coupon:', error);
            alert('Failed to delete coupon');
        }
    };

    const calculateExpiry = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    const isExpired = (dateString: string) => {
        return new Date(dateString) < new Date();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/coupons', formData);
            setIsModalOpen(false);
            setFormData({
                code: '',
                discountType: 'percentage',
                amount: '',
                expirationDate: '',
                usageLimit: ''
            });
            fetchCoupons();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to create coupon');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-background p-6 rounded-2xl border border-foreground/10 shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Coupons</h1>
                    <p className="text-sm text-foreground/50 mt-1">Manage discount codes and promotions</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-foreground/90 transition-all shadow-lg hover:shadow-foreground/20"
                >
                    <FiPlus /> Create Coupon
                </button>
            </div>

            <div className="bg-background border border-foreground/10 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-foreground/5 border-b border-foreground/5">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-foreground/40">Code</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-foreground/40">Discount</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-foreground/40">Usage</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-foreground/40">Expires</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-foreground/40">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-foreground/40 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-foreground/5">
                             {coupons.map((coupon) => (
                                <tr key={coupon._id} className="hover:bg-foreground/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <span className="font-mono font-bold text-foreground bg-foreground/5 px-2 py-1 rounded-lg border border-foreground/10">{coupon.code}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                                            {coupon.discountType === 'percentage' ? `${coupon.amount}%` : `$${coupon.amount}`}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-foreground/50 font-medium">
                                        {coupon.usedCount} <span className="opacity-30">/</span> {coupon.usageLimit || '∞'}
                                    </td>
                                    <td className="px-6 py-4 text-foreground/50 text-xs">
                                        {calculateExpiry(coupon.expirationDate)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {isExpired(coupon.expirationDate) ? (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-red-500/10 text-red-500 border border-red-500/20">Expired</span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-green-500/10 text-green-500 border border-green-500/20">Active</span>
                                        )}
                                    </td>
                                     <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDelete(coupon._id)}
                                            className="text-foreground/20 hover:text-red-500 hover:bg-red-500/10 transition-all p-2 rounded-lg opacity-0 group-hover:opacity-100"
                                            title="Delete Coupon"
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                             {coupons.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-foreground/30">
                                        No active promotions found. Initiate a new coupon strategy.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
             {isModalOpen && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-background border border-foreground/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-foreground/5 flex justify-between items-center bg-foreground/5">
                            <h3 className="text-foreground font-bold uppercase tracking-widest text-[10px]">Registry Protocol: New Coupon</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-foreground/40 hover:text-foreground transition-colors text-xl"
                            >
                                &times;
                            </button>
                        </div>

                         <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 mb-2">Coupon Identity</label>
                                <div className="relative">
                                    <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="CODE_2024"
                                        className="w-full pl-10 pr-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-foreground/30 text-foreground uppercase font-mono text-sm placeholder:text-foreground/20 transition-all font-bold"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 mb-2">Valuation Type</label>
                                    <select
                                        className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-foreground/30 text-foreground text-sm font-bold transition-all"
                                        value={formData.discountType}
                                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount ($)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 mb-2">Benefit Amount</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        placeholder="25"
                                        className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-foreground/30 text-foreground text-sm font-bold placeholder:text-foreground/20 transition-all"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 mb-2">Termination Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-foreground/30 text-foreground text-sm font-bold transition-all"
                                        value={formData.expirationDate}
                                        onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 mb-2">Utilization Cap</label>
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="UNLIMITED"
                                        className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-foreground/30 text-foreground text-sm font-bold placeholder:text-foreground/20 transition-all"
                                        value={formData.usageLimit}
                                        onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                    />
                                </div>
                            </div>

                             <div className="pt-6 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-3 border border-foreground/10 text-foreground/40 rounded-xl hover:bg-foreground/5 font-bold uppercase tracking-widest text-[10px] transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-foreground text-background rounded-xl hover:bg-foreground/90 font-bold uppercase tracking-widest text-[10px] transition-all shadow-lg hover:shadow-foreground/20"
                                >
                                    Authorize Coupon
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
