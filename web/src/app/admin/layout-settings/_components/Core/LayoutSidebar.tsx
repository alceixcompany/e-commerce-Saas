import { 
    FiChevronRight, FiChevronLeft, FiPlus, FiTrash2, FiMenu, FiSidebar, FiEdit2, FiX, FiLayout
} from 'react-icons/fi';
import { AnimatePresence } from 'framer-motion';
import { PageSection } from '@/types/page';
import { SECTION_ICONS_CONFIG } from '../../_config/layout-editor.config';

interface LayoutSidebarProps {
    t: any;
    sidebarView: 'pages' | 'sections';
    setSidebarView: (view: 'pages' | 'sections') => void;
    groupedPages: any[];
    collapsedCategories: Set<string>;
    toggleCategory: (catId: string) => void;
    selectedPageId: string;
    setSelectedPageId: (id: string) => void;
    handleDeletePage: (e: React.MouseEvent, pageId: string) => void;
    setIsAddPageModalOpen: (open: boolean) => void;
    selectedPage: any;
    activeSections: PageSection[];
    allowedPages: string[];
    handleClearAll: () => void;
    setIsComponentStoreOpen: (open: boolean) => void;
    handleEditSection: (id: string) => void;
    handleRemoveSection: (id: string) => void;
    handleDragEnd: (newSections: PageSection[]) => void;
}

export default function LayoutSidebar({
    t,
    sidebarView,
    setSidebarView,
    groupedPages,
    collapsedCategories,
    toggleCategory,
    selectedPageId,
    setSelectedPageId,
    handleDeletePage,
    setIsAddPageModalOpen,
    selectedPage,
    activeSections,
    allowedPages,
    handleClearAll,
    setIsComponentStoreOpen,
    handleEditSection,
    handleRemoveSection,
    handleDragEnd
}: LayoutSidebarProps) {
    return (
        <div className="w-72 bg-foreground/5 border-r border-foreground/10 flex-shrink-0 flex flex-col z-10 transition-all duration-300">
            {/* View: Page List */}
            {sidebarView === 'pages' && (
                <div className="flex flex-col h-full animate-in slide-in-from-left-4 duration-300">
                    <div className="p-5 pb-2 pt-6">
                        <h2 className="font-bold text-base text-foreground tracking-tight mb-1">{t('admin.layoutEditor')}</h2>
                        <p className="text-xs text-foreground/50 font-medium">{t('admin.selectPage')}</p>
                    </div>
                    <nav className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
                        {groupedPages.map(group => (
                            <div key={group.id} className="space-y-1.5 pt-1">
                                <button
                                    onClick={() => toggleCategory(group.id)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all group mb-0.5 border shadow-sm ${collapsedCategories.has(group.id) ? 'bg-foreground/5 border-foreground/5' : 'bg-background border-foreground/10 ring-1 ring-foreground/5'}`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className={`w-1 h-3.5 rounded-full transition-all ${collapsedCategories.has(group.id) ? 'bg-primary/20 group-hover:bg-primary/40' : 'bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]'}`} />
                                        <span className={`text-[10px] font-bold uppercase tracking-[0.12em] transition-colors ${collapsedCategories.has(group.id) ? 'text-foreground/50 group-hover:text-foreground/80' : 'text-foreground'}`}>
                                            {group.label}
                                        </span>
                                    </div>
                                    <div className={`transition-all duration-300 ${collapsedCategories.has(group.id) ? 'rotate-0 opacity-40' : 'rotate-90 text-primary'}`}>
                                        <FiChevronRight size={14} />
                                    </div>
                                </button>
                                
                                <AnimatePresence initial={false}>
                                    {!collapsedCategories.has(group.id) && (
                                        <div className="space-y-1.5 pl-0.5 py-1 animate-in fade-in slide-in-from-top-2 duration-300">
                                            {group.pages.map((page: any) => (
                                                <div
                                                    key={page.id}
                                                    role="button"
                                                    tabIndex={0}
                                                    onClick={() => { setSelectedPageId(page.id); setSidebarView('sections'); }}
                                                    onKeyDown={(e) => { 
                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                            e.preventDefault();
                                                            setSelectedPageId(page.id); 
                                                            setSidebarView('sections'); 
                                                        }
                                                    }}
                                                    className="w-full flex items-center gap-3 p-2 rounded-xl text-left transition-all hover:bg-background hover:shadow-sm border border-transparent hover:border-foreground/10 group cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                                                >
                                                    <div className="w-7 h-7 bg-background border border-foreground/20 rounded-lg flex items-center justify-center text-foreground/50 shadow-sm transition-all group-hover:text-foreground group-hover:border-foreground/30 shrink-0">
                                                        {page.icon ? <page.icon size={14} strokeWidth={1.5} /> : <FiLayout size={14} strokeWidth={1.5} />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-[11px] text-foreground flex items-center justify-between transition-all">
                                                            <span className="truncate">{page.label}</span>
                                                            {page.id.startsWith('custom_') && (
                                                                <button
                                                                    onClick={(e) => handleDeletePage(e, page.id)}
                                                                    className="p-1 text-foreground/20 hover:text-red-500 hover:bg-red-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                                                                    title={t('admin.deletePage') || 'Sayfayı Sil'}
                                                                >
                                                                    <FiTrash2 size={10} />
                                                                </button>
                                                            )}
                                                        </h3>
                                                    </div>
                                                    <FiChevronRight size={12} className="text-foreground/20 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </nav>
                    <div className="px-4 pb-4 mt-auto">
                        <button
                            onClick={() => setIsAddPageModalOpen(true)}
                            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-foreground/30 text-foreground/50 hover:text-foreground hover:border-foreground/50 hover:bg-foreground/5 transition-all text-xs font-bold uppercase tracking-widest"
                        >
                            <FiPlus size={16} /> {t('admin.addPage') || 'Yeni Sayfa Ekle'}
                        </button>
                    </div>
                </div>
            )}

            {/* View: Section Editor */}
            {sidebarView === 'sections' && (
                <div className="flex flex-col h-full bg-foreground/5 animate-in slide-in-from-right-4 duration-300">
                    <div className="p-5 pb-2 pt-6">
                        <button
                            onClick={() => setSidebarView('pages')}
                            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground/40 hover:text-foreground mb-4 transition-colors group"
                        >
                            <FiChevronLeft className="group-hover:-translate-x-1 transition-transform" /> {t('admin.back')}
                        </button>
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-foreground text-background rounded-md">
                                    {selectedPage?.icon && <selectedPage.icon size={14} />}
                                </div>
                                <h2 className="font-bold text-base text-foreground">{selectedPage?.label}</h2>
                            </div>
                            {allowedPages.includes(selectedPageId) && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleClearAll}
                                        className="w-7 h-7 flex items-center justify-center bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all"
                                        title={t('admin.clearAll') || 'Tümünü Temizle'}
                                    >
                                        <FiTrash2 size={13} />
                                    </button>
                                    <div className="relative group flex items-center">
                                        <button
                                            onClick={() => setIsComponentStoreOpen(true)}
                                            className="w-7 h-7 flex items-center justify-center bg-foreground/10 hover:bg-foreground text-foreground/50 hover:text-background rounded-lg transition-all"
                                        >
                                            <FiPlus size={14} />
                                        </button>
                                        <div className="absolute top-1/2 -translate-y-1/2 right-full mr-2 px-2 py-1 bg-foreground text-background text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-sm">
                                            {t('admin.store')}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-foreground/50 font-medium">{t('admin.manageSections')}</p>
                    </div>

                    <div className="flex-1 overflow-y-auto px-5 pb-10 space-y-4 custom-scrollbar">
                        {activeSections.filter(s => s.isActive).length > 0 ? (
                            <div className="space-y-2">
                            {activeSections.filter(s => s.isActive).map((section, index) => {
                                const Icon = SECTION_ICONS_CONFIG[section.id] || FiSidebar;

                                return (
                                    <div
                                        key={section.id}
                                        draggable
                                        onDragStart={(e) => {
                                            e.dataTransfer.setData('text/plain', index.toString());
                                            e.currentTarget.classList.add('opacity-50');
                                        }}
                                        onDragEnd={(e) => {
                                            e.currentTarget.classList.remove('opacity-50');
                                        }}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                        }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            const draggedIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
                                            const targetIdx = index;
                            
                                            if (allowedPages.includes(selectedPageId) && draggedIdx !== targetIdx) {
                                                const currentActive = activeSections.filter(s => s.isActive);
                                                const draggedItem = currentActive[draggedIdx];
                                                const newArr = [...currentActive];
                                                newArr.splice(draggedIdx, 1);
                                                newArr.splice(targetIdx, 0, draggedItem);
                            
                                                const inactiveItems = activeSections.filter(s => !s.isActive);
                                                const fullArray = [...newArr, ...inactiveItems];
                                                handleDragEnd(fullArray);
                                            }
                                        }}
                                        onClick={() => { if (section.hasSettings && section.isActive) handleEditSection(section.id); }}
                                        className={`relative flex items-center justify-between p-3 rounded-xl border bg-background shadow-sm transition-all group cursor-pointer hover:-translate-y-0.5 hover:shadow-md ${section.isActive ? 'border-foreground/20' : 'border-foreground/20 opacity-60'}`}
                                    >
                                        <div className="flex flex-1 items-center gap-3 overflow-hidden pr-2">
                                            {allowedPages.includes(selectedPageId) && (
                                                <div className="text-foreground/30 group-hover:text-foreground/50 shrink-0">
                                                    <FiMenu size={14} />
                                                </div>
                                            )}
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0 ${section.isActive ? 'bg-foreground/10 text-foreground' : 'bg-foreground/5 text-foreground/40'}`}>
                                                <Icon size={14} />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className={`font-bold text-xs truncate ${section.isActive ? 'text-foreground' : 'text-foreground/50'}`}>{section.label}</h3>
                                                <p className="text-[10px] text-foreground/40 truncate">{section.description}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0 ml-2 relative z-20">
                                            {section.hasSettings && section.isActive && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleEditSection(section.id); }}
                                                    className="p-1.5 text-foreground/40 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                                    title={t('admin.configure')}
                                                >
                                                    <FiEdit2 size={13} />
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleRemoveSection(section.id); }}
                                                className={`p-1.5 rounded-lg transition-colors cursor-pointer text-foreground/40 hover:text-red-500 hover:bg-red-500/10`}
                                                title={t('admin.delete')}
                                            >
                                                <FiX size={13} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-foreground/40 text-xs border-2 border-dashed border-foreground/20 rounded-xl bg-foreground/5 mt-4">
                            <p>{t('admin.noComponents')}</p>
                            <p className="text-[10px] mt-1 opacity-70">{t('admin.addComponentDesc')}</p>
                        </div>
                    )}
                    </div>
                </div>
            )}
        </div>
    );
}
