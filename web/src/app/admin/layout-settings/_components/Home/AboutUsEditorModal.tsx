'use client';

import { useState, useEffect } from 'react';
import { useCmsStore } from '@/lib/store/useCmsStore';
import { FiX, FiPlus, FiTrash2, FiSave, FiInfo, FiTruck, FiShield, FiHeart, FiClock, FiLayout, FiColumns, FiAlignCenter, FiRepeat } from 'react-icons/fi';
import ImageUpload from '@/components/ImageUpload';
import { useTranslation } from '@/hooks/useTranslation';
import type { AboutUsData, Feature } from '@/types/sections';

const AVAILABLE_ICONS = [
    { name: 'FiTruck', icon: FiTruck },
    { name: 'FiShield', icon: FiShield },
    { name: 'FiHeart', icon: FiHeart },
    { name: 'FiClock', icon: FiClock },
];

export default function AboutUsEditorModal({ onClose, onUpdate, instanceId }: { onClose: () => void; onUpdate: () => void; instanceId?: string }) {
    const { t } = useTranslation();
    const { instances, updateInstance } = useCmsStore();

    const instance = instanceId ? instances.find(i => i._id === instanceId) : null;

    const [settings, setSettings] = useState({
        heroTitle: 'About Our Brand',
        tagline: 'Crafting excellence for over a decade.',
        heroDesc: 'We are dedicated to providing the finest products with unparalleled customer service.',
        mediaUrl: '/image/alceix/hero.png',
        variant: 'default' as 'default' | 'split' | 'centered' | 'reverse',
        features: [] as Feature[]
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (instanceId && instance?.data) {
            const data = instance.data as unknown as AboutUsData;
            setSettings(prev => ({
                ...prev,
                heroTitle: data.heroTitle || prev.heroTitle,
                tagline: data.tagline || prev.tagline,
                heroDesc: data.heroDesc || prev.heroDesc,
                mediaUrl: data.mediaUrl || prev.mediaUrl,
                variant: (data.variant || prev.variant) as 'default' | 'split' | 'centered' | 'reverse',
                features: data.features || prev.features
            }));
        }
    }, [instance, instanceId]);

    const handleSave = async () => {
        if (!instanceId) return;
        setIsSaving(true);
        try {
            await updateInstance(instanceId, settings as unknown as Record<string, unknown>);
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
            features: [...settings.features, { id: Date.now().toString(), title: 'New Feature', description: 'Feature description', icon: 'FiHeart' }]
        });
    };

    const updateItem = (id: string, updates: Partial<{ title: string; description: string; icon: string }>) => {
        setSettings({
            ...settings,
            features: settings.features.map(item => item.id === id ? { ...item, ...updates } : item)
        });
    };

    const removeItem = (id: string) => {
        setSettings({
            ...settings,
            features: settings.features.filter(item => item.id !== id)
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm p-4">
            <div className="bg-background rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="p-6 border-b border-border flex justify-between items-center bg-background z-10">
                    <div>
                        <h3 className="font-bold text-lg flex items-center gap-2 italic">
                            <FiInfo className="text-primary" /> {t('admin.aboutUsEditor.title')}
                        </h3>
                        <p className="text-xs text-muted-foreground/80">{t('admin.aboutUsEditor.subtitle')}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted/80 rounded-full text-muted-foreground/80 hover:text-foreground transition-colors">
                        <FiX size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-muted/30">
                    <section className="bg-background p-6 rounded-2xl border border-border shadow-sm space-y-8 text-left">
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">{t('admin.aboutUsEditor.variant')}</label>
                            <div className="flex gap-4">
                                {(['default', 'split', 'centered', 'reverse'] as const).map((v) => (
                                    <button
                                        key={v}
                                        onClick={() => setSettings({ ...settings, variant: v })}
                                        className={`flex-1 py-4 px-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                                            settings.variant === v 
                                            ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/5' 
                                            : 'border-border/40 hover:border-primary/20 bg-background text-muted-foreground'
                                        }`}
                                    >
                                        <div className="relative w-10 h-10 flex items-center justify-center">
                                            <div className="absolute inset-0 rounded-full bg-current opacity-10"></div>
                                            <div className="relative z-10">
                                                {v === 'default' && <FiLayout size={20} />}
                                                {v === 'split' && <FiColumns size={20} />}
                                                {v === 'centered' && <FiAlignCenter size={20} />}
                                                {v === 'reverse' && <FiRepeat size={20} />}
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest">{t(`admin.aboutUsEditor.variants.${v}`)}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-border/60">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Section Title</label>
                                    <input
                                        type="text"
                                        value={settings.heroTitle}
                                        onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                                        className="w-full p-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Section Tagline</label>
                                    <input
                                        type="text"
                                        value={settings.tagline}
                                        onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                                        className="w-full p-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 block">Main Image</label>
                                <div className="h-40">
                                    <ImageUpload
                                        value={settings.mediaUrl}
                                        onChange={(url) => setSettings({ ...settings, mediaUrl: url })}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Main Description</label>
                            <textarea
                                value={settings.heroDesc}
                                onChange={(e) => setSettings({ ...settings, heroDesc: e.target.value })}
                                className="w-full p-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium resize-none"
                                rows={3}
                            />
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div className="flex justify-between items-center px-2">
                            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground italic">Features</h4>
                            <button
                                onClick={addItem}
                                className="flex items-center gap-2 text-[10px] font-bold uppercase bg-foreground text-background px-6 py-2.5 rounded-full"
                            >
                                <FiPlus /> Add Feature
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {settings.features.map((item) => (
                                <div key={item.id} className="bg-background p-6 rounded-2xl border border-border shadow-sm relative group space-y-4 text-left">
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="absolute top-4 right-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                    
                                    <div className="flex flex-wrap gap-2">
                                        {AVAILABLE_ICONS.map(i => (
                                            <button
                                                key={i.name}
                                                onClick={() => updateItem(item.id, { icon: i.name })}
                                                className={`p-2 rounded-lg border transition-all ${item.icon === i.name ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground/80'}`}
                                            >
                                                <i.icon size={16} />
                                            </button>
                                        ))}
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-muted-foreground/80 block mb-1">Feature Title</label>
                                            <input
                                                type="text"
                                                value={item.title}
                                                onChange={(e) => updateItem(item.id, { title: e.target.value })}
                                                className="w-full text-sm font-bold bg-transparent border-b border-border focus:border-foreground outline-none py-1 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-muted-foreground/80 block mb-1">Description</label>
                                            <textarea
                                                value={item.description}
                                                onChange={(e) => updateItem(item.id, { description: e.target.value })}
                                                rows={2}
                                                className="w-full text-xs text-muted-foreground bg-transparent border-b border-border focus:border-foreground outline-none py-1 resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="p-6 border-t border-border bg-background flex justify-end gap-3 px-8">
                    <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-xs text-muted-foreground hover:bg-muted/80 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-8 py-2.5 bg-foreground text-background rounded-xl text-xs font-bold hover:bg-gray-800 disabled:bg-gray-400 transition-colors flex items-center gap-2 shadow-lg"
                    >
                        {isSaving ? 'Saving...' : <><FiSave /> Save Changes</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
