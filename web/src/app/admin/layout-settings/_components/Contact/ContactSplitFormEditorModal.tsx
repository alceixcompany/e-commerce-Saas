'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { updateContactSettings } from '@/lib/slices/contentSlice';
import { FiX, FiSave, FiEye, FiEyeOff } from 'react-icons/fi';
import ImageUpload from '@/components/ImageUpload';

export default function ContactSplitFormEditorModal({ onClose, onUpdate }: { onClose: () => void; onUpdate: () => void }) {
    const dispatch = useAppDispatch();
    const { contactSettings } = useAppSelector((state) => state.content);

    const [formData, setFormData] = useState({
        isVisible: true,
        title: 'Get in Touch with Alceix',
        description: 'Fill out the form below and our Alceix team will get back to you shortly.',
        mediaUrl: '/image/alceix/product.png',
        mediaType: 'image' as 'image' | 'video' | 'map',
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (contactSettings?.splitForm) {
            setFormData({
                isVisible: contactSettings.splitForm.isVisible ?? true,
                title: contactSettings.splitForm.title || '',
                description: contactSettings.splitForm.description || '',
                mediaUrl: contactSettings.splitForm.mediaUrl || '',
                mediaType: contactSettings.splitForm.mediaType || 'image',
            });
        }
    }, [contactSettings]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!contactSettings) return;

        setIsSaving(true);
        try {
            await dispatch(updateContactSettings({
                ...contactSettings,
                splitForm: formData
            })).unwrap();
            onUpdate();
            onClose();
        } catch (error) {
            console.error(error);
            alert('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4">
            <div className="bg-background rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="p-6 border-b border-border flex justify-between items-center bg-background z-10 shrink-0">
                    <div>
                        <h3 className="font-bold text-lg">Contact Form Split Section</h3>
                        <p className="text-xs text-muted-foreground/80 font-medium">Customize the form and media split area</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted/80 rounded-full text-muted-foreground/80 hover:text-foreground transition-colors">
                        <FiX size={20} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-muted/30">
                    <form onSubmit={handleSave} className="space-y-6 max-w-xl mx-auto">
                        <div className="bg-background p-6 rounded-2xl border border-border shadow-sm flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-sm">Section Visibility</h4>
                                <p className="text-xs text-muted-foreground/80 mt-1">Show or hide this form section.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, isVisible: !formData.isVisible })}
                                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${formData.isVisible ? 'bg-green-100 text-green-700' : 'bg-muted/80 text-muted-foreground'}`}
                            >
                                {formData.isVisible ? <><FiEye /> Visible</> : <><FiEyeOff /> Hidden</>}
                            </button>
                        </div>
                        {formData.isVisible && (
                            <div className="bg-background p-6 rounded-2xl border border-border shadow-sm space-y-6">
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground/80 mb-1 block">Title</label>
                                    <input
                                        className="w-full p-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Get in Touch"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground/80 mb-1 block">Description</label>
                                    <textarea
                                        className="w-full p-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
                                        rows={3}
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Fill out the form below..."
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground/80 mb-2 block">Media Type</label>
                                    <div className="flex bg-muted/80 p-1 rounded-xl">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, mediaType: 'image' })}
                                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.mediaType === 'image' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground/80'}`}
                                        >
                                            Image
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, mediaType: 'map' })}
                                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.mediaType === 'map' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground/80'}`}
                                        >
                                            Map Embed
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground/80 mb-1 block">Media URL (Or Google Maps Embed Src)</label>
                                    {formData.mediaType === 'image' && (
                                        <ImageUpload
                                            value={formData.mediaUrl}
                                            onChange={(url) => setFormData({ ...formData, mediaUrl: url })}
                                        />
                                    )}
                                    <input
                                        className={`w-full p-3 bg-background border border-border rounded-xl text-xs font-mono text-foreground focus:outline-none focus:border-primary ${formData.mediaType === 'image' ? 'mt-3' : ''}`}
                                        placeholder="https://..."
                                        value={formData.mediaUrl}
                                        onChange={e => setFormData({ ...formData, mediaUrl: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}
                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="px-8 py-3 bg-foreground text-background rounded-xl font-bold shadow-xl hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
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
