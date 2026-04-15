'use client';

import { useState, useEffect } from 'react';
import { FiX, FiImage, FiVideo } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { updateAboutSettings } from '@/lib/slices/contentSlice';
import ImageUpload from '@/components/ImageUpload';
import VideoUpload from '@/components/VideoUpload';
import { useTranslation } from '@/hooks/useTranslation';

interface AboutShowcaseEditorModalProps {
    onClose: () => void;
    onUpdate: () => void;
}

export default function AboutShowcaseEditorModal({ onClose, onUpdate }: AboutShowcaseEditorModalProps) {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { aboutSettings } = useAppSelector((state) => state.content);

    const initialShowcase = aboutSettings?.showcase || {
        isVisible: true,
        title: 'Alceix Reflections',
        subtitle: 'Real Alceix moments',
        videoUrl: '',
        videoLabel: 'Alceix Glow',
        imageUrl: '/image/alceix/hero.png',
        imageLabel: 'Alceix Craft',
        layout: 'grid-2-col',
    };

    const [settings, setSettings] = useState(initialShowcase);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (aboutSettings?.showcase) {
            setSettings(aboutSettings.showcase);
        }
    }, [aboutSettings]);

    const handleSave = async () => {
        if (!aboutSettings) return;
        setIsSaving(true);
        try {
            await dispatch(updateAboutSettings({
                ...aboutSettings,
                showcase: settings
            })).unwrap();
            onUpdate();
            onClose();
        } catch (_err) {
            alert(t('admin.saveError'));
        } finally {
            setIsSaving(false);
        }
    };

    const layoutOptions = [
        {
            id: 'grid-2-col',
            label: t('admin.aboutShowcaseEditor.layouts.grid2Col'),
            desc: t('admin.aboutShowcaseEditor.layouts.grid2ColDesc'),
            preview: (
                <div className="w-full h-20 bg-muted rounded-lg flex gap-1 p-2 border border-border">
                    <div className="w-1/2 h-full bg-gray-300 rounded relative overflow-hidden flex items-center justify-center">
                        <div className="w-8 h-4 bg-background/50 rounded-sm"></div>
                    </div>
                    <div className="w-1/2 h-full bg-gray-200 rounded relative overflow-hidden flex items-center justify-center">
                        <div className="w-8 h-4 bg-background/50 rounded-sm"></div>
                    </div>
                </div>
            )
        },
        {
            id: 'masonry',
            label: t('admin.aboutShowcaseEditor.layouts.masonry'),
            desc: t('admin.aboutShowcaseEditor.layouts.masonryDesc'),
            preview: (
                <div className="w-full h-20 bg-muted rounded-lg flex gap-1 p-2 border border-border items-end">
                    <div className="w-2/3 h-full bg-gray-300 rounded relative overflow-hidden flex items-center justify-center">
                        <div className="w-8 h-4 bg-background/50 rounded-sm"></div>
                    </div>
                    <div className="w-1/3 h-3/4 bg-gray-200 rounded relative overflow-hidden flex items-center justify-center">
                        <div className="w-6 h-3 bg-background/50 rounded-sm"></div>
                    </div>
                </div>
            )
        },
        {
            id: 'featured-stack',
            label: t('admin.aboutShowcaseEditor.layouts.featuredStack'),
            desc: t('admin.aboutShowcaseEditor.layouts.featuredStackDesc'),
            preview: (
                <div className="w-full h-20 bg-muted rounded-lg flex flex-col gap-1 p-2 border border-border">
                    <div className="w-full h-2/3 bg-gray-300 rounded relative overflow-hidden flex items-center justify-center">
                        <div className="w-8 h-3 bg-background/50 rounded-sm"></div>
                    </div>
                    <div className="w-full h-1/3 bg-gray-200 rounded relative overflow-hidden flex items-center justify-center">
                        <div className="w-8 h-2 bg-background/50 rounded-sm"></div>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-background rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div>
                        <h2 className="text-xl font-bold">{t('admin.aboutShowcaseEditor.title')}</h2>
                        <p className="text-xs text-muted-foreground mt-1">{t('admin.aboutShowcaseEditor.subtitle')}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted/80 rounded-full transition-colors">
                        <FiX size={20} />
                    </button>
                </div>

                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    {/* Layout Selector */}
                    <div className="pb-6 border-b border-border mb-6">
                        <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-4">{t('admin.aboutShowcaseEditor.chooseLayout')}</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {layoutOptions.map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setSettings({ ...settings, layout: opt.id  })}
                                    className={`flex flex-col p-3 text-left rounded-xl border-2 transition-all group ${settings.layout === opt.id ? 'border-foreground bg-foreground text-background shadow-lg' : 'border-border hover:border-border text-muted-foreground bg-background'}`}
                                >
                                    <div className="mb-3 transition-transform group-hover:scale-[1.02]">
                                        {opt.preview}
                                    </div>
                                    <span className="font-bold text-[10px] uppercase tracking-wider mb-1">{opt.label}</span>
                                    <p className={`text-[9px] leading-tight ${settings.layout === opt.id ? 'text-gray-300' : 'text-muted-foreground/80'}`}>{opt.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-2">{t('admin.aboutShowcaseEditor.sectionTitle')}</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-foreground transition-colors"
                                value={settings.title}
                                onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-2">{t('admin.aboutShowcaseEditor.sectionSubtitle')}</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-foreground transition-colors"
                                value={settings.subtitle}
                                onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
                            />
                        </div>

                        {/* Video Column */}
                        <div className="col-span-2 md:col-span-1 p-4 border border-border rounded-xl bg-muted/50 space-y-4">
                            <h4 className="font-bold text-sm mb-2 flex items-center gap-2"><FiVideo /> {t('admin.aboutShowcaseEditor.videoColumn')}</h4>
                            <div>
                                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{t('admin.aboutShowcaseEditor.videoUpload')}</label>
                                <VideoUpload
                                    value={settings.videoUrl}
                                    onChange={(url) => setSettings({ ...settings, videoUrl: url })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{t('admin.aboutShowcaseEditor.hoverLabel')}</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-1.5 border border-border rounded-md focus:outline-none focus:border-foreground text-sm"
                                    value={settings.videoLabel}
                                    onChange={(e) => setSettings({ ...settings, videoLabel: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Image Column */}
                        <div className="col-span-2 md:col-span-1 p-4 border border-border rounded-xl bg-muted/50 space-y-4">
                            <h4 className="font-bold text-sm mb-2 flex items-center gap-2"><FiImage /> {t('admin.aboutShowcaseEditor.imageColumn')}</h4>
                            <div>
                                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{t('admin.aboutShowcaseEditor.imageUpload')}</label>
                                <div className="p-1 bg-background rounded flex justify-center mt-1 mb-2 border border-border">
                                    <ImageUpload
                                        value={settings.imageUrl}
                                        onChange={(url) => setSettings({ ...settings, imageUrl: url })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{t('admin.aboutShowcaseEditor.hoverLabel')}</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-1.5 border border-border rounded-md focus:outline-none focus:border-foreground text-sm"
                                    value={settings.imageLabel}
                                    onChange={(e) => setSettings({ ...settings, imageLabel: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-border bg-muted flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors" disabled={isSaving}>{t('admin.cancel')}</button>
                    <button onClick={handleSave} disabled={isSaving} className="px-6 py-2.5 bg-foreground text-background text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50">
                        {isSaving ? t('admin.saving') : t('admin.save')}
                    </button>
                </div>
            </div>
        </div>
    );
}
