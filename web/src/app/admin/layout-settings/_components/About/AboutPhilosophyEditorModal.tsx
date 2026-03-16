'use client';

import React, { useState, useEffect } from 'react';
import { FiX, FiInfo, FiImage } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { updateAboutSettings } from '@/lib/slices/contentSlice';
import ImageUpload from '@/components/ImageUpload';

interface AboutPhilosophyEditorModalProps {
    onClose: () => void;
    onUpdate: () => void;
}

export default function AboutPhilosophyEditorModal({ onClose, onUpdate }: AboutPhilosophyEditorModalProps) {
    const dispatch = useAppDispatch();
    const { aboutSettings } = useAppSelector((state) => state.content);

    const initialPhilosophy = aboutSettings?.philosophy || {
        isVisible: true,
        quote: '"Real elegance is found in the raw, personal moments of craftsmanship."',
        imageUrl: '/image/customer/WhatsApp Image 2026-02-06 at 01.01.20.jpeg',
        tagline: 'OUR PHILOSOPHY',
        backgroundText: 'Exquisite',
        layout: 'centered-quote',
    };

    const [settings, setSettings] = useState(initialPhilosophy);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (aboutSettings?.philosophy) {
            setSettings(aboutSettings.philosophy);
        }
    }, [aboutSettings]);

    const handleSave = async () => {
        if (!aboutSettings) return;
        setIsSaving(true);
        try {
            await dispatch(updateAboutSettings({
                ...aboutSettings,
                philosophy: settings
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
        <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-background rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div>
                        <h2 className="text-xl font-bold">Philosophy Section</h2>
                        <p className="text-xs text-muted-foreground mt-1">Manage the bottom quote and image</p>
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
                                    id: 'centered-quote',
                                    label: 'Centered Quote',
                                    desc: 'Huge centered typography with optional small image.',
                                    preview: (
                                        <div className="w-full h-20 bg-muted rounded-lg flex flex-col items-center justify-center gap-1 p-2 border border-border">
                                            <div className="w-6 h-6 rounded-full bg-gray-300"></div>
                                            <div className="w-3/4 h-2 bg-gray-400 rounded-sm"></div>
                                            <div className="w-1/2 h-2 bg-gray-400 rounded-sm"></div>
                                            <div className="w-8 h-1 bg-[#C5A059] mt-1"></div>
                                        </div>
                                    )
                                },
                                {
                                    id: 'left-aligned',
                                    label: 'Left Aligned',
                                    desc: 'Text anchored left, image floating right.',
                                    preview: (
                                        <div className="w-full h-20 bg-muted rounded-lg flex items-center justify-between gap-2 p-2 border border-border">
                                            <div className="w-2/3 flex flex-col gap-1">
                                                <div className="w-full h-2 bg-gray-400 rounded-sm"></div>
                                                <div className="w-4/5 h-2 bg-gray-400 rounded-sm"></div>
                                                <div className="w-8 h-1 bg-[#C5A059] mt-1"></div>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                                        </div>
                                    )
                                },
                                {
                                    id: 'quote-focus',
                                    label: 'Quote Focus',
                                    desc: 'Massive italicized text covering most of the container.',
                                    preview: (
                                        <div className="w-full h-20 bg-muted rounded-lg flex flex-col items-center justify-center gap-1 p-2 border border-border relative overflow-hidden">
                                            <div className="w-24 h-4 bg-gray-200 rounded-sm absolute opacity-30"></div>
                                            <div className="w-full h-3 bg-gray-400 rounded-sm z-10"></div>
                                            <div className="w-2/3 h-3 bg-gray-400 rounded-sm z-10"></div>
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

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-2">Quote Tagline</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-foreground transition-colors"
                                value={settings.tagline}
                                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-2">Philosophy Quote</label>
                            <textarea
                                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-foreground transition-colors h-24 resize-none"
                                value={settings.quote}
                                onChange={(e) => setSettings({ ...settings, quote: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-2">Center Image Upload</label>
                            <div className="p-1 bg-muted rounded-xl border border-border flex justify-center max-w-[200px]">
                                <ImageUpload
                                    value={settings.imageUrl}
                                    onChange={(url) => setSettings({ ...settings, imageUrl: url })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-2">Large Background Text (Watermark)</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-foreground transition-colors"
                                value={settings.backgroundText}
                                onChange={(e) => setSettings({ ...settings, backgroundText: e.target.value })}
                            />
                            <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                                <FiInfo size={12} /> Faded text that appears behind the quote.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-border bg-muted flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors" disabled={isSaving}>Cancel</button>
                    <button onClick={handleSave} disabled={isSaving} className="px-6 py-2.5 bg-foreground text-background text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50">
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}
