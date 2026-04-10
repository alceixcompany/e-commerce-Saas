'use client';

import { GlobalSettings } from '@/types/content';
import { FiDroplet, FiList } from 'react-icons/fi';

interface ThemeSettingsTabProps {
    settings: GlobalSettings;
    setSettings: (settings: GlobalSettings) => void;
    t: any;
}

export default function ThemeSettingsTab({ settings, setSettings, t }: ThemeSettingsTabProps) {
    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Theme Header */}
            <div className="p-8 rounded-3xl border border-border/50 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl relative overflow-hidden group transition-all duration-500 hover:shadow-2xl" 
                 style={{ backgroundImage: `linear-gradient(135deg, ${settings.theme?.primaryColor || '#C5A059'}05 0%, transparent 100%)`, backgroundColor: 'var(--muted-bg, rgba(0,0,0,0.02))' }}>
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, ${settings.theme?.primaryColor || '#C5A059'} 1px, transparent 0)`, backgroundSize: '24px 24px' }} />
                <div className="relative z-10 text-center md:text-left">
                    <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase mb-2 block" style={{ color: settings.theme?.primaryColor }}>{t('admin.globalSettings.theme.brandAesthetics')}</span>
                    <h4 className="font-bold text-2xl text-foreground mb-2 tracking-tight serif italic">{t('admin.globalSettings.theme.defineAesthetics')}</h4>
                    <p className="text-xs text-muted-foreground opacity-70 max-w-sm leading-relaxed">{t('admin.globalSettings.theme.aestheticDesc')}</p>
                </div>
                <div className="relative z-10 flex gap-3">
                    <div className="w-12 h-12 rounded-2xl shadow-lg border border-white/20 animate-pulse" style={{ backgroundColor: settings.theme?.primaryColor }} />
                    <div className="w-12 h-12 rounded-2xl shadow-lg border border-white/20 flex items-center justify-center font-serif text-xl italic bg-background" style={{ color: settings.theme?.textColor, fontFamily: settings.theme?.headingFont }}>Ag</div>
                </div>
            </div>

            {/* Colors */}
            <div className="space-y-6">
                <h4 className="font-bold text-sm border-b pb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-foreground"></span> {t('admin.globalSettings.theme.brandColors')}
                </h4>
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Primary Color */}
                    <div className="p-4 border border-border rounded-xl bg-muted/50 hover:bg-background transition-colors group">
                        <label className="text-xs font-bold uppercase text-muted-foreground mb-3 block">{t('admin.globalSettings.theme.primaryAccent')}</label>
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
                                <p className="text-[10px] text-muted-foreground/80 mt-1">{t('admin.globalSettings.theme.primaryHint')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Background Color */}
                    <div className="p-4 border border-border rounded-xl bg-muted/50 hover:bg-background transition-colors group">
                        <label className="text-xs font-bold uppercase text-muted-foreground mb-3 block">{t('admin.globalSettings.theme.backgroundColor')}</label>
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
                                <p className="text-[10px] text-muted-foreground/80 mt-1">{t('admin.globalSettings.theme.bgHint')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Text Color */}
                    <div className="p-4 border border-border rounded-xl bg-muted/50 hover:bg-background transition-colors group">
                        <label className="text-xs font-bold uppercase text-muted-foreground mb-3 block">{t('admin.globalSettings.theme.textColor')}</label>
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
                                <p className="text-[10px] text-muted-foreground/80 mt-1">{t('admin.globalSettings.theme.textHint')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Typography */}
            <div className="space-y-6 pt-4">
                <h4 className="font-bold text-sm border-b pb-2 flex items-center gap-2">
                    <span className="font-serif italic text-lg leading-none">Ag</span> {t('admin.globalSettings.theme.typography')}
                </h4>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-[10px] font-bold uppercase text-muted-foreground mb-2 block">{t('admin.globalSettings.theme.headingFont')}</label>
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
                        <p className="text-[10px] text-muted-foreground/80 mt-2">{t('admin.globalSettings.theme.headingHint')}</p>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase text-muted-foreground mb-2 block">{t('admin.globalSettings.theme.bodyFont')}</label>
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
                        <p className="text-[10px] text-muted-foreground/80 mt-2">{t('admin.globalSettings.theme.bodyHint')}</p>
                    </div>
                </div>
            </div>

            {/* Product Card Style */}
            <div className="space-y-6 pt-4 border-t border-border">
                <h4 className="font-bold text-sm flex items-center gap-2">
                    <FiList className="text-foreground" /> {t('admin.globalSettings.theme.productPresentation')}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        {
                            id: 'classic',
                            label: t('admin.globalSettings.theme.cardStyles.classic'),
                            desc: t('admin.globalSettings.theme.cardStyles.classicDesc'),
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
                            label: t('admin.globalSettings.theme.cardStyles.minimal'),
                            desc: t('admin.globalSettings.theme.cardStyles.minimalDesc'),
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
                            label: t('admin.globalSettings.theme.cardStyles.modern'),
                            desc: t('admin.globalSettings.theme.cardStyles.modernDesc'),
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
}
