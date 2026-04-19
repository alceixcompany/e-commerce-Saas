'use client';

import { useState, useEffect } from 'react';
import { useCmsStore } from '@/lib/store/useCmsStore';
import { FiX, FiPlus, FiTrash2, FiSave, FiTarget, FiList, FiGrid, FiAirplay } from 'react-icons/fi';
import ImageUpload from '@/components/ImageUpload';
import { useTranslation } from '@/hooks/useTranslation';
import { ExploreByRoomData } from '@/types/sections';

export default function ExploreRoomsEditorModal({ onClose, onUpdate, instanceId }: { onClose: () => void; onUpdate: () => void; instanceId?: string }) {
    const { t } = useTranslation();
    const { instances, updateInstance } = useCmsStore();

    const instance = instanceId ? instances.find(i => i._id === instanceId) : null;

    const [settings, setSettings] = useState({
        title: 'Explore By Room',
        subtitle: 'Find the perfect pieces for every corner of your home.',
        variant: 'list' as 'list' | 'grid' | 'focus',
        rooms: [] as { name: string; description: string; image: string; slug: string; id: string }[]
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (instanceId && instance?.data) {
            setSettings(prev => {
                const newData = { ...prev, ...(instance.data as unknown as ExploreByRoomData) };
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
            rooms: [...settings.rooms, { id: Date.now().toString(), name: t('admin.exploreRoomsEditor.roomNamePlaceholder'), description: '', image: '', slug: 'new-room' }]
        });
    };

    const updateItem = (id: string, updates: Partial<{ name: string; description: string; image: string; slug: string }>) => {
        setSettings({
            ...settings,
            rooms: settings.rooms.map(item => item.id === id ? { ...item, ...updates } : item)
        });
    };

    const removeItem = (id: string) => {
        setSettings({
            ...settings,
            rooms: settings.rooms.filter(item => item.id !== id)
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm p-4">
            <div className="bg-background rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="p-6 border-b border-border flex justify-between items-center bg-background z-10">
                    <div>
                        <h3 className="font-bold text-lg flex items-center gap-2 italic">
                            <FiTarget className="text-primary" /> {t('admin.exploreRoomsEditor.title')}
                        </h3>
                        <p className="text-xs text-muted-foreground/80">{t('admin.exploreRoomsEditor.subtitle')}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted/80 rounded-full text-muted-foreground/80 hover:text-foreground transition-colors">
                        <FiX size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-muted/30">
                    <section className="bg-background p-6 rounded-2xl border border-border shadow-sm space-y-4">
                        <div className="space-y-2 text-left">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">{t('admin.exploreRoomsEditor.sectionTitle')}</label>
                            <input
                                type="text"
                                value={settings.title}
                                onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                                className="w-full p-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium"
                            />
                        </div>
                        <div className="space-y-2 text-left">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">{t('admin.exploreRoomsEditor.sectionSubtitle')}</label>
                            <textarea
                                value={settings.subtitle}
                                onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
                                className="w-full p-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium resize-none"
                                rows={2}
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">{t('admin.exploreRoomsEditor.variant')}</label>
                            <div className="flex gap-4">
                                {(['list', 'grid', 'focus'] as const).map((v) => (
                                    <button
                                        key={v}
                                        onClick={() => setSettings({ ...settings, variant: v })}
                                        className={`flex-1 py-4 px-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                                            settings.variant === v 
                                            ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/5' 
                                            : 'border-border/40 hover:border-primary/20 bg-background text-muted-foreground'
                                        }`}
                                    >
                                        <div className="relative w-12 h-12 flex items-center justify-center">
                                            <div className="absolute inset-0 rounded-full bg-current opacity-10"></div>
                                            <div className="relative z-10">
                                                {v === 'list' && <FiList size={22} />}
                                                {v === 'grid' && <FiGrid size={22} />}
                                                {v === 'focus' && <FiAirplay size={22} />}
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest">{t(`admin.exploreRoomsEditor.variants.${v}`)}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div className="flex justify-between items-center px-2">
                            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground italic">{t('admin.exploreRoomsEditor.rooms')}</h4>
                            <button
                                onClick={addItem}
                                className="flex items-center gap-2 text-[10px] font-bold uppercase bg-foreground text-background px-6 py-2.5 rounded-full"
                            >
                                <FiPlus /> {t('admin.exploreRoomsEditor.addRoom')}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {settings.rooms.map((item) => (
                                <div key={item.id} className="bg-background rounded-3xl border border-border/60 shadow-xl shadow-foreground/5 relative group overflow-hidden flex flex-col md:flex-row h-full transition-all hover:shadow-2xl hover:border-primary/20">
                                    {/* Action Buttons */}
                                    <div className="absolute top-4 right-4 z-20 flex gap-2">
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-full transition-all scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 shadow-sm"
                                            title={t('admin.delete')}
                                        >
                                            <FiTrash2 size={14} />
                                        </button>
                                    </div>

                                    {/* Image Section */}
                                    <div className="w-full md:w-56 bg-muted/20 relative flex flex-col p-4 border-r border-border/40 shrink-0">
                                        <div className="w-full aspect-square rounded-2xl overflow-hidden border border-gray-100 bg-transparent group-hover:border-primary/20 transition-all">
                                            <ImageUpload 
                                                value={item.image} 
                                                onChange={url => updateItem(item.id, { image: url })}
                                                size="full"
                                            />
                                        </div>
                                    </div>

                                    {/* Form Section */}
                                    <div className="flex-1 p-6 md:pl-2 space-y-4 text-left">
                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 ml-1">{t('admin.exploreRoomsEditor.roomName')}</label>
                                                <input
                                                    type="text"
                                                    value={item.name}
                                                    onChange={(e) => updateItem(item.id, { name: e.target.value })}
                                                    placeholder={t('admin.exploreRoomsEditor.roomNamePlaceholder')}
                                                    className="w-full text-sm font-bold bg-muted/30 border border-transparent focus:border-primary/30 focus:bg-background rounded-xl px-4 py-2.5 outline-none transition-all placeholder:text-foreground/20"
                                                />
                                            </div>
                                            
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 ml-1">{t('admin.exploreRoomsEditor.roomDescription')}</label>
                                                <textarea
                                                    value={item.description}
                                                    onChange={(e) => updateItem(item.id, { description: e.target.value })}
                                                    placeholder={t('admin.exploreRoomsEditor.roomDescPlaceholder')}
                                                    rows={2}
                                                    className="w-full text-xs text-muted-foreground bg-muted/30 border border-transparent focus:border-primary/30 focus:bg-background rounded-xl px-4 py-2.5 outline-none transition-all resize-none placeholder:text-foreground/20"
                                                />
                                            </div>

                                            <div className="space-y-1.5 pt-1">
                                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 ml-1">{t('admin.exploreRoomsEditor.categorySlug')}</label>
                                                <div className="relative">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/40 font-mono">/category/</div>
                                                    <input
                                                        type="text"
                                                        value={item.slug}
                                                        onChange={(e) => updateItem(item.id, { slug: e.target.value })}
                                                        placeholder="living-room"
                                                        className="w-full text-[11px] font-mono pl-20 pr-4 py-2.5 bg-muted/20 border border-transparent focus:border-primary/20 rounded-xl outline-none transition-all text-primary/80"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="p-6 border-t border-border bg-background flex justify-end gap-3 px-8">
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
