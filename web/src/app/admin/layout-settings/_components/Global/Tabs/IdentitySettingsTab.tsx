'use client';

import { GlobalSettings } from '@/types/content';
import { FiGlobe, FiAlertCircle } from 'react-icons/fi';
import ImageUpload from '@/components/ImageUpload';

interface IdentitySettingsTabProps {
    settings: GlobalSettings;
    setSettings: (settings: GlobalSettings) => void;
    t: any;
}

export default function IdentitySettingsTab({ settings, setSettings, t }: IdentitySettingsTabProps) {
    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Identity Header */}
            <div className="p-8 rounded-3xl border border-border/50 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl relative overflow-hidden bg-muted/5 group transition-all duration-500 hover:shadow-2xl">
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, var(--primary-color) 1px, transparent 0)`, backgroundSize: '16px 16px' }} />
                <div className="relative z-10 text-center md:text-left">
                    <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase mb-2 block">{t('admin.globalSettings.identity.title')}</span>
                    <h4 className="font-bold text-2xl text-foreground mb-2 tracking-tight serif italic">{t('admin.globalSettings.identity.subtitle')}</h4>
                    <p className="text-xs text-muted-foreground opacity-70 max-w-sm leading-relaxed">{t('admin.globalSettings.identity.description')}</p>
                </div>
                <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-background border border-foreground/5 shadow-inner flex items-center justify-center">
                        <FiGlobe size={24} className="text-primary/40 animate-pulse" />
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">{t('admin.globalSettings.identity.siteName')}</label>
                        <input value={settings.siteName} onChange={e => setSettings({ ...settings, siteName: e.target.value })} className="input-field w-full p-2.5 border border-border rounded-lg text-sm bg-muted focus:bg-background transition-colors" placeholder="e.g. Alceix Group" />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">{t('admin.globalSettings.identity.brandTagline')}</label>
                        <input value={settings.tagline} onChange={e => setSettings({ ...settings, tagline: e.target.value })} className="input-field w-full p-2.5 border border-border rounded-lg text-sm bg-muted focus:bg-background transition-colors" placeholder="e.g. Timeless Elegance" />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">{t('admin.globalSettings.identity.storeCurrency')}</label>
                        <select 
                            value={settings.currency || 'USD'} 
                            onChange={e => setSettings({ ...settings, currency: e.target.value })} 
                            className="w-full p-2.5 border border-border rounded-lg text-sm bg-muted focus:bg-background transition-colors appearance-none cursor-pointer"
                        >
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="TRY">TRY (₺)</option>
                            <option value="GBP">GBP (£)</option>
                        </select>
                        <p className="text-[10px] text-muted-foreground/80 mt-1">This currency will be used for all transactions and payment gateways.</p>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">{t('admin.globalSettings.identity.activeLanguage')}</label>
                        <select 
                            value={settings.activeLanguage || 'en'} 
                            onChange={e => setSettings({ ...settings, activeLanguage: e.target.value as 'en' | 'tr' })} 
                            className="w-full p-2.5 border border-border rounded-lg text-sm bg-muted focus:bg-background transition-colors appearance-none cursor-pointer text-blue-600 font-bold"
                        >
                            <option value="en">English (Global)</option>
                            <option value="tr">Turkish (Türkiye)</option>
                        </select>
                    </div>
                </div>

                <div className="bg-[var(--primary-color)]/5 p-4 rounded-xl border border-[var(--primary-color)]/10 text-xs text-foreground space-y-2 h-fit">
                    <h4 className="font-bold flex items-center gap-2"><FiAlertCircle className="text-[var(--primary-color)]" /> {t('admin.globalSettings.identity.brandingTips')}</h4>
                    <ul className="list-disc list-inside opacity-80 space-y-1">
                        <li>{t('admin.globalSettings.identity.tip1')}</li>
                        <li>{t('admin.globalSettings.identity.tip2')}</li>
                        <li>{t('admin.globalSettings.identity.tip3')}</li>
                    </ul>
                </div>
            </div>

            {/* Finance & Presence Section */}
            <div className="space-y-6 pt-6 border-t border-border/50">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <h5 className="text-[11px] font-bold uppercase tracking-widest text-foreground/60">{t('admin.globalSettings.identity.financeHeader')}</h5>
                </div>
                
                <div>
                    <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">{t('admin.globalSettings.identity.storeUrl')}</label>
                    <input 
                        value={settings.storeUrl || ''} 
                        onChange={e => setSettings({ ...settings, storeUrl: e.target.value })} 
                        className="input-field w-full p-2.5 border border-border rounded-lg text-sm bg-muted focus:bg-background transition-colors font-mono" 
                        placeholder="e.g. https://yourstore.com" 
                    />
                    <p className="text-[10px] text-muted-foreground/80 mt-1 italic">{t('admin.globalSettings.identity.storeUrlHint')}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">{t('admin.globalSettings.identity.shippingFee')}</label>
                        <input 
                            type="number"
                            step="0.01"
                            value={settings.shippingFee || 0} 
                            onChange={e => setSettings({ ...settings, shippingFee: parseFloat(e.target.value) })} 
                            className="input-field w-full p-2.5 border border-border rounded-lg text-sm bg-muted focus:bg-background transition-colors" 
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">{t('admin.globalSettings.identity.taxRate')}</label>
                        <input 
                            type="number"
                            step="0.1"
                            value={settings.taxRate || 0} 
                            onChange={e => setSettings({ ...settings, taxRate: parseFloat(e.target.value) })} 
                            className="input-field w-full p-2.5 border border-border rounded-lg text-sm bg-muted focus:bg-background transition-colors" 
                        />
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-border/50">
                <div>
                    <ImageUpload
                        label={t('admin.globalSettings.identity.mainLogo')}
                        value={settings.logo}
                        onChange={url => setSettings({ ...settings, logo: url })}
                    />
                    <p className="text-[10px] text-muted-foreground/60 mt-2">{t('admin.globalSettings.identity.logoHint')}</p>
                </div>
                <div>
                    <ImageUpload
                        label={t('admin.globalSettings.identity.favicon')}
                        value={settings.favicon}
                        onChange={url => setSettings({ ...settings, favicon: url })}
                        size="sm"
                    />
                    <p className="text-[10px] text-muted-foreground/60 mt-2">{t('admin.globalSettings.identity.faviconHint')}</p>
                </div>
            </div>
        </div>
    );
}
