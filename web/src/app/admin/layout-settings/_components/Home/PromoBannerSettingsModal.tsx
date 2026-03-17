'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
    fetchAdminBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    updateHomeSettings,
    updateProductSettings,
    Banner
} from '@/lib/slices/contentSlice';
import { FiImage, FiX, FiCheck, FiPlus, FiSave, FiTrash2, FiLayout, FiMaximize, FiGrid } from 'react-icons/fi';
import ImageUpload from '@/components/ImageUpload';
import { useTranslation } from '@/hooks/useTranslation';

export default function PromoBannerSettingsModal({ onClose, onUpdate, isProductPage }: { onClose: () => void; onUpdate: () => void; isProductPage?: boolean }) {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { banners, homeSettings, productSettings, isLoading } = useAppSelector((state) => state.content);

    const [showNewForm, setShowNewForm] = useState(false);
    const [layout, setLayout] = useState<'classic' | 'split' | 'minimal'>(() => {
        return homeSettings?.bannerLayout || 'classic';
    });

    useEffect(() => {
        dispatch(fetchAdminBanners());
    }, [dispatch]);

    const gridBanners = banners.filter(b => b.section === 'grid').sort((a, b) => (a.order || 0) - (b.order || 0));

    const handleLayoutSave = async () => {
        try {
            await dispatch(updateHomeSettings({ ...homeSettings, bannerLayout: layout })).unwrap();
            onUpdate();
            alert(t('admin.saveSuccess'));
        } catch (err) {
            alert(t('admin.saveError'));
        }
    };

    // --- Sub-component for individual banner editing ---
    const BannerItemForm = ({ banner, isNew = false, onCancel }: { banner: Partial<Banner>, isNew?: boolean, onCancel?: () => void }) => {
        const [localData, setLocalData] = useState(banner);
        const [isSaving, setIsSaving] = useState(false);

        const onSaveAction = async (e: React.FormEvent) => {
            e.preventDefault();
            setIsSaving(true);
            try {
                if (isNew) {
                    await dispatch(createBanner({ ...localData, section: 'grid' as any })).unwrap();
                    setShowNewForm(false);
                } else {
                    await dispatch(updateBanner({ id: localData._id!, data: localData })).unwrap();
                }
                onUpdate();
                alert(t('admin.saveSuccess'));
            } catch (err) {
                alert(t('admin.saveError'));
            } finally {
                setIsSaving(false);
            }
        };

        const onDeleteAction = async () => {
            if (!confirm(t('admin.promo.deleteConfirm'))) return;
            try {
                await dispatch(deleteBanner(localData._id!)).unwrap();
                onUpdate();
            } catch (err) {
                alert(t('admin.deleteError'));
            }
        };

        return (
            <form onSubmit={onSaveAction} className={`space-y-6 border p-6 rounded-2xl bg-background shadow-sm transition-all hover:shadow-md ${isNew ? 'border-dashed border-blue-400 bg-blue-50/10' : 'border-border'}`}>
                <div className="flex justify-between items-center pb-4 border-b border-border">
                    <h4 className="font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                        {isNew ? <span className="text-blue-600 flex items-center gap-2"><FiPlus /> {t('admin.promo.newPromo')}</span> : <span>{t('admin.promo.banner')}: {localData.title || t('admin.promo.draft')}</span>}
                    </h4>
                    <div className="flex gap-2">
                        {!isNew && (
                            <button type="button" onClick={onDeleteAction} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                <FiTrash2 size={16} />
                            </button>
                        )}
                        {isNew && (
                            <button type="button" onClick={onCancel} className="p-2 text-muted-foreground/80 hover:text-foreground">
                                <FiX size={16} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid md:grid-cols-12 gap-8">
                    <div className="md:col-span-8 space-y-6">
                        <div className="grid grid-cols-4 gap-4">
                            <div className="col-span-3">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">{t('admin.promo.heroTitle')}</label>
                                <input className="w-full p-2.5 bg-muted border border-border rounded-lg text-sm focus:bg-background focus:ring-2 focus:ring-black/5" value={localData.title} onChange={e => setLocalData({ ...localData, title: e.target.value })} required />
                            </div>
                            <div className="col-span-1">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">{t('admin.promo.priority')}</label>
                                <input type="number" className="w-full p-2.5 bg-muted border border-border rounded-lg text-sm" value={localData.order} onChange={e => setLocalData({ ...localData, order: parseInt(e.target.value) })} />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">{t('admin.promo.subheading')}</label>
                            <textarea className="w-full p-2.5 bg-muted border border-border rounded-lg text-sm resize-none" rows={2} value={localData.description} onChange={e => setLocalData({ ...localData, description: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div>
                                <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">{t('admin.promo.buttonLabel')}</label>
                                <input className="w-full p-2.5 bg-muted border border-border rounded-lg text-sm" value={localData.buttonText} onChange={e => setLocalData({ ...localData, buttonText: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">{t('admin.promo.destPath')}</label>
                                <input className="w-full p-2.5 bg-muted border border-border rounded-lg text-sm" value={localData.buttonUrl} onChange={e => setLocalData({ ...localData, buttonUrl: e.target.value })} placeholder={t('admin.promo.destPlaceholder')} />
                            </div>
                        </div>
                    </div>
                    <div className="md:col-span-4 space-y-4">
                        <div className="p-1 bg-muted rounded-xl border border-border flex justify-center scale-90 origin-top h-[180px]">
                            <ImageUpload value={localData.image} onChange={url => setLocalData({ ...localData, image: url })} required isBanner />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase text-muted-foreground/80 mb-1 block">{t('admin.promo.status')}</label>
                            <select className="w-full p-2.5 bg-muted border border-border rounded-lg text-sm" value={localData.status} onChange={e => setLocalData({ ...localData, status: e.target.value as any })}>
                                <option value="active">{t('admin.promo.active')}</option>
                                <option value="inactive">{t('admin.promo.inactive')}</option>
                            </select>
                        </div>
                        <button type="submit" disabled={isSaving} className="w-full py-2.5 bg-foreground text-background rounded-xl text-xs font-bold hover:bg-gray-800 disabled:bg-gray-400 flex items-center justify-center gap-2">
                            {isSaving ? t('admin.saving') : <><FiSave /> {t('admin.promo.saveBanner')}</>}
                        </button>
                    </div>
                </div>
            </form>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4">
            <div className="bg-background rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">
                <div className="p-6 border-b border-border flex justify-between items-center bg-background z-10 shrink-0">
                    <div>
                        <h3 className="font-bold text-lg">{t('admin.promo.title')}</h3>
                        <p className="text-xs text-muted-foreground/80 font-medium">{t('admin.promo.desc')}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted/80 rounded-full text-muted-foreground/80 hover:text-foreground transition-colors">
                        <FiX size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-muted/30">
                    <div className="space-y-6">

                        {/* Layout Selector */}
                        <div className="bg-background p-6 rounded-2xl border border-border shadow-sm">
                            <h4 className="font-bold text-sm mb-4">{t('admin.promo.layoutStyle')}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { id: 'classic', label: t('admin.promo.classic'), icon: FiMaximize, desc: t('admin.promo.classicDesc') },
                                    { id: 'split', label: t('admin.promo.split'), icon: FiLayout, desc: t('admin.promo.splitDesc') },
                                    { id: 'minimal', label: t('admin.promo.minimal'), icon: FiGrid, desc: t('admin.promo.minimalDesc') }
                                ].map(lt => (
                                    <button
                                        key={lt.id}
                                        onClick={() => setLayout(lt.id as any)}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${layout === lt.id ? 'border-foreground bg-muted shadow-inner' : 'border-border hover:border-border bg-background'}`}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${layout === lt.id ? 'bg-foreground text-background' : 'bg-muted/80 text-muted-foreground/80'}`}>
                                                <lt.icon size={16} />
                                            </div>
                                            <h5 className="font-bold text-sm text-foreground">{lt.label}</h5>
                                            {layout === lt.id && <FiCheck className="ml-auto text-foreground" size={16} />}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{lt.desc}</p>
                                    </button>
                                ))}
                            </div>
                            {layout !== (homeSettings?.bannerLayout || 'classic') && (
                                <div className="mt-4 pt-4 border-t border-border flex justify-end">
                                    <button
                                        onClick={handleLayoutSave}
                                        className="px-6 py-2.5 bg-foreground text-background rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors"
                                    >
                                        {t('admin.promo.saveLayout')}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center bg-background p-4 rounded-2xl border border-border shadow-sm mt-8">
                            <div>
                                <h4 className="font-bold text-sm">{t('admin.promo.activePromos')}</h4>
                                <p className="text-[10px] text-muted-foreground/80">{t('admin.promo.managePromos')}</p>
                            </div>
                            <button onClick={() => setShowNewForm(true)} className="px-4 py-2 bg-foreground text-background rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg hover:bg-gray-800 transition-all">
                                <FiPlus /> {t('admin.promo.addNew')}
                            </button>
                        </div>

                        {showNewForm && (
                            <BannerItemForm
                                isNew
                                banner={{ title: '', description: '', image: '', buttonText: t('common.discover'), buttonUrl: '/collections', order: gridBanners.length + 1, status: 'active' }}
                                onCancel={() => setShowNewForm(false)}
                            />
                        )}

                        <div className="space-y-4">
                            {gridBanners.map((banner, idx) => (
                                <BannerItemForm key={banner._id || idx} banner={banner} />
                            ))}
                            {gridBanners.length === 0 && !showNewForm && (
                                <div className="text-center py-20 bg-background rounded-2xl border border-dashed border-border">
                                    <h4 className="font-bold text-muted-foreground/80">{t('admin.promo.noPromos')}</h4>
                                    <p className="text-xs text-muted-foreground/80 mt-2">{t('admin.promo.clickAdd')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
