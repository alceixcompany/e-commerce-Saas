'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { updatePopularCollections, updateHomeSettings } from '@/lib/slices/contentSlice';
import { FiStar, FiX, FiLayout, FiGrid, FiList } from 'react-icons/fi';
import { BsViewStacked } from 'react-icons/bs';
import ImageUpload from '@/components/ImageUpload';

export default function CollectionsEditorModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
    const dispatch = useAppDispatch();
    const { popularCollections, homeSettings } = useAppSelector((state) => state.content);

    const [images, setImages] = useState({ newArrivals: '', bestSellers: '' });
    const [layout, setLayout] = useState<'grid' | 'split' | 'stacked'>(homeSettings?.popularLayout || 'grid');
    const [activeTab, setActiveTab] = useState<'content' | 'layout'>('layout');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (popularCollections.newArrivals) setImages(popularCollections);
        else if (popularCollections) {
            setImages({
                newArrivals: popularCollections.newArrivals || '',
                bestSellers: popularCollections.bestSellers || ''
            });
        }
    }, [popularCollections]);

    useEffect(() => {
        if (homeSettings?.popularLayout) {
            setLayout(homeSettings.popularLayout);
        }
    }, [homeSettings]);

    const handleSave = async () => {
        if (!homeSettings) return;
        setLoading(true);
        try {
            await dispatch(updatePopularCollections(images)).unwrap();
            await dispatch(updateHomeSettings({ ...homeSettings, popularLayout: layout })).unwrap();
            onSave(); // Trigger refresh and close
        } catch (err) {
            console.error(err);
            alert('Failed to save');
        } finally {
            setLoading(false);
        }
    };

    const layouts = [
        {
            id: 'grid',
            label: 'Modern Grid',
            description: 'Two separate visual blocks side-by-side (Default).',
            icon: FiGrid
        },
        {
            id: 'split',
            label: 'Split Screen',
            description: 'Edge-to-edge tall split covering entire width.',
            icon: FiLayout
        },
        {
            id: 'stacked',
            label: 'Stacked Banners',
            description: 'Full width stacked promotional stripes.',
            icon: BsViewStacked
        }
    ] as const;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4">
            <div className="bg-background rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden">
                <div className="w-full md:w-64 bg-muted border-r border-border p-4 flex flex-col gap-1 shrink-0">
                    <div className="mb-6 px-2 mt-2">
                        <h2 className="font-bold text-lg tracking-tight">Popular Collections</h2>
                        <p className="text-xs text-muted-foreground/80 font-medium">Homepage Cards</p>
                    </div>

                    <button
                        onClick={() => setActiveTab('layout')}
                        className={`flex items-start gap-3 px-3 py-3 rounded-xl text-left transition-all ${activeTab === 'layout' ? 'bg-background shadow-md text-foreground ring-1 ring-black/5' : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'}`}
                    >
                        <FiLayout size={18} className="mt-0.5" />
                        <div>
                            <div className="text-xs font-bold">Design Layout</div>
                            <div className="text-[10px] font-medium opacity-60 leading-tight mt-0.5">Presentation style</div>
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveTab('content')}
                        className={`flex items-start gap-3 px-3 py-3 rounded-xl text-left transition-all ${activeTab === 'content' ? 'bg-background shadow-md text-foreground ring-1 ring-black/5' : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'}`}
                    >
                        <FiStar size={18} className="mt-0.5" />
                        <div>
                            <div className="text-xs font-bold">Cover Images</div>
                            <div className="text-[10px] font-medium opacity-60 leading-tight mt-0.5">Highlight visuals</div>
                        </div>
                    </button>

                    <div className="mt-auto px-4 py-4 opacity-50 text-[10px] text-muted-foreground/80">
                        <p>Configure New Arrivals and Best Sellers appearance.</p>
                    </div>
                </div>

                <div className="flex-1 flex flex-col min-h-0 bg-background">
                    <div className="p-6 border-b border-border flex justify-between items-center bg-background z-10 shrink-0">
                        <div>
                            <h3 className="font-bold text-lg">{activeTab === 'layout' ? 'Design Settings' : 'Promotional Covers'}</h3>
                            <p className="text-xs text-muted-foreground/80">{activeTab === 'layout' ? 'Choose how these collections are structured.' : 'Update the specific visuals for these cards.'}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-muted/80 rounded-full text-muted-foreground/80 hover:text-foreground transition-colors">
                            <FiX size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 md:p-8">
                        {activeTab === 'layout' && (
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
                        )}

                        {activeTab === 'content' && (
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">1</span>
                                        <span className="font-bold text-sm">New Arrivals</span>
                                    </div>
                                    <div className="p-2 bg-muted rounded-xl border border-border">
                                        <ImageUpload value={images.newArrivals} onChange={url => setImages({ ...images, newArrivals: url })} />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold">2</span>
                                        <span className="font-bold text-sm">Best Sellers</span>
                                    </div>
                                    <div className="p-2 bg-muted rounded-xl border border-border">
                                        <ImageUpload value={images.bestSellers} onChange={url => setImages({ ...images, bestSellers: url })} />
                                    </div>
                                </div>
                            </div>
                        )}
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
