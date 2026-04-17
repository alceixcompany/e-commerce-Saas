'use client';

import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { useContentStore } from '@/lib/store/useContentStore';
import ImageUpload from '@/components/ImageUpload';
import { useTranslation } from '@/hooks/useTranslation';

interface AuthLayoutEditorModalProps {
    type: 'login' | 'register';
    onClose: () => void;
    onUpdate: () => void;
}

export default function AuthLayoutEditorModal({ type, onClose, onUpdate }: AuthLayoutEditorModalProps) {
    const { t } = useTranslation();
    const { authSettings, updateAuthSettings } = useContentStore();

    const defaultState = {
        layout: 'split-left' as const,
        title: 'Welcome to Alceix',
        quote: 'Join the Alceix family and discover timeless treasures.',
        imageUrl: '/image/alceix/hero.png',
    };

    const initialAuth = authSettings?.[type] || defaultState;

    const [settings, setSettings] = useState(initialAuth);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (authSettings?.[type]) {
            setSettings(authSettings[type]);
        }
    }, [authSettings, type]);

    const handleSave = async () => {
        if (!authSettings) return;
        setIsSaving(true);
        try {
            await updateAuthSettings({
                ...authSettings,
                [type]: settings
            });
            onUpdate();
            onClose();
        } catch (_err) {
            alert(t('admin.saveError'));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-background rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div>
                        <h2 className="text-xl font-bold">
                            {t('admin.auth.pageLayout', { type: t(`common.${type}`) })}
                        </h2>
                        <p className="text-xs text-muted-foreground mt-1">
                            {t('admin.auth.manageLayout')}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted/80 rounded-full transition-colors">
                        <FiX size={20} />
                    </button>
                </div>

                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    {/* Layout Selector */}
                    <div className="pb-6 border-b border-border mb-6">
                        <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-4">
                            {t('admin.auth.chooseStyle')}
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                {
                                    id: 'split-left',
                                    label: t('admin.auth.splitLeft'),
                                    desc: t('admin.auth.splitLeftDesc'),
                                    preview: (
                                        <div className="w-full h-20 bg-muted rounded-lg flex gap-2 p-2 border border-border">
                                            <div className="w-1/2 h-full bg-gray-300 rounded overflow-hidden relative"></div>
                                            <div className="w-1/2 h-full flex flex-col justify-center gap-1.5 items-center">
                                                <div className="w-3/4 h-2 bg-gray-400 rounded block mb-2"></div>
                                                <div className="w-full h-2 bg-gray-300 rounded"></div>
                                                <div className="w-full h-2 bg-gray-300 rounded"></div>
                                                <div className="w-full h-3 bg-gray-400 rounded mt-1"></div>
                                            </div>
                                        </div>
                                    )
                                },
                                {
                                    id: 'split-right',
                                    label: t('admin.auth.splitRight'),
                                    desc: t('admin.auth.splitRightDesc'),
                                    preview: (
                                        <div className="w-full h-20 bg-muted rounded-lg flex flex-row-reverse gap-2 p-2 border border-border">
                                            <div className="w-1/2 h-full bg-gray-300 rounded overflow-hidden relative"></div>
                                            <div className="w-1/2 h-full flex flex-col justify-center gap-1.5 items-center">
                                                <div className="w-3/4 h-2 bg-gray-400 rounded block mb-2"></div>
                                                <div className="w-full h-2 bg-gray-300 rounded"></div>
                                                <div className="w-full h-2 bg-gray-300 rounded"></div>
                                                <div className="w-full h-3 bg-gray-400 rounded mt-1"></div>
                                            </div>
                                        </div>
                                    )
                                },
                                {
                                    id: 'centered',
                                    label: t('admin.auth.centered'),
                                    desc: t('admin.auth.centeredDesc'),
                                    preview: (
                                        <div className="w-full h-20 bg-muted rounded-lg flex flex-col items-center justify-center p-2 border border-border">
                                            <div className="w-1/2 h-full flex flex-col justify-center items-center gap-1">
                                                <div className="w-3/4 h-2 bg-gray-400 rounded block mb-1"></div>
                                                <div className="w-full h-1.5 bg-gray-300 rounded"></div>
                                                <div className="w-full h-1.5 bg-gray-300 rounded"></div>
                                                <div className="w-full h-2.5 bg-gray-400 rounded mt-1"></div>
                                            </div>
                                        </div>
                                    )
                                }
                            ].map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setSettings({ ...settings, layout: opt.id as 'centered' | 'split-left' | 'split-right' })}
                                    className={`flex flex-col p-3 text-left rounded-xl border-2 transition-all group ${settings.layout === opt.id ? 'border-[var(--primary-color)] bg-[var(--primary-color)] text-white shadow-lg' : 'border-border hover:border-border text-muted-foreground bg-background'}`}
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
                            <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-2">
                                {t('admin.auth.formTitle')}
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-foreground transition-colors"
                                value={settings.title}
                                onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                            />
                        </div>

                        {settings.layout !== 'centered' && (
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-2">
                                    {t('admin.auth.quote')}
                                </label>
                                <textarea
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-foreground transition-colors h-24 resize-none"
                                    value={settings.quote}
                                    onChange={(e) => setSettings({ ...settings, quote: e.target.value })}
                                />
                            </div>
                        )}

                        {settings.layout !== 'centered' && (
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-2">
                                    {t('admin.auth.visualUpload')}
                                </label>
                                <div className="p-1 bg-muted rounded-xl border border-border flex justify-center">
                                    <ImageUpload
                                        value={settings.imageUrl}
                                        onChange={(url) => setSettings({ ...settings, imageUrl: url })}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-border bg-muted flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors" disabled={isSaving}>
                        {t('admin.cancel')}
                    </button>
                    <button onClick={handleSave} disabled={isSaving} className="px-6 py-2.5 bg-[var(--primary-color)] text-white text-sm font-bold rounded-lg hover:opacity-90 transition-colors disabled:opacity-50">
                        {isSaving ? t('admin.saving') : t('admin.save')}
                    </button>
                </div>
            </div>
        </div>
    );
}
