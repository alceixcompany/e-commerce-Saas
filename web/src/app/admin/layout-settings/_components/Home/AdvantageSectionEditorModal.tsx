'use client';

import { useState, useEffect } from 'react';
import { Advantage } from '@/types/content';
import { FiX, FiPlus, FiTrash2, FiSave, FiTag, FiTruck, FiBox, FiShield, FiHeart, FiGift, FiAward, FiClock, FiSmartphone, FiCreditCard } from 'react-icons/fi';
import { useCmsStore } from '@/lib/store/useCmsStore';
import { useContentStore } from '@/lib/store/useContentStore';
import { useTranslation } from '@/hooks/useTranslation';
import { AdvantageData } from '@/types/sections';

const AVAILABLE_ICONS = [
    { name: 'FiTruck', icon: FiTruck },
    { name: 'FiBox', icon: FiBox },
    { name: 'FiShield', icon: FiShield },
    { name: 'FiHeart', icon: FiHeart },
    { name: 'FiGift', icon: FiGift },
    { name: 'FiAward', icon: FiAward },
    { name: 'FiClock', icon: FiClock },
    { name: 'FiSmartphone', icon: FiSmartphone },
    { name: 'FiCreditCard', icon: FiCreditCard },
    { name: 'FiTag', icon: FiTag },
];


export default function AdvantageSectionEditorModal({ onClose, onUpdate, instanceId }: { onClose: () => void; onUpdate: () => void; isProductPage?: boolean; instanceId?: string }) {
    const { t } = useTranslation();
    const { homeSettings, updateHomeSettings } = useContentStore();
    const { instances, updateInstance } = useCmsStore();


    const instance = instanceId ? instances.find((i: any) => i._id === instanceId) : null;

    const [settings, setSettings] = useState(homeSettings?.advantageSection || { isVisible: true, title: 'Why Choose Us', advantages: [] });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (instanceId && instance?.data) {
            setSettings(prev => {
                const newData = { ...prev, ...(instance.data as unknown as AdvantageData) };
                if (JSON.stringify(newData) !== JSON.stringify(prev)) {
                    return newData;
                }
                return prev;
            });
        } else if (homeSettings?.advantageSection) {
            setSettings(homeSettings.advantageSection);
        }
    }, [homeSettings, instance, instanceId]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (instanceId) {
                await updateInstance(instanceId, settings as unknown as Record<string, unknown>);
            } else if (homeSettings) {
                await updateHomeSettings({
                    ...homeSettings,
                    advantageSection: settings
                });
            }

            // Trigger refresh and close
            onUpdate();
            alert(t('admin.saveSuccess'));
            onClose();
        } catch (_e) {
            alert(t('admin.saveError'));
        } finally {
            setIsSaving(false);
        }
    };

    const addAdvantage = () => {
        const newAdv: Advantage = {
            id: Date.now().toString(),
            title: 'New Advantage',
            description: 'Enter description here',
            icon: 'FiTruck'
        };
        setSettings({ ...settings, advantages: [...settings.advantages, newAdv] });
    };

    const updateAdvantage = (id: string, updates: Partial<Advantage>) => {
        setSettings({
            ...settings,
            advantages: settings.advantages.map(a => a.id === id ? { ...a, ...updates } : a)
        });
    };

    const removeAdvantage = (id: string) => {
        setSettings({
            ...settings,
            advantages: settings.advantages.filter(a => a.id !== id)
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm p-4">
            <div className="bg-background rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-border flex justify-between items-center bg-background z-10">
                    <div>
                        <h3 className="font-bold text-lg flex items-center gap-2 italic">
                            <FiAward className="text-primary" /> {t('admin.advantagesEditor.title')}
                        </h3>
                        <p className="text-xs text-muted-foreground/80">{t('admin.advantagesEditor.subtitle')}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted/80 rounded-full text-muted-foreground/80 hover:text-foreground transition-colors">
                        <FiX size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-muted/30">
                    {/* Status & Title */}
                    <section className="bg-background p-6 rounded-2xl border border-border shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('admin.advantagesEditor.visibility')}</label>
                            <button
                                onClick={() => setSettings({ ...settings, isVisible: !settings.isVisible })}
                                className={`w-12 h-6 rounded-full transition-colors relative ${settings.isVisible ? 'bg-foreground' : 'bg-gray-200'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-background rounded-full transition-all ${settings.isVisible ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('admin.advantagesEditor.sectionTitle')}</label>
                            <input
                                type="text"
                                value={settings.title}
                                onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                                placeholder="e.g. why choose us"
                                className="w-full p-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-black outline-none transition-all text-sm"
                            />
                        </div>
                    </section>

                    {/* Advantages List */}
                    <section className="space-y-4">
                        <div className="flex justify-between items-center px-2">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-foreground">{t('admin.advantagesEditor.list')}</h4>
                            <button
                                onClick={addAdvantage}
                                className="flex items-center gap-2 text-[10px] font-bold uppercase bg-foreground text-background px-4 py-2 rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg"
                            >
                                <FiPlus /> {t('admin.advantagesEditor.addItem')}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {settings.advantages.map((adv) => (
                                <div key={adv.id} className="bg-background p-5 rounded-2xl border border-border shadow-sm space-y-4 group relative overflow-hidden">
                                    <button
                                        onClick={() => removeAdvantage(adv.id)}
                                        className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>

                                    {/* Icon Selection */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-muted-foreground/80">{t('admin.advantagesEditor.icon')}</label>
                                        <div className="flex flex-wrap gap-2">
                                            {AVAILABLE_ICONS.map(i => (
                                                <button
                                                    key={i.name}
                                                    onClick={() => updateAdvantage(adv.id, { icon: i.name })}
                                                    className={`p-2 rounded-lg border transition-all ${adv.icon === i.name ? 'border-primary bg-primary/5 text-primary scale-110 shadow-sm' : 'border-border text-muted-foreground/80 hover:border-border'}`}
                                                >
                                                    <i.icon size={16} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Title & Desc */}
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={adv.title}
                                            onChange={(e) => updateAdvantage(adv.id, { title: e.target.value })}
                                            placeholder={t('admin.advantagesEditor.itemTitle')}
                                            className="w-full text-sm font-bold bg-transparent border-b border-border focus:border-foreground outline-none py-1 transition-all"
                                        />
                                        <textarea
                                            value={adv.description}
                                            onChange={(e) => updateAdvantage(adv.id, { description: e.target.value })}
                                            placeholder={t('admin.advantagesEditor.itemDesc')}
                                            rows={2}
                                            className="w-full text-xs text-muted-foreground bg-transparent border-b border-border focus:border-foreground outline-none py-1 resize-none"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-50 bg-muted/50 flex justify-end gap-3 shrink-0 px-6">
                    <button onClick={onClose} className="px-5 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">{t('admin.cancel')}</button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-8 py-2.5 bg-foreground text-background rounded-xl text-xs font-bold shadow-xl hover:bg-gray-800 disabled:opacity-50 hover:scale-105 active:scale-95 transition-all"
                    >
                        <FiSave /> {isSaving ? t('admin.saving') : t('admin.advantagesEditor.saveChanges')}
                    </button>
                </div>
            </div>
        </div>
    );
}
