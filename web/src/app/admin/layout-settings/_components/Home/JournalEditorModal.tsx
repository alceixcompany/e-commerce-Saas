'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { updateHomeSettings, updateProductSettings } from '@/lib/slices/contentSlice';
import { FiX, FiCheck, FiSave, FiGrid, FiList, FiSidebar } from 'react-icons/fi';

import { updateComponentInstance } from '@/lib/slices/componentSlice';

export default function JournalEditorModal({ onClose, onUpdate, isProductPage, instanceId }: { onClose: () => void; onUpdate: () => void; isProductPage?: boolean; instanceId?: string } | any) {
    const dispatch = useAppDispatch();
    const { homeSettings, productSettings, loading: contentLoading } = useAppSelector((state) => state.content);
    const isLoading = contentLoading.homeSettings;
    const { instances } = useAppSelector((state) => state.component);

    const instance = instanceId ? instances.find(i => i._id === instanceId) : null;

    const [layout, setLayout] = useState<'grid' | 'list' | 'magazine'>(() => {
        if (instanceId && instance) {
            return instance.data?.journalLayout || 'grid';
        }
        return homeSettings?.journalLayout || 'grid';
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (instanceId && instance) {
            setLayout(instance.data?.journalLayout || 'grid');
        } else if (homeSettings?.journalLayout) {
            setLayout(homeSettings.journalLayout);
        }
    }, [homeSettings, instance, instanceId]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (instanceId) {
                await dispatch(updateComponentInstance({
                    id: instanceId,
                    data: { ...instance?.data, journalLayout: layout }
                })).unwrap();
            } else if (homeSettings) {
                await dispatch(updateHomeSettings({ ...homeSettings, journalLayout: layout })).unwrap();
            }
            onUpdate();
            onClose();
        } catch (err) {
            alert('Failed to save layout');
        } finally {
            setIsSaving(false);
        }
    };

    const layouts = [
        { id: 'grid', label: 'Classic Grid', icon: FiGrid, desc: 'Clean 3-column grid for your latest news and stories.' },
        { id: 'list', label: 'Minimal List', icon: FiList, desc: 'A sophisticated vertically stacked list layout.' },
        { id: 'magazine', label: 'Magazine Style', icon: FiSidebar, desc: 'Large featured article alongside smaller secondary posts.' }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4">
            <div className="bg-background rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden">
                <div className="p-6 border-b border-border flex justify-between items-center bg-background z-10 shrink-0">
                    <div>
                        <h3 className="font-bold text-lg">Journal / News Section</h3>
                        <p className="text-xs text-muted-foreground/80 font-medium">Choose how your latest blog posts appear on the homepage</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted/80 rounded-full text-muted-foreground/80 hover:text-foreground transition-colors">
                        <FiX size={20} />
                    </button>
                </div>

                <div className="p-6 md:p-8 bg-muted/30">
                    <div className="bg-background p-6 rounded-2xl border border-border shadow-sm">
                        <h4 className="font-bold text-sm mb-4">News Display Layout</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {layouts.map(lt => (
                                <button
                                    key={lt.id}
                                    onClick={() => setLayout(lt.id as any)}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${layout === lt.id ? 'border-foreground bg-muted shadow-inner' : 'border-border hover:border-border bg-background'}`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${layout === lt.id ? 'bg-foreground text-background' : 'bg-muted/80 text-muted-foreground/80'}`}>
                                            <lt.icon size={16} />
                                        </div>
                                        <h5 className="font-bold text-sm text-foreground">{lt.label}</h5>
                                        {layout === lt.id && <FiCheck className="ml-auto text-foreground" size={16} />}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">{lt.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-border bg-background flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-xs text-muted-foreground hover:bg-muted/80 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || isLoading}
                        className="px-8 py-2.5 bg-foreground text-background rounded-xl text-xs font-bold hover:bg-gray-800 disabled:bg-gray-400 transition-colors flex items-center gap-2 shadow-lg"
                    >
                        {isSaving ? 'Saving...' : <><FiSave /> Save Settings</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
