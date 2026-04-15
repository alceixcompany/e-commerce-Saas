import { FiTag } from 'react-icons/fi';
import { AnimatePresence } from 'framer-motion';
import { SYSTEM_SLUGS } from '../../_config/layout-editor.config';
import { createPage } from '@/lib/slices/pageSlice';
import { useAppDispatch } from '@/lib/hooks';
import type { Dispatch, SetStateAction } from 'react';
import type { PageSection } from '@/types/page';

import { Translate } from '@/hooks/useTranslation';

interface LayoutActionModalsProps {
    t: Translate;
    isAddPageModalOpen: boolean;
    setIsAddPageModalOpen: (open: boolean) => void;
    newPageName: string;
    setNewPageName: (name: string) => void;
    setSelectedPageId: (id: string) => void;
    setSidebarView: (view: 'pages' | 'sections') => void;
    setSectionsState: Dispatch<SetStateAction<Record<string, PageSection[]>>>;
    triggerRefresh: () => void;
    isComponentNameModalOpen: boolean;
    setIsComponentNameModalOpen: (open: boolean) => void;
    newInstanceName: string;
    setNewInstanceName: (name: string) => void;
    handleConvertSave: () => void;
    setSectionToConvert: (id: string | null) => void;
}

export default function LayoutActionModals({
    t,
    isAddPageModalOpen,
    setIsAddPageModalOpen,
    newPageName,
    setNewPageName,
    setSelectedPageId,
    setSidebarView,
    setSectionsState,
    triggerRefresh,
    isComponentNameModalOpen,
    setIsComponentNameModalOpen,
    newInstanceName,
    setNewInstanceName,
    handleConvertSave,
    setSectionToConvert
}: LayoutActionModalsProps) {
    const dispatch = useAppDispatch();

    const handleAddPage = async () => {
        if (!newPageName.trim()) return;
        const slug = newPageName.toLowerCase().replace(/[^a-z0-9ğüşöçı]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        const newPath = `/${slug}`;

        try {
            if (SYSTEM_SLUGS.includes(slug)) {
                alert(t('admin.slugReserved') || 'Slug is reserved');
                return;
            }

            const resultAction = await dispatch(createPage({
                title: newPageName,
                slug: slug,
                path: newPath,
                description: t('admin.customPageDesc') || 'Özel Kullanıcı Sayfası',
                sections: []
            })).unwrap();

            const newId = resultAction._id;
            setSectionsState(prev => ({ ...prev, [newId]: [] }));

            setNewPageName('');
            setIsAddPageModalOpen(false);

            setSelectedPageId(newId);
            setSidebarView('sections');
            triggerRefresh();
        } catch (error) {
            console.error('Failed to create page:', error);
            alert(t('admin.pageCreateError') || 'Sayfa oluşturulurken bir hata oluştu. (Slug benzersiz olmalı)');
        }
    };

    return (
        <>
            {/* Create Custom Page Modal */}
            <AnimatePresence>
                {isAddPageModalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center">
                        <div className="bg-background rounded-2xl shadow-2xl p-6 w-full max-w-md border border-foreground/10 animate-in zoom-in-95 duration-200">
                            <h3 className="text-lg font-bold text-foreground mb-1">{t('admin.addPage')}</h3>
                            <p className="text-xs text-foreground/50 mb-6">{t('admin.addPageDesc')}</p>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-1">
                                        {t('admin.pageName')}
                                    </label>
                                    <input
                                        type="text"
                                        value={newPageName}
                                        onChange={(e) => setNewPageName(e.target.value)}
                                        className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                                        placeholder={t('admin.pageNamePlaceholder')}
                                        autoFocus
                                    />
                                    {newPageName && (
                                        <p className="text-[10px] text-foreground/40 ml-1">
                                            {t('admin.createdUrl')} <span className="text-primary font-mono cursor-default">/{newPageName.toLowerCase().replace(/[^a-z0-9ğüşöçı]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}</span>
                                        </p>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        onClick={() => { setIsAddPageModalOpen(false); setNewPageName(''); }}
                                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-foreground/60 hover:text-foreground transition-colors"
                                    >
                                        {t('admin.cancel')}
                                    </button>
                                    <button
                                        onClick={handleAddPage}
                                        className="bg-[var(--primary-color)] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg hover:opacity-90 transition-all"
                                    >
                                        {t('admin.createButton')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* Component Naming Modal (for conversion) */}
            <AnimatePresence>
                {isComponentNameModalOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250] flex items-center justify-center p-4">
                        <div className="bg-background rounded-3xl shadow-2xl p-8 w-full max-w-md border border-foreground/5 animate-in zoom-in-95 duration-200">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                                    <FiTag size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-foreground">{t('admin.nameComponentTitle')}</h3>
                                    <p className="text-xs text-foreground/40 mt-1">{t('admin.nameComponentDesc')}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-1">
                                        {t('admin.componentNameLabel')}
                                    </label>
                                    <input
                                        type="text"
                                        value={newInstanceName}
                                        onChange={(e) => setNewInstanceName(e.target.value)}
                                        className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-primary transition-all font-medium"
                                        placeholder={t('admin.componentNamePlaceholder')}
                                        autoFocus
                                        onKeyDown={(e) => e.key === 'Enter' && handleConvertSave()}
                                    />
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => { setIsComponentNameModalOpen(false); setSectionToConvert(null); setNewInstanceName(''); }}
                                        className="px-6 py-3 rounded-2xl text-[10px] font-bold tracking-widest uppercase text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-all"
                                    >
                                        {t('admin.cancel')}
                                    </button>
                                    <button
                                        onClick={handleConvertSave}
                                        disabled={!newInstanceName.trim()}
                                        className="bg-foreground text-background px-8 py-3 rounded-2xl text-[10px] font-bold tracking-widest uppercase hover:bg-primary hover:text-white transition-all shadow-xl disabled:opacity-50 disabled:hover:bg-foreground"
                                    >
                                        {t('admin.saveAndEdit')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
