'use client';

import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { updateAuthSettings } from '@/lib/slices/contentSlice';
import ImageUpload from '@/components/ImageUpload';

interface AuthLayoutEditorModalProps {
    type: 'login' | 'register';
    onClose: () => void;
    onUpdate: () => void;
}

export default function AuthLayoutEditorModal({ type, onClose, onUpdate }: AuthLayoutEditorModalProps) {
    const dispatch = useAppDispatch();
    const { authSettings } = useAppSelector((state) => state.content);

    const defaultState = {
        layout: 'split-left' as const,
        title: 'Welcome',
        quote: 'Description text',
        imageUrl: '',
    };

    const initialAuth = authSettings?.[type] || defaultState;

    const [settings, setSettings] = useState(initialAuth);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (authSettings?.[type]) {
            setSettings(authSettings[type]);
        }
    }, [authSettings, type]);

    const handleSave = async () => {
        if (!authSettings) return;
        setIsSaving(true);
        try {
            await dispatch(updateAuthSettings({
                ...authSettings,
                [type]: settings
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
                        <h2 className="text-xl font-bold capitalize">{type} Page Layout</h2>
                        <p className="text-xs text-muted-foreground mt-1">Manage the layout variation, imagery, and copy</p>
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
                                    id: 'split-left',
                                    label: 'Split Left',
                                    desc: 'Large visual image on the left, form side on the right.',
                                    preview: (
                                        <div className="w-full h-20 bg-muted rounded-lg flex gap-2 p-2 border border-border">
                                            <div className="w-1/2 h-full bg-gray-300 rounded overflow-hidden relative"></div>
                                            <div className="w-1/2 h-full flex flex-col justify-center gap-1.5 items-center">
                                                <div className="w-3/4 h-2 bg-gray-400 rounded block mb-2"></div>
                                                <div className="w-full h-2 bg-gray-300 rounded"></div>
                                                <div className="w-full h-2 bg-gray-300 rounded"></div>
                                                <div className="w-full h-3 bg-gray-400 rounded mt-1"></div>
                                            </div>
                                        </div>
                                    )
                                },
                                {
                                    id: 'split-right',
                                    label: 'Split Right',
                                    desc: 'Form side on the left, large visual image on the right.',
                                    preview: (
                                        <div className="w-full h-20 bg-muted rounded-lg flex flex-row-reverse gap-2 p-2 border border-border">
                                            <div className="w-1/2 h-full bg-gray-300 rounded overflow-hidden relative"></div>
                                            <div className="w-1/2 h-full flex flex-col justify-center gap-1.5 items-center">
                                                <div className="w-3/4 h-2 bg-gray-400 rounded block mb-2"></div>
                                                <div className="w-full h-2 bg-gray-300 rounded"></div>
                                                <div className="w-full h-2 bg-gray-300 rounded"></div>
                                                <div className="w-full h-3 bg-gray-400 rounded mt-1"></div>
                                            </div>
                                        </div>
                                    )
                                },
                                {
                                    id: 'centered',
                                    label: 'Centered Form',
                                    desc: 'Minimalist approach with no large visual, just the form.',
                                    preview: (
                                        <div className="w-full h-20 bg-muted rounded-lg flex flex-col items-center justify-center p-2 border border-border">
                                            <div className="w-1/2 h-full flex flex-col justify-center items-center gap-1">
                                                <div className="w-3/4 h-2 bg-gray-400 rounded block mb-1"></div>
                                                <div className="w-full h-1.5 bg-gray-300 rounded"></div>
                                                <div className="w-full h-1.5 bg-gray-300 rounded"></div>
                                                <div className="w-full h-2.5 bg-gray-400 rounded mt-1"></div>
                                            </div>
                                        </div>
                                    )
                                }
                            ].map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setSettings({ ...settings, layout: opt.id as any })}
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
                            <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-2">Form Title</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-foreground transition-colors"
                                value={settings.title}
                                onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                            />
                        </div>

                        {settings.layout !== 'centered' && (
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-2">Quote / Description (Overlay Text)</label>
                                <textarea
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-foreground transition-colors h-24 resize-none"
                                    value={settings.quote}
                                    onChange={(e) => setSettings({ ...settings, quote: e.target.value })}
                                />
                            </div>
                        )}

                        {settings.layout !== 'centered' && (
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wider mb-2">Visual Image Upload</label>
                                <div className="p-1 bg-muted rounded-xl border border-border flex justify-center">
                                    <ImageUpload
                                        value={settings.imageUrl}
                                        onChange={(url) => setSettings({ ...settings, imageUrl: url })}
                                    />
                                </div>
                            </div>
                        )}
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
