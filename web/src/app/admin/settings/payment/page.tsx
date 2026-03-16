'use client';

import { useState, useEffect } from 'react';
import { FiSave, FiCreditCard, FiCheckCircle, FiAlertCircle, FiInfo, FiShield } from 'react-icons/fi';
import axios from 'axios';
import { useAppSelector } from '@/lib/hooks';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export default function PaymentSettingsPage() {
    const { token } = useAppSelector((state) => state.auth);
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [settings, setSettings] = useState({
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
        }
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/admin/payment-settings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setSettings(response.data.data);
            }
        } catch (error: any) {
            console.error('Fetch settings error:', error);
            setMessage({ type: 'error', text: 'Settings could not be loaded.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        if (settings.paypal?.active && (!settings.paypal.clientId || !settings.paypal.clientSecret)) {
            setMessage({ type: 'error', text: 'Please enter your PayPal Client ID and Secret before activating.' });
            return;
        }
        if (settings.iyzico?.active && (!settings.iyzico.apiKey || !settings.iyzico.secretKey)) {
            setMessage({ type: 'error', text: 'Please enter your Iyzico API Key and Secret Key before activating.' });
            return;
        }

        try {
            setSaving(true);
            setMessage({ type: '', text: '' });
            
            const response = await axios.put(`${API_URL}/admin/payment-settings`, settings, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setMessage({ type: 'success', text: 'Payment settings updated successfully.' });
                // Re-fetch to see the masked values
                fetchSettings();
            }
        } catch (error: any) {
            console.error('Update settings error:', error);
            setMessage({ type: 'error', text: error.response?.data?.message || 'Update failed.' });
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
                <h1 className="text-3xl font-bold text-foreground tracking-tight">Payment Infrastructure</h1>
                <p className="text-foreground/50 mt-2">Configure secure merchant gateways and transaction protocols.</p>
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
                {/* PayPal Section */}
                <div className="bg-background border border-foreground/10 rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md">
                    <div className="p-6 bg-foreground/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center text-foreground group">
                                <FiCreditCard size={24} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-foreground">PayPal Merchant Gateway</h2>
                                <p className="text-xs text-foreground/50 font-medium">Global payment processing & digital wallet integration.</p>
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
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">Environment Profile</label>
                                            <select 
                                                className="w-full bg-background border border-foreground/10 rounded-lg px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-foreground/5 transition-all text-foreground"
                                                value={settings.paypal?.mode || 'sandbox'}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    paypal: { ...settings.paypal, mode: e.target.value }
                                                })}
                                            >
                                                <option value="sandbox">Sandbox (Development Testing)</option>
                                                <option value="live">Live (Production Operations)</option>
                                            </select>
                                            <p className="text-[10px] text-foreground/30 font-medium italic">Synchronize with appropriate API endpoints.</p>
                                        </div>
                                    </div>

                                    <div className="grid gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">Gateway Client ID</label>
                                            <div className="relative">
                                                <input 
                                                    type="text"
                                                    className="w-full bg-background border border-foreground/10 rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-foreground/5 transition-all text-foreground placeholder:text-foreground/20"
                                                    placeholder="Enter your encrypted merchant Client ID"
                                                    value={settings.paypal?.clientId || ''}
                                                    onChange={(e) => setSettings({
                                                        ...settings,
                                                        paypal: { ...settings.paypal, clientId: e.target.value }
                                                    })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">Gateway Secret Credentials</label>
                                            <div className="relative">
                                                <input 
                                                    type="password"
                                                    className="w-full bg-background border border-foreground/10 rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-foreground/5 transition-all text-foreground placeholder:text-foreground/20"
                                                    placeholder="Enter secure merchant secret"
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
                                            <p className="font-bold text-foreground">Security Protocol Insight</p>
                                            <p className="opacity-75 font-medium">Private keys are asymmetrically encrypted at rest. Masked artifacts identify established credentials. Modification triggers re-encryption.</p>
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
                                <h2 className="text-lg font-bold text-foreground">Iyzico Payment Gateway</h2>
                                <p className="text-xs text-foreground/50 font-medium">Secure local payment processing & installment infrastructure.</p>
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
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">Api Base URL</label>
                                            <select 
                                                className="w-full bg-background border border-foreground/10 rounded-lg px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-foreground/5 transition-all text-foreground"
                                                value={settings.iyzico?.baseUrl || 'https://sandbox-api.iyzipay.com'}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    iyzico: { ...settings.iyzico, baseUrl: e.target.value }
                                                })}
                                            >
                                                <option value="https://sandbox-api.iyzipay.com">Sandbox (Development Testing)</option>
                                                <option value="https://api.iyzipay.com">Live (Production Operations)</option>
                                            </select>
                                            <p className="text-[10px] text-foreground/30 font-medium italic">Synchronize with appropriate API endpoints.</p>
                                        </div>
                                    </div>

                                    <div className="grid gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">API Key</label>
                                            <div className="relative">
                                                <input 
                                                    type="text"
                                                    className="w-full bg-background border border-foreground/10 rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-foreground/5 transition-all text-foreground placeholder:text-foreground/20"
                                                    placeholder="Enter your encrypted merchant API Key"
                                                    value={settings.iyzico?.apiKey || ''}
                                                    onChange={(e) => setSettings({
                                                        ...settings,
                                                        iyzico: { ...settings.iyzico, apiKey: e.target.value }
                                                    })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">Secret Key</label>
                                            <div className="relative">
                                                <input 
                                                    type="password"
                                                    className="w-full bg-background border border-foreground/10 rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-foreground/5 transition-all text-foreground placeholder:text-foreground/20"
                                                    placeholder="Enter secure merchant secret key"
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
                                            <p className="font-bold text-foreground">Security Protocol Insight</p>
                                            <p className="opacity-75 font-medium">Private keys are asymmetrically encrypted at rest. Masked artifacts identify established credentials. Modification triggers re-encryption.</p>
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
                        Authorize & Commit Changes
                    </button>
                </div>
            </form>
        </div>
    );
}
