'use client';

import { useState, useEffect } from 'react';
import { useCmsStore } from '@/lib/store/useCmsStore';
import { useContentStore } from '@/lib/store/useContentStore';
import { FiStar, FiX, FiLayout, FiGrid } from 'react-icons/fi';
import { BsViewStacked } from 'react-icons/bs';
import ImageUpload from '@/components/ImageUpload';
import { useTranslation } from '@/hooks/useTranslation';


import { PopularCollectionsData } from '@/types/sections';

export default function CollectionsEditorModal({ onClose, onSave, instanceId }: { onClose: () => void; onSave: () => void; instanceId?: string }) {
    const { t } = useTranslation();
    const { popularCollections, homeSettings, updateHomeSettings, updatePopularCollections } = useContentStore();
    const { instances, updateInstance } = useCmsStore();

    const instance = instanceId ? instances.find(i => i._id === instanceId) : null;

    const [images, setImages] = useState({
        newArrivals: '',
        bestSellers: '',
        newArrivalsTitle: '',
        newArrivalsLink: '',
        bestSellersTitle: '',
        bestSellersLink: ''
    });
    const [layout, setLayout] = useState<'grid' | 'split' | 'stacked'>('grid');
    const [activeTab, setActiveTab] = useState<'content' | 'layout'>('layout');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const instanceData = instance?.data as PopularCollectionsData | undefined;
        if (instanceId && instanceData) {
            setImages({
                newArrivals: instanceData.newArrivals || '',
                bestSellers: instanceData.bestSellers || '',
                newArrivalsTitle: instanceData.newArrivalsTitle || '',
                newArrivalsLink: instanceData.newArrivalsLink || '',
                bestSellersTitle: instanceData.bestSellersTitle || '',
                bestSellersLink: instanceData.bestSellersLink || ''
            });
            setLayout(instanceData.popularLayout || 'grid');
        } else {
            if (popularCollections) {
                setImages({
                    newArrivals: popularCollections.newArrivals || '',
                    bestSellers: popularCollections.bestSellers || '',
                    newArrivalsTitle: popularCollections.newArrivalsTitle || '',
                    newArrivalsLink: popularCollections.newArrivalsLink || '',
                    bestSellersTitle: popularCollections.bestSellersTitle || '',
                    bestSellersLink: popularCollections.bestSellersLink || ''
                });
            }
            if (homeSettings?.popularLayout) {
                setLayout(homeSettings.popularLayout);
            }
        }
    }, [popularCollections, homeSettings, instance, instanceId]);

    const handleSave = async () => {
        setLoading(true);
        try {
            if (instanceId) {
                await updateInstance(instanceId, {
                        ...instance?.data,
                        ...images,
                        popularLayout: layout
                    });
            } else if (homeSettings) {
                await updatePopularCollections(images);
                await updateHomeSettings({ ...homeSettings, popularLayout: layout });
            }
            onSave();
        } catch (err) {
            console.error(err);
            alert(t('admin.saveError'));
        } finally {
            setLoading(false);
        }
    };

    const layouts = [
        {
            id: 'grid',
            label: t('admin.popularEditor.layouts.grid'),
            description: t('admin.popularEditor.layouts.gridDesc'),
            icon: FiGrid
        },
        {
            id: 'split',
            label: t('admin.popularEditor.layouts.split'),
            description: t('admin.popularEditor.layouts.splitDesc'),
            icon: FiLayout
        },
        {
            id: 'stacked',
            label: t('admin.popularEditor.layouts.stacked'),
            description: t('admin.popularEditor.layouts.stackedDesc'),
            icon: BsViewStacked
        }
    ] as const;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4">
            <div className="bg-background rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden">
                <div className="w-full md:w-64 bg-muted border-r border-border p-4 flex flex-col gap-1 shrink-0">
                    <div className="mb-6 px-2 mt-2">
                        <h2 className="font-bold text-lg tracking-tight">{t('admin.popularEditor.title')}</h2>
                        <p className="text-xs text-muted-foreground/80 font-medium">{t('admin.popularEditor.subtitle')}</p>
                    </div>

                    <button
                        onClick={() => setActiveTab('layout')}
                        className={`flex items-start gap-3 px-3 py-3 rounded-xl text-left transition-all ${activeTab === 'layout' ? 'bg-background shadow-md text-foreground ring-1 ring-black/5' : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'}`}
                    >
                        <FiLayout size={18} className="mt-0.5" />
                        <div>
                            <div className="text-xs font-bold">{t('admin.popularEditor.designLayout')}</div>
                            <div className="text-[10px] font-medium opacity-60 leading-tight mt-0.5">{t('admin.popularEditor.presentationStyle')}</div>
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveTab('content')}
                        className={`flex items-start gap-3 px-3 py-3 rounded-xl text-left transition-all ${activeTab === 'content' ? 'bg-background shadow-md text-foreground ring-1 ring-black/5' : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'}`}
                    >
                        <FiStar size={18} className="mt-0.5" />
                        <div>
                            <div className="text-xs font-bold">{t('admin.popularEditor.coverImages')}</div>
                            <div className="text-[10px] font-medium opacity-60 leading-tight mt-0.5">{t('admin.popularEditor.highlightVisuals')}</div>
                        </div>
                    </button>

                    <div className="mt-auto px-4 py-4 opacity-50 text-[10px] text-muted-foreground/80 lowercase italic font-heading">
                        <p>{t('admin.popularEditor.configureDesc')}</p>
                    </div>
                </div>

                <div className="flex-1 flex flex-col min-h-0 bg-background text-left">
                    <div className="p-6 border-b border-border flex justify-between items-center bg-background z-10 shrink-0">
                        <div>
                            <h3 className="font-bold text-lg">{activeTab === 'layout' ? t('admin.popularEditor.designSettings') : t('admin.popularEditor.promoCovers')}</h3>
                            <p className="text-xs text-muted-foreground/80">{activeTab === 'layout' ? t('admin.popularEditor.chooseStructure') : t('admin.popularEditor.updateVisuals')}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-muted/80 rounded-full text-muted-foreground/80 hover:text-foreground transition-colors">
                            <FiX size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 md:p-8">
                        {activeTab === 'layout' && (
                            <div className="grid md:grid-cols-2 gap-4">
                                {layouts.map((l) => {
                                    const Icon = l.icon;
                                    const isSelected = layout === l.id;
                                    return (
                                        <button
                                            key={l.id}
                                            onClick={() => setLayout(l.id)}
                                            className={`flex flex-col text-left p-4 rounded-xl border-2 transition-all ${isSelected
                                                ? 'border-foreground bg-foreground/5 ring-4 ring-black/5'
                                                : 'border-border bg-background hover:border-border hover:bg-muted'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={`p-2 rounded-lg ${isSelected ? 'bg-foreground text-background' : 'bg-muted/80 text-muted-foreground'}`}>
                                                    <Icon size={16} />
                                                </div>
                                                <span className={`font-bold text-sm ${isSelected ? 'text-foreground' : 'text-foreground/80'}`}>{l.label}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground font-medium pl-[44px] leading-relaxed">
                                                {l.description}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {activeTab === 'content' && (
                            <div className="space-y-12">
                                <div className="grid md:grid-cols-2 gap-8 items-start">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">1</span>
                                            <span className="font-bold text-sm">{t('admin.popularEditor.newArrivalsTitle')}</span>
                                        </div>
                                        <div className="p-2 bg-muted rounded-xl border border-border">
                                            <ImageUpload value={images.newArrivals} onChange={url => setImages({ ...images, newArrivals: url })} />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('admin.popularEditor.customTitle')}</label>
                                            <input
                                                type="text"
                                                value={images.newArrivalsTitle}
                                                onChange={(e) => setImages({ ...images, newArrivalsTitle: e.target.value })}
                                                placeholder={t('admin.popularEditor.newArrivalsPlaceholder')}
                                                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('admin.popularEditor.customLink')}</label>
                                            <input
                                                type="text"
                                                value={images.newArrivalsLink}
                                                onChange={(e) => setImages({ ...images, newArrivalsLink: e.target.value })}
                                                placeholder={t('admin.popularEditor.linkPlaceholder')}
                                                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-border w-full"></div>

                                <div className="grid md:grid-cols-2 gap-8 items-start">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">2</span>
                                            <span className="font-bold text-sm">{t('admin.popularEditor.bestSellersTitle')}</span>
                                        </div>
                                        <div className="p-2 bg-muted rounded-xl border border-border">
                                            <ImageUpload value={images.bestSellers} onChange={url => setImages({ ...images, bestSellers: url })} />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('admin.popularEditor.customTitle')}</label>
                                            <input
                                                type="text"
                                                value={images.bestSellersTitle}
                                                onChange={(e) => setImages({ ...images, bestSellersTitle: e.target.value })}
                                                placeholder={t('admin.popularEditor.bestSellersPlaceholder')}
                                                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('admin.popularEditor.customLink')}</label>
                                            <input
                                                type="text"
                                                value={images.bestSellersLink}
                                                onChange={(e) => setImages({ ...images, bestSellersLink: e.target.value })}
                                                placeholder={t('admin.popularEditor.linkPlaceholder')}
                                                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-border bg-muted/50 flex justify-end gap-3 shrink-0">
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
