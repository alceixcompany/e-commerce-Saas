'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { updateGlobalSettings } from '@/lib/slices/contentSlice';
import { GlobalSettings } from '@/types/content';
import { FiGlobe, FiDroplet, FiMenu, FiPhone, FiSearch, FiX } from 'react-icons/fi';
import { useTranslation } from '@/hooks/useTranslation';

import IdentitySettingsTab from './Tabs/IdentitySettingsTab';
import ThemeSettingsTab from './Tabs/ThemeSettingsTab';
import NavbarSettingsTab from './Tabs/NavbarSettingsTab';
import FooterSettingsTab from './Tabs/FooterSettingsTab';
import SEOSettingsTab from './Tabs/SEOSettingsTab';

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
            onSave();
        } catch (err: any) {
            console.error('Save error:', err);
            const is401 = (typeof err === 'string' && err.includes('401')) || (err?.message?.includes && err.message.includes('401'));
            if (is401) {
                alert(t('admin.globalSettings.sessionExpired'));
                window.location.href = '/login';
            } else {
                alert(typeof err === 'string' ? err : t('admin.globalSettings.saveFailed'));
            }
        } finally {
            setLoading(false);
        }
    };

    const TABS = [
        { id: 'identity', label: t('admin.globalSettings.identity.title'), icon: FiGlobe, desc: t('admin.globalSettings.identity.description') },
        { id: 'theme', label: t('admin.globalSettings.theme.title'), icon: FiDroplet, desc: t('admin.globalSettings.theme.description') },
        { id: 'navbar', label: t('admin.globalSettings.navbar.title'), icon: FiMenu, desc: t('admin.globalSettings.navbar.description') },
        { id: 'footer_contact', label: t('admin.globalSettings.footer.title'), icon: FiPhone, desc: t('admin.globalSettings.footer.description') },
        { id: 'seo', label: t('admin.globalSettings.seo.title'), icon: FiSearch, desc: t('admin.globalSettings.seo.description') },
    ];

    const renderContent = () => {
        const props = { settings, setSettings, t };
        
        switch (activeTab) {
            case 'identity':
                return <IdentitySettingsTab {...props} />;
            case 'theme':
                return <ThemeSettingsTab {...props} />;
            case 'navbar':
                return <NavbarSettingsTab {...props} />;
            case 'footer_contact':
                return <FooterSettingsTab {...props} />;
            case 'seo':
                return <SEOSettingsTab {...props} />;
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4">
            <div className="bg-background rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="flex-1 flex flex-col min-h-0 bg-background">
                    {/* Sidebar + Content Layout */}
                    <div className="flex flex-1 min-h-0">
                        {/* Sidebar Navigation */}
                        <div className="w-64 border-r border-border bg-muted/20 flex flex-col shrink-0">
                            <div className="p-6 border-b border-border">
                                <h3 className="font-bold text-lg italic serif tracking-tight">{t('admin.globalSettings.settings')}</h3>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">{t('admin.globalSettings.designSystem')}</p>
                            </div>
                            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                                {TABS.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all group ${activeTab === tab.id ? 'bg-background shadow-md border border-border text-foreground scale-[1.02]' : 'hover:bg-background/50 text-muted-foreground'}`}
                                    >
                                        <div className={`p-2 rounded-lg transition-colors ${activeTab === tab.id ? 'bg-[var(--primary-color)] text-white' : 'bg-muted group-hover:bg-muted-foreground/10'}`}>
                                            <tab.icon size={18} />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold leading-none mb-1">{tab.label}</div>
                                            <div className="text-[9px] opacity-60 leading-none">{tab.desc}</div>
                                        </div>
                                    </button>
                                ))}
                            </nav>
                            <div className="p-4 border-t border-border mt-auto">
                                <button onClick={onClose} className="w-full flex items-center justify-center gap-2 p-3 text-xs font-bold text-muted-foreground hover:text-red-500 transition-colors">
                                    <FiX /> {t('admin.globalSettings.exitEditor')}
                                </button>
                            </div>
                        </div>

                        {/* Main Interaction Area */}
                        <div className="flex-1 flex flex-col min-h-0 bg-background">
                            {/* Header */}
                            <div className="p-6 border-b border-border flex justify-between items-center bg-background z-10 shrink-0">
                                <div>
                                    <h3 className="font-bold text-xl">{TABS.find(t => t.id === activeTab)?.label}</h3>
                                    <p className="text-xs text-muted-foreground/80">{TABS.find(t => t.id === activeTab)?.desc}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={onClose} className="p-2 hover:bg-muted/80 rounded-full text-muted-foreground/80 hover:text-foreground transition-colors md:hidden">
                                        <FiX size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto p-8" style={{ scrollBehavior: 'smooth' }}>
                                <div className="max-w-3xl mx-auto">
                                    {renderContent()}
                                </div>
                            </div>

                            {/* Bottom Actions */}
                            <div className="p-4 border-t border-border bg-background/50 backdrop-blur-md flex justify-end gap-3 shrink-0">
                                <button type="button" onClick={onClose} className="px-5 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-lg transition-colors">{t('admin.globalSettings.discard')}</button>
                                <button onClick={handleSave} disabled={loading} className="px-8 py-2.5 bg-foreground text-background rounded-xl text-xs font-bold shadow-xl hover:opacity-90 disabled:opacity-50 hover:scale-105 active:scale-95 transition-all">
                                    {loading ? t('admin.globalSettings.processing') : t('admin.globalSettings.saveSettings')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
