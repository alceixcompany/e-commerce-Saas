'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { updateHomeSettings } from '@/lib/slices/contentSlice';
import { FiX, FiLayout, FiGrid, FiList } from 'react-icons/fi';
import { BsViewStacked } from 'react-icons/bs';

export default function CategoryLayoutEditorModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
    const dispatch = useAppDispatch();
    const { homeSettings } = useAppSelector((state) => state.content);

    // Default to 'carousel' if not set
    const [layout, setLayout] = useState<'carousel' | 'grid' | 'masonry' | 'minimal'>(homeSettings?.categoryLayout || 'carousel');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (homeSettings?.categoryLayout) {
            setLayout(homeSettings.categoryLayout);
        }
    }, [homeSettings]);

    const handleSave = async () => {
        if (!homeSettings) return;
        setLoading(true);
        try {
            await dispatch(updateHomeSettings({ ...homeSettings, categoryLayout: layout })).unwrap();
            onSave(); // Trigger refresh and close
        } catch (err) {
            console.error(err);
            alert('Failed to save layout');
        } finally {
            setLoading(false);
        }
    };

    const layouts = [
        {
            id: 'carousel',
            label: 'Cover Carousel',
            description: 'Horizontal scrollable large cover images (Default)',
            icon: BsViewStacked
        },
        {
            id: 'grid',
            label: 'Modern Grid',
            description: 'Symmetric grid layout with square images.',
            icon: FiGrid
        },
        {
            id: 'masonry',
            label: 'Masonry Collage',
            description: 'Asymmetric stylish grid with varied heights.',
            icon: FiLayout
        },
        {
            id: 'minimal',
            label: 'Minimalist Text',
            description: 'Clean typography focus without heavy images.',
            icon: FiList
        }
    ] as const;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4">
            <div className="bg-background rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden">
                {/* Sidebar */}
                <div className="w-full md:w-64 bg-muted border-r border-border p-4 flex flex-col gap-1 shrink-0">
                    <div className="mb-6 px-2 mt-2">
                        <h2 className="font-bold text-lg tracking-tight">Shop by Category</h2>
                        <p className="text-xs text-muted-foreground/80 font-medium">Layout Settings</p>
                    </div>

                    <button className="flex items-start gap-3 px-3 py-3 rounded-xl text-left transition-all bg-background shadow-md text-foreground ring-1 ring-black/5">
                        <FiLayout size={18} className="mt-0.5 text-foreground" />
                        <div>
                            <div className="text-xs font-bold">Design Style</div>
                            <div className="text-[10px] font-medium opacity-60 leading-tight mt-0.5">Change how cards look</div>
                        </div>
                    </button>

                    <div className="mt-auto px-4 py-4 opacity-50 text-[10px] text-muted-foreground/80">
                        <p>Categories are managed via the Categories page. Here you only adjust their appearance on the homepage.</p>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col min-h-0 bg-background">
                    <div className="p-6 border-b border-border flex justify-between items-center bg-background z-10 shrink-0">
                        <div>
                            <h3 className="font-bold text-lg">Choose a layout</h3>
                            <p className="text-xs text-muted-foreground/80">Select how you want to present your shop categories.</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-muted/80 rounded-full text-muted-foreground/80 hover:text-foreground transition-colors">
                            <FiX size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 md:p-8">
                        <div className="grid md:grid-cols-2 gap-4">
                            {layouts.map((l) => {
                                const Icon = l.icon;
                                const isSelected = layout === l.id;
                                return (
                                    <button
                                        key={l.id}
                                        onClick={() => setLayout(l.id as any)}
                                        className={`flex flex-col text-left p-4 rounded-xl border-2 transition-all ${isSelected
                                                ? 'border-foreground bg-foreground/5 ring-4 ring-black/5'
                                                : 'border-border bg-background hover:border-border hover:bg-muted'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={`p-2 rounded-lg ${isSelected ? 'bg-foreground text-background' : 'bg-muted/80 text-muted-foreground'}`}>
                                                <Icon size={16} />
                                            </div>
                                            <span className={`font-bold text-sm ${isSelected ? 'text-foreground' : 'text-foreground/80'}`}>{l.label}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground font-medium pl-[44px] leading-relaxed">
                                            {l.description}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-4 border-t border-gray-50 bg-muted/50 flex justify-end gap-3 shrink-0">
                        <button onClick={onClose} className="px-5 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-lg transition-colors">Cancel</button>
                        <button onClick={handleSave} disabled={loading} className="px-6 py-2.5 bg-foreground text-background rounded-xl text-xs font-bold shadow-xl hover:bg-gray-800 disabled:opacity-50 hover:scale-105 active:scale-95 transition-all">
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
