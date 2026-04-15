'use client';

import { GlobalSettings } from '@/types/content';
import { FiSearch, FiGlobe } from 'react-icons/fi';
import { Translate } from '@/hooks/useTranslation';

interface SEOSettingsTabProps {
    settings: GlobalSettings;
    setSettings: (settings: GlobalSettings) => void;
    t: Translate;
}

export default function SEOSettingsTab({ settings, setSettings, t }: SEOSettingsTabProps) {
    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* SEO Header */}
            <div className="p-8 rounded-3xl border border-border/50 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl relative overflow-hidden bg-muted/5 group transition-all duration-500 hover:shadow-2xl">
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, var(--primary-color) 1px, transparent 0)`, backgroundSize: '16px 16px' }} />
                <div className="relative z-10 text-center md:text-left">
                    <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase mb-2 block">{t('admin.globalSettings.seo.title')}</span>
                    <h4 className="font-bold text-2xl text-foreground mb-2 tracking-tight serif italic">{t('admin.globalSettings.seo.optimization')}</h4>
                    <p className="text-xs text-muted-foreground opacity-70 max-w-sm leading-relaxed">{t('admin.globalSettings.seo.optDesc')}</p>
                </div>
                <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-background border border-foreground/5 shadow-inner flex items-center justify-center">
                        <FiSearch size={24} className="text-primary/40 animate-pulse" />
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] font-bold uppercase text-muted-foreground mb-2 block">{t('admin.globalSettings.seo.metaTitle')}</label>
                        <input
                            value={settings.metaTitle || ''}
                            onChange={e => setSettings({ ...settings, metaTitle: e.target.value })}
                            className="w-full p-3 bg-muted border border-border rounded-xl text-sm focus:bg-background focus:ring-1 focus:ring-black transition-all"
                            placeholder="Alceix - Luxury Jewelry & Timeless Designs"
                        />
                        <div className="flex justify-between items-center mt-2 px-1">
                            <p className="text-[9px] text-muted-foreground">{t('admin.globalSettings.seo.metaTitleHint')}</p>
                            <span className={`text-[9px] font-bold ${(settings.metaTitle?.length || 0) > 60 ? 'text-red-500' : 'text-blue-500'}`}>{settings.metaTitle?.length || 0}/60</span>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold uppercase text-muted-foreground mb-2 block">{t('admin.globalSettings.seo.metaDescription')}</label>
                        <textarea
                            rows={4}
                            value={settings.metaDescription || ''}
                            onChange={e => setSettings({ ...settings, metaDescription: e.target.value })}
                            className="w-full p-3 bg-muted border border-border rounded-xl text-sm focus:bg-background focus:ring-1 focus:ring-black transition-all resize-none"
                            placeholder="Discover Alceix Group's exclusive collection of fine jewelry. Handcrafted elegance delivered worldwide."
                        />
                        <div className="flex justify-between items-center mt-2 px-1">
                            <p className="text-[9px] text-muted-foreground">{t('admin.globalSettings.seo.metaDescHint')}</p>
                            <span className={`text-[9px] font-bold ${(settings.metaDescription?.length || 0) > 160 ? 'text-red-500' : 'text-blue-500'}`}>{settings.metaDescription?.length || 0}/160</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] font-bold uppercase text-muted-foreground mb-2 block">{t('admin.globalSettings.seo.keywords')}</label>
                        <input
                            value={settings.tagline || ''}
                            onChange={e => setSettings({ ...settings, tagline: e.target.value })}
                            className="w-full p-3 bg-muted border border-border rounded-xl text-sm focus:bg-background focus:ring-1 focus:ring-black transition-all"
                            placeholder="jewelry, luxury, gold, diamonds, handcrafted"
                        />
                        <p className="text-[9px] text-muted-foreground mt-2 px-1">{t('admin.globalSettings.seo.keywordsDesc')}</p>
                    </div>

                    <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-3">
                        <h5 className="text-[10px] font-bold text-blue-900 uppercase tracking-widest flex items-center gap-2">
                            <FiGlobe /> {t('admin.globalSettings.seo.searchPreview')}
                        </h5>
                        <div className="space-y-1">
                            <div className="text-blue-600 text-base font-medium truncate hover:underline cursor-pointer">
                                {settings.metaTitle || 'Alceix - Luxury Store'}
                            </div>
                            <div className="text-green-700 text-xs truncate">https://{settings.siteName?.toLowerCase().replace(/\s+/g, '') || 'yourstore'}.com</div>
                            <div className="text-gray-600 text-[11px] line-clamp-2 leading-relaxed">
                                {settings.metaDescription || t('admin.globalSettings.seo.previewHint')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
