'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCmsStore } from '@/lib/store/useCmsStore';
import { useContentStore } from '@/lib/store/useContentStore';
import { Banner } from '@/types/content';
import {
    FiLayout, FiX, FiMonitor, FiImage, FiCheck,
    FiPlus, FiSave, FiTrash2, FiType, FiAlignLeft, FiMousePointer, FiAlertTriangle
} from 'react-icons/fi';
import ImageUpload from '@/components/ImageUpload';
import VideoUpload from '@/components/VideoUpload';
import { useTranslation } from '@/hooks/useTranslation';

import * as Sections from '@/types/sections';

export default function BannerEditorModal({ onClose, onUpdate, instanceId }: { onClose: () => void; onUpdate: () => void; instanceId?: string }) {
    const { t } = useTranslation();
    const tUnsafe = useCallback(
        (key: string, variables?: Record<string, string | number>) => t(key as never, variables),
        [t]
    );
    const { banners, homeSettings, updateHomeSettings, fetchAdminBanners, createBanner, updateBanner, deleteBanner } = useContentStore();
    const { instances, updateInstance } = useCmsStore();

    const instance = instanceId ? instances.find(i => i._id === instanceId) : null;

    // Local UI State
    const [showNewForm, setShowNewForm] = useState(false);
    const [videoSettings, setVideoSettings] = useState({
        heroVideoUrl: '', heroImageUrl: '', heroTitle: '', heroDescription: '', heroButtonText: '', heroButtonUrl: ''
    });
    const [visibilitySettings, setVisibilitySettings] = useState({
        heroShowTitle: true,
        heroShowDescription: true,
        heroShowButton: true
    });
    const [isSavingVisibility, setIsSavingVisibility] = useState(false);

    useEffect(() => {
        fetchAdminBanners();
    }, [fetchAdminBanners]);

    useEffect(() => {
        if (instanceId && instance) {
            const data = instance.data as Sections.HeroData;
            setVideoSettings({
                heroVideoUrl: data?.heroVideoUrl || '',
                heroImageUrl: data?.heroImageUrl || '',
                heroTitle: data?.heroTitle || '',
                heroDescription: data?.heroDescription || '',
                heroButtonText: data?.heroButtonText || '',
                heroButtonUrl: data?.heroButtonUrl || ''
            });
            setVisibilitySettings({
                heroShowTitle: data?.heroShowTitle !== false,
                heroShowDescription: data?.heroShowDescription !== false,
                heroShowButton: data?.heroShowButton !== false
            });
        } else if (homeSettings) {
            setVideoSettings({
                heroVideoUrl: homeSettings.heroVideoUrl || '',
                heroImageUrl: homeSettings.heroImageUrl || '',
                heroTitle: homeSettings.heroTitle || '',
                heroDescription: homeSettings.heroDescription || '',
                heroButtonText: homeSettings.heroButtonText || '',
                heroButtonUrl: homeSettings.heroButtonUrl || ''
            });
            setVisibilitySettings({
                heroShowTitle: homeSettings.heroShowTitle !== false,
                heroShowDescription: homeSettings.heroShowDescription !== false,
                heroShowButton: homeSettings.heroShowButton !== false
            });
        }
    }, [homeSettings, instance, instanceId]);

    const handleLayoutChange = async (layout: 'video' | 'slider' | 'split') => {
        try {
            if (instanceId) {
                await updateInstance(instanceId, { ...instance?.data, heroLayout: layout });
            } else if (homeSettings) {
                await updateHomeSettings({ ...homeSettings, heroLayout: layout });
            }
            onUpdate();
            alert(t('admin.banners.layoutUpdateSuccess'));
        } catch (e) {
            console.error(e);
            alert(t('admin.saveError'));
        }
    };

    const handleSaveVideoSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (instanceId) {
                await updateInstance(instanceId, { ...instance?.data, ...videoSettings });
            } else if (homeSettings) {
                await updateHomeSettings({ ...homeSettings, ...videoSettings });
            }
            onUpdate();
            alert(t('admin.banners.videoSaveSuccess'));
        } catch (e) {
            console.error(e);
            alert(t('admin.saveError'));
        }
    };

    const handleSaveVisibility = async () => {
        setIsSavingVisibility(true);
        try {
            if (instanceId) {
                await updateInstance(instanceId, { ...instance?.data, ...visibilitySettings });
            } else if (homeSettings) {
                await updateHomeSettings({ ...homeSettings, ...visibilitySettings });
            }
            onUpdate();
            alert(t('admin.banners.visibilitySaveSuccess'));
        } catch (e) {
            console.error(e);
            alert(t('admin.saveError'));
        } finally {
            setIsSavingVisibility(false);
        }
    };

    const activeLayout = instanceId ? ((instance?.data as Sections.HeroData)?.heroLayout || 'video') : (homeSettings?.heroLayout || 'video');
    const layoutModes = ['video', 'slider', 'split'] as const;
    const targetSection = instanceId ? `instance_${instanceId}` : (activeLayout === 'split' ? 'hero_split' : 'hero');
    const heroBanners = banners.filter(b => b.section === targetSection).sort((a, b) => (a.order || 0) - (b.order || 0));

    // --- Sub-component for individual banner editing ---
    const BannerItemForm = ({ banner, isNew = false, onCancel }: { banner: Partial<Banner>, isNew?: boolean, onCancel?: () => void }) => {
        const [localData, setLocalData] = useState(banner);
        const [isSaving, setIsSaving] = useState(false);
        const hasChanges = isNew || JSON.stringify(localData) !== JSON.stringify(banner);

        const onSaveAction = async (e: React.FormEvent) => {
            e.preventDefault();
            setIsSaving(true);
            try {
                if (isNew) {
                    await createBanner({ ...localData, section: targetSection });
                    setShowNewForm(false);
                } else {
                    await updateBanner(localData._id!, localData);
                }
                onUpdate();
                alert(t('admin.saveSuccess'));
            } catch (_err) {
                alert(t('admin.saveError'));
            } finally {
                setIsSaving(false);
            }
        };

        const onDeleteAction = async () => {
            if (!confirm(t('admin.deleteConfirm'))) return;
            try {
                await deleteBanner(localData._id!);
                onUpdate();
            } catch (_err) {
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
                                <input id="banner-title" name="banner-title" className="w-full p-2.5 bg-muted border border-border rounded-lg text-sm focus:bg-background focus:ring-2 focus:ring-black/5" value={localData.title} onChange={e => setLocalData({ ...localData, title: e.target.value })} required />
                            </div>
                            <div className="col-span-1">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">{t('admin.banners.priority')}</label>
                                <input id="banner-order" name="banner-order" type="number" className="w-full p-2.5 bg-muted border border-border rounded-lg text-sm" value={localData.order} onChange={e => setLocalData({ ...localData, order: parseInt(e.target.value) })} />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">{t('admin.banners.shortDesc')}</label>
                            <textarea id="banner-description" name="banner-description" className="w-full p-2.5 bg-muted border border-border rounded-lg text-sm resize-none" rows={2} value={localData.description} onChange={e => setLocalData({ ...localData, description: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div>
                                <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">{t('admin.banners.buttonLabel')}</label>
                                <input id="banner-button-text" name="banner-button-text" className="w-full p-2.5 bg-muted border border-border rounded-lg text-sm" value={localData.buttonText} onChange={e => setLocalData({ ...localData, buttonText: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">{t('admin.banners.buttonUrl')}</label>
                                <input id="banner-button-url" name="banner-button-url" className="w-full p-2.5 bg-muted border border-border rounded-lg text-sm" value={localData.buttonUrl} onChange={e => setLocalData({ ...localData, buttonUrl: e.target.value })} />
                            </div>
                        </div>
                    </div>
                    <div className="md:col-span-4 space-y-4">
                        <div className="p-1 bg-muted rounded-xl border border-border flex justify-center scale-90 origin-top">
                            <ImageUpload value={localData.image} onChange={url => setLocalData({ ...localData, image: url })} required isBanner />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase text-muted-foreground/80 mb-1 block">{t('admin.banners.status')}</label>
                            <select className="w-full p-2.5 bg-muted border border-border rounded-lg text-sm" value={localData.status} onChange={e => setLocalData({ ...localData, status: e.target.value as Banner['status'] })}>
                                <option value="active">{t('admin.banners.active')}</option>
                                <option value="inactive">{t('admin.banners.inactive')}</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            disabled={isSaving || !hasChanges}
                            className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
                                hasChanges
                                    ? 'bg-emerald-600 text-white shadow-md hover:bg-emerald-700'
                                    : 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400'
                            } disabled:opacity-70`}
                        >
                            {isSaving ? (
                                t('admin.saving')
                            ) : (
                                <>
                                    <FiSave />
                                    {isNew
                                        ? t('admin.banners.saveNewSlide')
                                        : hasChanges
                                            ? t('admin.banners.saveChanges')
                                            : t('admin.banners.noChanges')}
                                </>
                            )}
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
                                {layoutModes.map((mode) => (
                                    <button
                                        key={mode}
                                        onClick={() => handleLayoutChange(mode)}
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
                                            <h4 className="font-bold text-xs uppercase mb-0.5">{tUnsafe(`admin.banners.${mode}`)}</h4>
                                            <p className="text-[10px] text-muted-foreground/80 leading-tight">
                                                {mode === 'video' && t('admin.banners.cinematic')}
                                                {mode === 'slider' && t('admin.banners.carousel')}
                                                {mode === 'split' && t('admin.banners.split_desc')}
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

                        {/* Hero content visibility */}
                        <div className="mb-8 rounded-2xl border border-border bg-background p-5 shadow-sm">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
                                            {t('admin.banners.contentVisibility')}
                                        </h3>
                                        <p className="mt-1 text-[11px] text-muted-foreground/80">
                                            {t('admin.banners.contentVisibilityDesc')}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {([
                                            { key: 'heroShowTitle', label: t('admin.banners.showTitle'), icon: FiType },
                                            { key: 'heroShowDescription', label: t('admin.banners.showDescription'), icon: FiAlignLeft },
                                            { key: 'heroShowButton', label: t('admin.banners.showButton'), icon: FiMousePointer }
                                        ] as const).map(({ key, label, icon: Icon }) => {
                                            const isEnabled = visibilitySettings[key];
                                            return (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    role="switch"
                                                    aria-checked={isEnabled}
                                                    onClick={() => setVisibilitySettings(current => ({ ...current, [key]: !current[key] }))}
                                                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                                                        isEnabled
                                                            ? 'border-foreground bg-foreground text-background'
                                                            : 'border-border bg-muted/40 text-muted-foreground hover:border-foreground/30'
                                                    }`}
                                                >
                                                    <Icon size={16} />
                                                    <span className="text-xs font-bold">{label}</span>
                                                    <span className={`relative ml-2 h-5 w-9 rounded-full transition-colors ${
                                                        isEnabled ? 'bg-background/30' : 'bg-foreground/15'
                                                    }`}>
                                                        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-background shadow transition-transform ${
                                                            isEnabled ? 'translate-x-[18px]' : 'translate-x-0.5'
                                                        }`} />
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleSaveVisibility}
                                    disabled={isSavingVisibility}
                                    className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3 text-xs font-bold text-background transition-opacity disabled:opacity-50"
                                >
                                    <FiSave />
                                    {isSavingVisibility ? t('admin.saving') : t('admin.banners.visibilitySave')}
                                </button>
                            </div>
                        </div>

                        {/* 2. Content Editor (Dynamic based on selection) */}
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="mb-4 px-1 border-t border-border pt-8">
                                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
                                    {tUnsafe('admin.banners.editContent', { layout: tUnsafe(`admin.banners.${activeLayout}`) })}
                                </h3>
                            </div>

                            {(activeLayout === 'video' || activeLayout === 'split') && (
                                <form onSubmit={handleSaveVideoSettings} className="bg-background p-6 rounded-2xl border border-border shadow-sm space-y-6">
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-bold uppercase text-muted-foreground/80 mb-1 block">{t('admin.banners.overlayHeading')}</label>
                                                <input id="hero-title" name="hero-title" className="input-field w-full p-3 border rounded-xl" value={videoSettings.heroTitle} onChange={e => setVideoSettings({ ...videoSettings, heroTitle: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold uppercase text-muted-foreground/80 mb-1 block">{t('admin.banners.narrative')}</label>
                                                <textarea id="hero-description" name="hero-description" className="input-field w-full p-3 border rounded-xl" rows={3} value={videoSettings.heroDescription} onChange={e => setVideoSettings({ ...videoSettings, heroDescription: e.target.value })} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] font-bold uppercase text-muted-foreground/80 mb-1 block">{t('admin.banners.ctaText')}</label>
                                                    <input id="hero-btn-text" name="hero-btn-text" className="input-field w-full p-3 border rounded-xl" value={videoSettings.heroButtonText} onChange={e => setVideoSettings({ ...videoSettings, heroButtonText: e.target.value })} />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold uppercase text-muted-foreground/80 mb-1 block">{t('admin.banners.ctaLink')}</label>
                                                    <input id="hero-btn-url" name="hero-btn-url" className="input-field w-full p-3 border rounded-xl" value={videoSettings.heroButtonUrl} onChange={e => setVideoSettings({ ...videoSettings, heroButtonUrl: e.target.value })} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            {activeLayout === 'video' ? (
                                                <>
                                                    <label className="text-[10px] font-bold uppercase text-muted-foreground/80 mb-1 block">{t('admin.banners.videoUpload')}</label>
                                                    <VideoUpload
                                                        value={videoSettings.heroVideoUrl}
                                                        onChange={url => setVideoSettings({ ...videoSettings, heroVideoUrl: url })}
                                                    />
                                                    <div>
                                                        <label className="text-[10px] font-bold uppercase text-muted-foreground/80 mb-2 block">{t('admin.banners.heroImageFallback') || 'Hero Image (Video Fallback)'}</label>
                                                        <ImageUpload
                                                            value={videoSettings.heroImageUrl}
                                                            onChange={url => setVideoSettings({ ...videoSettings, heroImageUrl: url })}
                                                            isBanner
                                                        />
                                                    </div>
                                                </>
                                            ) : (
                                                <div>
                                                    <label className="text-[10px] font-bold uppercase text-muted-foreground/80 mb-2 block">{t('admin.banners.imageSelection') || 'Görsel Seçimi'}</label>
                                                    <ImageUpload
                                                        value={videoSettings.heroImageUrl}
                                                        onChange={url => setVideoSettings({ ...videoSettings, heroImageUrl: url })}
                                                        isBanner
                                                    />
                                                </div>
                                            )}
                                            <button type="submit" className="w-full py-3 bg-foreground text-background rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
                                                <FiSave /> {activeLayout === 'video' ? t('admin.banners.updateVideo') : (t('admin.banners.saveConfig') || 'Ayarları Kaydet')}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}

                            {activeLayout === 'slider' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center bg-background p-4 rounded-2xl border border-border shadow-sm">
                                        <div>
                                            <h4 className="font-bold text-sm">{t('admin.banners.activeBanners')}</h4>
                                            <p className="text-[10px] text-muted-foreground/80">{t('admin.banners.manageSlides')}</p>
                                        </div>
                                        <button
                                            onClick={() => setShowNewForm(true)}
                                            disabled={showNewForm}
                                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                                                showNewForm
                                                    ? 'cursor-not-allowed border border-amber-200 bg-amber-50 text-amber-700'
                                                    : 'bg-foreground text-background shadow-lg hover:bg-gray-800'
                                            }`}
                                        >
                                            {showNewForm ? <FiAlertTriangle /> : <FiPlus />}
                                            {showNewForm ? t('admin.banners.finishCurrentSlide') : t('admin.banners.addNew')}
                                        </button>
                                    </div>

                                    {showNewForm && (
                                        <>
                                            <div
                                                role="alert"
                                                className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900"
                                            >
                                                <FiAlertTriangle className="mt-0.5 shrink-0" size={18} />
                                                <div>
                                                    <p className="text-xs font-bold">{t('admin.banners.finishCurrentSlide')}</p>
                                                    <p className="mt-1 text-[11px] leading-relaxed text-amber-800">
                                                        {t('admin.banners.finishCurrentSlideDesc')}
                                                    </p>
                                                </div>
                                            </div>
                                            <BannerItemForm
                                                isNew
                                                banner={{ title: '', description: '', image: '', buttonText: t('common.discover'), buttonUrl: '/collections', order: heroBanners.length + 1, status: 'active' }}
                                                onCancel={() => setShowNewForm(false)}
                                            />
                                        </>
                                    )}

                                    <div className="space-y-4">
                                        {heroBanners.map((banner, idx) => (
                                            <BannerItemForm key={banner._id || idx} banner={banner} />
                                        ))}
                                        {heroBanners.length === 0 && !showNewForm && (
                                            <div className="text-center py-16 bg-background rounded-2xl border border-dashed border-border">
                                                <FiImage className="mx-auto text-gray-200 mb-3" size={32} />
                                                <p className="text-muted-foreground/80 text-sm font-medium">
                                                    {tUnsafe('admin.banners.noBanners', { layout: tUnsafe(`admin.banners.${activeLayout}`) })}
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
