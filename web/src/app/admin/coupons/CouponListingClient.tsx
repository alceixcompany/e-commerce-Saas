'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiTag } from 'react-icons/fi';
import { useCouponStore } from '@/lib/store/useCouponStore';
import { useContentStore } from '@/lib/store/useContentStore';
import { getCurrencySymbol } from '@/utils/currency';
import AdminPagination from '@/components/admin/AdminPagination';
import { Coupon } from '@/types/coupon';
import { useTranslation } from '@/hooks/useTranslation';
import { getErrorMessage } from '@/lib/utils/error';

interface CouponListingClientProps {
    initialCoupons?: Coupon[];
    initialMetadata?: any;
}

export default function CouponListingClient({ initialCoupons = [], initialMetadata }: CouponListingClientProps) {
    const { t } = useTranslation();
    const { coupons: storeCoupons, metadata: storeMetadata, isLoading: storeIsLoading, fetchCoupons, createCoupon, deleteCoupon, bulkDeleteCoupons } = useCouponStore();
    const { globalSettings } = useContentStore();
    const currencySymbol = getCurrencySymbol(globalSettings?.currency);
    
    const coupons = storeCoupons.length > 0 ? storeCoupons : initialCoupons;
    const metadata = storeMetadata.total > 0 ? storeMetadata : (initialMetadata || { page: 1, pages: 1, total: 0 });
    const isLoading = !!storeIsLoading.fetchList && coupons.length === 0;
    const isDeleting = !!storeIsLoading.delete;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [selectedCouponIds, setSelectedCouponIds] = useState<string[]>([]);
    const [hasInitialized, setHasInitialized] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'percentage' as 'percentage' | 'fixed',
        amount: '',
        expirationDate: '',
        usageLimit: ''
    });

    useEffect(() => {
        if (hasInitialized) {
            fetchCoupons({ page, limit });
        } else {
            setHasInitialized(true);
        }
    }, [fetchCoupons, page, limit, hasInitialized]);

    const handleDelete = async (id: string) => {
        if (!window.confirm(t('admin.engagement.coupons.confirm.delete'))) return;
        try {
            await deleteCoupon(id);
            fetchCoupons({ page, limit });
        } catch (err: unknown) {
            console.error('Failed to delete coupon:', err);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedCouponIds.length === 0) return;

        if (confirm(t('admin.engagement.coupons.bulk.confirmDelete', { count: selectedCouponIds.length }))) {
            try {
                await bulkDeleteCoupons(selectedCouponIds);
                setSelectedCouponIds([]);
                fetchCoupons({ page, limit });
            } catch (err: unknown) {
                console.error('Failed to bulk delete coupons:', err);
            }
        }
    };

    const toggleSelectAll = () => {
        if (selectedCouponIds.length === coupons.length) {
            setSelectedCouponIds([]);
        } else {
            setSelectedCouponIds(coupons.map((c) => c._id));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedCouponIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
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
            const submitData = {
                ...formData,
                amount: Number(formData.amount),
                usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
                isActive: true
            } as any;
            await createCoupon(submitData);
            setIsModalOpen(false);
            setFormData({
                code: '',
                discountType: 'percentage',
                amount: '',
                expirationDate: '',
                usageLimit: ''
            });
            fetchCoupons({ page, limit });
        } catch (err: unknown) {
            alert(getErrorMessage(err) || t('admin.engagement.coupons.errors.create'));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-background p-6 rounded-2xl border border-foreground/10 shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">{t('admin.engagement.coupons.title')}</h1>
                    <p className="text-sm text-foreground/50 mt-1">{t('admin.engagement.coupons.subtitle')}</p>
                </div>
                <div className="flex items-center gap-3">
                    {selectedCouponIds.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            disabled={isDeleting}
                            className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-red-600 transition-all shadow-lg hover:shadow-red-500/20 disabled:opacity-50"
                        >
                            <FiTrash2 /> {t('admin.common.selected')}: {selectedCouponIds.length}
                        </button>
                    )}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-foreground/90 transition-all shadow-lg hover:shadow-foreground/20"
                    >
                        <FiPlus /> {t('admin.engagement.coupons.createButton')}
                    </button>
                </div>
            </div>

            <div className="bg-background border border-foreground/10 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-foreground/5 border-b border-foreground/5">
                            <tr>
                                <th className="px-6 py-4 text-center w-12 text-foreground/40 font-bold uppercase tracking-widest text-[10px]">
                                    <input
                                        type="checkbox"
                                        checked={selectedCouponIds.length === coupons.length && coupons.length > 0}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 rounded border-foreground/20 bg-background text-foreground focus:ring-foreground/10 transition-all cursor-pointer mx-auto"
                                    />
                                </th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-foreground/40">{t('admin.engagement.coupons.table.code')}</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-foreground/40">{t('admin.engagement.coupons.table.discount')}</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-foreground/40">{t('admin.engagement.coupons.table.usage')}</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-foreground/40">{t('admin.engagement.coupons.table.expires')}</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-foreground/40">{t('admin.engagement.coupons.table.status')}</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-foreground/40 text-right">{t('admin.engagement.coupons.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-foreground/5">
                            {coupons.map((coupon) => (
                                <tr key={coupon._id} className={`hover:bg-foreground/5 transition-colors group ${selectedCouponIds.includes(coupon._id) ? 'bg-foreground/[0.02]' : ''}`}>
                                    <td className="px-6 py-4 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedCouponIds.includes(coupon._id)}
                                            onChange={() => toggleSelect(coupon._id)}
                                            className="w-4 h-4 rounded border-foreground/20 bg-background text-foreground focus:ring-foreground/10 transition-all cursor-pointer mx-auto"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-mono font-bold text-foreground bg-foreground/5 px-2.5 py-1 rounded-lg border border-foreground/10 shadow-sm leading-none transition-all group-hover:border-foreground/30">{coupon.code}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] bg-primary/10 text-primary border border-primary/20 shadow-sm shadow-primary/5">
                                            {coupon.discountType === 'percentage' ? `${coupon.amount}%` : `${currencySymbol}${coupon.amount.toFixed(2)}`}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-foreground/50 font-bold text-xs">
                                        {coupon.usedCount} <span className="opacity-30 mx-1">/</span> <span className="text-foreground tracking-widest">{coupon.usageLimit || '∞'}</span>
                                    </td>
                                    <td className="px-6 py-4 text-foreground/40 text-[10px] font-black tracking-widest uppercase">
                                        {calculateExpiry(coupon.expirationDate)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {isExpired(coupon.expirationDate) ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-red-500/10 text-red-500 border border-red-500/20 shadow-sm shadow-red-500/5">
                                                <span className="w-1 h-1 rounded-full bg-red-500"></span>
                                                {t('admin.engagement.coupons.status.expired')}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-green-500/10 text-green-500 border border-green-500/20 shadow-sm shadow-green-500/5">
                                                <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></span>
                                                {t('admin.engagement.coupons.status.active')}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDelete(coupon._id)}
                                            className="text-foreground/20 hover:text-red-500 hover:bg-red-500/10 transition-all p-2.5 rounded-xl opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                                            title={t('admin.common.delete')}
                                        >
                                            <FiTrash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {coupons.length === 0 && !isLoading && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-32 text-center">
                                        <div className="flex flex-col items-center justify-center text-foreground/10">
                                            <div className="w-16 h-16 bg-foreground/5 rounded-full flex items-center justify-center mb-6">
                                                <FiTag size={32} />
                                            </div>
                                            <p className="text-sm font-black uppercase tracking-[0.3em] text-foreground/20 italic">{t('admin.engagement.coupons.empty.title')}</p>
                                        </div>
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

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-background border border-foreground/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-foreground/5 flex justify-between items-center bg-foreground/5">
                            <h3 className="text-foreground font-bold uppercase tracking-widest text-[10px]">{t('admin.engagement.coupons.modal.registry')}</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-foreground/40 hover:text-foreground transition-colors text-xl"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 mb-2">{t('admin.engagement.coupons.modal.identity')}</label>
                                <div className="relative">
                                    <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" />
                                    <input
                                        type="text"
                                        required
                                        placeholder={t('admin.engagement.coupons.modal.placeholder.code')}
                                        className="w-full pl-10 pr-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-foreground/30 text-foreground uppercase font-mono text-sm placeholder:text-foreground/20 transition-all font-black tracking-widest"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 mb-2">{t('admin.engagement.coupons.modal.valuation')}</label>
                                    <select
                                        className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-foreground/30 text-foreground text-sm font-bold transition-all"
                                        value={formData.discountType}
                                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value as Coupon['discountType'] })}
                                    >
                                        <option value="percentage">{t('admin.engagement.coupons.modal.valuationType.percentage')}</option>
                                        <option value="fixed">{t('admin.engagement.coupons.modal.valuationType.fixed', { currency: currencySymbol })}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 mb-2">{t('admin.engagement.coupons.modal.benefit')}</label>
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
                                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 mb-2">{t('admin.engagement.coupons.modal.termination')}</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-foreground/30 text-foreground text-sm font-bold transition-all"
                                        value={formData.expirationDate}
                                        onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 mb-2">{t('admin.engagement.coupons.modal.utilization')}</label>
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder={t('admin.engagement.coupons.modal.placeholder.unlimited')}
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
                                    {t('admin.common.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-foreground text-background rounded-xl hover:bg-foreground/90 font-bold uppercase tracking-widest text-[10px] transition-all shadow-lg hover:shadow-foreground/20"
                                >
                                    {t('admin.engagement.coupons.modal.authorize')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
