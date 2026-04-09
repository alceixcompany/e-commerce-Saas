'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { useLayoutEditor } from './_hooks/useLayoutEditor';

// --- Components ---
import LayoutSidebar from './_components/Core/LayoutSidebar';
import LivePreview from './_components/Core/LivePreview';
import EditorModalRegistry from './_components/Core/EditorModalRegistry';
import LayoutActionModals from './_components/Core/LayoutActionModals';

export default function LayoutSettingsPage() {
    const { t } = useTranslation();
    const {
        // State
        selectedPageId, setSelectedPageId,
        sidebarView, setSidebarView,
        refreshKey,
        viewMode, setViewMode,
        collapsedCategories,
        activeModal, setActiveModal,
        activeInstanceId,
        isComponentStoreOpen, setIsComponentStoreOpen,
        isAddPageModalOpen, setIsAddPageModalOpen,
        newPageName, setNewPageName,
        isComponentNameModalOpen, setIsComponentNameModalOpen,
        newInstanceName, setNewInstanceName,
        
        // Data
        groupedPages, selectedPage, activeSections, allowedPages,
        
        // Handlers
        triggerRefresh,
        toggleSection,
        handleRemoveSection,
        handleDeletePage,
        handleEditSection,
        handleAddFromStore,
        handleDragEnd,
        handleConvertSave,
        toggleCategory,
        setSectionsState,
        setSectionToConvert,
        persistLayout
    } = useLayoutEditor();

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-background">
            <LayoutSidebar
                t={t}
                sidebarView={sidebarView}
                setSidebarView={setSidebarView}
                groupedPages={groupedPages}
                collapsedCategories={collapsedCategories}
                toggleCategory={toggleCategory}
                selectedPageId={selectedPageId}
                setSelectedPageId={setSelectedPageId}
                handleDeletePage={(e, id) => {
                    e.stopPropagation();
                    handleDeletePage(id);
                }}
                setIsAddPageModalOpen={setIsAddPageModalOpen}
                selectedPage={selectedPage}
                activeSections={activeSections}
                allowedPages={allowedPages}
                handleClearAll={async () => {
                    if (window.confirm(t('admin.confirmClearAll') || 'Bu sayfadaki tüm bileşenleri silmek istediğinizden emin misiniz?')) {
                        await persistLayout(selectedPageId, []);
                    }
                }}
                setIsComponentStoreOpen={setIsComponentStoreOpen}
                handleEditSection={handleEditSection}
                handleRemoveSection={handleRemoveSection}
                handleDragEnd={handleDragEnd}
            />

            <LivePreview
                t={t}
                viewMode={viewMode}
                setViewMode={setViewMode}
                selectedPage={selectedPage}
                refreshKey={refreshKey}
            />

            <LayoutActionModals
                t={t}
                isAddPageModalOpen={isAddPageModalOpen}
                setIsAddPageModalOpen={setIsAddPageModalOpen}
                newPageName={newPageName}
                setNewPageName={setNewPageName}
                setSelectedPageId={setSelectedPageId}
                setSidebarView={setSidebarView}
                setSectionsState={setSectionsState}
                triggerRefresh={triggerRefresh}
                isComponentNameModalOpen={isComponentNameModalOpen}
                setIsComponentNameModalOpen={setIsComponentNameModalOpen}
                newInstanceName={newInstanceName}
                setNewInstanceName={setNewInstanceName}
                handleConvertSave={handleConvertSave}
                setSectionToConvert={setSectionToConvert}
            />

            <EditorModalRegistry
                activeModal={activeModal}
                activeInstanceId={activeInstanceId}
                setActiveModal={setActiveModal}
                triggerRefresh={triggerRefresh}
                isComponentStoreOpen={isComponentStoreOpen}
                setIsComponentStoreOpen={setIsComponentStoreOpen}
                handleAddFromStore={handleAddFromStore}
                activeSections={activeSections.filter(s => s.isActive).map(s => s.id)}
                selectedPageId={selectedPageId}
            />
        </div>
    );
}
