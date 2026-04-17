'use client';

import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { useContentStore } from '@/lib/store/useContentStore';
import ImageUpload from '@/components/ImageUpload';
import { useTranslation } from '@/hooks/useTranslation';

interface AboutAuthenticityEditorModalProps {
    onClose: () => void;
    onUpdate: () => void;
}

export default function AboutAuthenticityEditorModal({ onClose, onUpdate }: AboutAuthenticityEditorModalProps) {
    const { t } = useTranslation();
    const { aboutSettings, updateAboutSettings } = useContentStore();

    const initialAuth = aboutSettings?.authenticity || {
        isVisible: true,
        tagline: 'ALCEIX CRAFTSMANSHIP',
        titlePart1: 'Captured in',
        titlePart2: 'the Alceix Moment',
        description: '"Beauty is not just in the final Alceix piece, but in the meticulous journey of its creation."',
        imageUrl: '/image/alceix/product.png',
        buttonText: 'Behind the Alceix scenes',
        layout: 'image-right',
    };

    const [settings, setSettings] = useState(initialAuth);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (aboutSettings?.authenticity) {
            setSettings(aboutSettings.authenticity);
        }
    }, [aboutSettings]);

    const handleSave = async () => {
        if (!aboutSettings) return;
        setIsSaving(true);
        try {
            await updateAboutSettings({
                ...aboutSettings,
                authenticity: settings
            });
            onUpdate();
            onClose();
        } catch (_err) {
            alert(t('admin.saveError'));
        } finally {
            setIsSaving(false);
        }
    };

    const layoutOptions = [
        {
            id: 'image-right',
            label: t('admin.aboutAuthenticityEditor.layouts.right'),
            desc: t('admin.aboutAuthenticityEditor.layouts.rightDesc'),
            preview: (
                <div className="w-full h-20 bg-muted rounded-lg flex gap-2 p-2 border border-border">
                    <div className="w-1/2 h-full flex flex-col justify-center gap-1.5">
                        <div className="w-1/2 h-1 bg-gray-300 rounded"></div>
                        <div className="w-full h-2 bg-gray-400 rounded"></div>
                        <div className="w-3/4 h-2 bg-gray-400 rounded"></div>
                        <div className="w-4 h-1 bg-[#C5A059] mt-1"></div>
                    </div>
                    <div className="w-1/2 h-full bg-gray-300 rounded overflow-hidden relative"></div>
                </div>
            )
        },
        {
            id: 'image-left',
            label: t('admin.aboutAuthenticityEditor.layouts.left'),
            desc: t('admin.aboutAuthenticityEditor.layouts.leftDesc'),
            preview: (
                <div className="w-full h-20 bg-muted rounded-lg flex flex-row-reverse gap-2 p-2 border border-border">
                    <div className="w-1/2 h-full flex flex-col justify-center gap-1.5">
                        <div className="w-1/2 h-1 bg-gray-300 rounded"></div>
                        <div className="w-full h-2 bg-gray-400 rounded"></div>
                        <div className="w-3/4 h-2 bg-gray-400 rounded"></div>
                        <div className="w-4 h-1 bg-[#C5A059] mt-1"></div>
                    </div>
                    <div className="w-1/2 h-full bg-gray-300 rounded overflow-hidden relative"></div>
                </div>
            )
        },
        {
            id: 'stacked',
            label: t('admin.aboutAuthenticityEditor.layouts.stacked'),
            desc: t('admin.aboutAuthenticityEditor.layouts.stackedDesc'),
            preview: (
                <div className="w-full h-20 bg-muted rounded-lg flex flex-col gap-2 p-2 border border-border">
                    <div className="w-full flex-1 flex flex-col items-center justify-center gap-1">
                        <div className="w-1/4 h-1 bg-gray-300 rounded"></div>
                        <div className="w-1/2 h-2 bg-gray-400 rounded"></div>
                    </div>
                    <div className="w-full h-8 bg-gray-300 rounded overflow-hidden relative"></div>
                </div>
            )
        }
    ];

    return (
        <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-background rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div>
                        <h2 className="text-xl font-bold">{t('admin.aboutAuthenticityEditor.title')}</h2>
                        <p className="text-xs text-muted-foreground mt-1">{t('admin.aboutAuthenticityEditor.subtitle')}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted/80 rounded-full transition-colors">
                        <FiX size={20} />
                    </button>
                </div>

                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    {/* Layout Selector */}
                    <div className="pb-6 border-b border-border mb-6">
                        <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-4">{t('admin.aboutAuthenticityEditor.chooseLayout')}</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {layoutOptions.map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setSettings({ ...settings, layout: opt.id  })}
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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-2">{t('admin.aboutAuthenticityEditor.tagline')}</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-foreground transition-colors"
                                value={settings.tagline}
                                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-2">{t('admin.aboutAuthenticityEditor.titlePart1')}</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-foreground transition-colors"
                                value={settings.titlePart1}
                                onChange={(e) => setSettings({ ...settings, titlePart1: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-2">{t('admin.aboutAuthenticityEditor.titlePart2')}</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-foreground transition-colors"
                                value={settings.titlePart2}
                                onChange={(e) => setSettings({ ...settings, titlePart2: e.target.value })}
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-2">{t('admin.aboutAuthenticityEditor.description')}</label>
                            <textarea
                                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-foreground transition-colors h-24 resize-none"
                                value={settings.description}
                                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-2">{t('admin.aboutAuthenticityEditor.imageUpload')}</label>
                            <div className="p-1 bg-muted rounded-xl border border-border flex justify-center">
                                <ImageUpload
                                    value={settings.imageUrl}
                                    onChange={(url) => setSettings({ ...settings, imageUrl: url })}
                                />
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-2">{t('admin.aboutAuthenticityEditor.buttonText')}</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-foreground transition-colors"
                                value={settings.buttonText}
                                onChange={(e) => setSettings({ ...settings, buttonText: e.target.value })}
                            />
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
