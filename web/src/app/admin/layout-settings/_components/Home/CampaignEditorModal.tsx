'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { updateHomeSettings } from '@/lib/slices/contentSlice';
import { CampaignItem, CampaignSection } from '@/types/content';
import { FiX, FiPlus, FiTrash2, FiSave, FiImage, FiSettings, FiGrid, FiColumns } from 'react-icons/fi';
import ImageUpload from '@/components/ImageUpload';

import { updateComponentInstance } from '@/lib/slices/componentSlice';
import { useTranslation } from '@/hooks/useTranslation';

export default function CampaignEditorModal({ onClose, onUpdate, instanceId }: { onClose: () => void; onUpdate: () => void; instanceId?: string } | any) {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { homeSettings } = useAppSelector((state) => state.content);
    const { instances } = useAppSelector((state) => state.component);

    const instance = instanceId ? instances.find(i => i._id === instanceId) : null;

    const [settings, setSettings] = useState<CampaignSection>(homeSettings?.campaignSection || { isVisible: true, title: 'Limited Offers', layout: 'grid', items: [] });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (instanceId && instance) {
            setSettings(instance.data || { isVisible: true, title: '', layout: 'grid', items: [] });
        } else if (homeSettings?.campaignSection) {
            setSettings(homeSettings.campaignSection);
        }
    }, [homeSettings, instance, instanceId]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (instanceId) {
                await dispatch(updateComponentInstance({
                    id: instanceId,
                    data: settings
                })).unwrap();
            } else if (homeSettings) {
                await dispatch(updateHomeSettings({
                    ...homeSettings,
                    campaignSection: settings
                })).unwrap();
            }
            onUpdate();
            alert(t('admin.saveSuccess'));
            onClose();
        } catch (e) {
            alert(t('admin.saveError'));
        } finally {
            setIsSaving(false);
        }
    };

    const addItem = () => {
        const newItem: CampaignItem = {
            id: Date.now().toString(),
            title: 'New Alceix Campaign',
            subtitle: 'Branded placeholder image used by default.',
            image: '/image/alceix/product.png',
            buttonText: 'Explore Collection',
            buttonUrl: '/collections'
        };
        setSettings({ ...settings, items: [...settings.items, newItem] });
    };

    const updateItem = (id: string, updates: Partial<CampaignItem>) => {
        setSettings({
            ...settings,
            items: settings.items.map((a: CampaignItem) => a.id === id ? { ...a, ...updates } : a)
        });
    };

    const removeItem = (id: string) => {
        setSettings({
            ...settings,
            items: settings.items.filter((a: CampaignItem) => a.id !== id)
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm p-4">
            <div className="bg-background rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-border flex justify-between items-center bg-background z-10 px-8">
                    <div>
                        <h3 className="font-bold text-lg flex items-center gap-2 italic">
                            <FiSettings className="text-primary" /> {t('admin.campaignEditor.title')}
                        </h3>
                        <p className="text-xs text-muted-foreground/80 font-medium">{t('admin.campaignEditor.subtitle')}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted/80 rounded-full text-muted-foreground/80 hover:text-foreground transition-colors">
                        <FiX size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-muted/30">
                    {/* General Settings */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-background p-6 rounded-2xl border border-border shadow-sm">
                        <div className="space-y-4 text-left">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">{t('admin.campaignEditor.visibility')}</label>
                                <button
                                    onClick={() => setSettings({ ...settings, isVisible: !settings.isVisible })}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${settings.isVisible ? 'bg-foreground' : 'bg-gray-200'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-background rounded-full transition-all ${settings.isVisible ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">{t('admin.campaignEditor.sectionTitle')}</label>
                                <input
                                    type="text"
                                    value={settings.title}
                                    onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                                    className="w-full p-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-4 text-left">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 block mb-2">{t('admin.campaignEditor.cardLayout')}</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setSettings({ ...settings, layout: 'grid' })}
                                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${settings.layout === 'grid' ? 'border-foreground bg-foreground text-background' : 'border-border bg-background text-muted-foreground/80 hover:border-border'}`}
                                >
                                    <FiGrid size={16} /> <span className="text-[10px] font-bold uppercase">{t('admin.campaignEditor.grid')}</span>
                                </button>
                                <button
                                    onClick={() => setSettings({ ...settings, layout: 'split' })}
                                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${settings.layout === 'split' ? 'border-foreground bg-foreground text-background' : 'border-border bg-background text-muted-foreground/80 hover:border-border'}`}
                                >
                                    <FiColumns size={16} /> <span className="text-[10px] font-bold uppercase">{t('admin.campaignEditor.split')}</span>
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Items List */}
                    <section className="space-y-6">
                        <div className="flex justify-between items-center px-2">
                            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground italic">{t('admin.campaignEditor.cards')}</h4>
                            <button
                                onClick={addItem}
                                className="flex items-center gap-2 text-[10px] font-bold uppercase bg-foreground text-background px-6 py-2.5 rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl"
                            >
                                <FiPlus /> {t('admin.campaignEditor.addCampaign')}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {settings.items.map((item: CampaignItem) => (
                                <div key={item.id} className="bg-background p-6 rounded-3xl border border-border shadow-sm flex flex-col md:flex-row gap-8 relative group text-left">
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="absolute top-6 right-6 p-2 bg-red-50 text-red-400 hover:bg-red-500 hover:text-background rounded-full transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>

                                    {/* Image Column */}
                                    <div className="w-full md:w-64 space-y-4">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">{t('admin.campaignEditor.cardImage')}</label>
                                        <ImageUpload
                                            value={item.image}
                                            onChange={(url) => updateItem(item.id, { image: url })}
                                        />
                                    </div>

                                    {/* Content Column */}
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">{t('admin.campaignEditor.titleLabel')}</label>
                                                <input
                                                    type="text"
                                                    value={item.title}
                                                    onChange={(e) => updateItem(item.id, { title: e.target.value })}
                                                    className="w-full p-3 bg-muted border border-border rounded-xl focus:ring-1 focus:ring-black outline-none text-sm font-bold"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">{t('admin.campaignEditor.subtitleLabel')}</label>
                                                <textarea
                                                    value={item.subtitle}
                                                    onChange={(e) => updateItem(item.id, { subtitle: e.target.value })}
                                                    rows={3}
                                                    className="w-full p-3 bg-muted border border-border rounded-xl focus:ring-1 focus:ring-black outline-none text-xs font-medium text-muted-foreground resize-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">{t('admin.campaignEditor.buttonText')}</label>
                                                <input
                                                    type="text"
                                                    value={item.buttonText}
                                                    onChange={(e) => updateItem(item.id, { buttonText: e.target.value })}
                                                    className="w-full p-3 bg-muted border border-border rounded-xl focus:ring-1 focus:ring-black outline-none text-xs font-bold"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">{t('admin.campaignEditor.linkUrl')}</label>
                                                <input
                                                    type="text"
                                                    value={item.buttonUrl}
                                                    onChange={(e) => updateItem(item.id, { buttonUrl: e.target.value })}
                                                    className="w-full p-3 bg-muted border border-border rounded-xl focus:ring-1 focus:ring-black outline-none text-xs font-medium"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-50 bg-muted/50 flex justify-end gap-3 shrink-0 px-8">
                    <button onClick={onClose} className="px-5 py-2.5 text-xs font-bold text-muted-foreground/80 hover:text-foreground transition-colors">{t('admin.campaignEditor.discard')}</button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-10 py-3 bg-foreground text-background rounded-2xl text-[11px] font-bold shadow-2xl hover:bg-gray-800 disabled:opacity-50 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest"
                    >
                        {isSaving ? t('admin.saving') : t('admin.campaignEditor.save')}
                    </button>
                </div>
            </div>
        </div>
    );
}
