'use client';

import { useCategoryManager } from './_hooks/useCategoryManager';
import CategoryForm from './_components/CategoryForm';
import CategoryTable from './_components/CategoryTable';
import AdminPagination from '@/components/admin/AdminPagination';
import { FiPlus } from 'react-icons/fi';

export default function CategoriesPage() {
    const {
        categories,
        metadata,
        page,
        setPage,
        limit,
        isLoading,
        isSubmitting,
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
        handleDelete
    } = useCategoryManager();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Categories</h1>
                    <p className="text-foreground/50 mt-2">Manage product categories and structure</p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-foreground text-background text-sm font-medium hover:bg-foreground/80 transition-all rounded-lg shadow-sm hover:shadow-md"
                    >
                        <FiPlus size={18} />
                        Add Category
                    </button>
                )}
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    {error}
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
                <div className="bg-background border border-foreground/10 rounded-xl shadow-sm overflow-hidden">
                    <CategoryTable 
                        categories={categories}
                        isLoading={isLoading}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
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
            )}
        </div>
    );
}
