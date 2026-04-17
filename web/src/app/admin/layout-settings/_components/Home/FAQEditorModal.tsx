'use client';

import { useState, useEffect } from 'react';
import { useCmsStore } from '@/lib/store/useCmsStore';
import { FiX, FiPlus, FiTrash2, FiSave, FiHelpCircle } from 'react-icons/fi';
import { useTranslation } from '@/hooks/useTranslation';
import { FAQData } from '@/types/sections';

export default function FAQEditorModal({ onClose, onUpdate, instanceId }: { onClose: () => void; onUpdate: () => void; instanceId?: string }) {
    const { t } = useTranslation();
    const { instances, updateInstance } = useCmsStore();

    const instance = instanceId ? instances.find(i => i._id === instanceId) : null;

    const [settings, setSettings] = useState({
        title: 'Frequently Asked Questions',
        subtitle: 'Find answers to common questions about our products and services.',
        items: [] as { question: string; answer: string; id: string | number }[]
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (instanceId && instance?.data) {
            setSettings(prev => {
                const newData = { ...prev, ...(instance.data as unknown as FAQData) };
                if (JSON.stringify(newData) !== JSON.stringify(prev)) {
                    return newData;
                }
                return prev;
            });
        }
    }, [instance, instanceId]);

    const handleSave = async () => {
        if (!instanceId) return;
        setIsSaving(true);
        try {
            await updateInstance(instanceId, settings);
            onUpdate();
            onClose();
        } catch (_e) {
            alert(t('admin.saveError'));
        } finally {
            setIsSaving(false);
        }
    };

    const addItem = () => {
        setSettings({
            ...settings,
            items: [...settings.items, { id: Date.now().toString(), question: t('admin.faqEditor.questionPlaceholder') || 'New Question', answer: t('admin.faqEditor.answerPlaceholder') || 'New Answer' }]
        });
    };

    const updateItem = (id: string | number, updates: Partial<{ question: string; answer: string }>) => {
        setSettings({
            ...settings,
            items: settings.items.map(item => item.id === id ? { ...item, ...updates } : item)
        });
    };

    const removeItem = (id: string | number) => {
        setSettings({
            ...settings,
            items: settings.items.filter(item => item.id !== id)
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm p-4">
            <div className="bg-background rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="p-6 border-b border-border flex justify-between items-center bg-background z-10">
                    <div>
                        <h3 className="font-bold text-lg flex items-center gap-2 italic">
                            <FiHelpCircle className="text-primary" /> {t('admin.faqEditor.title')}
                        </h3>
                        <p className="text-xs text-muted-foreground/80">{t('admin.faqEditor.subtitle')}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted/80 rounded-full text-muted-foreground/80 hover:text-foreground transition-colors">
                        <FiX size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-muted/30">
                    <section className="bg-background p-6 rounded-2xl border border-border shadow-sm space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">{t('admin.faqEditor.sectionTitle') || t('admin.exploreRoomsEditor.sectionTitle')}</label>
                            <input
                                type="text"
                                value={settings.title}
                                onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                                className="w-full p-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">{t('admin.faqEditor.sectionSubtitle') || t('admin.exploreRoomsEditor.sectionSubtitle')}</label>
                            <textarea
                                value={settings.subtitle}
                                onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
                                className="w-full p-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium resize-none"
                                rows={2}
                            />
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div className="flex justify-between items-center px-2">
                            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground italic">{t('admin.faqEditor.questions')}</h4>
                            <button
                                onClick={addItem}
                                className="flex items-center gap-2 text-[10px] font-bold uppercase bg-foreground text-background px-6 py-2.5 rounded-full"
                            >
                                <FiPlus /> {t('admin.faqEditor.addFaq')}
                            </button>
                        </div>

                        <div className="space-y-4">
                            {settings.items.map((item) => (
                                <div key={item.id} className="bg-background p-6 rounded-2xl border border-border shadow-sm relative group">
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="absolute top-4 right-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            value={item.question}
                                            onChange={(e) => updateItem(item.id, { question: e.target.value })}
                                            placeholder={t('admin.faqEditor.question')}
                                            className="w-full text-sm font-bold bg-transparent border-b border-border focus:border-foreground outline-none py-1 transition-all"
                                        />
                                        <textarea
                                            value={item.answer}
                                            onChange={(e) => updateItem(item.id, { answer: e.target.value })}
                                            placeholder={t('admin.faqEditor.answer')}
                                            rows={2}
                                            className="w-full text-xs text-muted-foreground bg-transparent border-b border-border focus:border-foreground outline-none py-1 resize-none"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="p-6 border-t border-border bg-background flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-xs text-muted-foreground hover:bg-muted/80 transition-colors">
                        {t('admin.cancel')}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-8 py-2.5 bg-foreground text-background rounded-xl text-xs font-bold hover:bg-gray-800 disabled:bg-gray-400 transition-colors flex items-center gap-2 shadow-lg"
                    >
                        {isSaving ? t('admin.saving') : <><FiSave /> {t('admin.save')}</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
