'use client';

import { useState, useEffect } from 'react';
import { useCmsStore } from '@/lib/store/useCmsStore';
import { useContentStore } from '@/lib/store/useContentStore';
import { FiX, FiCheck, FiSave, FiGrid, FiList, FiSidebar } from 'react-icons/fi';
import { useTranslation } from '@/hooks/useTranslation';
import { HomeJournalData } from '@/types/sections';


export default function JournalEditorModal({ onClose, onUpdate, instanceId }: { onClose: () => void; onUpdate: () => void; instanceId?: string }) {
    const { t } = useTranslation();
    const { homeSettings, isLoading, updateHomeSettings } = useContentStore();
    const { instances, updateInstance } = useCmsStore();

    const instance = instanceId ? instances.find(i => i._id === instanceId) : null;

    const [layout, setLayout] = useState<'grid' | 'list' | 'magazine'>(() => {
        const instanceData = instance?.data as HomeJournalData | undefined;
        if (instanceId && instanceData) {
            return instanceData.journalLayout || 'grid';
        }
        return homeSettings?.journalLayout || 'grid';
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const instanceData = instance?.data as HomeJournalData | undefined;
        if (instanceId && instanceData) {
            setLayout(instanceData.journalLayout || 'grid');
        } else if (homeSettings?.journalLayout) {
            setLayout(homeSettings.journalLayout);
        }
    }, [homeSettings, instance, instanceId]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (instanceId) {
                await updateInstance(instanceId, { ...instance?.data, journalLayout: layout });
            } else if (homeSettings) {
                await updateHomeSettings({ ...homeSettings, journalLayout: layout });
            }
            onUpdate();
            onClose();
        } catch (_err) {
            alert(t('admin.saveError'));
        } finally {
            setIsSaving(false);
        }
    };

    const layouts = [
        { id: 'grid', label: t('admin.journalEditor.layouts.grid'), icon: FiGrid, desc: t('admin.journalEditor.layouts.gridDesc') },
        { id: 'list', label: t('admin.journalEditor.layouts.list'), icon: FiList, desc: t('admin.journalEditor.layouts.listDesc') },
        { id: 'magazine', label: t('admin.journalEditor.layouts.magazine'), icon: FiSidebar, desc: t('admin.journalEditor.layouts.magazineDesc') }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4">
            <div className="bg-background rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden">
                <div className="p-6 border-b border-border flex justify-between items-center bg-background z-10 shrink-0">
                    <div>
                        <h3 className="font-bold text-lg">{t('admin.journalEditor.title')}</h3>
                        <p className="text-xs text-muted-foreground/80 font-medium">{t('admin.journalEditor.subtitle')}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted/80 rounded-full text-muted-foreground/80 hover:text-foreground transition-colors">
                        <FiX size={20} />
                    </button>
                </div>

                <div className="p-6 md:p-8 bg-muted/30">
                    <div className="bg-background p-6 rounded-2xl border border-border shadow-sm">
                        <h4 className="font-bold text-sm mb-4">{t('admin.journalEditor.layoutTitle')}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {layouts.map(lt => (
                                <button
                                    key={lt.id}
                                    onClick={() => setLayout(lt.id as 'grid' | 'list' | 'magazine')}
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
                        {t('admin.cancel')}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || isLoading}
                        className="px-8 py-2.5 bg-foreground text-background rounded-xl text-xs font-bold hover:bg-gray-800 disabled:bg-gray-400 transition-colors flex items-center gap-2 shadow-lg"
                    >
                        {isSaving ? t('admin.saving') : <><FiSave /> {t('admin.journalEditor.saveSettings')}</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
