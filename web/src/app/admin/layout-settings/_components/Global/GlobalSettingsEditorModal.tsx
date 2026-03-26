'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { updateGlobalSettings } from '@/lib/slices/contentSlice';
import {
    FiGlobe, FiDroplet, FiMenu, FiPhone, FiSearch, FiAlertCircle,
    FiPlus, FiTrash2, FiMail, FiX, FiType, FiList, FiLink, FiArrowRight
} from 'react-icons/fi';
import ImageUpload from '@/components/ImageUpload';
import { useTranslation } from '@/hooks/useTranslation';

export default function GlobalSettingsEditorModal({ onClose, sectionId, onSave }: { onClose: () => void; sectionId: string; onSave: () => void }) {
    const dispatch = useAppDispatch();
    const { globalSettings } = useAppSelector((state) => state.content);
    const { t } = useTranslation();
    const [settings, setSettings] = useState(globalSettings);
    const [activeTab, setActiveTab] = useState(sectionId);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setSettings(globalSettings);
    }, [globalSettings]);

    // Keep activeTab in sync if modal is re-opened with different section (though usually it mounts fresh)
    useEffect(() => {
        if (sectionId && ['identity', 'theme', 'navbar', 'footer_contact', 'seo'].includes(sectionId)) {
            setActiveTab(sectionId);
        }
    }, [sectionId]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await dispatch(updateGlobalSettings(settings)).unwrap();
            onSave(); // Trigger refresh and close
        } catch (err: any) {
            console.error('Save error:', err);
            const is401 = (typeof err === 'string' && err.includes('401')) || (err?.message?.includes && err.message.includes('401'));
            if (is401) {
                alert('Session expired. Please log in again.');
                window.location.href = '/login';
            } else {
                alert(typeof err === 'string' ? err : 'Failed to save settings.');
            }
        } finally {
            setLoading(false);
        }
    };

    const TABS = [
        { id: 'identity', label: t('admin.identity'), icon: FiGlobe, desc: 'Logo, Tagline, Favicon' },
        { id: 'theme', label: t('admin.theme'), icon: FiDroplet, desc: 'Colors, Fonts & Aesthetics' },
        { id: 'navbar', label: t('admin.navbar'), icon: FiMenu, desc: 'Header & Mobile Links' },
        { id: 'footer_contact', label: t('admin.footerContact'), icon: FiPhone, desc: 'Address, Email, Copyright' },
        { id: 'seo', label: t('admin.seo'), icon: FiSearch, desc: 'Search Engine Visibility' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'identity':
                return (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        {/* Identity Header */}
                        <div className="p-8 rounded-3xl border border-border/50 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl relative overflow-hidden bg-muted/5 group transition-all duration-500 hover:shadow-2xl">
                            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, var(--primary-color) 1px, transparent 0)`, backgroundSize: '16px 16px' }} />
                            <div className="relative z-10 text-center md:text-left">
                                <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase mb-2 block">{t('admin.identity')}</span>
                                <h4 className="font-bold text-2xl text-foreground mb-2 tracking-tight serif italic">{t('admin.siteIdentity')}</h4>
                                <p className="text-xs text-muted-foreground opacity-70 max-w-sm leading-relaxed">Establish your store's name, presence, and visual recognition.</p>
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
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">{t('admin.siteName')}</label>
                                    <input value={settings.siteName} onChange={e => setSettings({ ...settings, siteName: e.target.value })} className="input-field w-full p-2.5 border border-border rounded-lg text-sm bg-muted focus:bg-background transition-colors" placeholder="e.g. Ocean Gem" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">{t('admin.brandTagline')}</label>
                                    <input value={settings.tagline} onChange={e => setSettings({ ...settings, tagline: e.target.value })} className="input-field w-full p-2.5 border border-border rounded-lg text-sm bg-muted focus:bg-background transition-colors" placeholder="e.g. Timeless Elegance" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">{t('admin.storeCurrency')}</label>
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
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">{t('admin.activeLanguage')}</label>
                                    <select 
                                        value={settings.activeLanguage || 'en'} 
                                        onChange={e => setSettings({ ...settings, activeLanguage: e.target.value as 'en' | 'tr' })} 
                                        className="w-full p-2.5 border border-border rounded-lg text-sm bg-muted focus:bg-background transition-colors appearance-none cursor-pointer text-blue-600 font-bold"
                                    >
                                        <option value="en">English (Global)</option>
                                        <option value="tr">Turkish (Türkiye)</option>
                                    </select>
                                    <p className="text-[10px] text-muted-foreground/80 mt-1">Sets the primary language for all static site content.</p>
                                </div>
                            </div>
                            <div className="bg-[var(--primary-color)]/5 p-4 rounded-xl border border-[var(--primary-color)]/10 text-xs text-foreground space-y-2">
                                <h4 className="font-bold flex items-center gap-2"><FiAlertCircle className="text-[var(--primary-color)]" /> Branding Tips</h4>
                                <ul className="list-disc list-inside opacity-80 space-y-1">
                                    <li>Keep your tagline short (under 60 chars).</li>
                                    <li>Use a transparent PNG for the logo.</li>
                                    <li>Favicon should be a square (32x32).</li>
                                </ul>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-border/50">
                            <div>
                                <ImageUpload
                                    label="Main Logo"
                                    value={settings.logo}
                                    onChange={url => setSettings({ ...settings, logo: url })}
                                />
                                <p className="text-[10px] text-muted-foreground/60 mt-2">Recommended: Transparent PNG, 400x120px</p>
                            </div>
                            <div>
                                <ImageUpload
                                    label="Browser Icon (Favicon)"
                                    value={settings.favicon}
                                    onChange={url => setSettings({ ...settings, favicon: url })}
                                    size="sm"
                                />
                                <p className="text-[10px] text-muted-foreground/60 mt-2">Recommended: 32x32px or 64x64px square</p>
                            </div>
                        </div>
                    </div>
                );
            case 'theme':
                return (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        {/* Theme Header */}
                        <div className="p-8 rounded-3xl border border-border/50 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl relative overflow-hidden group transition-all duration-500 hover:shadow-2xl" 
                             style={{ backgroundImage: `linear-gradient(135deg, ${settings.theme?.primaryColor || '#C5A059'}05 0%, transparent 100%)`, backgroundColor: 'var(--muted-bg, rgba(0,0,0,0.02))' }}>
                            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, ${settings.theme?.primaryColor || '#C5A059'} 1px, transparent 0)`, backgroundSize: '24px 24px' }} />
                            <div className="relative z-10 text-center md:text-left">
                                <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase mb-2 block" style={{ color: settings.theme?.primaryColor }}>{t('admin.brandAesthetics')}</span>
                                <h4 className="font-bold text-2xl text-foreground mb-2 tracking-tight serif italic">{t('admin.defineAesthetics')}</h4>
                                <p className="text-xs text-muted-foreground opacity-70 max-w-sm leading-relaxed">Customize your brand's digital soul with precision colors and signature typography.</p>
                            </div>
                            <div className="relative z-10 flex gap-3">
                                <div className="w-12 h-12 rounded-2xl shadow-lg border border-white/20 animate-pulse" style={{ backgroundColor: settings.theme?.primaryColor }} />
                                <div className="w-12 h-12 rounded-2xl shadow-lg border border-white/20 flex items-center justify-center font-serif text-xl italic bg-background" style={{ color: settings.theme?.textColor, fontFamily: settings.theme?.headingFont }}>Ag</div>
                            </div>
                        </div>

                        {/* Colors */}
                        <div className="space-y-6">
                            <h4 className="font-bold text-sm border-b pb-2 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-foreground"></span> {t('admin.brandColors')}
                            </h4>
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Primary Color */}
                                <div className="p-4 border border-border rounded-xl bg-muted/50 hover:bg-background transition-colors group">
                                    <label className="text-xs font-bold uppercase text-muted-foreground mb-3 block">{t('admin.primaryAccent')}</label>
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-12 h-12 rounded-full overflow-hidden shadow-sm border border-foreground/10 shrink-0">
                                            <input
                                                type="color"
                                                value={settings.theme?.primaryColor || '#C5A059'}
                                                onChange={e => setSettings({ ...settings, theme: { ...settings.theme, primaryColor: e.target.value } })}
                                                className="absolute inset-[-10px] w-20 h-20 cursor-pointer"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                value={settings.theme?.primaryColor || '#C5A059'}
                                                onChange={e => setSettings({ ...settings, theme: { ...settings.theme, primaryColor: e.target.value } })}
                                                className="w-full bg-background border border-border rounded-lg p-2 text-sm font-mono focus:ring-1 focus:ring-black uppercase"
                                            />
                                            <p className="text-[10px] text-muted-foreground/80 mt-1">Used for buttons, highlights, links</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Background Color */}
                                <div className="p-4 border border-border rounded-xl bg-muted/50 hover:bg-background transition-colors group">
                                    <label className="text-xs font-bold uppercase text-muted-foreground mb-3 block">{t('admin.backgroundColor')}</label>
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-12 h-12 rounded-full overflow-hidden shadow-sm border border-foreground/10 shrink-0">
                                            <input
                                                type="color"
                                                value={settings.theme?.backgroundColor || '#ffffff'}
                                                onChange={e => setSettings({ ...settings, theme: { ...settings.theme, backgroundColor: e.target.value } })}
                                                className="absolute inset-[-10px] w-20 h-20 cursor-pointer"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                value={settings.theme?.backgroundColor || '#ffffff'}
                                                onChange={e => setSettings({ ...settings, theme: { ...settings.theme, backgroundColor: e.target.value } })}
                                                className="w-full bg-background border border-border rounded-lg p-2 text-sm font-mono focus:ring-1 focus:ring-black uppercase"
                                            />
                                            <p className="text-[10px] text-muted-foreground/80 mt-1">{t('admin.mainBgDesc')}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Text Color */}
                                <div className="p-4 border border-border rounded-xl bg-muted/50 hover:bg-background transition-colors group">
                                    <label className="text-xs font-bold uppercase text-muted-foreground mb-3 block">{t('admin.textColor')}</label>
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-12 h-12 rounded-full overflow-hidden shadow-sm border border-foreground/10 shrink-0">
                                            <input
                                                type="color"
                                                value={settings.theme?.textColor || '#18181b'}
                                                onChange={e => setSettings({ ...settings, theme: { ...settings.theme, textColor: e.target.value } })}
                                                className="absolute inset-[-10px] w-20 h-20 cursor-pointer"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                value={settings.theme?.textColor || '#18181b'}
                                                onChange={e => setSettings({ ...settings, theme: { ...settings.theme, textColor: e.target.value } })}
                                                className="w-full bg-background border border-border rounded-lg p-2 text-sm font-mono focus:ring-1 focus:ring-black uppercase"
                                            />
                                            <p className="text-[10px] text-muted-foreground/80 mt-1">{t('admin.mainTextDesc')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Typography */}
                        <div className="space-y-6 pt-4">
                            <h4 className="font-bold text-sm border-b pb-2 flex items-center gap-2">
                                <span className="font-serif italic text-lg leading-none">Ag</span> {t('admin.typography')}
                            </h4>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground mb-2 block">{t('admin.headingFont')}</label>
                                    <select
                                        value={settings.theme?.headingFont || 'Playfair Display'}
                                        onChange={e => setSettings({ ...settings, theme: { ...settings.theme, headingFont: e.target.value } })}
                                        className="w-full p-3 border border-border rounded-xl text-sm font-medium bg-muted focus:bg-background transition-colors appearance-none"
                                    >
                                        <option value="Playfair Display">Playfair Display (Elegant)</option>
                                        <option value="Merriweather">Merriweather (Classic)</option>
                                        <option value="Lora">Lora (Soft)</option>
                                        <option value="Cinzel">Cinzel (Luxury)</option>
                                        <option value="Inter">Inter (Modern Sans)</option>
                                        <option value="Outfit">Outfit (Geometric)</option>
                                    </select>
                                    <p className="text-[10px] text-muted-foreground/80 mt-2">Used for large emphasis text</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground mb-2 block">{t('admin.bodyFont')}</label>
                                    <select
                                        value={settings.theme?.bodyFont || 'Inter'}
                                        onChange={e => setSettings({ ...settings, theme: { ...settings.theme, bodyFont: e.target.value } })}
                                        className="w-full p-3 border border-border rounded-xl text-sm font-medium bg-muted focus:bg-background transition-colors appearance-none"
                                    >
                                        <option value="Inter">Inter (Clean)</option>
                                        <option value="Roboto">Roboto (Standard)</option>
                                        <option value="Open Sans">Open Sans (Friendly)</option>
                                        <option value="Poppins">Poppins (Playful)</option>
                                        <option value="Outfit">Outfit (Modern)</option>
                                    </select>
                                    <p className="text-[10px] text-muted-foreground/80 mt-2">Used for paragraphs and regular text</p>
                                </div>
                            </div>
                        </div>

                        {/* Product Card Style */}
                        <div className="space-y-6 pt-4 border-t border-border">
                            <h4 className="font-bold text-sm flex items-center gap-2">
                                <FiList className="text-foreground" /> {t('admin.productPresentation')}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    {
                                        id: 'classic',
                                        label: 'Classic Elite',
                                        desc: 'Signature glassmorphism overlay with centered information.',
                                        preview: (
                                            <div className="w-full h-24 bg-muted rounded-lg relative overflow-hidden flex items-end justify-center">
                                                <div className="w-full h-full bg-gray-200"></div>
                                                <div className="absolute bottom-2 left-2 right-2 bg-background/80 backdrop-blur-sm p-2 text-center rounded">
                                                    <div className="w-1/2 h-1 bg-gray-400 mx-auto mb-1"></div>
                                                    <div className="w-1/3 h-1 bg-gray-300 mx-auto"></div>
                                                </div>
                                            </div>
                                        )
                                    },
                                    {
                                        id: 'minimal',
                                        label: 'Pure Minimal',
                                        desc: 'Focus on purity. Info appears cleanly at the bottom without overlays.',
                                        preview: (
                                            <div className="w-full h-24 bg-muted rounded-lg overflow-hidden flex flex-col">
                                                <div className="flex-1 bg-gray-200"></div>
                                                <div className="p-2 flex flex-col gap-1 items-center">
                                                    <div className="w-2/3 h-1 bg-gray-400"></div>
                                                    <div className="w-1/2 h-1 bg-gray-300 font-bold"></div>
                                                </div>
                                            </div>
                                        )
                                    },
                                    {
                                        id: 'modern',
                                        label: 'Modern Stack',
                                        desc: 'Text below image with a polished, modern retail feel.',
                                        preview: (
                                            <div className="w-full h-24 bg-muted rounded-lg overflow-hidden flex flex-col p-1 gap-1">
                                                <div className="relative flex-1 bg-gray-200 rounded">
                                                    <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-foreground opacity-20"></div>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <div className="w-3/4 h-1.5 bg-gray-400"></div>
                                                    <div className="w-1/4 h-1.5 bg-primary/40"></div>
                                                </div>
                                            </div>
                                        )
                                    }
                                ].map(opt => (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => setSettings({ ...settings, theme: { ...settings.theme, cardStyle: opt.id as any } })}
                                        className={`flex flex-col p-3 text-left rounded-xl border-2 transition-all group ${settings.theme?.cardStyle === opt.id ? 'border-[var(--primary-color)] bg-[var(--primary-color)] text-white shadow-lg' : 'border-border hover:border-border text-muted-foreground bg-background'}`}
                                    >
                                        <div className="mb-3 transition-transform group-hover:scale-[1.02]">
                                            {opt.preview}
                                        </div>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-xs uppercase tracking-wider">{opt.label}</span>
                                        </div>
                                        <p className={`text-[9px] leading-tight ${settings.theme?.cardStyle === opt.id ? 'text-background/60' : 'text-muted-foreground/80'}`}>{opt.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 'navbar':
                return (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
                        {/* Navbar Header */}
                        <div className="p-8 rounded-3xl border border-border/50 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl relative overflow-hidden bg-muted/5 group transition-all duration-500 hover:shadow-2xl">
                            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, var(--primary-color) 1px, transparent 0)`, backgroundSize: '16px 16px' }} />
                            <div className="relative z-10 text-center md:text-left">
                                <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase mb-2 block">{t('admin.navbar')}</span>
                                <h4 className="font-bold text-2xl text-foreground mb-2 tracking-tight serif italic">{t('admin.navigationMenu')}</h4>
                                <p className="text-xs text-muted-foreground opacity-70 max-w-sm leading-relaxed">{t('admin.structureLinks')}</p>
                            </div>
                            <div className="relative z-10">
                                <div className="w-16 h-16 rounded-2xl bg-background border border-foreground/5 shadow-inner flex items-center justify-center">
                                    <FiMenu size={24} className="text-primary/40 animate-pulse" />
                                </div>
                            </div>
                        </div>

                        {/* 1. Global Layout Selection */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-base font-bold text-foreground flex items-center gap-2">
                                        <FiMenu className="text-foreground" /> {t('admin.navigationStyle')}
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-1">Select the architectural layout for your store's header.</p>
                                </div>
                                <div className="px-3 py-1 bg-muted/80 rounded-full text-[10px] font-bold text-muted-foreground">
                                    {settings.navbarLayout?.toUpperCase()}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    {
                                        id: 'classic',
                                        label: 'Classic Luxury',
                                        desc: 'Centered logo with a hidden side menu.',
                                        icon: (
                                            <div className="w-full h-12 bg-gray-200/50 rounded-xl border border-dashed border-border flex items-center justify-between px-3 relative overflow-hidden">
                                                <div className="w-4 h-0.5 bg-gray-400 rounded-full" />
                                                <div className="w-12 h-6 bg-background rounded-lg shadow-sm flex items-center justify-center text-[6px] font-bold text-gray-300">LOGO</div>
                                                <div className="flex gap-1.5"><div className="w-2 h-2 rounded-full bg-gray-300" /><div className="w-2 h-2 rounded-full bg-gray-300" /></div>
                                            </div>
                                        )
                                    },
                                    {
                                        id: 'centered',
                                        label: 'Stacked Elegance',
                                        desc: 'Logo prominently on top, links centered below.',
                                        icon: (
                                            <div className="w-full h-12 bg-gray-200/50 rounded-xl border border-dashed border-border flex flex-col items-center justify-center gap-1.5 px-3 relative overflow-hidden">
                                                <div className="w-10 h-4 bg-background rounded-lg shadow-sm flex items-center justify-center text-[5px] font-bold text-gray-300">LOGO</div>
                                                <div className="flex gap-2"><div className="w-6 h-0.5 bg-gray-400 rounded-full" /><div className="w-6 h-0.5 bg-gray-400 rounded-full" /></div>
                                            </div>
                                        )
                                    },
                                    {
                                        id: 'minimal',
                                        label: 'Sleek Minimal',
                                        desc: 'Compact, everything on one line with logo left.',
                                        icon: (
                                            <div className="w-full h-12 bg-gray-200/50 rounded-xl border border-dashed border-border flex items-center gap-3 px-3 relative overflow-hidden">
                                                <div className="w-8 h-4 bg-background rounded-lg shadow-sm flex items-center justify-center text-[5px] font-bold text-gray-300">LOGO</div>
                                                <div className="flex gap-1"><div className="w-4 h-0.5 bg-gray-300 rounded-full" /><div className="w-4 h-0.5 bg-gray-300 rounded-full" /></div>
                                                <div className="ml-auto flex gap-1"><div className="w-2 h-2 rounded-full bg-gray-300" /><div className="w-2 h-2 rounded-full bg-gray-300" /></div>
                                            </div>
                                        )
                                    },
                                    {
                                        id: 'horizontal',
                                        label: 'Modern Direct',
                                        desc: 'Links are always visible for a standard navigation experience.',
                                        icon: (
                                            <div className="w-full h-12 bg-gray-200/50 rounded-xl border border-dashed border-border flex items-center px-4 relative overflow-hidden">
                                                <div className="w-8 h-4 bg-background rounded-lg shadow-sm flex items-center justify-center text-[5px] font-bold text-gray-300">LOGO</div>
                                                <div className="flex gap-4 mx-auto"><div className="w-6 h-1 bg-gray-400 rounded-full" /><div className="w-6 h-1 bg-gray-400 rounded-full" /><div className="w-6 h-1 bg-gray-400 rounded-full" /></div>
                                                <div className="flex gap-2 ml-4"><div className="w-2 h-2 rounded-full bg-gray-300" /><div className="w-2 h-2 rounded-full bg-gray-300" /></div>
                                            </div>
                                        )
                                    }
                                ].map((l) => (
                                    <button
                                        key={l.id}
                                        type="button"
                                        onClick={() => setSettings({ ...settings, navbarLayout: l.id as any })}
                                        className={`p-4 rounded-3xl border-2 text-left transition-all group relative overflow-hidden ${settings.navbarLayout === l.id ? 'border-[var(--primary-color)] bg-background shadow-xl scale-[1.02] ring-8 ring-[var(--primary-color)]/5' : 'border-gray-50 bg-muted/50 hover:bg-background hover:border-border hover:shadow-lg hover:scale-[1.01]'}`}
                                    >
                                        <div className="mb-4">{l.icon}</div>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-bold text-foreground">{l.label}</span>
                                            {settings.navbarLayout === l.id && <div className="w-4 h-4 rounded-full bg-foreground flex items-center justify-center"><FiX className="text-background rotate-45" size={10} /></div>}
                                        </div>
                                        <p className="text-[10px] text-muted-foreground leading-relaxed pr-6">{l.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* 2. Content & Labels Section */}
                        <section className="bg-background rounded-[32px] border border-border overflow-hidden shadow-sm">
                            <div className="p-6 bg-muted/20 border-b border-border flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                                        <FiType className="text-foreground" /> {t('admin.visualTextElements')}
                                    </h4>
                                    <p className="text-[10px] text-muted-foreground/80 mt-1">Control visibility and naming of navbar components.</p>
                                </div>
                            </div>

                            <div className="p-8 space-y-10">
                                {/* Banner Controls */}
                                <div className="grid md:grid-cols-2 gap-8 items-start">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between group">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-foreground">{t('admin.topBanner')}</span>
                                                <span className="text-[9px] text-muted-foreground/80 uppercase tracking-wider">{t('admin.announcementBar')}</span>
                                            </div>
                                            <div
                                                className={`w-11 h-6 rounded-full relative transition-all cursor-pointer ${settings.showTopBanner ? 'bg-[var(--primary-color)] shadow-lg shadow-[var(--primary-color)]/10' : 'bg-gray-200'}`}
                                                onClick={() => setSettings({ ...settings, showTopBanner: !settings.showTopBanner })}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${settings.showTopBanner ? 'left-6' : 'left-1'}`} />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-bold text-muted-foreground/80 ml-1 uppercase">{t('admin.bannerMessage')}</label>
                                            <input
                                                type="text"
                                                disabled={!settings.showTopBanner}
                                                value={settings.topBannerText || ''}
                                                onChange={e => setSettings({ ...settings, topBannerText: e.target.value })}
                                                className={`w-full p-3 rounded-2xl text-sm focus:ring-2 focus:ring-black/5 transition-all outline-none border ${settings.showTopBanner ? 'bg-muted border-border focus:bg-background' : 'bg-muted/80/50 border-border text-muted-foreground/80'}`}
                                                placeholder="e.g. Complimentary worldwide shipping"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between group">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-foreground">{t('admin.minimalSubHeader')}</span>
                                                <span className="text-[9px] text-muted-foreground/80 uppercase tracking-wider">{t('admin.taglineMotto')}</span>
                                            </div>
                                            <div
                                                className={`w-11 h-6 rounded-full relative transition-all cursor-pointer ${settings.showSubHeader ? 'bg-[var(--primary-color)] shadow-lg shadow-[var(--primary-color)]/10' : 'bg-gray-200'}`}
                                                onClick={() => setSettings({ ...settings, showSubHeader: !settings.showSubHeader })}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${settings.showSubHeader ? 'left-6' : 'left-1'}`} />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-bold text-muted-foreground/80 ml-1 uppercase">{t('admin.subHeaderText')}</label>
                                            <input
                                                type="text"
                                                disabled={!settings.showSubHeader}
                                                value={settings.navbarSubHeaderText || ''}
                                                onChange={e => setSettings({ ...settings, navbarSubHeaderText: e.target.value })}
                                                className={`w-full p-3 rounded-2xl text-sm focus:ring-2 focus:ring-black/5 transition-all outline-none border ${settings.showSubHeader ? 'bg-muted border-border focus:bg-background' : 'bg-muted/80/50 border-border text-muted-foreground/80'}`}
                                                placeholder="e.g. Exquisite Treasures From The Deep"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="h-[1px] bg-muted" />

                                {/* Interactive Labels Grid */}
                                <div className="space-y-6">
                                    <h5 className="text-[10px] font-bold text-foreground uppercase tracking-widest border-l-2 border-foreground pl-3">{t('admin.interactiveButtons')}</h5>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                        {[
                                            { label: 'Menu Button', key: 'navbarMenuLabel', placeholder: 'Menu' },
                                            { label: 'Account Label', key: 'navbarAccountLabel', placeholder: 'Account' },
                                            { label: 'Contact Label', key: 'navbarContactLabel', placeholder: 'Contact Us' },
                                            { label: 'Discover Prefix', key: 'navbarDiscoverText', placeholder: 'Discover' }
                                        ].map((field) => (
                                            <div key={field.key} className="space-y-1.5">
                                                <label className="text-[9px] font-bold text-muted-foreground/80 uppercase ml-1">{field.label}</label>
                                                <input
                                                    value={(settings as any)[field.key] || ''}
                                                    onChange={e => setSettings({ ...settings, [field.key]: e.target.value })}
                                                    className="w-full p-3 bg-muted border border-border rounded-2xl text-xs focus:bg-background focus:ring-2 focus:ring-black/5 transition-all outline-none font-medium"
                                                    placeholder={field.placeholder}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 3. Navigation Links Architecture */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between border-b border-border pb-4">
                                <div>
                                    <h4 className="text-base font-bold text-foreground flex items-center gap-2">
                                        <FiList className="text-foreground" /> {t('admin.navMenuStructure')}
                                    </h4>
                                    <p className="text-[10px] text-muted-foreground mt-1">Configure your primary links and paths.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSettings({
                                        ...settings,
                                        navigationLinks: [...(settings.navigationLinks || []), { label: 'New Link', path: '/' }]
                                    })}
                                    className="px-5 py-2.5 bg-[var(--primary-color)] text-white rounded-[20px] text-xs font-bold hover:opacity-90 transition-all flex items-center gap-2 shadow-xl shadow-[var(--primary-color)]/10 hover:shadow-[var(--primary-color)]/20 hover:scale-105 active:scale-95"
                                >
                                    <FiPlus size={14} /> {t('admin.addItem')}
                                </button>
                            </div>

                            <div className="space-y-3">
                                {(!settings.navigationLinks || settings.navigationLinks.length === 0) && (
                                    <div className="py-20 bg-muted/50 border-2 border-dashed border-border rounded-[32px] flex flex-col items-center justify-center text-muted-foreground/80 gap-3">
                                        <FiLink size={32} strokeWidth={1} />
                                        <p className="text-sm">Your menu is currently empty.</p>
                                    </div>
                                )}
                                {settings.navigationLinks?.map((link, index) => (
                                    <div key={index} className="flex gap-4 items-center bg-background p-4 border border-border rounded-3xl shadow-sm hover:shadow-xl hover:border-foreground/5 transition-all animate-in slide-in-from-left duration-300 group" style={{ animationDelay: `${index * 50}ms` }}>
                                        <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground/80 group-hover:bg-foreground group-hover:text-background transition-all duration-500">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold uppercase text-muted-foreground/80 ml-1">{t('admin.label')}</label>
                                                <input
                                                    value={link.label}
                                                    onChange={(e) => {
                                                        const newLinks = [...(settings.navigationLinks || [])];
                                                        newLinks[index].label = e.target.value;
                                                        setSettings({ ...settings, navigationLinks: newLinks });
                                                    }}
                                                    className="w-full bg-transparent text-sm font-bold focus:outline-none border-b border-transparent focus:border-foreground transition-all px-1 pb-1"
                                                    placeholder="e.g. Collections"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold uppercase text-muted-foreground/80 ml-1">{t('admin.destinationPath')}</label>
                                                <div className="flex items-center gap-2">
                                                    <FiArrowRight className="text-gray-300" size={12} />
                                                    <input
                                                        value={link.path}
                                                        onChange={(e) => {
                                                            const newLinks = [...(settings.navigationLinks || [])];
                                                            newLinks[index].path = e.target.value;
                                                            setSettings({ ...settings, navigationLinks: newLinks });
                                                        }}
                                                        className="flex-1 bg-transparent text-sm font-mono text-blue-600 focus:outline-none border-b border-transparent focus:border-blue-500 transition-all px-1 pb-1"
                                                        placeholder="/shop"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newLinks = settings.navigationLinks?.filter((_, i) => i !== index);
                                                setSettings({ ...settings, navigationLinks: newLinks });
                                            }}
                                            className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                            title="Delete link"
                                        >
                                            <FiTrash2 size={18} strokeWidth={1.5} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                );
            case 'footer_contact':
                return (
                    <div className="space-y-12 animate-in fade-in duration-300 pb-10">
                        {/* 0. Footer Layout Selection */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between border-b border-border pb-4">
                                <div>
                                    <h4 className="text-base font-bold text-foreground flex items-center gap-2 italic">
                                        <FiList className="text-primary" /> {t('admin.footerStyle')}
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-1">Choose how your footer columns and brand info are presented.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { id: 'classic', label: 'Classic', desc: 'Centered logo, 3-col grid links.' },
                                    { id: 'minimal', label: 'Minimal', desc: 'Sleek horizontal bottom bar.' },
                                    { id: 'magazine', label: 'Magazine', desc: 'Large typography & editorial feel.' },
                                    { id: 'centered', label: 'Centered', desc: 'Full mathematical symmetry.' }
                                ].map((l) => (
                                    <button
                                        key={l.id}
                                        type="button"
                                        onClick={() => setSettings({ ...settings, footerLayout: l.id as any })}
                                        className={`p-4 rounded-3xl border-2 text-left transition-all relative overflow-hidden h-full flex flex-col ${settings.footerLayout === l.id ? 'border-primary bg-primary/5 shadow-lg scale-[1.02]' : 'border-gray-50 bg-muted/50 hover:bg-background hover:border-border'}`}
                                    >
                                        <div className="mb-3">
                                            {l.id === 'classic' && <div className="w-full h-8 bg-gray-200 rounded flex gap-1 items-center justify-center"><div className="w-4 h-4 bg-background rounded-full" /><div className="flex gap-1"><div className="w-2 h-1 bg-gray-400 rounded" /><div className="w-2 h-1 bg-gray-400 rounded" /></div></div>}
                                            {l.id === 'minimal' && <div className="w-full h-8 bg-gray-200 rounded flex items-center justify-between px-2"><div className="w-2 h-2 bg-background rounded-full" /><div className="w-8 h-1 bg-gray-400 rounded" /></div>}
                                            {l.id === 'magazine' && <div className="w-full h-8 bg-gray-200 rounded p-2 flex flex-col gap-1 text-[4px] font-serif">Ocean Gem<div className="w-6 h-1 bg-gray-400 rounded" /></div>}
                                            {l.id === 'centered' && <div className="w-full h-8 bg-gray-200 rounded flex flex-col items-center justify-center gap-1"><div className="w-4 h-1 bg-gray-400 rounded" /><div className="w-6 h-1 bg-gray-400 rounded" /></div>}
                                        </div>
                                        <span className="text-xs font-bold text-foreground mb-1">{l.label}</span>
                                        <p className="text-[10px] text-muted-foreground/80 leading-tight flex-1">{l.desc}</p>
                                        {settings.footerLayout === l.id && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* 1. Contact Info Section */}
                        <div className="space-y-4">
                            <h4 className="font-bold text-sm border-b pb-2 flex items-center gap-2">
                                <FiPhone className="text-muted-foreground/80" /> {t('admin.contactInfo')}
                            </h4>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">{t('admin.supportEmail')}</label>
                                    <input value={settings.contactEmail} onChange={e => setSettings({ ...settings, contactEmail: e.target.value })} className="input-field w-full p-2 border border-border rounded-lg text-sm" placeholder="support@example.com" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">{t('admin.phoneNumber')}</label>
                                    <input value={settings.contactPhone} onChange={e => setSettings({ ...settings, contactPhone: e.target.value })} className="input-field w-full p-2 border border-border rounded-lg text-sm" placeholder="+1 (555) 000-0000" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">{t('admin.physicalAddress')}</label>
                                <textarea rows={2} value={settings.contactAddress} onChange={e => setSettings({ ...settings, contactAddress: e.target.value })} className="input-field w-full p-2 border border-border rounded-lg text-sm resize-none" placeholder="123 Store Street..." />
                            </div>
                        </div>

                        {/* 2. Newsletter Section */}
                        <div className="space-y-4">
                            <h4 className="font-bold text-sm border-b pb-2 flex items-center gap-2">
                                <FiMail className="text-muted-foreground/80" /> {t('admin.newsletterSettings')}
                            </h4>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">{t('admin.heading')}</label>
                                    <input value={settings.newsletterTitle || ''} onChange={e => setSettings({ ...settings, newsletterTitle: e.target.value })} className="input-field w-full p-2 border border-border rounded-lg text-sm" placeholder="Join the Inner Circle" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">{t('admin.description')}</label>
                                    <input value={settings.newsletterDescription || ''} onChange={e => setSettings({ ...settings, newsletterDescription: e.target.value })} className="input-field w-full p-2 border border-border rounded-lg text-sm" placeholder="Unlock exclusive access..." />
                                </div>
                            </div>
                        </div>

                        {/* 3. Social Media Section */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-end border-b pb-2">
                                <h4 className="font-bold text-sm flex items-center gap-2"><FiGlobe className="text-muted-foreground/80" /> {t('admin.socialMediaLinks')}</h4>
                                <button
                                    type="button"
                                    onClick={() => setSettings({
                                        ...settings,
                                        socialLinks: [...(settings.socialLinks || []), { platform: 'New Platform', url: 'https://' }]
                                    })}
                                    className="text-[10px] font-bold bg-muted/80 hover:bg-foreground hover:text-background px-2 py-1 rounded transition-colors"
                                >
                                    {t('admin.addSocial')}
                                </button>
                            </div>
                            <div className="space-y-2">
                                {(!settings.socialLinks || settings.socialLinks.length === 0) && (
                                    <p className="text-xs text-muted-foreground/80 italic">No social links added.</p>
                                )}
                                {settings.socialLinks?.map((social, index) => (
                                    <div key={index} className="flex gap-2 items-center group">
                                        <div className="w-1/3">
                                            <input
                                                value={social.platform}
                                                onChange={(e) => {
                                                    const newLinks = (settings.socialLinks || []).map((lnk, i) => 
                                                        i === index ? { ...lnk, platform: e.target.value } : lnk
                                                    );
                                                    setSettings({ ...settings, socialLinks: newLinks });
                                                }}
                                                className="w-full p-2 border border-border rounded-lg text-xs focus:ring-1 focus:ring-black focus:border-foreground transition-all"
                                                placeholder="Name (e.g. Instagram)"
                                                title="Platform Name"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                value={social.url}
                                                onChange={(e) => {
                                                    const newLinks = (settings.socialLinks || []).map((lnk, i) => 
                                                        i === index ? { ...lnk, url: e.target.value } : lnk
                                                    );
                                                    setSettings({ ...settings, socialLinks: newLinks });
                                                }}
                                                className="w-full p-2 border border-border rounded-lg text-xs text-blue-600 font-mono focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                placeholder="Profile URL (https://...)"
                                                title="Profile Link URL"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newLinks = settings.socialLinks?.filter((_, i) => i !== index);
                                                setSettings({ ...settings, socialLinks: newLinks });
                                            }}
                                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Remove Social Link"
                                        >
                                            <FiTrash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 4. Footer Columns Section */}
                        <div className="space-y-6">
                            <div className="flex justify-between items-end border-b pb-2">
                                <div>
                                    <h4 className="font-bold text-sm flex items-center gap-2"><FiMenu className="text-muted-foreground/80" /> {t('admin.footerLinkGroups')}</h4>
                                    <p className="text-[10px] text-muted-foreground/80 mt-0.5">Organize links into columns (e.g. 'Help', 'Legal')</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSettings({
                                        ...settings,
                                        footerColumns: [...(settings.footerColumns || []), { title: 'New Group', links: [] }]
                                    })}
                                    className="text-[10px] font-bold bg-foreground text-background px-3 py-1.5 rounded-lg hover:opacity-80 transition-opacity"
                                >
                                    {t('admin.addGroup')}
                                </button>
                            </div>

                            {(!settings.footerColumns || settings.footerColumns.length === 0) && (
                                <div className="text-center py-8 bg-muted rounded-xl border border-dashed border-border">
                                    <p className="text-xs text-muted-foreground/80">No link groups created yet.</p>
                                </div>
                            )}

                            <div className="grid md:grid-cols-2 gap-6">
                                {settings.footerColumns?.map((col, colIndex) => (
                                    <div key={colIndex} className="bg-background/50 rounded-xl p-4 border border-border space-y-4 relative group hover:border-border transition-colors shadow-sm">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <label className="text-[9px] font-bold uppercase text-muted-foreground/80 mb-1 block">{t('admin.groupTitle')}</label>
                                                <input
                                                    value={col.title}
                                                    onChange={(e) => {
                                                        const newCols = (settings.footerColumns || []).map((c, i) => 
                                                            i === colIndex ? { ...c, title: e.target.value } : c
                                                        );
                                                        setSettings({ ...settings, footerColumns: newCols });
                                                    }}
                                                    className="w-full p-2 border border-border rounded-lg text-sm font-bold bg-background focus:ring-1 focus:ring-black focus:border-foreground transition-all"
                                                    placeholder="e.g. Customer Care"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newCols = settings.footerColumns?.filter((_, i) => i !== colIndex);
                                                    setSettings({ ...settings, footerColumns: newCols });
                                                }}
                                                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                                title="Delete Entire Group"
                                            >
                                                <FiTrash2 size={14} />
                                            </button>
                                        </div>

                                        <div className="space-y-2 bg-muted/50 p-3 rounded-lg border border-border">
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="text-[9px] font-bold uppercase text-muted-foreground/80 block">{t('admin.groupLinks')}</label>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newCols = (settings.footerColumns || []).map((c, i) => 
                                                            i === colIndex ? { ...c, links: [...c.links, { label: '', path: '' }] } : c
                                                        );
                                                        setSettings({ ...settings, footerColumns: newCols });
                                                    }}
                                                    className="text-[9px] bg-background border border-border px-2 py-0.5 rounded text-foreground hover:border-foreground transition-colors font-medium shadow-sm"
                                                >
                                                    {t('admin.addLink')}
                                                </button>
                                            </div>

                                            <div className="space-y-2">
                                                {col.links.map((link, linkIndex) => (
                                                    <div key={linkIndex} className="flex gap-2 items-center group/link">
                                                        <div className="w-1/2">
                                                            <input
                                                                value={link.label}
                                                                onChange={(e) => {
                                                                    const newCols = (settings.footerColumns || []).map((c, i) => 
                                                                        i === colIndex ? { 
                                                                            ...c, 
                                                                            links: c.links.map((l, li) => li === linkIndex ? { ...l, label: e.target.value } : l)
                                                                        } : c
                                                                    );
                                                                    setSettings({ ...settings, footerColumns: newCols });
                                                                }}
                                                                className="w-full p-1.5 border border-border rounded text-xs focus:border-foreground focus:outline-none transition-colors"
                                                                placeholder="Text (e.g. Return Policy)"
                                                                title="Link Text"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <input
                                                                value={link.path}
                                                                onChange={(e) => {
                                                                    const newCols = (settings.footerColumns || []).map((c, i) => 
                                                                        i === colIndex ? { 
                                                                            ...c, 
                                                                            links: c.links.map((l, li) => li === linkIndex ? { ...l, path: e.target.value } : l)
                                                                        } : c
                                                                    );
                                                                    setSettings({ ...settings, footerColumns: newCols });
                                                                }}
                                                                className="w-full p-1.5 border border-border rounded text-xs text-blue-600 font-mono focus:border-blue-500 focus:outline-none transition-colors"
                                                                placeholder="/page-url"
                                                                title="Destination URL"
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newCols = (settings.footerColumns || []).map((c, i) => 
                                                                    i === colIndex ? { ...c, links: c.links.filter((_, li) => li !== linkIndex) } : c
                                                                );
                                                                setSettings({ ...settings, footerColumns: newCols });
                                                            }}
                                                            className="text-gray-300 hover:text-red-500 opacity-0 group-hover/link:opacity-100 transition-opacity"
                                                            title="Remove Link"
                                                        >
                                                            <FiX size={12} />
                                                        </button>
                                                    </div>
                                                ))}
                                                {col.links.length === 0 && (
                                                    <div className="text-center py-2 text-[10px] text-muted-foreground/80 italic bg-background/50 rounded border border-dashed border-border">
                                                        Empty group. Add specific links above.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 5. Copyright Section */}
                        <div className="space-y-4 pt-4 border-t">
                            <h4 className="font-bold text-sm border-b pb-2">{t('admin.footerBottom')}</h4>
                            <div>
                                <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">{t('admin.copyrightText')}</label>
                                <input value={settings.footerText} onChange={e => setSettings({ ...settings, footerText: e.target.value })} className="input-field w-full p-2 border border-border rounded-lg text-sm" />
                                <div className="text-[10px] text-muted-foreground/90 mt-2 space-y-1 bg-amber-50/30 p-2 rounded border border-amber-100/50">
                                    <p>Use <code>{'{year}'}</code> for auto-year.</p>
                                    <p><strong>HTML Supported:</strong> Use <code>{'<a href="/faq">FAQ</a>'}</code> to add links.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'seo':
                return (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        {/* SEO Header */}
                        <div className="p-8 rounded-3xl border border-border/50 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl relative overflow-hidden bg-purple-50/10 group transition-all duration-500 hover:shadow-2xl">
                            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, #9333ea 1px, transparent 0)`, backgroundSize: '20px 20px' }} />
                            <div className="relative z-10 text-center md:text-left">
                                <span className="text-[10px] font-bold tracking-[0.3em] text-purple-600/60 uppercase mb-2 block">{t('admin.seoVisibility')}</span>
                                <h4 className="font-bold text-2xl text-foreground mb-2 tracking-tight serif italic">{t('admin.optimization')}</h4>
                                <p className="text-xs text-muted-foreground opacity-70 max-w-sm leading-relaxed">Boost your organic growth and control how the world sees your brand online.</p>
                            </div>
                            <div className="relative z-10">
                                <div className="w-16 h-16 rounded-2xl bg-background border border-purple-100 shadow-inner flex items-center justify-center">
                                    <FiSearch size={24} className="text-purple-400 animate-bounce" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-purple-50/30 p-4 rounded-xl border border-purple-100/50 flex gap-4 text-purple-800/80">
                            <FiSearch className="shrink-0 mt-1" size={20} />
                            <div>
                                <h4 className="font-bold text-sm mb-1">{t('admin.seoPreview')}</h4>
                                <p className="text-xs opacity-80 leading-relaxed">
                                    This is how your homepage will appear in Google search results and when shared on social media.
                                </p>
                            </div>
                        </div>

                        <div className="p-4 border rounded-xl shadow-sm bg-background">
                            <div className="text-xs text-muted-foreground mb-1">www.yourstore.com</div>
                            <div className="text-lg text-blue-800 font-medium hover:underline cursor-pointer truncate">
                                {settings.metaTitle || settings.siteName || "Your Store Title"}
                            </div>
                            <div className="text-sm text-muted-foreground line-clamp-2">
                                {settings.metaDescription || "Your store's description will appear here. Make it catchy to attract clicks..."}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">{t('admin.metaTitle')}</label>
                                <input value={settings.metaTitle} onChange={e => setSettings({ ...settings, metaTitle: e.target.value })} className="input-field w-full p-2.5 border border-border rounded-lg text-sm font-medium" placeholder={settings.siteName} />
                                <div className="flex justify-end mt-1">
                                    <span className={`text-[10px] ${(settings.metaTitle?.length || 0) > 60 ? 'text-red-500' : 'text-muted-foreground/80'}`}>{settings.metaTitle?.length || 0}/60</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">{t('admin.metaDescription')}</label>
                                <textarea rows={3} value={settings.metaDescription} onChange={e => setSettings({ ...settings, metaDescription: e.target.value })} className="input-field w-full p-2.5 border border-border rounded-lg text-sm resize-none" placeholder="Shop the latest trends..." />
                                <div className="flex justify-end mt-1">
                                    <span className={`text-[10px] ${(settings.metaDescription?.length || 0) > 160 ? 'text-red-500' : 'text-muted-foreground/80'}`}>{settings.metaDescription?.length || 0}/160</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4">
            <div className="bg-background rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="flex-1 flex flex-col min-h-0 bg-background">
                    <div className="p-6 border-b border-border flex justify-between items-center bg-background z-10 shrink-0">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                {TABS.find(t => t.id === activeTab)?.icon && (
                                    <div className="p-1.5 bg-[var(--primary-color)]/10 rounded-lg text-[var(--primary-color)]">
                                        {(() => {
                                            const Icon = TABS.find(t => t.id === activeTab)?.icon!;
                                            return <Icon size={18} />;
                                        })()}
                                    </div>
                                )}
                                <h3 className="font-bold text-lg">{TABS.find(t => t.id === activeTab)?.label}</h3>
                            </div>
                            <p className="text-xs text-muted-foreground/80">{TABS.find(t => t.id === activeTab)?.desc || 'Make changes to your site-wide settings'}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-muted/80 rounded-full text-muted-foreground/80 hover:text-foreground transition-colors">
                            <FiX size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 md:p-8" style={{ fontFamily: 'var(--font-body-custom)' }}>
                        {renderContent()}
                    </form>

                    <div className="p-4 border-t border-gray-50 bg-muted/50 flex justify-end gap-3 shrink-0">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-lg transition-colors">Cancel</button>
                        <button onClick={handleSave} disabled={loading} className="px-6 py-2.5 bg-[var(--primary-color)] text-white rounded-xl text-xs font-bold shadow-xl hover:opacity-90 disabled:opacity-50 hover:scale-105 active:scale-95 transition-all">
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
