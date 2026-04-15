'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { updateComponentInstance } from '@/lib/slices/componentSlice';
import { FiX, FiCheck, FiSave, FiColumns, FiLayout, FiMaximize, FiSidebar, FiAlignLeft } from 'react-icons/fi';
import * as Sections from '@/types/sections';

interface BlogDetailEditorModalProps {
    onClose: () => void;
    onSave: () => void;
    instanceId: string;
}

export default function BlogDetailEditorModal({ onClose, onSave, instanceId }: BlogDetailEditorModalProps) {
    const dispatch = useAppDispatch();
    const { instances } = useAppSelector((state) => state.component);
    const instance = instances.find(i => i._id === instanceId);
    
    const [variant, setVariant] = useState<string>(((instance?.data as Sections.BlogDetailData)?.variant as string) || 'editorial');
    const [showRecommended, setShowRecommended] = useState((instance?.data as Sections.BlogDetailData)?.showRecommended !== false);
    const [recommendedTitle, setRecommendedTitle] = useState<string>(((instance?.data as Sections.BlogDetailData)?.recommendedTitle as string) || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await dispatch(updateComponentInstance({
                id: instanceId,
                data: { 
                    ...(instance?.data as Sections.BlogDetailData || {}), 
                    variant, 
                    showRecommended,
                    recommendedTitle: recommendedTitle || undefined
                }
            })).unwrap();
            onSave();
        } catch (err) {
            console.error('Failed to save blog detail settings:', err);
            alert('Settings could not be saved.');
        } finally {
            setIsSaving(false);
        }
    };

    const variants = [
        { id: 'editorial', label: 'Editorial Classic', icon: FiLayout, desc: 'Large image header with elegant text overlay.' },
        { id: 'focused', label: 'Centered Focus', icon: FiAlignLeft, desc: 'Clean centered typography with a standard video/image ratio.' },
        { id: 'immersive', label: 'Full Immersive', icon: FiMaximize, desc: 'Full-screen cinematic header with artistic typography.' },
        { id: 'modern_sidebar', label: 'Modern Sidebar', icon: FiSidebar, desc: 'Dynamic split layout with curator info on the side.' },
        { id: 'minimalist', label: 'Minimalist', icon: FiColumns, desc: 'Ultra-clean, text-first approach for pure reading.' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4">
            <div className="bg-background rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden border border-border">
                <div className="p-6 border-b border-border flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg">Blog Detail Settings</h3>
                        <p className="text-xs text-muted-foreground">Customize the reading experience of your articles</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <FiX size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10 bg-muted/10">
                    {/* Variant Selection */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Design Variation</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {variants.map((v) => (
                                <button
                                    key={v.id}
                                    onClick={() => setVariant(v.id)}
                                    className={`p-5 rounded-2xl border-2 text-left transition-all flex flex-col gap-4 ${variant === v.id ? 'border-foreground bg-background shadow-xl scale-[1.02]' : 'border-border bg-background/50 hover:border-foreground/30'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${variant === v.id ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'}`}>
                                            <v.icon size={20} />
                                        </div>
                                        {variant === v.id && <FiCheck className="text-foreground" size={24} />}
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-sm tracking-tight">{v.label}</h5>
                                        <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">{v.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Recommendations Settings */}
                    <div className="bg-background p-6 rounded-2xl border border-border shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h4 className="font-bold text-sm">Recommended Articles</h4>
                                <p className="text-[10px] text-muted-foreground">Show related stories at the bottom of the page</p>
                            </div>
                            <button 
                                onClick={() => setShowRecommended(!showRecommended)}
                                className={`w-12 h-6 rounded-full transition-colors relative ${showRecommended ? 'bg-primary' : 'bg-muted'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${showRecommended ? 'left-7' : 'left-1'}`}></div>
                            </button>
                        </div>

                        {showRecommended && (
                            <div className="animate-in slide-in-from-top-2 duration-300 space-y-2 pt-4 border-t border-border">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Recommendations Title</label>
                                <input 
                                    type="text" 
                                    value={recommendedTitle}
                                    onChange={(e) => setRecommendedTitle(e.target.value)}
                                    placeholder="Continue reading (Default)"
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-foreground outline-none transition-all"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-border bg-background flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-xs text-muted-foreground hover:bg-muted transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-8 py-2.5 bg-foreground text-background rounded-xl text-xs font-bold hover:bg-foreground/90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg"
                    >
                        {isSaving ? 'Saving...' : <><FiSave /> Update Layout</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
