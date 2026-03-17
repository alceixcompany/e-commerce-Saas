'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { updateHomeSettings } from '@/lib/slices/contentSlice';
import { FiX, FiMonitor, FiImage, FiSave, FiEye, FiEyeOff, FiAlignLeft, FiAlignRight } from 'react-icons/fi';
import ImageUpload from '@/components/ImageUpload';
import VideoUpload from '@/components/VideoUpload';

export default function FeaturedSectionEditorModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
    const dispatch = useAppDispatch();
    const { homeSettings } = useAppSelector((state) => state.content);

    const [formData, setFormData] = useState({
        isVisible: true,
        title: '',
        description: '',
        mediaUrl: '',
        mediaType: 'video' as 'video' | 'image',
        buttonText: '',
        buttonUrl: '',
        layout: 'left' as 'left' | 'right',
        overlayTitle: '',
        overlayDescription: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (homeSettings?.featuredSection) {
            setFormData({
                isVisible: homeSettings.featuredSection.isVisible ?? true,
                title: homeSettings.featuredSection.title || 'Alceix Mastery',
                description: homeSettings.featuredSection.description || 'Discover the Alceix difference in every detail.',
                mediaUrl: homeSettings.featuredSection.mediaUrl || '/image/alceix/hero.png',
                mediaType: homeSettings.featuredSection.mediaType || 'image',
                buttonText: homeSettings.featuredSection.buttonText || 'Explore Alceix',
                buttonUrl: homeSettings.featuredSection.buttonUrl || '/collections',
                layout: homeSettings.featuredSection.layout || 'left',
                overlayTitle: homeSettings.featuredSection.overlayTitle || 'Alceix Artisans',
                overlayDescription: homeSettings.featuredSection.overlayDescription || '"Quality is not an act, it is a habit. - Alceix"'
            });
        }
    }, [homeSettings]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!homeSettings) return;

        setIsSaving(true);
        try {
            await dispatch(updateHomeSettings({
                ...homeSettings,
                featuredSection: formData
            })).unwrap();
            onSave();
        } catch (error) {
            console.error(error);
            alert('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4">
            <div className="bg-background rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="p-6 border-b border-border flex justify-between items-center bg-background z-10 shrink-0">
                    <div>
                        <h3 className="font-bold text-lg">Featured Section</h3>
                        <p className="text-xs text-muted-foreground/80 font-medium">Customize the "Mastery" promo section</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted/80 rounded-full text-muted-foreground/80 hover:text-foreground transition-colors">
                        <FiX size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-muted/30">
                    <form onSubmit={handleSave} className="space-y-8 max-w-3xl mx-auto">

                        {/* Visibility & Toggle */}
                        <div className="bg-background p-6 rounded-2xl border border-border shadow-sm flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-sm">Section Visibility</h4>
                                <p className="text-xs text-muted-foreground/80 mt-1">Show or hide this section on the homepage.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, isVisible: !formData.isVisible })}
                                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${formData.isVisible
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                    : 'bg-muted/80 text-muted-foreground hover:bg-gray-200'
                                    }`}
                            >
                                {formData.isVisible ? <><FiEye /> Visible</> : <><FiEyeOff /> Hidden</>}
                            </button>
                        </div>

                        {formData.isVisible && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                                {/* 1. Layout & Media */}
                                <div className="bg-background p-6 rounded-2xl border border-border shadow-sm space-y-6">
                                    <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-4 border-b pb-2">Layout & Media</h4>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-bold uppercase text-muted-foreground/80 mb-2 block">Layout Orientation</label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, layout: 'left' })}
                                                        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${formData.layout === 'left' ? 'border-foreground bg-gray-900 text-background' : 'border-border hover:border-border'
                                                            }`}
                                                    >
                                                        <FiAlignLeft size={20} />
                                                        <span className="text-[10px] font-bold">Media Left</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, layout: 'right' })}
                                                        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${formData.layout === 'right' ? 'border-foreground bg-gray-900 text-background' : 'border-border hover:border-border'
                                                            }`}
                                                    >
                                                        <FiAlignRight size={20} />
                                                        <span className="text-[10px] font-bold">Media Right</span>
                                                    </button>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-bold uppercase text-muted-foreground/80 mb-2 block">Media Type</label>
                                                <div className="flex bg-muted/80 p-1 rounded-xl">
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, mediaType: 'video' })}
                                                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.mediaType === 'video' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground/80'
                                                            }`}
                                                    >
                                                        Video
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, mediaType: 'image' })}
                                                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.mediaType === 'image' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground/80'
                                                            }`}
                                                    >
                                                        Image
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase text-muted-foreground/80 mb-1 block">
                                                {formData.mediaType === 'video' ? 'Video Source (URL)' : 'Image Source'}
                                            </label>

                                            {formData.mediaType === 'video' ? (
                                                <div className="space-y-3">
                                                    <VideoUpload
                                                        value={formData.mediaUrl}
                                                        onChange={(url) => setFormData({ ...formData, mediaUrl: url })}
                                                    />
                                                    <div className="relative py-2">
                                                        <div className="absolute inset-0 flex items-center">
                                                            <div className="w-full border-t border-border"></div>
                                                        </div>
                                                        <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-bold">
                                                            <span className="bg-background px-2 text-muted-foreground/80">Or External URL</span>
                                                        </div>
                                                    </div>
                                                    <input
                                                        className="input-field w-full p-3 border rounded-xl text-xs font-mono text-muted-foreground focus:text-foreground transition-colors"
                                                        placeholder="https://example.com/video.mp4"
                                                        value={formData.mediaUrl}
                                                        onChange={e => setFormData({ ...formData, mediaUrl: e.target.value })}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    <ImageUpload
                                                        value={formData.mediaUrl}
                                                        onChange={(url) => setFormData({ ...formData, mediaUrl: url })}
                                                    />
                                                    <div className="relative py-2">
                                                        <div className="absolute inset-0 flex items-center">
                                                            <div className="w-full border-t border-border"></div>
                                                        </div>
                                                        <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-bold">
                                                            <span className="bg-background px-2 text-muted-foreground/80">Or External URL</span>
                                                        </div>
                                                    </div>
                                                    <input
                                                        className="input-field w-full p-3 border rounded-xl text-xs font-mono text-muted-foreground focus:text-foreground transition-colors"
                                                        placeholder="https://example.com/image.jpg"
                                                        value={formData.mediaUrl}
                                                        onChange={e => setFormData({ ...formData, mediaUrl: e.target.value })}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Content */}
                                <div className="bg-background p-6 rounded-2xl border border-border shadow-sm space-y-6">
                                    <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-4 border-b pb-2">Text Content</h4>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-bold uppercase text-muted-foreground/80 mb-1 block">Main Heading</label>
                                                <input
                                                    className="input-field w-full p-3 border rounded-xl font-serif text-lg"
                                                    placeholder="Mastery in Diamond-Cut Patterns"
                                                    value={formData.title}
                                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold uppercase text-muted-foreground/80 mb-1 block">Description Body</label>
                                                <textarea
                                                    className="input-field w-full p-3 border rounded-xl"
                                                    rows={4}
                                                    placeholder="Our signature hand-engraved collection..."
                                                    value={formData.description}
                                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                />
                                            </div>

                                            {/* New Overlay Text Inputs */}
                                            <div className="pt-4 border-t border-border">
                                                <label className="text-[10px] font-bold uppercase text-blue-500 mb-2 block">Overlay Text (On Media)</label>
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="text-[10px] font-bold uppercase text-muted-foreground/80 mb-1 block">Overlay Title</label>
                                                        <input
                                                            className="input-field w-full p-3 border rounded-xl"
                                                            placeholder="Ocean Gem Artisans"
                                                            value={formData.overlayTitle}
                                                            onChange={e => setFormData({ ...formData, overlayTitle: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold uppercase text-muted-foreground/80 mb-1 block">Overlay Quote</label>
                                                        <input
                                                            className="input-field w-full p-3 border rounded-xl italic"
                                                            placeholder='"Every wave tells a story..."'
                                                            value={formData.overlayDescription}
                                                            onChange={e => setFormData({ ...formData, overlayDescription: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-bold uppercase text-muted-foreground/80 mb-1 block">Button Label</label>
                                                <input
                                                    className="input-field w-full p-3 border rounded-xl"
                                                    placeholder="DISCOVER THE DEEP"
                                                    value={formData.buttonText}
                                                    onChange={e => setFormData({ ...formData, buttonText: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold uppercase text-muted-foreground/80 mb-1 block">Button Link</label>
                                                <input
                                                    className="input-field w-full p-3 border rounded-xl text-blue-600"
                                                    placeholder="/collections"
                                                    value={formData.buttonUrl}
                                                    onChange={e => setFormData({ ...formData, buttonUrl: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end pt-4 pb-8">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="px-8 py-3 bg-foreground text-background rounded-xl font-bold shadow-xl hover:bg-gray-800 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                            >
                                {isSaving ? 'Saving...' : <><FiSave /> Save Changes</>}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
