'use client';

import { useState } from 'react';
import { FiX, FiSave, FiPlus, FiTrash2, FiMail, FiPhone, FiMapPin, FiLayout, FiInfo } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { updateComponentInstance } from '@/lib/slices/componentSlice';
import { updateContactSettings } from '@/lib/slices/contentSlice';

import { useTranslation } from '@/hooks/useTranslation';
import * as Sections from '@/types/sections';

interface ContactInfoEditorModalProps {
    onClose: () => void;
    onUpdate: () => void;
    instanceId?: string;
}

export default function ContactInfoEditorModal({ onClose, onUpdate, instanceId }: ContactInfoEditorModalProps) {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { instances } = useAppSelector((state) => state.component);
    const { contactSettings } = useAppSelector((state) => state.content);
    const instance = instanceId ? instances.find(i => i._id === instanceId) : null;

    const [formData, setFormData] = useState<Sections.ContactInfoData>(() => {
        const instanceData = instance?.data as Sections.ContactInfoData | undefined;
        if (instanceData) {
            return {
                title: instanceData.title || '',
                faqs: instanceData.faqs || [],
                supportText: instanceData.supportText || '',
                supportEmail: instanceData.supportEmail || '',
                supportPhone: instanceData.supportPhone || '',
                supportAddress: instanceData.supportAddress || '',
                socialLinks: instanceData.socialLinks || [],
                variant: instanceData.variant || 'split'
            };
        }

        if (contactSettings?.faq) {
            return {
                title: contactSettings.faq.title || '',
                faqs: contactSettings.faq.faqs || [],
                supportText: contactSettings.faq.supportText || '',
                supportEmail: contactSettings.faq.supportEmail || '',
                supportPhone: contactSettings.faq.supportPhone || '',
                supportAddress: contactSettings.faq.supportAddress || '',
                socialLinks: contactSettings.faq.socialLinks || [],
                variant: contactSettings.faq.variant || 'split'
            };
        }

        return {
            title: '',
            faqs: [] as { question: string, answer: string }[],
            supportText: '',
            supportEmail: '',
            supportPhone: '',
            supportAddress: '',
            socialLinks: [] as { platform: string, url: string }[],
            variant: 'split' as 'split' | 'grid' | 'stacked'
        };
    });

    const handleSave = async () => {
        if (instanceId) {
            await dispatch(updateComponentInstance({
                id: instanceId,
                data: formData
            }));
        } else if (contactSettings?.faq) {
            await dispatch(updateContactSettings({
                ...contactSettings,
                faq: {
                    ...contactSettings.faq,
                    ...formData,
                    isVisible: true
                }
            }));
        }
        onUpdate();
        onClose();
    };

    const addFaq = () => {
        setFormData({
            ...formData,
            faqs: [...formData.faqs, { question: '', answer: '' }]
        });
    };

    const removeFaq = (index: number) => {
        const newFaqs = [...formData.faqs];
        newFaqs.splice(index, 1);
        setFormData({ ...formData, faqs: newFaqs });
    };

    const updateFaq = (index: number, field: 'question' | 'answer', value: string) => {
        const newFaqs = [...formData.faqs];
        newFaqs[index][field] = value;
        setFormData({ ...formData, faqs: newFaqs });
    };

    const addSocial = () => {
        setFormData({
            ...formData,
            socialLinks: [...(formData.socialLinks ?? []), { platform: 'instagram', url: '' }]
        });
    };

    const removeSocial = (index: number) => {
        const newLinks = [...(formData.socialLinks ?? [])];
        newLinks.splice(index, 1);
        setFormData({ ...formData, socialLinks: newLinks });
    };

    const updateSocial = (index: number, field: 'platform' | 'url', value: string) => {
        const newLinks = [...(formData.socialLinks ?? [])];
        newLinks[index] = { ...newLinks[index], [field]: value };
        setFormData({ ...formData, socialLinks: newLinks });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm shadow-2xl">
            <div className="bg-background w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-foreground/5 animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-8 border-b border-foreground/5 bg-foreground/[0.02] shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                            <FiInfo size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-light serif text-foreground tracking-wide">{t('admin.contactInfoEditor.title')}</h3>
                            <p className="text-xs text-foreground/40 font-light mt-1">{t('admin.contactInfoEditor.subtitle')}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-foreground/5 rounded-2xl transition-all text-foreground/40 hover:text-foreground">
                        <FiX size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 space-y-10 overflow-y-auto custom-scrollbar flex-1">
                    {/* Layout Variant */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 flex items-center gap-2">
                            <FiLayout size={12} /> {t('admin.exploreRoomsEditor.variant')}
                        </label>
                        <div className="grid grid-cols-3 gap-4">
                            {([
                                { id: 'split', label: t('admin.contactInfoEditor.variants.split'), icon: '🌓' },
                                { id: 'grid', label: t('admin.contactInfoEditor.variants.grid'), icon: '▦' },
                                { id: 'stacked', label: t('admin.contactInfoEditor.variants.faqFirst'), icon: '🥞' }
                            ] as const).map((v) => (
                                <button
                                    key={v.id}
                                    onClick={() => setFormData({ ...formData, variant: v.id })}
                                    className={`p-6 rounded-2xl border transition-all flex flex-col items-center gap-3 ${formData.variant === v.id
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

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* FAQ Editor */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 ml-1">{t('admin.faqEditor.questions')}</label>
                                <button
                                    onClick={addFaq}
                                    className="flex items-center gap-2 text-[10px] font-extrabold tracking-widest uppercase text-primary hover:bg-primary/5 px-3 py-1 rounded-lg transition-all"
                                >
                                    <FiPlus size={12} /> {t('admin.faqEditor.addFaq')}
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-foreground/[0.03] border border-foreground/5 rounded-2xl px-6 py-4 text-sm text-foreground focus:outline-none focus:border-primary transition-all font-light"
                                        placeholder={t('admin.faqEditor.placeholderTitle')}
                                    />
                                </div>

                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {formData.faqs.map((faq, index) => (
                                        <div key={index} className="p-6 bg-foreground/[0.02] rounded-2xl border border-foreground/5 space-y-4 relative group">
                                            <button
                                                onClick={() => removeFaq(index)}
                                                className="absolute -top-2 -right-2 w-8 h-8 bg-background border border-foreground/5 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:bg-red-50"
                                            >
                                                <FiTrash2 size={12} />
                                            </button>
                                            <input
                                                type="text"
                                                value={faq.question}
                                                onChange={(e) => updateFaq(index, 'question', e.target.value)}
                                                className="w-full bg-background border border-foreground/5 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary transition-all font-medium"
                                                placeholder={t('admin.faqEditor.question')}
                                            />
                                            <textarea
                                                value={faq.answer}
                                                onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                                                rows={3}
                                                className="w-full bg-background border border-foreground/5 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary transition-all font-light resize-none"
                                                placeholder={t('admin.faqEditor.answer')}
                                            />
                                        </div>
                                    ))}
                                    {formData.faqs.length === 0 && (
                                        <div className="py-12 border-2 border-dashed border-foreground/5 rounded-3xl flex flex-col items-center justify-center text-foreground/20 italic text-sm text-center px-4">
                                            {t('admin.contactInfoEditor.noItems')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Support Info Editor */}
                        <div className="space-y-6">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 ml-1">{t('admin.contactInfoEditor.supportCardTitle')}</label>
                            <div className="p-8 bg-foreground/[0.03] rounded-3xl border border-foreground/5 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-foreground/30 ml-1">{t('admin.banners.headingTitle')}</label>
                                    <input
                                        type="text"
                                        value={formData.supportText}
                                        onChange={(e) => setFormData({ ...formData, supportText: e.target.value })}
                                        className="w-full bg-background border border-foreground/5 rounded-2xl px-6 py-4 text-sm text-foreground focus:outline-none focus:border-primary transition-all font-serif"
                                        placeholder={t('admin.contactInfoEditor.supportHeadingPlaceholder')}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="relative">
                                        <FiMail className="absolute left-6 top-1/2 -translate-y-1/2 text-foreground/20" />
                                        <input
                                            type="email"
                                            value={formData.supportEmail}
                                            onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                                            className="w-full bg-background border border-foreground/5 rounded-2xl pl-14 pr-6 py-4 text-sm text-foreground focus:outline-none focus:border-primary transition-all font-light"
                                            placeholder={t('admin.contactInfoEditor.supportEmail')}
                                        />
                                    </div>
                                    <div className="relative">
                                        <FiPhone className="absolute left-6 top-1/2 -translate-y-1/2 text-foreground/20" />
                                        <input
                                            type="text"
                                            value={formData.supportPhone}
                                            onChange={(e) => setFormData({ ...formData, supportPhone: e.target.value })}
                                            className="w-full bg-background border border-foreground/5 rounded-2xl pl-14 pr-6 py-4 text-sm text-foreground focus:outline-none focus:border-primary transition-all font-light"
                                            placeholder={t('admin.contactInfoEditor.supportPhone')}
                                        />
                                    </div>
                                    <div className="relative px-6 py-4">
                                        <FiMapPin className="absolute left-6 top-6 text-foreground/20" />
                                        <textarea
                                            value={formData.supportAddress}
                                            onChange={(e) => setFormData({ ...formData, supportAddress: e.target.value })}
                                            rows={2}
                                            className="w-full bg-background border border-foreground/5 rounded-2xl pl-14 pr-6 py-4 text-sm text-foreground focus:outline-none focus:border-primary transition-all font-light resize-none"
                                            placeholder={t('admin.contactInfoEditor.supportAddress')}
                                        />
                                    </div>
                                </div>

                                {/* Social Links Editor */}
                                <div className="pt-6 border-t border-foreground/5 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[9px] font-bold uppercase tracking-widest text-foreground/30 ml-1">{t('admin.contactInfoEditor.socialLinks')}</label>
                                        <button
                                            onClick={addSocial}
                                            className="text-[10px] font-extrabold uppercase tracking-widest text-primary hover:bg-primary/5 px-2 py-1 rounded-lg transition-all flex items-center gap-1"
                                        >
                                            <FiPlus size={10} /> {t('admin.contactInfoEditor.addSocial')}
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {(formData.socialLinks ?? []).map((social, index) => (
                                            <div key={index} className="flex gap-2 items-center">
                                                <select
                                                    value={social.platform}
                                                    onChange={(e) => updateSocial(index, 'platform', e.target.value)}
                                                    className="bg-background border border-foreground/5 rounded-xl px-3 py-3 text-xs text-foreground focus:outline-none focus:border-primary transition-all font-medium"
                                                >
                                                    <option value="instagram">Instagram</option>
                                                    <option value="facebook">Facebook</option>
                                                    <option value="twitter">Twitter</option>
                                                    <option value="linkedin">LinkedIn</option>
                                                    <option value="youtube">YouTube</option>
                                                    <option value="github">GitHub</option>
                                                    <option value="website">Website</option>
                                                </select>
                                                <input
                                                    type="text"
                                                    value={social.url}
                                                    onChange={(e) => updateSocial(index, 'url', e.target.value)}
                                                    className="flex-1 bg-background border border-foreground/5 rounded-xl px-4 py-3 text-xs text-foreground focus:outline-none focus:border-primary transition-all font-light"
                                                    placeholder={t('admin.contactInfoEditor.urlPlaceholder')}
                                                />
                                                <button
                                                    onClick={() => removeSocial(index)}
                                                    className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                >
                                                    <FiTrash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                        {(formData.socialLinks ?? []).length === 0 && (
                                            <p className="text-[10px] text-foreground/20 italic text-center py-2">{t('admin.contactInfoEditor.noItems')}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-foreground/5 flex justify-end gap-4 bg-foreground/[0.01] shrink-0">
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
