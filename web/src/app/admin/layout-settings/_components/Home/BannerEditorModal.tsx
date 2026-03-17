'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
    fetchAdminBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    updateHomeSettings,
    Banner
} from '@/lib/slices/contentSlice';
import {
    FiLayout, FiLayers, FiX, FiMonitor, FiImage, FiCheck,
    FiPlus, FiSave, FiTrash2
} from 'react-icons/fi';
import ImageUpload from '@/components/ImageUpload';
import VideoUpload from '@/components/VideoUpload';
import { GlobalSettings } from '@/lib/slices/contentSlice';
import { useTranslation } from '@/hooks/useTranslation';

export default function BannerEditorModal({ onClose, onUpdate }: { onClose: () => void; onUpdate: () => void }) {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { banners, isLoading, homeSettings } = useAppSelector((state) => state.content);

    // Local UI State
    const [activeTab, setActiveTab] = useState('content'); // 'layout' or 'content'
    const [showNewForm, setShowNewForm] = useState(false);
    const [videoSettings, setVideoSettings] = useState({
        heroVideoUrl: '', heroTitle: '', heroDescription: '', heroButtonText: '', heroButtonUrl: ''
    });

    useEffect(() => {
        dispatch(fetchAdminBanners());
    }, [dispatch]);

    useEffect(() => {
        if (homeSettings) {
            setVideoSettings({
                heroVideoUrl: homeSettings.heroVideoUrl || '',
                heroTitle: homeSettings.heroTitle || '',
                heroDescription: homeSettings.heroDescription || '',
                heroButtonText: homeSettings.heroButtonText || '',
                heroButtonUrl: homeSettings.heroButtonUrl || ''
            });
        }
    }, [homeSettings]);

    const handleLayoutChange = async (layout: 'video' | 'slider' | 'split') => {
        if (!homeSettings) return;
        try {
            await dispatch(updateHomeSettings({ ...homeSettings, heroLayout: layout })).unwrap();
            onUpdate();
            alert(t('admin.banners.layoutUpdateSuccess'));
        } catch (e) {
            console.error(e);
            alert(t('admin.saveError'));
        }
    };

    const handleSaveVideoSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!homeSettings) return;
        try {
            await dispatch(updateHomeSettings({ ...homeSettings, ...videoSettings })).unwrap();
            onUpdate();
            alert(t('admin.banners.videoSaveSuccess'));
        } catch (e) {
            console.error(e);
            alert(t('admin.saveError'));
        }
    };

    const activeLayout = homeSettings?.heroLayout || 'video';
    const targetSection = activeLayout === 'split' ? 'hero_split' : 'hero';
    const heroBanners = banners.filter(b => b.section === targetSection).sort((a, b) => (a.order || 0) - (b.order || 0));

    // --- Sub-component for individual banner editing ---
    const BannerItemForm = ({ banner, isNew = false, onCancel }: { banner: Partial<Banner>, isNew?: boolean, onCancel?: () => void }) => {
        const [localData, setLocalData] = useState(banner);
        const [isSaving, setIsSaving] = useState(false);

        const onSaveAction = async (e: React.FormEvent) => {
            e.preventDefault();
            setIsSaving(true);
            try {
                if (isNew) {
                    await dispatch(createBanner({ ...localData, section: targetSection as any })).unwrap();
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
            if (!confirm(t('admin.deleteConfirm'))) return;
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
                        {isNew ? <span className="text-blue-600 flex items-center gap-2"><FiPlus /> {t('admin.banners.newSlide')}</span> : <span>{t('admin.banners.slide')}: {localData.title || t('admin.banners.draft')}</span>}
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
                                <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">{t('admin.banners.headingTitle')}</label>
                                <input className="w-full p-2.5 bg-muted border border-border rounded-lg text-sm focus:bg-background focus:ring-2 focus:ring-black/5" value={localData.title} onChange={e => setLocalData({ ...localData, title: e.target.value })} required />
                            </div>
                            <div className="col-span-1">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">{t('admin.banners.priority')}</label>
                                <input type="number" className="w-full p-2.5 bg-muted border border-border rounded-lg text-sm" value={localData.order} onChange={e => setLocalData({ ...localData, order: parseInt(e.target.value) })} />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">{t('admin.banners.shortDesc')}</label>
                            <textarea className="w-full p-2.5 bg-muted border border-border rounded-lg text-sm resize-none" rows={2} value={localData.description} onChange={e => setLocalData({ ...localData, description: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div>
                                <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">{t('admin.banners.buttonLabel')}</label>
                                <input className="w-full p-2.5 bg-muted border border-border rounded-lg text-sm" value={localData.buttonText} onChange={e => setLocalData({ ...localData, buttonText: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">{t('admin.banners.buttonUrl')}</label>
                                <input className="w-full p-2.5 bg-muted border border-border rounded-lg text-sm" value={localData.buttonUrl} onChange={e => setLocalData({ ...localData, buttonUrl: e.target.value })} />
                            </div>
                        </div>
                    </div>
                    <div className="md:col-span-4 space-y-4">
                        <div className="p-1 bg-muted rounded-xl border border-border flex justify-center scale-90 origin-top">
                            <ImageUpload value={localData.image} onChange={url => setLocalData({ ...localData, image: url })} required isBanner />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase text-muted-foreground/80 mb-1 block">{t('admin.banners.status')}</label>
                            <select className="w-full p-2.5 bg-muted border border-border rounded-lg text-sm" value={localData.status} onChange={e => setLocalData({ ...localData, status: e.target.value as any })}>
                                <option value="active">{t('admin.banners.active')}</option>
                                <option value="inactive">{t('admin.banners.inactive')}</option>
                            </select>
                        </div>
                        <button type="submit" disabled={isSaving} className="w-full py-2.5 bg-foreground text-background rounded-xl text-xs font-bold hover:bg-gray-800 disabled:bg-gray-400 flex items-center justify-center gap-2">
                            {isSaving ? t('admin.saving') : <><FiSave /> {t('admin.banners.saveSlide')}</>}
                        </button>
                    </div>
                </div>
            </form>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4">
            <div className="bg-background rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col md:flex-row overflow-hidden">


                {/* Main Content */}
                <div className="flex-1 flex flex-col min-h-0 bg-background">
                    <div className="p-6 border-b border-border flex justify-between items-center bg-background z-10 shrink-0">
                        <div>
                            <h3 className="font-bold text-lg">{t('admin.banners.heroConfig')}</h3>
                            <p className="text-xs text-muted-foreground/80 font-medium">{t('admin.banners.heroDesc')}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-muted/80 rounded-full text-muted-foreground/80 hover:text-foreground transition-colors">
                            <FiX size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-muted/30">
                        {/* 1. Layout Selection */}
                        <div className="mb-8">
                            <div className="mb-4 px-1">
                                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">{t('admin.banners.selectStyle')}</h3>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                {['video', 'slider', 'split'].map(mode => (
                                    <button
                                        key={mode}
                                        onClick={() => handleLayoutChange(mode as any)}
                                        className={`relative overflow-hidden group p-4 rounded-xl border-2 transition-all text-left flex flex-col gap-3 ${activeLayout === mode
                                            ? 'border-foreground bg-background shadow-md ring-1 ring-black/5'
                                            : 'border-transparent bg-background shadow-sm hover:border-border opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${activeLayout === mode ? 'bg-foreground text-background' : 'bg-muted/80 text-muted-foreground/80'}`}>
                                            {mode === 'video' && <FiMonitor />}
                                            {mode === 'slider' && <FiImage />}
                                            {mode === 'split' && <FiLayout />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-xs uppercase mb-0.5">{t(`admin.banners.${mode}` as any)}</h4>
                                            <p className="text-[10px] text-muted-foreground/80 leading-tight">
                                                {mode === 'video' && t('admin.banners.cinematic')}
                                                {mode === 'slider' && t('admin.banners.carousel')}
                                                {mode === 'split' && t('admin.banners.split')}
                                            </p>
                                        </div>
                                        {activeLayout === mode && (
                                            <div className="absolute top-3 right-3 text-foreground">
                                                <FiCheck size={16} />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 2. Content Editor (Dynamic based on selection) */}
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="mb-4 px-1 border-t border-border pt-8">
                                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
                                    {t('admin.banners.editContent', { layout: t(`admin.banners.${activeLayout}` as any) })}
                                </h3>
                            </div>

                            {activeLayout === 'video' && (
                                <form onSubmit={handleSaveVideoSettings} className="bg-background p-6 rounded-2xl border border-border shadow-sm space-y-6">
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-bold uppercase text-muted-foreground/80 mb-1 block">{t('admin.banners.overlayHeading')}</label>
                                                <input className="input-field w-full p-3 border rounded-xl" value={videoSettings.heroTitle} onChange={e => setVideoSettings({ ...videoSettings, heroTitle: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold uppercase text-muted-foreground/80 mb-1 block">{t('admin.banners.narrative')}</label>
                                                <textarea className="input-field w-full p-3 border rounded-xl" rows={3} value={videoSettings.heroDescription} onChange={e => setVideoSettings({ ...videoSettings, heroDescription: e.target.value })} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] font-bold uppercase text-muted-foreground/80 mb-1 block">{t('admin.banners.ctaText')}</label>
                                                    <input className="input-field w-full p-3 border rounded-xl" value={videoSettings.heroButtonText} onChange={e => setVideoSettings({ ...videoSettings, heroButtonText: e.target.value })} />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold uppercase text-muted-foreground/80 mb-1 block">{t('admin.banners.ctaLink')}</label>
                                                    <input className="input-field w-full p-3 border rounded-xl" value={videoSettings.heroButtonUrl} onChange={e => setVideoSettings({ ...videoSettings, heroButtonUrl: e.target.value })} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-bold uppercase text-muted-foreground/80 mb-1 block">{t('admin.banners.videoUpload')}</label>
                                            <VideoUpload
                                                value={videoSettings.heroVideoUrl}
                                                onChange={url => setVideoSettings({ ...videoSettings, heroVideoUrl: url })}
                                            />
                                            <button type="submit" className="w-full py-3 bg-foreground text-background rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
                                                <FiSave /> {t('admin.banners.updateVideo')}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}

                            {(activeLayout === 'slider' || activeLayout === 'split') && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center bg-background p-4 rounded-2xl border border-border shadow-sm">
                                        <div>
                                            <h4 className="font-bold text-sm">{t('admin.banners.activeBanners')}</h4>
                                            <p className="text-[10px] text-muted-foreground/80">{t('admin.banners.manageSlides')}</p>
                                        </div>
                                        <button onClick={() => setShowNewForm(true)} className="px-4 py-2 bg-foreground text-background rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg hover:bg-gray-800 transition-all">
                                            <FiPlus /> {t('admin.banners.addNew')}
                                        </button>
                                    </div>

                                    {showNewForm && (
                                        <BannerItemForm
                                            isNew
                                            banner={{ title: '', description: '', image: '', buttonText: t('common.discover'), buttonUrl: '/collections', order: heroBanners.length + 1, status: 'active' }}
                                            onCancel={() => setShowNewForm(false)}
                                        />
                                    )}

                                    <div className="space-y-4">
                                        {heroBanners.map((banner, idx) => (
                                            <BannerItemForm key={banner._id || idx} banner={banner} />
                                        ))}
                                        {heroBanners.length === 0 && !showNewForm && (
                                            <div className="text-center py-16 bg-background rounded-2xl border border-dashed border-border">
                                                <FiImage className="mx-auto text-gray-200 mb-3" size={32} />
                                                <p className="text-muted-foreground/80 text-sm font-medium">
                                                    {t('admin.banners.noBanners', { layout: t(`admin.banners.${activeLayout}` as any) })}
                                                </p>
                                                <button onClick={() => setShowNewForm(true)} className="mt-4 text-xs font-bold text-blue-600 hover:underline">
                                                    {t('admin.banners.createFirst')}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
