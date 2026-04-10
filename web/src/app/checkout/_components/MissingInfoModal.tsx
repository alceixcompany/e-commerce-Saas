'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertCircle, FiCheck, FiRefreshCcw, FiSettings, FiPhone, FiCreditCard, FiSave } from 'react-icons/fi';
import { profileService } from '@/lib/services/profileService';

interface MissingInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    onRefresh: () => Promise<any>;
}

export default function MissingInfoModal({ isOpen, onClose, user, onRefresh }: MissingInfoModalProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        phone: user?.phone || '',
        identityNumber: user?.identityNumber || ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setFormData({
                phone: user?.phone || '',
                identityNumber: user?.identityNumber || ''
            });
            setError('');
        }
    }, [isOpen, user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.phone) {
            setError('Phone number is required to proceed.');
            return;
        }

        try {
            setIsSaving(true);
            // 1. Update Profile (Backend)
            await profileService.updateProfile({
                phone: formData.phone,
                identityNumber: formData.identityNumber
            });

            // 2. Refresh Global Auth State
            await onRefresh();
            
            setIsSaving(false);
            onClose();
        } catch (err: any) {
            console.error('Failed to update profile from modal:', err);
            setError(err.message || 'Failed to save information. Please try again.');
            setIsSaving(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-foreground/40 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative bg-background border border-foreground/10 shadow-2xl w-full max-w-md overflow-hidden rounded-3xl"
                    >
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-primary"></div>
                        
                        <div className="p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                    <FiSettings size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold font-serif text-foreground">
                                        {!user?.phone && !user?.identityNumber ? 'Complete Profile' : 'Veri Güncelleme'}
                                    </h3>
                                    <p className="text-xs text-foreground/40 font-medium uppercase tracking-[0.2em] mt-0.5">Quick Verification</p>
                                </div>
                            </div>

                            <p className="text-sm text-foreground/60 leading-relaxed mb-6">
                                {!user?.phone && !user?.identityNumber 
                                    ? 'Hesabınızın güvenliği ve yasal süreçler için lütfen eksik bilgilerinizi tamamlayın.'
                                    : 'Ödeme işleminin tamamlanabilmesi için aşağıdaki eksik bilginin girilmesi önerilir.'}
                            </p>

                            <form onSubmit={handleSave} className="space-y-5">
                                {(!user?.phone || user?.phone === '') && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 flex items-center gap-2">
                                            <FiPhone className="text-primary" /> Telefon Numarası (Zorunlu)
                                        </label>
                                        <input 
                                            type="tel"
                                            className="w-full bg-foreground/5 border border-foreground/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                            placeholder="+90 5xx xxx xx xx"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                )}

                                {(!user?.identityNumber || user?.identityNumber === '' || user?.identityNumber === '11111111111') && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 flex items-center justify-between">
                                            <span className="flex items-center gap-2"><FiCreditCard className="text-primary" /> T.C. Kimlik / Pasaport</span>
                                            <span className="text-[9px] text-primary/60 italic">İsteğe Bağlı</span>
                                        </label>
                                        <input 
                                            type="text"
                                            className="w-full bg-foreground/5 border border-foreground/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                                            placeholder="TCKN veya Pasaport No"
                                            value={formData.identityNumber}
                                            onChange={(e) => setFormData({ ...formData, identityNumber: e.target.value })}
                                        />
                                        <p className="text-[9px] text-foreground/30 italic">Güvenli faturalandırma için doğru giriş yapılması önerilir.</p>
                                    </div>
                                )}

                                {error && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-xs text-red-500 animate-shake">
                                        <FiAlertCircle className="shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <div className="pt-2">
                                    <button 
                                        type="submit"
                                        disabled={isSaving}
                                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-foreground text-background rounded-2xl text-sm font-bold shadow-xl shadow-foreground/10 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {isSaving ? (
                                            <FiRefreshCcw className="animate-spin" />
                                        ) : (
                                            <>Bilgileri Kaydet ve Devam Et <FiCheck size={18} /></>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="bg-muted p-4 border-t border-foreground/5 flex justify-center">
                            <button onClick={onClose} className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 hover:text-foreground transition-colors">
                                Return to Checkout
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
