'use client';

import React, { useState, useEffect } from 'react';
import { FiX, FiInfo } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { updateAboutSettings } from '@/lib/slices/contentSlice';
import VideoUpload from '@/components/VideoUpload';

interface AboutHeroEditorModalProps {
    onClose: () => void;
    onUpdate: () => void;
}

export default function AboutHeroEditorModal({ onClose, onUpdate }: AboutHeroEditorModalProps) {
    const dispatch = useAppDispatch();
    const { aboutSettings } = useAppSelector((state) => state.content);

    const initialHero = aboutSettings?.hero || {
        isVisible: true,
        title: 'Our Alceix Story',
        subtitle: 'The Essence of Alceix Elegance',
        videoUrl: '',
        layout: 'fullscreen',
    };

    const [settings, setSettings] = useState(initialHero);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (aboutSettings?.hero) {
            setSettings(aboutSettings.hero);
        }
    }, [aboutSettings]);

    const handleSave = async () => {
        if (!aboutSettings) return;
        setIsSaving(true);
        try {
            await dispatch(updateAboutSettings({
                ...aboutSettings,
                hero: settings
            })).unwrap();
            onUpdate();
            onClose();
        } catch (err) {
            alert('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-background rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div>
                        <h2 className="text-xl font-bold">About Top Banner</h2>
                        <p className="text-xs text-muted-foreground mt-1">Manage the hero section of the Our Story page</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted/80 rounded-full transition-colors">
                        <FiX size={20} />
                    </button>
                </div>

                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    {/* Layout Selector */}
                    <div className="pb-6 border-b border-border mb-6">
                        <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-4">Choose Layout Style</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                {
                                    id: 'fullscreen',
                                    label: 'Fullscreen',
                                    desc: 'Background video with large centered text overlay.',
                                    preview: (
                                        <div className="w-full h-20 bg-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden">
                                            <div className="w-full h-full bg-gray-300 absolute inset-0"></div>
                                            <div className="w-16 h-2 bg-foreground/40 rounded-full z-10 mb-2"></div>
                                            <div className="w-24 h-4 bg-foreground/60 rounded-full z-10 absolute"></div>
                                        </div>
                                    )
                                },
                                {
                                    id: 'split-visual',
                                    label: 'Split Visual',
                                    desc: '50/50 split. Video on left, typography on right.',
                                    preview: (
                                        <div className="w-full h-20 bg-muted rounded-lg flex border border-border overflow-hidden">
                                            <div className="w-1/2 h-full bg-gray-300"></div>
                                            <div className="w-1/2 h-full flex flex-col items-center justify-center gap-1.5 p-2">
                                                <div className="w-8 h-1.5 bg-gray-300 rounded-full"></div>
                                                <div className="w-14 h-2.5 bg-gray-400 rounded-full"></div>
                                            </div>
                                        </div>
                                    )
                                },
                                {
                                    id: 'minimal-centered',
                                    label: 'Minimal Centered',
                                    desc: 'Clean white background with a boxed video area.',
                                    preview: (
                                        <div className="w-full h-20 bg-background rounded-lg border border-border flex flex-col items-center justify-center gap-2 p-2 relative">
                                            <div className="w-full h-10 bg-gray-200 rounded"></div>
                                            <div className="w-12 h-2.5 bg-gray-400 rounded-full absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2"></div>
                                        </div>
                                    )
                                }
                            ].map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setSettings({ ...settings, layout: opt.id })}
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

                    {/* Content Fields */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-2">Title</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-foreground transition-colors"
                                value={settings.title}
                                onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-2">Subtitle</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-foreground transition-colors"
                                value={settings.subtitle}
                                onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
                            />
                            <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                                <FiInfo size={12} /> Small text that appears above the main title.
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-2">Background Video Upload</label>
                            <VideoUpload
                                value={settings.videoUrl}
                                onChange={(url) => setSettings({ ...settings, videoUrl: url })}
                            />
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-border bg-muted flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                        disabled={isSaving}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2.5 bg-foreground text-background text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}
