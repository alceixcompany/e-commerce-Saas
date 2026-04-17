import { useState, useEffect, useCallback } from 'react';
import { useCategoryStore } from '@/lib/store/useCategoryStore';
import { Category } from '@/types/category';

export function useCategoryManager() {
    const { 
        categories, 
        metadata, 
        isLoading, 
        error, 
        fetchCategories, 
        createCategory, 
        updateCategory, 
        deleteCategory, 
        clearError 
    } = useCategoryStore();
    
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        image: '',
        bannerImage: '',
        status: 'active' as 'active' | 'inactive',
    });

    useEffect(() => {
        fetchCategories({ page, limit });
    }, [fetchCategories, page, limit]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const next = { ...prev, [name]: value };
            // Auto-generate slug from name
            if (name === 'name') {
                next.slug = value
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');
            }
            return next;
        });
    }, []);

    const setManualField = useCallback((name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleEdit = useCallback((category: Category) => {
        setEditingId(category._id);
        setFormData({
            name: category.name,
            slug: category.slug,
            image: category.image || '',
            bannerImage: category.bannerImage || '',
            status: category.status,
        });
        setShowForm(true);
    }, []);

    const handleCancelEdit = useCallback(() => {
        setShowForm(false);
        setEditingId(null);
        setFormData({ name: '', slug: '', image: '', bannerImage: '', status: 'active' });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();

        try {
            const submitData = {
                name: formData.name,
                slug: formData.slug,
                image: formData.image || '',
                bannerImage: formData.bannerImage || '',
                status: formData.status,
            };

            if (editingId) {
                await updateCategory(editingId, submitData);
            } else {
                await createCategory(submitData);
            }
            
            handleCancelEdit();
            fetchCategories({ page, limit });
        } catch (err: unknown) {
            console.error('Submit error:', err);
        }
    };

    const handleDelete = async (id: string) => {
        const category = categories.find(c => c._id === id);
        const productCount = category?.productCount || 0;
        
        let message = 'Are you sure you want to delete this category?';
        if (productCount > 0) {
            message = `This category contains ${productCount} products. Deleting it will permanently remove all associated products. Are you sure?`;
        }

        if (!confirm(message)) return;
        try {
            await deleteCategory(id);
            fetchCategories({ page, limit });
        } catch (err: unknown) {
            console.error('Failed to delete category:', err);
        }
    };

    const handleBulkDelete = async () => {
        // Bulk delete is not yet implemented in the new store, but we can call deleteCategory multiple times or implement bulkDeleteProducts later
        // For now, let's keep it simple
        if (selectedCategoryIds.length === 0) return;

        if (confirm(`Are you sure you want to delete ${selectedCategoryIds.length} categories?`)) {
            try {
                for (const id of selectedCategoryIds) {
                    await deleteCategory(id);
                }
                setSelectedCategoryIds([]);
                fetchCategories({ page, limit });
            } catch (err: unknown) {
                console.error('Failed to bulk delete categories:', err);
            }
        }
    };

    const toggleSelect = useCallback((id: string) => {
        setSelectedCategoryIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    }, []);

    const toggleSelectAll = useCallback(() => {
        if (selectedCategoryIds.length === categories.length) {
            setSelectedCategoryIds([]);
        } else {
            setSelectedCategoryIds(categories.map(c => c._id));
        }
    }, [selectedCategoryIds.length, categories]);

    return {
        categories,
        metadata,
        page,
        setPage,
        limit,
        isLoading,
        isSubmitting: isLoading,
        isDeleting: isLoading,
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
        setSelectedCategoryIds,
        handleBulkDelete,
        toggleSelect,
        toggleSelectAll
    };
}
