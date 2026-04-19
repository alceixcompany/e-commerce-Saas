'use client';

import React, { useMemo, useState } from 'react';
import { FiX, FiSave, FiMap, FiImage, FiVideo, FiLayout, FiMessageSquare, FiType, FiLayers, FiCheck } from 'react-icons/fi';
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
    const [isSaving, setIsSaving] = useState(false);

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
        setIsSaving(true);
        try {
            if (instanceId) {
                await updateInstance(instanceId, formData);
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
        } finally {
            setIsSaving(false);
        }
    };

    const variantOptions: Array<{
        id: ContactFormVariant;
        label: string;
        description: string;
        preview: React.ReactNode;
    }> = [
        {
            id: 'side-by-side',
            label: t('admin.contactFormEditor.variants.sideBySide'),
            description: 'Media and form presented in a balanced split canvas.',
            preview: (
                <div className="grid grid-cols-2 gap-2 rounded-2xl border border-border bg-muted/40 p-2">
                    <div className="h-24 rounded-xl bg-gradient-to-br from-zinc-300 to-zinc-200" />
                    <div className="rounded-xl bg-background p-3">
                        <div className="mb-2 h-2 w-16 rounded bg-zinc-300" />
                        <div className="mb-4 h-1.5 w-24 rounded bg-zinc-200" />
                        <div className="space-y-2">
                            <div className="h-7 rounded-lg bg-zinc-100" />
                            <div className="h-7 rounded-lg bg-zinc-100" />
                            <div className="h-12 rounded-lg bg-zinc-100" />
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'stacked',
            label: t('admin.contactFormEditor.variants.stacked'),
            description: 'Form content first, supporting media displayed below.',
            preview: (
                <div className="rounded-2xl border border-border bg-muted/40 p-2">
                    <div className="rounded-xl bg-background p-3">
                        <div className="mb-2 h-2 w-20 rounded bg-zinc-300" />
                        <div className="mb-4 h-1.5 w-28 rounded bg-zinc-200" />
                        <div className="grid grid-cols-2 gap-2">
                            <div className="h-7 rounded-lg bg-zinc-100" />
                            <div className="h-7 rounded-lg bg-zinc-100" />
                        </div>
                        <div className="mt-2 h-7 rounded-lg bg-zinc-100" />
                    </div>
                    <div className="mt-2 h-16 rounded-xl bg-gradient-to-br from-zinc-300 to-zinc-200" />
                </div>
            )
        },
        {
            id: 'clean',
            label: t('admin.contactFormEditor.variants.clean'),
            description: 'Focused form-only presentation with minimal distractions.',
            preview: (
                <div className="rounded-2xl border border-border bg-background p-4">
                    <div className="mx-auto max-w-[85%]">
                        <div className="mb-2 h-2 w-16 rounded bg-zinc-300" />
                        <div className="mb-4 h-1.5 w-24 rounded bg-zinc-200" />
                        <div className="space-y-2">
                            <div className="h-7 rounded-lg bg-zinc-100" />
                            <div className="h-7 rounded-lg bg-zinc-100" />
                            <div className="h-7 rounded-lg bg-zinc-100" />
                            <div className="h-12 rounded-lg bg-zinc-100" />
                        </div>
                    </div>
                </div>
            )
        }
    ];

    const mediaTypeOptions: Array<{ id: ContactFormMediaType; label: string; icon: React.ReactNode }> = [
        { id: 'image', label: t('admin.banners.imageSelection'), icon: <FiImage size={14} /> },
        { id: 'video', label: t('admin.banners.videoUpload'), icon: <FiVideo size={14} /> },
        { id: 'map', label: t('admin.contactFormEditor.embedUrl'), icon: <FiMap size={14} /> }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm shadow-2xl">
            <div className="bg-background w-full max-w-4xl rounded-[2rem] shadow-2xl overflow-hidden border border-foreground/5 animate-in fade-in zoom-in duration-300 flex max-h-[90vh] flex-col">
                <div className="flex items-center justify-between p-8 border-b border-foreground/5 bg-gradient-to-r from-foreground/[0.03] to-transparent shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-sm">
                            <FiMessageSquare size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-foreground tracking-tight">{t('admin.contactFormEditor.title')}</h3>
                            <p className="text-sm text-foreground/45 mt-1 max-w-xl">{t('admin.contactFormEditor.subtitle')}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-foreground/5 rounded-2xl transition-all text-foreground/40 hover:text-foreground">
                        <FiX size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                    <section className="rounded-[1.75rem] border border-foreground/5 bg-foreground/[0.02] p-6 md:p-7 space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-background border border-foreground/5 flex items-center justify-center text-foreground/70">
                                <FiLayout size={18} />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-foreground tracking-tight">{t('admin.exploreRoomsEditor.variant')}</h4>
                                <p className="text-xs text-foreground/45">Choose how the form and supporting media are arranged.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {variantOptions.map((option) => {
                                const isActive = formData.variant === option.id;
                                return (
                                    <button
                                        key={option.id}
                                        onClick={() => setField('variant', option.id)}
                                        className={`rounded-[1.5rem] border p-4 text-left transition-all ${
                                            isActive
                                                ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                                                : 'border-foreground/5 bg-background hover:border-foreground/15 hover:shadow-md'
                                        }`}
                                    >
                                        <div className="mb-4">{option.preview}</div>
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <div>
                                                <div className={`text-xs font-black uppercase tracking-[0.2em] ${isActive ? 'text-primary' : 'text-foreground/75'}`}>{option.label}</div>
                                            </div>
                                            {isActive && <FiCheck className="text-primary shrink-0" size={16} />}
                                        </div>
                                        <p className="text-xs leading-relaxed text-foreground/45">{option.description}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    <section className="rounded-[1.75rem] border border-foreground/5 bg-background p-6 md:p-7 space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-foreground/[0.03] border border-foreground/5 flex items-center justify-center text-foreground/70">
                                <FiType size={18} />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-foreground tracking-tight">Copy</h4>
                                <p className="text-xs text-foreground/45">Refine the headline and intro text shown above the form.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 ml-1">{t('admin.contactFormEditor.sectionTitle')}</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setField('title', e.target.value)}
                                    className="w-full bg-foreground/[0.03] border border-foreground/5 rounded-2xl px-5 py-4 text-sm text-foreground focus:outline-none focus:border-primary transition-all font-light"
                                    placeholder={t('admin.contactFormEditor.formHeadingPlaceholder')}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 ml-1">{t('admin.contactFormEditor.description')}</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setField('description', e.target.value)}
                                    rows={3}
                                    className="w-full bg-foreground/[0.03] border border-foreground/5 rounded-2xl px-5 py-4 text-sm text-foreground focus:outline-none focus:border-primary transition-all font-light resize-none"
                                    placeholder={t('admin.contactFormEditor.formSubheadingPlaceholder')}
                                />
                            </div>
                        </div>
                    </section>

                    {formData.variant !== 'clean' && (
                        <section className="rounded-[1.75rem] border border-foreground/5 bg-foreground/[0.02] p-6 md:p-7 space-y-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-background border border-foreground/5 flex items-center justify-center text-foreground/70">
                                    <FiLayers size={18} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-foreground tracking-tight">{t('admin.contactFormEditor.mediaContent')}</h4>
                                    <p className="text-xs text-foreground/45">Attach supporting visual content beside or below the form.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-[220px,1fr] gap-5 items-start">
                                <div className="space-y-3">
                                    {mediaTypeOptions.map((option) => {
                                        const isActive = formData.mediaType === option.id;
                                        return (
                                            <button
                                                key={option.id}
                                                onClick={() => setField('mediaType', option.id)}
                                                className={`w-full rounded-2xl border px-4 py-3 flex items-center justify-between transition-all ${
                                                    isActive
                                                        ? 'border-primary bg-primary/5 text-primary'
                                                        : 'border-foreground/5 bg-background text-foreground/50 hover:border-foreground/15 hover:text-foreground/80'
                                                }`}
                                            >
                                                <span className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em]">
                                                    {option.icon}
                                                    {option.label}
                                                </span>
                                                {isActive && <FiCheck size={14} />}
                                            </button>
                                        );
                                    })}
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
                                        className="w-full bg-background border border-foreground/5 rounded-2xl px-5 py-4 text-sm text-foreground focus:outline-none focus:border-primary transition-all font-light"
                                        placeholder="https://www.google.com/maps/embed..."
                                    />
                                )}
                                {formData.mediaType === 'map' && (
                                    <p className="text-[11px] text-foreground/35 ml-1 leading-relaxed">
                                        {t('admin.contactFormEditor.mediaNote')}
                                    </p>
                                )}
                            </div>
                            </div>
                        </section>
                    )}
                </div>

                <div className="p-6 md:p-8 border-t border-foreground/5 flex justify-end gap-3 bg-foreground/[0.01] shrink-0">
                    <button
                        onClick={onClose}
                        disabled={isSaving}
                        className="px-6 py-3 rounded-2xl text-[10px] font-bold tracking-widest uppercase text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-all disabled:opacity-50"
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-foreground text-background px-6 py-3 rounded-2xl text-[10px] font-bold tracking-widest uppercase hover:bg-primary hover:text-white transition-all shadow-xl flex items-center gap-3 disabled:opacity-50"
                    >
                        <FiSave size={14} /> {isSaving ? t('admin.saving') : t('common.save')}
                    </button>
                </div>
            </div>
        </div>
    );
}
