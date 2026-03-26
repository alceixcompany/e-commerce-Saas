'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { FiX, FiType, FiLayout, FiGrid, FiList, FiImage, FiCheck, FiLayers } from 'react-icons/fi';
import { BsViewStacked } from 'react-icons/bs';
import { useTranslation } from '@/hooks/useTranslation';
import { updateComponentInstance } from '@/lib/slices/componentSlice';

export default function CategoryListingEditorModal({ onClose, onSave, instanceId }: { onClose: () => void; onSave: () => void; instanceId: string }) {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { instances } = useAppSelector((state) => state.component);

    const instance = instances.find(i => i._id === instanceId);

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: 'Our Collections',
        subtitle: 'Explore our curated jewelry categories',
        layout: 'grid',
        columns: 3,
        showItemCount: true,
        imageAspectRatio: 'portrait'
    });

    useEffect(() => {
        if (instance?.data) {
            setFormData({
                ...formData,
                ...instance.data
            });
        }
    }, [instance]);

    const handleSave = async () => {
        setLoading(true);
        try {
            await dispatch(updateComponentInstance({
                id: instanceId,
                data: formData
            })).unwrap();
            onSave();
            alert(t('admin.saveSuccess'));
        } catch (err) {
            console.error(err);
            alert(t('admin.saveError'));
        } finally {
            setLoading(false);
        }
    };

    const layouts = [
        { id: 'grid', label: t('admin.categories.grid') || 'Grid', icon: FiGrid },
        { id: 'masonry', label: t('admin.categories.masonry') || 'Masonry', icon: FiLayout },
        { id: 'slider', label: 'Slider', icon: BsViewStacked },
        { id: 'minimal', label: t('admin.categories.minimal') || 'Minimal', icon: FiList }
    ];

    const aspectRatios = [
        { id: 'square', label: 'Square (1:1)' },
        { id: 'portrait', label: 'Portrait (3:4)' }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4">
            <div className="bg-background rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden">
                {/* Sidebar */}
                <div className="w-full md:w-64 bg-muted border-r border-border p-4 flex flex-col gap-1 shrink-0">
                    <div className="mb-6 px-2 mt-2">
                        <h2 className="font-bold text-lg tracking-tight">Catalog Settings</h2>
                        <p className="text-xs text-muted-foreground/80 font-medium">Configure categories display</p>
                    </div>

                    <button className="flex items-start gap-3 px-3 py-3 rounded-xl text-left transition-all bg-background shadow-md text-foreground ring-1 ring-black/5">
                        <FiLayers size={18} className="mt-0.5 text-foreground" />
                        <div>
                            <div className="text-xs font-bold">General Settings</div>
                            <div className="text-[10px] font-medium opacity-60 leading-tight mt-0.5">Layout and design</div>
                        </div>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col min-h-0 bg-background">
                    <div className="p-6 border-b border-border flex justify-between items-center bg-background z-10 shrink-0">
                        <div>
                            <h3 className="font-bold text-lg">Edit Category Catalog</h3>
                            <p className="text-xs text-muted-foreground/80">Customize how your categories appear on the site.</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-muted/80 rounded-full text-muted-foreground/80 hover:text-foreground transition-colors">
                            <FiX size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
                        {/* Title & Subtitle */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 mb-4 flex items-center gap-2">
                                <FiType /> Text Content
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold ml-1">Section Title</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ring-primary/20 transition-all font-medium"
                                        placeholder="e.g. Our Collections"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold ml-1">Section Subtitle</label>
                                    <input
                                        type="text"
                                        value={formData.subtitle}
                                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                        className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ring-primary/20 transition-all font-medium"
                                        placeholder="e.g. Explore our curated jewelry"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Layout Picker */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 mb-4 flex items-center gap-2">
                                <FiLayout /> Visual Layout
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {layouts.map((l) => {
                                    const Icon = l.icon;
                                    const isSelected = formData.layout === l.id;
                                    return (
                                        <button
                                            key={l.id}
                                            onClick={() => setFormData({ ...formData, layout: l.id as any })}
                                            className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${isSelected
                                                    ? 'border-foreground bg-foreground/5'
                                                    : 'border-border bg-background hover:bg-muted'
                                                }`}
                                        >
                                            <Icon size={20} className={isSelected ? 'text-foreground' : 'text-foreground/40'} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">{l.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Additional Options */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Grid Settings */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 flex items-center gap-2">
                                    <FiGrid /> Grid Settings
                                </h4>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold ml-1">Columns</label>
                                        <div className="flex gap-2">
                                            {[2, 3, 4].map((n) => (
                                                <button
                                                    key={n}
                                                    onClick={() => setFormData({ ...formData, columns: n as any })}
                                                    className={`flex-1 py-2 rounded-lg border-2 text-xs font-bold transition-all ${formData.columns === n ? 'border-foreground bg-foreground text-background' : 'border-border hover:border-foreground/20'}`}
                                                >
                                                    {n} Columns
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-foreground/5 rounded-xl border border-foreground/10">
                                        <div>
                                            <div className="text-xs font-bold">Show Item Count</div>
                                            <div className="text-[10px] opacity-60 italic">Display number of pieces in each category</div>
                                        </div>
                                        <button
                                            onClick={() => setFormData({ ...formData, showItemCount: !formData.showItemCount })}
                                            className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${formData.showItemCount ? 'bg-primary justify-end' : 'bg-foreground/20 justify-start'}`}
                                        >
                                            <div className="w-4 h-4 bg-background rounded-full shadow-sm" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Media Settings */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 flex items-center gap-2">
                                    <FiImage /> Media Display
                                </h4>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold ml-1">Image Aspect Ratio</label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {aspectRatios.map((r) => (
                                            <button
                                                key={r.id}
                                                onClick={() => setFormData({ ...formData, imageAspectRatio: r.id as any })}
                                                className={`flex items-center justify-between px-4 py-2.5 rounded-xl border-2 transition-all text-xs font-medium ${formData.imageAspectRatio === r.id ? 'border-foreground bg-foreground/5' : 'border-border hover:border-foreground/20'}`}
                                            >
                                                {r.label}
                                                {formData.imageAspectRatio === r.id && <FiCheck />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-gray-50 bg-muted/50 flex justify-end gap-3 shrink-0">
                        <button onClick={onClose} className="px-5 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-lg transition-colors">{t('admin.cancel')}</button>
                        <button onClick={handleSave} disabled={loading} className="px-6 py-2.5 bg-foreground text-background rounded-xl text-xs font-bold shadow-xl hover:bg-gray-800 disabled:opacity-50 hover:scale-105 active:scale-95 transition-all">
                            {loading ? t('admin.saving') : t('admin.save')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
