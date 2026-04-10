'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { updateComponentInstance } from '@/lib/slices/componentSlice';
import { FiX, FiCheck, FiSave, FiLayers, FiGrid, FiList, FiSidebar, FiColumns } from 'react-icons/fi';

interface BlogListEditorModalProps {
    onClose: () => void;
    onSave: () => void;
    instanceId: string;
}

export default function BlogListEditorModal({ onClose, onSave, instanceId }: BlogListEditorModalProps) {
    const dispatch = useAppDispatch();
    const { instances, loading: componentLoading } = useAppSelector((state) => state.component);
    const instance = instances.find(i => i._id === instanceId);
    
    const [variant, setVariant] = useState(instance?.data?.variant || 'editorial');
    const [itemsPerPage, setItemsPerPage] = useState(instance?.data?.itemsPerPage || 10);
    const [title, setTitle] = useState(instance?.data?.title || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await dispatch(updateComponentInstance({
                id: instanceId,
                data: { 
                    ...instance?.data, 
                    variant, 
                    itemsPerPage: Number(itemsPerPage),
                    title: title || undefined
                }
            })).unwrap();
            onSave();
        } catch (err) {
            console.error('Failed to save blog list settings:', err);
            alert('Settings could not be saved.');
        } finally {
            setIsSaving(false);
        }
    };

    const variants = [
        { id: 'editorial', label: 'Editorial', icon: FiSidebar, desc: 'Large featured article followed by a 2-column grid.' },
        { id: 'magazine', label: 'Magazine', icon: FiGrid, desc: 'Classic 3-column grid layout for high readability.' },
        { id: 'minimal', label: 'Minimal List', icon: FiList, desc: 'Clean vertical list with circular thumbnails.' },
        { id: 'zigzag', label: 'Story Zig-Zag', icon: FiLayers, desc: 'Large alternating hero rows for storytelling.' },
        { id: 'masonry', label: 'Masonry Flow', icon: FiColumns, desc: 'Dynamic staggered columns for a modern art-gallery feel.' },
        { id: 'grid_compact', label: 'Compact Grid', icon: FiGrid, desc: 'Dense 4-column grid for quickly browsing many posts.' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4">
            <div className="bg-background rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden border border-border">
                <div className="p-6 border-b border-border flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg">Blog List Settings</h3>
                        <p className="text-xs text-muted-foreground">Configure how your journal articles are displayed</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <FiX size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-muted/10">
                    {/* Basic Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Custom Page Title</label>
                            <input 
                                type="text" 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="The Journal (Default)"
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-foreground outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Items Per Page</label>
                            <input 
                                type="number" 
                                value={itemsPerPage}
                                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-foreground outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Variant Selection */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Display Variation</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {variants.map((v) => (
                                <button
                                    key={v.id}
                                    onClick={() => setVariant(v.id as any)}
                                    className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col gap-3 ${variant === v.id ? 'border-foreground bg-background shadow-lg scale-[1.02]' : 'border-border bg-background/50 hover:border-foreground/30'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${variant === v.id ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'}`}>
                                            <v.icon size={18} />
                                        </div>
                                        {variant === v.id && <FiCheck className="text-foreground" size={20} />}
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-sm">{v.label}</h5>
                                        <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">{v.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-border bg-background flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-xs text-muted-foreground hover:bg-muted transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-8 py-2.5 bg-foreground text-background rounded-xl text-xs font-bold hover:bg-foreground/90 disabled:opacity-50 transition-all flex items-center gap-2"
                    >
                        {isSaving ? 'Saving...' : <><FiSave /> Save Changes</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
