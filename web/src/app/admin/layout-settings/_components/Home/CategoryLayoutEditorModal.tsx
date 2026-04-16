'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { updateHomeSettings } from '@/lib/slices/contentSlice';
import { FiX, FiLayout, FiGrid, FiList, FiCheck, FiSave, FiLayers, FiSidebar } from 'react-icons/fi';
import { BsViewStacked } from 'react-icons/bs';
import { useTranslation } from '@/hooks/useTranslation';

import { updateComponentInstance } from '@/lib/slices/componentSlice';
import { CollectionsData } from '@/types/sections';

type CategoryLayout = NonNullable<CollectionsData['categoryLayout']>;

export default function CategoryLayoutEditorModal({ onClose, onSave, instanceId }: { onClose: () => void; onSave: () => void; instanceId?: string }) {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { homeSettings } = useAppSelector((state) => state.content);
    const { instances } = useAppSelector((state) => state.component);

    const instance = instanceId ? instances.find(i => i._id === instanceId) : null;

    const [layout, setLayout] = useState<CategoryLayout>(
        (instance?.data as CollectionsData)?.categoryLayout || homeSettings?.categoryLayout || 'carousel'
    );
    const [showGlassEffect, setShowGlassEffect] = useState<boolean>(
        (instance?.data as CollectionsData)?.showGlassEffect || homeSettings?.showGlassEffect || false
    );
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const instanceData = instance?.data as CollectionsData | undefined;
        if (instanceId && instanceData) {
            setLayout(instanceData.categoryLayout || 'carousel');
            setShowGlassEffect(instanceData.showGlassEffect || false);
        } else if (homeSettings?.categoryLayout) {
            setLayout(homeSettings.categoryLayout);
            setShowGlassEffect(homeSettings.showGlassEffect || false);
        }
    }, [homeSettings, instance, instanceId]);

    const handleSave = async () => {
        setLoading(true);
        try {
            if (instanceId) {
                await dispatch(updateComponentInstance({
                    id: instanceId,
                    data: {
                        ...instance?.data,
                        categoryLayout: layout,
                        showGlassEffect: showGlassEffect
                    }
                })).unwrap();
            } else if (homeSettings) {
                await dispatch(updateHomeSettings({ 
                    ...homeSettings, 
                    categoryLayout: layout,
                    showGlassEffect: showGlassEffect
                })).unwrap();
            }
            onSave();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const layouts = [
        {
            id: 'editorial',
            label: t('admin.categories.editorial'),
            description: t('admin.categories.editorialDesc'),
            icon: FiLayers
        },
        {
            id: 'carousel',
            label: t('admin.categories.carousel'),
            description: t('admin.categories.carouselDesc'),
            icon: BsViewStacked
        },
        {
            id: 'grid',
            label: t('admin.categories.grid'),
            description: t('admin.categories.gridDesc'),
            icon: FiGrid
        },
        {
            id: 'masonry',
            label: t('admin.categories.masonry'),
            description: t('admin.categories.masonryDesc'),
            icon: FiLayout
        },
        {
            id: 'minimal',
            label: t('admin.categories.minimal'),
            description: t('admin.categories.minimalDesc'),
            icon: FiList
        }
    ] as const;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4">
            <div className="bg-background rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-border animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-border flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg">{t('admin.categories.title')}</h3>
                        <p className="text-xs text-muted-foreground">{t('admin.categories.layoutSettings')}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
                        <FiX size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-muted/10 custom-scrollbar">
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <FiSidebar size={12} /> {t('admin.categories.chooseLayout')}
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {layouts.map((l) => {
                                const Icon = l.icon;
                                const isSelected = layout === l.id;
                                return (
                                    <button
                                        key={l.id}
                                        onClick={() => setLayout(l.id)}
                                        className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col gap-3 ${isSelected ? 'border-foreground bg-background shadow-lg scale-[1.02]' : 'border-border bg-background/50 hover:border-foreground/30'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSelected ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'}`}>
                                                <Icon size={18} />
                                            </div>
                                            {isSelected && <FiCheck className="text-foreground" size={20} />}
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-sm">{l.label}</h5>
                                            <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">{l.description}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-5 bg-background border border-border rounded-xl flex items-center justify-between group/glass transition-all hover:border-primary/30">
                        <div className="flex gap-4 items-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${showGlassEffect ? 'bg-primary/20 text-primary shadow-[0_0_20px_rgba(var(--primary),0.3)]' : 'bg-muted text-muted-foreground'}`}>
                                <FiLayers size={22} className={showGlassEffect ? 'animate-pulse' : ''} />
                            </div>
                            <div>
                                <h5 className="font-bold text-sm flex items-center gap-2">
                                    {t('admin.categories.glassEffect')}
                                    {showGlassEffect && <span className="bg-primary/10 text-primary text-[8px] px-1.5 py-0.5 rounded-full animate-bounce">LIVE</span>}
                                </h5>
                                <p className="text-[10px] text-muted-foreground">{t('admin.categories.glassEffectDesc')}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowGlassEffect(!showGlassEffect)}
                            className={`w-12 h-6 rounded-full relative transition-all duration-300 ${showGlassEffect ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${showGlassEffect ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>

                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-2">
                        <p className="text-xs font-bold text-primary flex items-center gap-2 uppercase tracking-tight">
                            <FiLayers size={14} /> Design Note
                        </p>
                        <p className="text-xs text-primary/70">{t('admin.categories.manageNote')}</p>
                    </div>
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
                        disabled={loading}
                        className="px-8 py-2.5 bg-foreground text-background rounded-xl text-xs font-bold hover:bg-foreground/90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin"/> {t('admin.saving')}</span>
                        ) : (
                            <><FiSave size={14} /> {t('admin.save')}</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
