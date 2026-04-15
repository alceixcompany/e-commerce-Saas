'use client';

import { GlobalSettings } from '@/types/content';
import { FiMenu, FiX, FiType, FiPlus, FiLink, FiArrowRight, FiTrash2, FiList } from 'react-icons/fi';
import { Translate } from '@/hooks/useTranslation';


type NavbarLayout = NonNullable<GlobalSettings['navbarLayout']>;
type NavbarTextFieldKey = 'navbarMenuLabel' | 'navbarAccountLabel' | 'navbarContactLabel' | 'navbarDiscoverText';

interface NavbarSettingsTabProps {
    settings: GlobalSettings;
    setSettings: (settings: GlobalSettings) => void;
    t: Translate;
}

export default function NavbarSettingsTab({ settings, setSettings, t }: NavbarSettingsTabProps) {
    const setSetting = <K extends keyof GlobalSettings>(key: K, value: GlobalSettings[K]) => {
        setSettings({ ...settings, [key]: value });
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-10">
            {/* Navbar Header */}
            <div className="p-8 rounded-3xl border border-border/50 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl relative overflow-hidden bg-muted/5 group transition-all duration-500 hover:shadow-2xl">
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, var(--primary-color) 1px, transparent 0)`, backgroundSize: '16px 16px' }} />
                <div className="relative z-10 text-center md:text-left">
                    <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase mb-2 block">{t('admin.globalSettings.navbar.title')}</span>
                    <h4 className="font-bold text-2xl text-foreground mb-2 tracking-tight serif italic">{t('admin.globalSettings.navbar.navMenu')}</h4>
                    <p className="text-xs text-muted-foreground opacity-70 max-w-sm leading-relaxed">{t('admin.globalSettings.navbar.navDesc')}</p>
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
                            <FiMenu className="text-foreground" /> {t('admin.globalSettings.navbar.navStyle')}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">{t('admin.globalSettings.navbar.navStyleDesc')}</p>
                    </div>
                    <div className="px-3 py-1 bg-muted/80 rounded-full text-[10px] font-bold text-muted-foreground">
                        {settings.navbarLayout?.toUpperCase()}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        {
                            id: 'classic',
                            label: t('admin.globalSettings.navbar.layouts.classic'),
                            desc: t('admin.globalSettings.navbar.layouts.classicDesc'),
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
                            label: t('admin.globalSettings.navbar.layouts.centered'),
                            desc: t('admin.globalSettings.navbar.layouts.centeredDesc'),
                            icon: (
                                <div className="w-full h-12 bg-gray-200/50 rounded-xl border border-dashed border-border flex flex-col items-center justify-center gap-1.5 px-3 relative overflow-hidden">
                                    <div className="w-10 h-4 bg-background rounded-lg shadow-sm flex items-center justify-center text-[5px] font-bold text-gray-300">LOGO</div>
                                    <div className="flex gap-2"><div className="w-6 h-0.5 bg-gray-400 rounded-full" /><div className="w-6 h-0.5 bg-gray-400 rounded-full" /></div>
                                </div>
                            )
                        },
                        {
                            id: 'minimal',
                            label: t('admin.globalSettings.navbar.layouts.minimal'),
                            desc: t('admin.globalSettings.navbar.layouts.minimalDesc'),
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
                            label: t('admin.globalSettings.navbar.layouts.horizontal'),
                            desc: t('admin.globalSettings.navbar.layouts.horizontalDesc'),
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
	                            onClick={() => setSetting('navbarLayout', l.id as NavbarLayout)}
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
                            <FiType className="text-foreground" /> {t('admin.globalSettings.navbar.visualElements')}
                        </h4>
                        <p className="text-[10px] text-muted-foreground/80 mt-1">{t('admin.globalSettings.navbar.visualDesc')}</p>
                    </div>
                </div>

                <div className="p-8 space-y-10">
                    {/* Banner Controls */}
                    <div className="grid md:grid-cols-2 gap-8 items-start">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between group">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-foreground">{t('admin.globalSettings.navbar.topBanner')}</span>
                                    <span className="text-[9px] text-muted-foreground/80 uppercase tracking-wider">{t('admin.globalSettings.navbar.announcementBar')}</span>
                                </div>
                                <div
                                    className={`w-11 h-6 rounded-full relative transition-all cursor-pointer ${settings.showTopBanner ? 'bg-[var(--primary-color)] shadow-lg shadow-[var(--primary-color)]/10' : 'bg-gray-200'}`}
                                    onClick={() => setSettings({ ...settings, showTopBanner: !settings.showTopBanner })}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${settings.showTopBanner ? 'left-6' : 'left-1'}`} />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-muted-foreground/80 ml-1 uppercase">{t('admin.globalSettings.navbar.bannerMessage')}</label>
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
                                    <span className="text-xs font-bold text-foreground">{t('admin.globalSettings.navbar.minimalSubHeader')}</span>
                                    <span className="text-[9px] text-muted-foreground/80 uppercase tracking-wider">{t('admin.globalSettings.navbar.taglineMotto')}</span>
                                </div>
                                <div
                                    className={`w-11 h-6 rounded-full relative transition-all cursor-pointer ${settings.showSubHeader ? 'bg-[var(--primary-color)] shadow-lg shadow-[var(--primary-color)]/10' : 'bg-gray-200'}`}
                                    onClick={() => setSettings({ ...settings, showSubHeader: !settings.showSubHeader })}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${settings.showSubHeader ? 'left-6' : 'left-1'}`} />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-muted-foreground/80 ml-1 uppercase">{t('admin.globalSettings.navbar.subHeaderText')}</label>
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
	                        <h5 className="text-[10px] font-bold text-foreground uppercase tracking-widest border-l-2 border-foreground pl-3">{t('admin.globalSettings.navbar.interactiveButtons')}</h5>
	                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
	                            {([
	                                { label: t('admin.globalSettings.navbar.menuButton'), key: 'navbarMenuLabel', placeholder: 'Menu' },
	                                { label: t('admin.globalSettings.navbar.accountLabel'), key: 'navbarAccountLabel', placeholder: 'Account' },
	                                { label: t('admin.globalSettings.navbar.contactLabel'), key: 'navbarContactLabel', placeholder: 'Contact Us' },
	                                { label: t('admin.globalSettings.navbar.discoverPrefix'), key: 'navbarDiscoverText', placeholder: 'Discover' }
	                            ] as const satisfies ReadonlyArray<{ label: string; key: NavbarTextFieldKey; placeholder: string }>).map((field) => (
	                                <div key={field.key} className="space-y-1.5">
	                                    <label className="text-[9px] font-bold text-muted-foreground/80 uppercase ml-1">{field.label}</label>
	                                    <input
	                                        value={settings[field.key] || ''}
	                                        onChange={(e) => setSetting(field.key, e.target.value)}
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
                            <FiList className="text-foreground" /> {t('admin.globalSettings.navbar.menuItems')}
                        </h4>
                        <p className="text-[10px] text-muted-foreground mt-1">{t('admin.globalSettings.navbar.navDesc')}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setSettings({
                            ...settings,
                            navigationLinks: [...(settings.navigationLinks || []), { label: 'New Link', path: '/' }]
                        })}
                        className="px-5 py-2.5 bg-[var(--primary-color)] text-white rounded-[20px] text-xs font-bold hover:opacity-90 transition-all flex items-center gap-2 shadow-xl shadow-[var(--primary-color)]/10 hover:shadow-[var(--primary-color)]/20 hover:scale-105 active:scale-95"
                    >
                        <FiPlus size={14} /> {t('admin.globalSettings.navbar.addItem')}
                    </button>
                </div>

                <div className="space-y-3">
                    {(!settings.navigationLinks || settings.navigationLinks.length === 0) && (
                        <div className="py-20 bg-muted/50 border-2 border-dashed border-border rounded-[32px] flex flex-col items-center justify-center text-muted-foreground/80 gap-3">
                            <FiLink size={32} strokeWidth={1} />
                            <p className="text-sm">{t('admin.globalSettings.navbar.emptyMenu')}</p>
                        </div>
                    )}
                    {settings.navigationLinks?.map((link, index) => (
                        <div key={index} className="flex gap-4 items-center bg-background p-4 border border-border rounded-3xl shadow-sm hover:shadow-xl hover:border-foreground/5 transition-all animate-in slide-in-from-left duration-200 group">
                            <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground/80 group-hover:bg-foreground group-hover:text-background transition-all duration-500">
                                {index + 1}
                            </div>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold uppercase text-muted-foreground/80 ml-1">{t('admin.globalSettings.navbar.label')}</label>
                                    <input
                                        value={link.label}
                                        onChange={(e) => {
                                            const newLinks = (settings.navigationLinks || []).map((l, i) => 
                                                i === index ? { ...l, label: e.target.value } : l
                                            );
                                            setSettings({ ...settings, navigationLinks: newLinks });
                                        }}
                                        className="w-full bg-transparent text-sm font-bold focus:outline-none border-b border-transparent focus:border-foreground transition-all px-1 pb-1"
                                        placeholder="e.g. Collections"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold uppercase text-muted-foreground/80 ml-1">{t('admin.globalSettings.navbar.destinationPath')}</label>
                                    <div className="flex items-center gap-2">
                                        <FiArrowRight className="text-gray-300" size={12} />
                                        <input
                                            value={link.path}
                                            onChange={(e) => {
                                                const newLinks = (settings.navigationLinks || []).map((l, i) => 
                                                    i === index ? { ...l, path: e.target.value } : l
                                                );
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
                                title={t('admin.globalSettings.navbar.deleteItem')}
                            >
                                <FiTrash2 size={18} strokeWidth={1.5} />
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
