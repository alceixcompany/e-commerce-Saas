'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { updateContactSettings } from '@/lib/slices/contentSlice';
import { FiX, FiSave, FiEye, FiEyeOff } from 'react-icons/fi';
import ImageUpload from '@/components/ImageUpload';

export default function ContactHeroEditorModal({ onClose, onUpdate }: { onClose: () => void; onUpdate: () => void }) {
    const dispatch = useAppDispatch();
    const { contactSettings } = useAppSelector((state) => state.content);

    const [formData, setFormData] = useState({
        isVisible: true,
        title: 'Contact Alceix',
        subtitle: "We'd love to hear from you",
        backgroundImageUrl: '/image/alceix/hero.png',
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (contactSettings?.hero) {
            setFormData({
                isVisible: contactSettings.hero.isVisible ?? true,
                title: contactSettings.hero.title || '',
                subtitle: contactSettings.hero.subtitle || '',
                backgroundImageUrl: contactSettings.hero.backgroundImageUrl || '',
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
                hero: formData
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
                        <h3 className="font-bold text-lg">Contact Hero Section</h3>
                        <p className="text-xs text-muted-foreground/80 font-medium">Customize the top banner of the contact page</p>
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
                                <p className="text-xs text-muted-foreground/80 mt-1">Show or hide this hero section.</p>
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
                                        placeholder="Contact Us"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground/80 mb-1 block">Subtitle</label>
                                    <input
                                        className="w-full p-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
                                        value={formData.subtitle}
                                        onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                                        placeholder="We'd love to hear from you."
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground/80 mb-1 block">Background Image</label>
                                    <ImageUpload
                                        value={formData.backgroundImageUrl}
                                        onChange={(url) => setFormData({ ...formData, backgroundImageUrl: url })}
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
