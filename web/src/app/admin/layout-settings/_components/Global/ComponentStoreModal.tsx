'use client';

import { FiX, FiCheck, FiLayout, FiImage, FiGrid, FiAlignLeft, FiSidebar, FiColumns, FiBook, FiAward, FiPlus, FiTag, FiMail, FiInfo, FiTrash2 } from 'react-icons/fi';
import { BsViewStacked } from 'react-icons/bs';
import { useTranslation } from '@/hooks/useTranslation';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchComponentInstances, createComponentInstance, deleteComponentInstance } from '@/lib/slices/componentSlice';
import { COMPONENTS, PAGE_RECOMMENDATIONS, ComponentDefinition } from '@/config/component-store.config';

export default function ComponentStoreModal({
    onClose,
    onAdd,
    activeIds,
    pageType = 'home'
}: {
    onClose: () => void;
    onAdd: (id: string) => void;
    activeIds: string[];
    pageType?: string;
}) {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { instances, loading: componentLoading } = useAppSelector(state => state.component);
    const isLoading = componentLoading.fetchAll;

    const [selectedType, setSelectedType] = useState<ComponentDefinition | null>(null);
    const [newInstanceName, setNewInstanceName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        if (selectedType) {
            dispatch(fetchComponentInstances(selectedType.id));
        }
    }, [selectedType, dispatch]);

    const [activeCategory, setActiveCategory] = useState<'recommended' | 'basics' | 'products' | 'content'>('recommended');

    const recommendedIds = PAGE_RECOMMENDATIONS[pageType] || [];
    
    // Group other components by category for 'All' view
    const filteredComponents = COMPONENTS.filter(c => {
        // Restricted contact components - only show on contact page
        if ((c.id === 'contact_form' || c.id === 'contact_info') && pageType !== 'contact') {
            return false;
        }
        // Restricted auth component - only show on login/register pages
        if (c.id === 'auth' && (pageType !== 'login' && pageType !== 'register')) {
            return false;
        }
        // If it's page specific, only show if it's recommended for current page
        const isRecommended = recommendedIds.includes(c.id);
        if (c.pageSpecific && !isRecommended) return false;
        
        if (activeCategory === 'recommended') return isRecommended;
        return c.category === activeCategory;
    });

    const categoryIcons = {
        recommended: FiPlus,
        basics: FiLayout,
        products: FiGrid,
        content: FiBook
    };

    const renderCard = (comp: ComponentDefinition) => {
        const isAdded = activeIds.some(id => id === comp.id || id.startsWith(`${comp.id}_instance_`));
        return (
            <div key={comp.id} className="group flex flex-col bg-background rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="h-40 bg-background border-b border-gray-50 flex items-center justify-center p-4 relative overflow-hidden group-hover:bg-muted/50 transition-colors">
                    <div className="w-full h-full opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" dangerouslySetInnerHTML={{ __html: comp.image.replace(/currentColor/g, '#E2E8F0') }} />
                    {!comp.isAvailable && (
                        <div className="absolute inset-0 bg-background/70 backdrop-blur-[2px] flex items-center justify-center">
                            <span className="bg-foreground text-background text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">{t('admin.storeComponent.comingSoon')}</span>
                        </div>
                    )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                        <comp.icon size={16} className={isAdded ? "text-green-500" : "text-foreground"} />
                        <h3 className="font-bold text-sm text-foreground">{t(comp.titleKey as any)}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-6 leading-relaxed flex-1 line-clamp-2">{t(comp.descriptionKey as any)}</p>
                    <div className="mt-auto">
                        {isAdded ? (
                            <button disabled className="w-full py-2.5 bg-green-50 text-green-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-green-200">
                                <FiCheck size={16} /> {t('admin.storeComponent.installed')}
                            </button>
                        ) : (
                            <button
                                disabled={!comp.isAvailable}
                                onClick={() => setSelectedType(comp)}
                                className="w-full py-2.5 bg-foreground text-background font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md hover:bg-gray-800 hover:shadow-xl disabled:bg-gray-200 disabled:text-muted-foreground/80 disabled:shadow-none transition-all active:scale-95"
                            >
                                <FiPlus size={14} /> {t('admin.storeComponent.add')}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-background rounded-[2rem] shadow-2xl w-full max-w-[1100px] h-[85vh] max-h-[900px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="px-8 py-6 border-b border-border flex justify-between items-center bg-background sticky top-0 z-10">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
                            <span className="p-2 bg-foreground text-background rounded-xl shadow-lg ring-1 ring-black/5"><FiLayout size={20} /></span>
                            {t('admin.storeComponent.title')}
                        </h2>
                        <p className="text-muted-foreground text-sm font-medium mt-1">{t('admin.storeComponent.subtitle')} <span className="text-foreground font-bold uppercase underline underline-offset-4 decoration-[#C5A059]">{t(`admin.pages.desc_${pageType}` as any) || pageType}</span></p>
                    </div>
                    <button onClick={onClose} className="p-3 text-muted-foreground/80 hover:bg-muted/80 hover:text-foreground rounded-full transition-all">
                        <FiX size={24} />
                    </button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar */}
                    {!selectedType && (
                        <div className="w-64 border-r border-border bg-muted/20 p-6 space-y-2 hidden md:block">
                            {(['recommended', 'basics', 'products', 'content'] as const).map((cat) => {
                                const Icon = categoryIcons[cat];
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                                            activeCategory === cat 
                                            ? 'bg-foreground text-background shadow-lg shadow-foreground/10 translate-x-1' 
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                        }`}
                                    >
                                        <Icon size={18} />
                                        {t(`admin.storeComponent.cat_${cat}` as any) || cat.charAt(0).toUpperCase() + cat.slice(1)}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {selectedType ? (
                        <div className="flex-1 overflow-y-auto p-8 bg-muted/50 custom-scrollbar fade-in animate-in">
                            <button onClick={() => setSelectedType(null)} className="text-sm font-bold text-muted-foreground hover:text-foreground mb-6 flex items-center gap-2">
                                <FiX size={16} /> Geri Dön
                            </button>
                            
                            <div className="bg-background p-6 rounded-2xl shadow-sm border border-border mb-8">
                                <h3 className="text-base font-bold text-foreground mb-2 flex items-center gap-2">
                                    <FiPlus /> {t('admin.storeComponent.createNew')}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Mevcut bir tasarıma bağlı kalmadan, tamamen esnek yeni bir bileşen varyasyonu ekleyin.
                                </p>
                                <div className="flex gap-3">
                                    <input 
                                        type="text" 
                                        value={newInstanceName}
                                        onChange={(e) => setNewInstanceName(e.target.value)}
                                        placeholder={t('admin.storeComponent.instanceNamePlaceholder') || "E.g., Yaz Kampanyası"}
                                        className="flex-1 bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                                    />
                                    <button 
                                        disabled={!newInstanceName.trim() || isCreating}
                                        onClick={async () => {
                                            if (!newInstanceName.trim()) return;
                                            setIsCreating(true);
                                            try {
                                                const result = await dispatch(createComponentInstance({ type: selectedType.id, name: newInstanceName.trim() })).unwrap();
                                                onAdd(`${selectedType.id}_instance_${result._id}`);
                                            } catch (e) {
                                                console.error(e);
                                            } finally {
                                                setIsCreating(false);
                                            }
                                        }}
                                        className="px-6 py-2.5 bg-foreground text-background rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
                                    >
                                        {isCreating ? t('admin.storeComponent.creating') || 'Oluşturuluyor...' : t('admin.storeComponent.confirmAdd') || 'Sayfaya Ekle'}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-background p-6 rounded-2xl shadow-sm border border-border">
                                <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                                    <FiCheck /> {t('admin.storeComponent.useExisting')}
                                </h3>
                                {isLoading ? (
                                    <div className="flex justify-center p-8 opacity-50"><FiGrid className="animate-spin" size={24} /></div>
                                ) : instances.length > 0 ? (
                                    <div className="space-y-3">
                                        {instances.map(inst => (
                                            <div key={inst._id} className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-foreground/20 transition-all bg-foreground/[0.02]">
                                                <div>
                                                    <p className="font-bold text-sm text-foreground">{inst.name}</p>
                                                    <p className="text-[10px] text-muted-foreground">Son güncelleme: {new Date(inst.updatedAt).toLocaleDateString()}</p>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0 ml-4">
                                                    <button 
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            if (window.confirm(t('admin.storeComponent.deleteInstanceConfirm') || 'Bu tasarımı silmek istediğinizden emin misiniz?')) {
                                                                try {
                                                                    await dispatch(deleteComponentInstance(inst._id)).unwrap();
                                                                } catch (err) {
                                                                    console.error('Failed to delete instance:', err);
                                                                }
                                                            }
                                                        }}
                                                        className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                        title={t('common.delete')}
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => onAdd(`${selectedType.id}_instance_${inst._id}`)}
                                                        className="px-4 py-2 text-xs font-bold bg-foreground/5 text-foreground hover:bg-foreground hover:text-background rounded-lg transition-colors border border-foreground/10"
                                                    >
                                                        {t('admin.storeComponent.selectExisting') || 'Bu Tasarımı Kullan'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic p-4 bg-foreground/5 rounded-xl border border-dashed border-foreground/20 text-center">
                                        {t('admin.storeComponent.noInstances') || 'Henüz kaydedilmiş bir tasarım bulunamadı.'}
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto p-8 bg-muted/50 custom-scrollbar fade-in animate-in pb-20">
                            <div>
                                <div className="flex items-center gap-4 mb-6">
                                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C5A059]">
                                        {t(`admin.storeComponent.cat_${activeCategory}` as any) || activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}
                                    </h3>
                                    <div className="h-px flex-1 bg-gray-200"></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {filteredComponents.map(renderCard)}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
