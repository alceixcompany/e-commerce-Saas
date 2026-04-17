'use client';

import { useCategoryManager } from './_hooks/useCategoryManager';
import CategoryForm from './_components/CategoryForm';
import CategoryTable from './_components/CategoryTable';
import AdminPagination from '@/components/admin/AdminPagination';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { useTranslation } from '@/hooks/useTranslation';
import { Category } from '@/types/category';

interface CategoryListingClientProps {
    initialCategories?: Category[];
    initialMetadata?: any;
}

export default function CategoryListingClient({ initialCategories = [], initialMetadata }: CategoryListingClientProps) {
    const { t } = useTranslation();
    const {
        categories: storeCategories,
        metadata: storeMetadata,
        setPage,
        limit,
        isLoading: storeLoading,
        isSubmitting,
        isDeleting,
        error,
        showForm,
        setShowForm,
        editingId,
        formData,
        handleChange,
        setManualField,
        handleSubmit,
        handleEdit,
        handleCancelEdit,
        handleDelete,
        selectedCategoryIds,
        handleBulkDelete,
        toggleSelect,
        toggleSelectAll
    } = useCategoryManager();

    const categories = storeCategories.length > 0 ? storeCategories : initialCategories;
    const metadata = storeMetadata.total > 0 ? storeMetadata : (initialMetadata || { page: 1, pages: 1, total: initialCategories.length });
    const isLoading = storeLoading && storeCategories.length === 0;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">{t('admin.catalog.categories.title')}</h1>
                    <p className="text-foreground/50 mt-2 font-medium">{t('admin.catalog.categories.subtitle')}</p>
                </div>
                {!showForm && (
                    <div className="flex items-center gap-3">
                        {selectedCategoryIds.length > 0 && (
                            <button
                                onClick={handleBulkDelete}
                                disabled={isDeleting}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-all rounded-xl shadow-lg hover:shadow-red-500/20 disabled:opacity-50"
                            >
                                <FiTrash2 size={18} />
                                {t('admin.common.selected')}: {selectedCategoryIds.length}
                            </button>
                        )}
                        <button
                            onClick={() => setShowForm(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background text-[10px] font-black uppercase tracking-[0.2em] hover:bg-foreground/80 transition-all rounded-xl shadow-lg hover:shadow-foreground/20"
                        >
                            <FiPlus size={18} />
                            {t('admin.catalog.categories.addCategory')}
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <div className="p-4 bg-red-500/5 text-red-500 rounded-xl border border-red-500/10 flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                    <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
                </div>
            )}

            {showForm ? (
                <CategoryForm
                    editingId={editingId}
                    formData={formData}
                    handleChange={handleChange}
                    setManualField={setManualField}
                    handleSubmit={handleSubmit}
                    handleCancelEdit={handleCancelEdit}
                    isLoading={isSubmitting}
                />
            ) : (
                <>
                    <div className="bg-background border border-foreground/10 rounded-2xl shadow-sm overflow-hidden">
                        <CategoryTable
                            categories={categories}
                            isLoading={isLoading}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            selectedIds={selectedCategoryIds}
                            onToggleSelect={toggleSelect}
                            onToggleSelectAll={toggleSelectAll}
                        />

                        <AdminPagination
                            currentPage={metadata.page}
                            totalPages={metadata.pages}
                            totalItems={metadata.total}
                            limit={limit}
                            onPageChange={(p) => setPage(p)}
                            isLoading={isLoading}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
