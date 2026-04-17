'use client';

import React, { useMemo, useState } from 'react';
import { FiX, FiSave, FiMap, FiImage, FiVideo, FiLayout, FiMessageSquare } from 'react-icons/fi';
import ImageUpload from '@/components/ImageUpload';
import VideoUpload from '@/components/VideoUpload';
import { useCmsStore } from '@/lib/store/useCmsStore';
import { useContentStore } from '@/lib/store/useContentStore';

import { useTranslation } from '@/hooks/useTranslation';

type ContactFormMediaType = 'image' | 'video' | 'map';
type ContactFormVariant = 'side-by-side' | 'stacked' | 'clean';

type ContactFormData = {
    title: string;
    description: string;
    mediaUrl: string;
    mediaType: ContactFormMediaType;
    variant: ContactFormVariant;
};

const isPlaceholderMediaUrl = (url: string) => url === '/image/alceix/hero.png' || url === '/image/alceix/product.png';

interface ContactFormEditorModalProps {
    onClose: () => void;
    onUpdate: () => void;
    instanceId?: string;
}

export default function ContactFormEditorModal({ onClose, onUpdate, instanceId }: ContactFormEditorModalProps) {
    const { t } = useTranslation();
    const { instances, updateInstance } = useCmsStore();
    const { contactSettings, updateContactSettings } = useContentStore();
    const instance = instanceId ? instances.find(i => i._id === instanceId) : null;

    const baseFormData: ContactFormData = useMemo(() => {
        const source = (instance?.data ?? contactSettings?.splitForm ?? {}) as Partial<ContactFormData>;
        const sourceMediaUrl = typeof source.mediaUrl === 'string' ? source.mediaUrl : '';

        return {
            title: typeof source.title === 'string' ? source.title : '',
            description: typeof source.description === 'string' ? source.description : '',
            mediaUrl: isPlaceholderMediaUrl(sourceMediaUrl) ? '' : sourceMediaUrl,
            mediaType: source.mediaType === 'video' || source.mediaType === 'map' ? source.mediaType : 'image',
            variant: source.variant === 'stacked' || source.variant === 'clean' ? source.variant : 'side-by-side'
        };
    }, [contactSettings?.splitForm, instance?.data]);

    const [overrides, setOverrides] = useState<Partial<ContactFormData>>({});
    const formData: ContactFormData = useMemo(() => ({ ...baseFormData, ...overrides }), [baseFormData, overrides]);

    const setField = <K extends keyof ContactFormData>(key: K, value: ContactFormData[K]) => {
        setOverrides((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        if (instanceId) {
            await updateInstance(instanceId, formData
            );
        } else if (contactSettings?.splitForm) {
            await updateContactSettings({
                ...contactSettings,
                splitForm: {
                    ...contactSettings.splitForm,
                    ...formData,
                    isVisible: true
                }
            });
        }
        onUpdate();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm shadow-2xl">
            <div className="bg-background w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-foreground/5 animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-8 border-b border-foreground/5 bg-foreground/[0.02]">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                            <FiMessageSquare size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-light serif text-foreground tracking-wide">{t('admin.contactFormEditor.title')}</h3>
                            <p className="text-xs text-foreground/40 font-light mt-1">{t('admin.contactFormEditor.subtitle')}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-foreground/5 rounded-2xl transition-all text-foreground/40 hover:text-foreground">
                        <FiX size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Variant Selection */}
	                    <div className="space-y-4">
	                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 flex items-center gap-2">
	                            <FiLayout size={12} /> {t('admin.exploreRoomsEditor.variant')}
	                        </label>
	                        <div className="grid grid-cols-3 gap-4">
	                            {([
	                                { id: 'side-by-side', label: t('admin.contactFormEditor.variants.sideBySide'), icon: '🌓' },
	                                { id: 'stacked', label: t('admin.contactFormEditor.variants.stacked'), icon: '🥞' },
	                                { id: 'clean', label: t('admin.contactFormEditor.variants.clean'), icon: '◻️' }
	                            ] as const satisfies ReadonlyArray<{ id: ContactFormVariant; label: string; icon: string }>).map((v) => (
	                                <button
	                                    key={v.id}
	                                    onClick={() => setField('variant', v.id)}
	                                    className={`p-6 rounded-2xl border transition-all flex flex-col items-center gap-3 ${
	                                        formData.variant === v.id 
	                                        ? 'border-primary bg-primary/5 text-primary ring-4 ring-primary/5' 
	                                        : 'border-foreground/5 hover:border-foreground/20 text-foreground/40'
	                                    }`}
                                >
                                    <span className="text-2xl">{v.icon}</span>
                                    <span className="text-[10px] font-bold tracking-widest uppercase text-center">{v.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Form Fields Info */}
                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 ml-1">{t('admin.contactFormEditor.sectionTitle')}</label>
	                            <input
	                                type="text"
	                                value={formData.title}
	                                onChange={(e) => setField('title', e.target.value)}
	                                className="w-full bg-foreground/[0.03] border border-foreground/5 rounded-2xl px-6 py-4 text-sm text-foreground focus:outline-none focus:border-primary transition-all font-light"
	                                placeholder={t('admin.contactFormEditor.formHeadingPlaceholder')}
	                            />
	                        </div>
	                        <div className="space-y-2">
	                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 ml-1">{t('admin.contactFormEditor.description')}</label>
	                            <textarea
	                                value={formData.description}
	                                onChange={(e) => setField('description', e.target.value)}
	                                rows={2}
	                                className="w-full bg-foreground/[0.03] border border-foreground/5 rounded-2xl px-6 py-4 text-sm text-foreground focus:outline-none focus:border-primary transition-all font-light resize-none italic"
	                                placeholder={t('admin.contactFormEditor.formSubheadingPlaceholder')}
	                            />
	                        </div>
	                    </div>

                    {/* Media Settings */}
                    {formData.variant !== 'clean' && (
                        <div className="p-8 bg-foreground/[0.02] rounded-3xl border border-foreground/5 space-y-6">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 flex items-center gap-2">
                                    {t('admin.contactFormEditor.mediaContent')}
	                                </label>
	                                <div className="flex bg-background rounded-xl p-1 border border-foreground/5">
	                                    {([
	                                        { id: 'image', icon: <FiImage size={14} /> },
	                                        { id: 'video', icon: <FiVideo size={14} /> },
	                                        { id: 'map', icon: <FiMap size={14} /> }
	                                    ] as const satisfies ReadonlyArray<{ id: ContactFormMediaType; icon: React.ReactNode }>).map((t) => (
	                                        <button
	                                            key={t.id}
	                                            onClick={() => setField('mediaType', t.id)}
	                                            className={`p-2 rounded-lg transition-all flex items-center justify-center w-10 ${
	                                                formData.mediaType === t.id 
	                                                ? 'bg-primary text-white shadow-sm' 
	                                                : 'text-foreground/40 hover:text-foreground hover:bg-foreground/5'
	                                            }`}
                                        >
                                            {t.icon}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 ml-1">
                                    {formData.mediaType === 'map' ? t('admin.contactFormEditor.embedUrl') : formData.mediaType === 'video' ? t('admin.banners.videoUpload') : t('admin.banners.imageSelection')}
                                </label>
                                
	                                {formData.mediaType === 'image' ? (
	                                    <ImageUpload 
	                                        value={formData.mediaUrl}
	                                        onChange={(url: string) => setField('mediaUrl', url)}
	                                    />
	                                ) : formData.mediaType === 'video' ? (
	                                    <VideoUpload 
	                                        value={formData.mediaUrl}
	                                        onChange={(url: string) => setField('mediaUrl', url)}
	                                    />
	                                ) : (
	                                    <input
	                                        type="text"
	                                        value={formData.mediaUrl}
	                                        onChange={(e) => setField('mediaUrl', e.target.value)}
	                                        className="w-full bg-background border border-foreground/5 rounded-2xl px-6 py-4 text-sm text-foreground focus:outline-none focus:border-primary transition-all font-light"
	                                        placeholder="https://www.google.com/maps/embed..."
	                                    />
	                                )}
                                {formData.mediaType === 'map' && (
                                    <p className="text-[9px] text-foreground/30 ml-1 italic">
                                        {t('admin.contactFormEditor.mediaNote')}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-foreground/5 flex justify-end gap-4 bg-foreground/[0.01]">
                    <button
                        onClick={onClose}
                        className="px-8 py-4 rounded-2xl text-[10px] font-bold tracking-widest uppercase text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-all"
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        onClick={handleSave}
                        className="bg-foreground text-background px-8 py-4 rounded-2xl text-[10px] font-bold tracking-widest uppercase hover:bg-primary hover:text-white transition-all shadow-xl flex items-center gap-3"
                    >
                        <FiSave size={14} /> {t('common.save')}
                    </button>
                </div>
            </div>
        </div>
    );
}
