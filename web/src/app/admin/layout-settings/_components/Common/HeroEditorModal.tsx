'use client';

import React, { useState, useEffect } from 'react';
import { FiX, FiSave, FiImage, FiLayout, FiType } from 'react-icons/fi';
import ImageUpload from '@/components/ImageUpload';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { updateComponentInstance } from '@/lib/slices/componentSlice';
import { updateContactSettings } from '@/lib/slices/contentSlice';

import { useTranslation } from '@/hooks/useTranslation';

interface HeroEditorModalProps {
    onClose: () => void;
    onUpdate: () => void;
    instanceId?: string;
}

export default function HeroEditorModal({ onClose, onUpdate, instanceId }: HeroEditorModalProps) {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { instances } = useAppSelector((state) => state.component);
    const { contactSettings } = useAppSelector((state) => state.content);
    const instance = instanceId ? instances.find(i => i._id === instanceId) : null;

    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        backgroundImageUrl: '',
        variant: 'classic' as 'classic' | 'split' | 'minimal'
    });

    useEffect(() => {
        const isPlaceholder = (url: string) => url === '/image/alceix/hero.png' || url === '/image/alceix/product.png';

        if (instance?.data) {
            setFormData({
                title: instance.data.title || '',
                subtitle: instance.data.subtitle || '',
                backgroundImageUrl: isPlaceholder(instance.data.backgroundImageUrl || '') ? '' : (instance.data.backgroundImageUrl || ''),
                variant: instance.data.variant || 'classic'
            });
        } else if (contactSettings?.hero) {
            setFormData({
                title: contactSettings.hero.title || '',
                subtitle: contactSettings.hero.subtitle || '',
                backgroundImageUrl: isPlaceholder(contactSettings.hero.backgroundImageUrl || '') ? '' : (contactSettings.hero.backgroundImageUrl || ''),
                variant: contactSettings.hero.variant || 'classic'
            });
        }
    }, [instance, contactSettings]);

    const handleSave = async () => {
        if (instanceId) {
            await dispatch(updateComponentInstance({
                id: instanceId,
                data: formData
            }));
        } else if (contactSettings?.hero) {
            await dispatch(updateContactSettings({
                ...contactSettings,
                hero: {
                    ...contactSettings.hero,
                    ...formData,
                    isVisible: true
                }
            }));
        }
        onUpdate();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-background w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-foreground/5 animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-8 border-b border-foreground/5 bg-foreground/[0.02]">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                            <FiType size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-light serif text-foreground tracking-wide">{t('admin.heroEditor.title')}</h3>
                            <p className="text-xs text-foreground/40 font-light mt-1">{t('admin.heroEditor.subtitle')}</p>
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
                            <FiLayout size={12} /> {t('admin.heroEditor.layoutVariant')}
                        </label>
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { id: 'classic', label: t('admin.aboutUsEditor.variants.default') || 'Classic', icon: '🔲' },
                                { id: 'split', label: t('admin.aboutUsEditor.variants.split') || 'Split', icon: '🌓' },
                                { id: 'minimal', label: t('admin.exploreRoomsEditor.variants.focus') || 'Minimal', icon: '◻️' }
                            ].map((v) => (
                                <button
                                    key={v.id}
                                    onClick={() => setFormData({ ...formData, variant: v.id as any })}
                                    className={`p-6 rounded-2xl border transition-all flex flex-col items-center gap-3 ${
                                        formData.variant === v.id 
                                        ? 'border-primary bg-primary/5 text-primary ring-4 ring-primary/5' 
                                        : 'border-foreground/5 hover:border-foreground/20 text-foreground/40'
                                    }`}
                                >
                                    <span className="text-2xl">{v.icon}</span>
                                    <span className="text-[10px] font-bold tracking-widest uppercase">{v.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 ml-1">{t('admin.heroEditor.heroSubtitle')}</label>
                            <input
                                type="text"
                                value={formData.subtitle}
                                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                className="w-full bg-foreground/[0.03] border border-foreground/5 rounded-2xl px-6 py-4 text-sm text-foreground focus:outline-none focus:border-primary transition-all font-light"
                                placeholder={t('admin.promo.subheading') || "SUBTITLE"}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 ml-1">{t('admin.heroEditor.mainTitle')}</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-foreground/[0.03] border border-foreground/5 rounded-2xl px-6 py-4 text-sm text-foreground focus:outline-none focus:border-primary transition-all font-light"
                                placeholder={t('admin.banners.headingTitle') || "Main Title"}
                            />
                        </div>
                    </div>

                    {/* Image Upload */}
                    {formData.variant !== 'minimal' && (
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 flex items-center gap-2">
                                <FiImage size={12} /> {t('admin.heroEditor.backgroundImage')}
                            </label>
                            <ImageUpload 
                                value={formData.backgroundImageUrl}
                                onChange={(url: string) => setFormData({ ...formData, backgroundImageUrl: url })}
                                isBanner={true}
                            />
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
