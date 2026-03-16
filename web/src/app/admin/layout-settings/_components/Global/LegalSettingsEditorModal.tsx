'use client';

import { useState, useEffect } from 'react';
import { FiX, FiSave, FiInfo, FiCalendar, FiLayout } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { updateLegalSettings, LegalSettings, fetchLegalSettings } from '@/lib/slices/contentSlice';

interface LegalSettingsEditorModalProps {
    type: 'privacy_policy' | 'terms_of_service' | 'accessibility';
    onClose: () => void;
    onUpdate: () => void;
}

export default function LegalSettingsEditorModal({ type, onClose, onUpdate }: LegalSettingsEditorModalProps) {
    const dispatch = useAppDispatch();
    const { privacySettings, termsSettings, accessibilitySettings } = useAppSelector((state) => state.content);

    const [formData, setFormData] = useState<LegalSettings>({
        title: '',
        content: '',
        lastUpdated: new Date().toISOString().split('T')[0],
    });

    const pageLabels = {
        privacy_policy: 'Privacy Policy',
        terms_of_service: 'Terms of Service',
        accessibility: 'Accessibility Statement',
    };

    useEffect(() => {
        dispatch(fetchLegalSettings(type));
    }, [dispatch, type]);

    useEffect(() => {
        let settings;
        if (type === 'privacy_policy') settings = privacySettings;
        else if (type === 'terms_of_service') settings = termsSettings;
        else if (type === 'accessibility') settings = accessibilitySettings;

        if (settings) {
            setFormData({
                title: settings.title || pageLabels[type],
                content: settings.content || '',
                lastUpdated: settings.lastUpdated || new Date().toISOString().split('T')[0],
            });
        }
    }, [privacySettings, termsSettings, accessibilitySettings, type]);

    const handleSave = async () => {
        try {
            await dispatch(updateLegalSettings({ type, content: formData })).unwrap();
            alert('Settings updated successfully');
            onUpdate();
            onClose();
        } catch (error) {
            alert('Failed to update settings');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-end">
            <div 
                className="w-full max-w-2xl h-full bg-background shadow-2xl flex flex-col animate-in slide-in-from-right duration-500"
            >
                {/* Header */}
                <div className="p-6 border-b border-foreground/10 flex items-center justify-between bg-foreground/5">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Edit {pageLabels[type]}</h2>
                        <p className="text-xs text-foreground/50">Modify the content and metadata for your legal page.</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-foreground/10 rounded-full transition-colors"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <FiInfo className="text-primary" />
                            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/60">Page Header</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-1">Page Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                                    placeholder="e.g. Privacy Policy"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-1 text-flex items-center gap-2">
                                    <FiCalendar size={10} /> Last Updated
                                </label>
                                <input
                                    type="date"
                                    value={formData.lastUpdated}
                                    onChange={(e) => setFormData({ ...formData, lastUpdated: e.target.value })}
                                    className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Rich Content Area */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <FiLayout className="text-primary" />
                                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/60">Page Content</h3>
                            </div>
                            <span className="text-[10px] text-foreground/30 font-bold uppercase tracking-widest">Supports HTML</span>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-1">Main Body Content</label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors min-h-[400px] font-mono leading-relaxed"
                                placeholder="<h1>Section Title</h1><p>Your content here...</p>"
                            />
                            <p className="text-[10px] text-foreground/40 italic">Note: You can use HTML tags to format your text (h1, h2, p, ul, li, etc.)</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-foreground/10 bg-foreground/5 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold text-foreground/60 hover:text-foreground transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="bg-foreground text-background px-8 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-primary transition-all shadow-lg"
                    >
                        <FiSave size={16} /> Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
