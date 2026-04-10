'use client';

import { useState, useEffect } from 'react';
import { FiSave, FiCreditCard, FiCheckCircle, FiAlertCircle, FiInfo, FiShield, FiGlobe, FiExternalLink } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { paymentSettingsService } from '@/lib/services/paymentSettingsService';
import { PaymentSettings } from '@/types/payment-settings';
import { useTranslation } from '@/hooks/useTranslation';

export default function PaymentSettingsPage() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [settings, setSettings] = useState<PaymentSettings>({
        paypal: {
            active: false,
            clientId: '',
            clientSecret: '',
            mode: 'sandbox'
        },
        iyzico: {
            active: false,
            apiKey: '',
            secretKey: '',
            baseUrl: 'https://sandbox-api.iyzipay.com'
        },
        storeUrl: ''
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const data = await paymentSettingsService.getPaymentSettings();
            setSettings(data);
        } catch (error: any) {
            console.error('Fetch settings error:', error);
            setMessage({ type: 'error', text: t('admin.management.payment.messages.error') });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        if (settings.paypal?.active && (!settings.paypal.clientId || !settings.paypal.clientSecret)) {
            setMessage({ type: 'error', text: t('admin.management.payment.validation.paypalMissing') });
            return;
        }
        if (settings.iyzico?.active && (!settings.iyzico.apiKey || !settings.iyzico.secretKey)) {
            setMessage({ type: 'error', text: t('admin.management.payment.validation.iyzicoMissing') });
            return;
        }

        // Global Validation
        if (!settings.storeUrl) {
            setMessage({ type: 'error', text: t('admin.management.payment.validation.urlRequired') });
            return;
        }

        try {
            setSaving(true);
            setMessage({ type: '', text: '' });

            await paymentSettingsService.updatePaymentSettings(settings);

            setMessage({ type: 'success', text: t('admin.management.payment.messages.success') });
            // Re-fetch to see the masked values
            fetchSettings();
        } catch (error: any) {
            console.error('Update settings error:', error);
            setMessage({ type: 'error', text: t('admin.management.payment.messages.updateFailed') });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto mb-4"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">{t('admin.management.payment.title')}</h1>
                <p className="text-foreground/50 mt-2">{t('admin.management.payment.subtitle')}</p>
            </div>

            {message.text && (
                <div className={`p-4 rounded-xl border flex items-center gap-3 text-sm font-medium ${
                    message.type === 'success' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                }`}>
                    {message.type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
                    <span>{message.text}</span>
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
                {/* Store Presence Section */}
                <div className="bg-background border border-foreground/10 rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md">
                    <div className="p-6 bg-foreground/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center text-foreground group">
                                <FiGlobe size={24} strokeWidth={1.5} className="group-hover:rotate-12 transition-transform" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-foreground">{t('admin.management.payment.store.title')}</h2>
                                <p className="text-xs text-foreground/50 font-medium">{t('admin.management.payment.store.subtitle')}</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-8 border-t border-foreground/5 bg-foreground/[0.02]">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">{t('admin.management.payment.store.urlLabel')}</label>
                            <div className="relative">
                                <input 
                                    type="text"
                                    className="w-full bg-background border border-foreground/10 rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-foreground/5 transition-all text-foreground placeholder:text-foreground/20"
                                    placeholder="e.g. https://yourstore.com"
                                    value={settings.storeUrl || ''}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        storeUrl: e.target.value
                                    })}
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/20">
                                    <FiExternalLink size={16} />
                                </div>
                            </div>
                            <p className="text-[10px] text-foreground/30 font-medium italic mt-2">
                                {t('admin.management.payment.store.urlHint')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* PayPal Section */}
                <div className="bg-background border border-foreground/10 rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md">
                    <div className="p-6 bg-foreground/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center text-foreground group">
                                <FiCreditCard size={24} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-foreground">{t('admin.management.payment.paypal.title')}</h2>
                                <p className="text-xs text-foreground/50 font-medium">{t('admin.management.payment.paypal.subtitle')}</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer group">
                            <input 
                                type="checkbox" 
                                className="sr-only peer"
                                checked={settings.paypal?.active || false}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    paypal: { ...settings.paypal, active: e.target.checked }
                                })}
                            />
                            <div className="w-14 h-7 bg-foreground/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-background after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-foreground/10 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-foreground"></div>
                        </label>
                    </div>

                    <AnimatePresence>
                        {settings.paypal?.active && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                className="overflow-hidden border-t border-foreground/5"
                            >
                                <div className="p-8 space-y-8">
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">{t('admin.management.payment.paypal.envLabel')}</label>
                                            <select 
                                                className="w-full bg-background border border-foreground/10 rounded-lg px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-foreground/5 transition-all text-foreground"
                                                value={settings.paypal?.mode || 'sandbox'}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    paypal: { ...settings.paypal, mode: e.target.value as 'sandbox' | 'live' }
                                                })}
                                            >
                                                <option value="sandbox">{t('admin.management.payment.paypal.sandbox')}</option>
                                                <option value="live">{t('admin.management.payment.paypal.live')}</option>
                                            </select>
                                            <p className="text-[10px] text-foreground/30 font-medium italic">{t('admin.management.payment.paypal.envHint')}</p>
                                        </div>
                                    </div>

                                    <div className="grid gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">{t('admin.management.payment.paypal.idLabel')}</label>
                                            <div className="relative">
                                                <input 
                                                    type="text"
                                                    className="w-full bg-background border border-foreground/10 rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-foreground/5 transition-all text-foreground placeholder:text-foreground/20"
                                                    placeholder={t('admin.management.payment.paypal.idPlaceholder')}
                                                    value={settings.paypal?.clientId || ''}
                                                    onChange={(e) => setSettings({
                                                        ...settings,
                                                        paypal: { ...settings.paypal, clientId: e.target.value }
                                                    })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">{t('admin.management.payment.paypal.secretLabel')}</label>
                                            <div className="relative">
                                                <input 
                                                    type="password"
                                                    className="w-full bg-background border border-foreground/10 rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-foreground/5 transition-all text-foreground placeholder:text-foreground/20"
                                                    placeholder={t('admin.management.payment.paypal.secretPlaceholder')}
                                                    value={settings.paypal?.clientSecret || ''}
                                                    onChange={(e) => setSettings({
                                                        ...settings,
                                                        paypal: { ...settings.paypal, clientSecret: e.target.value }
                                                    })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-zinc-900/5 border border-foreground/5 p-4 rounded-xl flex gap-4 text-foreground/60 text-xs leading-relaxed items-start group">
                                        <div className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center shrink-0">
                                            <FiInfo className="text-foreground/40" size={16} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-bold text-foreground">{t('admin.management.payment.security.title')}</p>
                                            <p className="opacity-75 font-medium">{t('admin.management.payment.security.subtitle')}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                
                {/* Iyzico Section */}
                <div className="bg-background border border-foreground/10 rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md mt-6">
                    <div className="p-6 bg-foreground/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center text-foreground group">
                                <FiShield size={24} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-foreground">{t('admin.management.payment.iyzico.title')}</h2>
                                <p className="text-xs text-foreground/50 font-medium">{t('admin.management.payment.iyzico.subtitle')}</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer group">
                            <input 
                                type="checkbox" 
                                className="sr-only peer"
                                checked={settings.iyzico?.active || false}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    iyzico: { ...settings.iyzico, active: e.target.checked }
                                })}
                            />
                            <div className="w-14 h-7 bg-foreground/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-background after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-foreground/10 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-foreground"></div>
                        </label>
                    </div>

                    <AnimatePresence>
                        {settings.iyzico?.active && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                className="overflow-hidden border-t border-foreground/5"
                            >
                                <div className="p-8 space-y-8">
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">{t('admin.management.payment.store.urlLabel')}</label>
                                            <select 
                                                className="w-full bg-background border border-foreground/10 rounded-lg px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-foreground/5 transition-all text-foreground"
                                                value={settings.iyzico?.baseUrl || 'https://sandbox-api.iyzipay.com'}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    iyzico: { ...settings.iyzico, baseUrl: e.target.value }
                                                })}
                                            >
                                                <option value="https://sandbox-api.iyzipay.com">{t('admin.management.payment.paypal.sandbox')}</option>
                                                <option value="https://api.iyzipay.com">{t('admin.management.payment.paypal.live')}</option>
                                            </select>
                                            <p className="text-[10px] text-foreground/30 font-medium italic">{t('admin.management.payment.paypal.envHint')}</p>
                                        </div>
                                    </div>

                                    <div className="grid gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">{t('admin.management.payment.iyzico.apiKeyLabel')}</label>
                                            <div className="relative">
                                                <input 
                                                    type="text"
                                                    className="w-full bg-background border border-foreground/10 rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-foreground/5 transition-all text-foreground placeholder:text-foreground/20"
                                                    placeholder={t('admin.management.payment.iyzico.apiKeyPlaceholder')}
                                                    value={settings.iyzico?.apiKey || ''}
                                                    onChange={(e) => setSettings({
                                                        ...settings,
                                                        iyzico: { ...settings.iyzico, apiKey: e.target.value }
                                                    })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">{t('admin.management.payment.iyzico.secretKeyLabel')}</label>
                                            <div className="relative">
                                                <input 
                                                    type="password"
                                                    className="w-full bg-background border border-foreground/10 rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-foreground/5 transition-all text-foreground placeholder:text-foreground/20"
                                                    placeholder={t('admin.management.payment.iyzico.secretKeyPlaceholder')}
                                                    value={settings.iyzico?.secretKey || ''}
                                                    onChange={(e) => setSettings({
                                                        ...settings,
                                                        iyzico: { ...settings.iyzico, secretKey: e.target.value }
                                                    })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-zinc-900/5 border border-foreground/5 p-4 rounded-xl flex gap-4 text-foreground/60 text-xs leading-relaxed items-start group">
                                        <div className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center shrink-0">
                                            <FiInfo className="text-foreground/40" size={16} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-bold text-foreground">{t('admin.management.payment.security.title')}</p>
                                            <p className="opacity-75 font-medium">{t('admin.management.payment.security.subtitle')}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-3 bg-foreground text-background px-10 py-3.5 rounded-xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-foreground/10 group"
                    >
                        {saving ? (
                            <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin"></div>
                        ) : (
                            <FiSave className="group-hover:rotate-12 transition-transform" size={18} />
                        )}
                        {saving ? t('admin.management.payment.actions.saving') : t('admin.management.payment.actions.save')}
                    </button>
                </div>
            </form>
        </div>
    );
}
