'use client';

import React, { useState } from 'react';
import { FiX, FiCheck, FiSave, FiImage, FiLayout, FiType, FiSidebar, FiMaximize, FiMinus } from 'react-icons/fi';
import ImageUpload from '@/components/ImageUpload';
import { useCmsStore } from '@/lib/store/useCmsStore';
import { useContentStore } from '@/lib/store/useContentStore';

import { useTranslation } from '@/hooks/useTranslation';
import { PageHeroData } from '@/types/sections';

interface HeroEditorModalProps {
    onClose: () => void;
    onUpdate: () => void;
    instanceId?: string;
}

export default function HeroEditorModal({ onClose, onUpdate, instanceId }: HeroEditorModalProps) {
    const { t } = useTranslation();
    const { instances, updateInstance } = useCmsStore();
    const { contactSettings, updateContactSettings } = useContentStore();
    const instance = instanceId ? instances.find(i => i._id === instanceId) : null;
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState(() => {
        const isPlaceholder = (url: string) => url === '/image/alceix/hero.png' || url === '/image/alceix/product.png';
        const instanceData = instance?.data as PageHeroData | undefined;

        if (instanceData) {
            return {
                title: instanceData.title || '',
                subtitle: instanceData.subtitle || '',
                backgroundImageUrl: isPlaceholder(instanceData.backgroundImageUrl || '') ? '' : (instanceData.backgroundImageUrl || ''),
                variant: instanceData.variant || 'classic'
            };
        }

        if (contactSettings?.hero) {
            return {
                title: contactSettings.hero.title || '',
                subtitle: contactSettings.hero.subtitle || '',
                backgroundImageUrl: isPlaceholder(contactSettings.hero.backgroundImageUrl || '') ? '' : (contactSettings.hero.backgroundImageUrl || ''),
                variant: contactSettings.hero.variant || 'classic'
            };
        }

        return {
            title: '',
            subtitle: '',
            backgroundImageUrl: '',
            variant: 'classic' as 'classic' | 'split' | 'minimal'
        };
    });

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (instanceId) {
                await updateInstance(instanceId, formData
                );
            } else if (contactSettings?.hero) {
                await updateContactSettings({
                    ...contactSettings,
                    hero: {
                        ...contactSettings.hero,
                        ...formData,
                        isVisible: true
                    }
                });
            }
            onUpdate();
            onClose();
        } catch (error) {
            console.error('Failed to save hero settings:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const variants = [
        { id: 'classic', label: t('admin.aboutUsEditor.variants.default') || 'Classic Hero', icon: FiMaximize, desc: 'Full-width image background with centered elegant text.' },
        { id: 'split', label: t('admin.aboutUsEditor.variants.split') || 'Split Screen', icon: FiSidebar, desc: 'Modern side-by-side layout separating text and imagery.' },
        { id: 'minimal', label: t('admin.exploreRoomsEditor.variants.focus') || 'Minimal Focus', icon: FiMinus, desc: 'Clean, typography-focused design without background image.' }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4">
            <div className="bg-background rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-border animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-border flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg">{t('admin.heroEditor.title')}</h3>
                        <p className="text-xs text-muted-foreground">{t('admin.heroEditor.subtitle')}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
                        <FiX size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-muted/10 custom-scrollbar">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <FiType size={12} /> {t('admin.heroEditor.heroSubtitle')}
                            </label>
                            <input
                                type="text"
                                value={formData.subtitle}
                                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-foreground outline-none transition-all"
                                placeholder={t('admin.promo.subheading') || "e.g., WELCOME TO OUR STORE"}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <FiType size={12} /> {t('admin.heroEditor.mainTitle')}
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-foreground outline-none transition-all"
                                placeholder={t('admin.banners.headingTitle') || "Discover the Collection"}
                            />
                        </div>
                    </div>

                    {/* Variant Selection */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <FiLayout size={12} /> {t('admin.heroEditor.layoutVariant')}
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {variants.map((v) => (
                                <button
                                    key={v.id}
                                    onClick={() => setFormData({ ...formData, variant: v.id as 'classic' | 'split' | 'minimal' })}
                                    className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col gap-3 ${formData.variant === v.id ? 'border-foreground bg-background shadow-lg scale-[1.02]' : 'border-border bg-background/50 hover:border-foreground/30'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${formData.variant === v.id ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'}`}>
                                            <v.icon size={18} />
                                        </div>
                                        {formData.variant === v.id && <FiCheck className="text-foreground" size={20} />}
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-sm">{v.label}</h5>
                                        <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">{v.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Image Upload */}
                    {formData.variant !== 'minimal' && (
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <FiImage size={12} /> {t('admin.heroEditor.backgroundImage')}
                            </label>
                            <div className="p-4 bg-background rounded-xl border border-border">
                                <ImageUpload
                                    value={formData.backgroundImageUrl}
                                    onChange={(url: string) => setFormData({ ...formData, backgroundImageUrl: url })}
                                    isBanner={true}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border bg-background flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl font-bold text-xs text-muted-foreground hover:bg-muted transition-colors"
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-8 py-2.5 bg-foreground text-background rounded-xl text-xs font-bold hover:bg-foreground/90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
                    >
                        {isSaving ? (
                            <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin"/> Saving...</span>
                        ) : (
                            <><FiSave size={14} /> {t('common.save')}</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

