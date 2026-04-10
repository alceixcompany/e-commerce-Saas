'use client';

import React, { useState, useEffect } from 'react';
import { FiX, FiInfo, FiImage } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { updateAboutSettings } from '@/lib/slices/contentSlice';
import ImageUpload from '@/components/ImageUpload';
import { useTranslation } from '@/hooks/useTranslation';

interface AboutPhilosophyEditorModalProps {
    onClose: () => void;
    onUpdate: () => void;
}

export default function AboutPhilosophyEditorModal({ onClose, onUpdate }: AboutPhilosophyEditorModalProps) {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { aboutSettings } = useAppSelector((state) => state.content);

    const initialPhilosophy = aboutSettings?.philosophy || {
        isVisible: true,
        quote: '"Real elegance is found in the Alceix craftsmanship."',
        imageUrl: '/image/alceix/product.png',
        tagline: 'ALCEIX PHILOSOPHY',
        backgroundText: 'Alceix',
        layout: 'centered-quote',
    };

    const [settings, setSettings] = useState(initialPhilosophy);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (aboutSettings?.philosophy) {
            setSettings(aboutSettings.philosophy);
        }
    }, [aboutSettings]);

    const handleSave = async () => {
        if (!aboutSettings) return;
        setIsSaving(true);
        try {
            await dispatch(updateAboutSettings({
                ...aboutSettings,
                philosophy: settings
            })).unwrap();
            onUpdate();
            onClose();
        } catch (err) {
            alert(t('admin.saveError'));
        } finally {
            setIsSaving(false);
        }
    };

    const layoutOptions = [
        {
            id: 'centered-quote',
            label: t('admin.aboutPhilosophyEditor.layouts.centered'),
            desc: t('admin.aboutPhilosophyEditor.layouts.centeredDesc'),
            preview: (
                <div className="w-full h-20 bg-muted rounded-lg flex flex-col items-center justify-center gap-1 p-2 border border-border">
                    <div className="w-6 h-6 rounded-full bg-gray-300"></div>
                    <div className="w-3/4 h-2 bg-gray-400 rounded-sm"></div>
                    <div className="w-1/2 h-2 bg-gray-400 rounded-sm"></div>
                    <div className="w-8 h-1 bg-[#C5A059] mt-1"></div>
                </div>
            )
        },
        {
            id: 'left-aligned',
            label: t('admin.aboutPhilosophyEditor.layouts.left'),
            desc: t('admin.aboutPhilosophyEditor.layouts.leftDesc'),
            preview: (
                <div className="w-full h-20 bg-muted rounded-lg flex items-center justify-between gap-2 p-2 border border-border">
                    <div className="w-2/3 flex flex-col gap-1">
                        <div className="w-full h-2 bg-gray-400 rounded-sm"></div>
                        <div className="w-4/5 h-2 bg-gray-400 rounded-sm"></div>
                        <div className="w-8 h-1 bg-[#C5A059] mt-1"></div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                </div>
            )
        },
        {
            id: 'quote-focus',
            label: t('admin.aboutPhilosophyEditor.layouts.quoteFocus'),
            desc: t('admin.aboutPhilosophyEditor.layouts.quoteFocusDesc'),
            preview: (
                <div className="w-full h-20 bg-muted rounded-lg flex flex-col items-center justify-center gap-1 p-2 border border-border relative overflow-hidden">
                    <div className="w-24 h-4 bg-gray-200 rounded-sm absolute opacity-30"></div>
                    <div className="w-full h-3 bg-gray-400 rounded-sm z-10"></div>
                    <div className="w-2/3 h-3 bg-gray-400 rounded-sm z-10"></div>
                </div>
            )
        }
    ];

    return (
        <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-background rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div>
                        <h2 className="text-xl font-bold">{t('admin.aboutPhilosophyEditor.title')}</h2>
                        <p className="text-xs text-muted-foreground mt-1">{t('admin.aboutPhilosophyEditor.subtitle')}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted/80 rounded-full transition-colors">
                        <FiX size={20} />
                    </button>
                </div>

                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    {/* Layout Selector */}
                    <div className="pb-6 border-b border-border mb-6">
                        <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-4">{t('admin.aboutPhilosophyEditor.chooseLayout')}</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {layoutOptions.map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setSettings({ ...settings, layout: opt.id as any })}
                                    className={`flex flex-col p-3 text-left rounded-xl border-2 transition-all group ${settings.layout === opt.id ? 'border-foreground bg-foreground text-background shadow-lg' : 'border-border hover:border-border text-muted-foreground bg-background'}`}
                                >
                                    <div className="mb-3 transition-transform group-hover:scale-[1.02]">
                                        {opt.preview}
                                    </div>
                                    <span className="font-bold text-[10px] uppercase tracking-wider mb-1">{opt.label}</span>
                                    <p className={`text-[9px] leading-tight ${settings.layout === opt.id ? 'text-gray-300' : 'text-muted-foreground/80'}`}>{opt.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-2">{t('admin.aboutPhilosophyEditor.quoteTagline')}</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-foreground transition-colors"
                                value={settings.tagline}
                                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-2">{t('admin.aboutPhilosophyEditor.philosophyQuote')}</label>
                            <textarea
                                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-foreground transition-colors h-24 resize-none"
                                value={settings.quote}
                                onChange={(e) => setSettings({ ...settings, quote: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-2">{t('admin.aboutPhilosophyEditor.centerImage')}</label>
                            <div className="p-1 bg-muted rounded-xl border border-border flex justify-center max-w-[200px]">
                                <ImageUpload
                                    value={settings.imageUrl}
                                    onChange={(url) => setSettings({ ...settings, imageUrl: url })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-2">{t('admin.aboutPhilosophyEditor.backgroundText')}</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-foreground transition-colors"
                                value={settings.backgroundText}
                                onChange={(e) => setSettings({ ...settings, backgroundText: e.target.value })}
                            />
                            <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                                <FiInfo size={12} /> {t('admin.aboutPhilosophyEditor.backgroundTextHint')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-border bg-muted flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors" disabled={isSaving}>{t('admin.cancel')}</button>
                    <button onClick={handleSave} disabled={isSaving} className="px-6 py-2.5 bg-foreground text-background text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50">
                        {isSaving ? t('admin.saving') : t('admin.save')}
                    </button>
                </div>
            </div>
        </div>
    );
}
