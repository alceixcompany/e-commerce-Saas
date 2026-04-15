'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { getErrorMessage } from '@/lib/redux-utils';
import {
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    bulkDeleteCategories,
    clearError,
} from '@/lib/slices/categorySlice';
import { Category } from '@/types/category';

export function useCategoryManager() {
    const dispatch = useAppDispatch();
    const { categories, loading, error, metadata } = useAppSelector((state) => state.category);
    
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
        dispatch(fetchCategories({ page, limit }));
    }, [dispatch, page, limit]);

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
        dispatch(clearError());

        try {
            const submitData = {
                name: formData.name,
                slug: formData.slug,
                image: formData.image || '',
                bannerImage: formData.bannerImage || '',
                status: formData.status,
            };

            if (editingId) {
                await dispatch(updateCategory({ id: editingId, data: submitData })).unwrap();
            } else {
                await dispatch(createCategory(submitData)).unwrap();
            }
            
            handleCancelEdit();
            dispatch(fetchCategories({ page, limit }));
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
            await dispatch(deleteCategory(id)).unwrap();
            dispatch(fetchCategories({ page, limit }));
        } catch (err: unknown) {
            alert(getErrorMessage(err) || 'Failed to delete category');
        }
    };

    const handleBulkDelete = async () => {
        if (selectedCategoryIds.length === 0) return;

        const totalProductsAffected = categories
            .filter(c => selectedCategoryIds.includes(c._id))
            .reduce((sum, c) => sum + (c.productCount || 0), 0);

        let message = `Are you sure you want to delete ${selectedCategoryIds.length} categories?`;
        if (totalProductsAffected > 0) {
            message = `These ${selectedCategoryIds.length} categories contain a total of ${totalProductsAffected} products. Deleting them will permanently remove all associated products. Are you sure?`;
        }

        if (confirm(message)) {
            try {
                await dispatch(bulkDeleteCategories(selectedCategoryIds)).unwrap();
                setSelectedCategoryIds([]);
                dispatch(fetchCategories({ page, limit }));
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
        isLoading: loading.fetchList,
        isSubmitting: loading.create || loading.update,
        isDeleting: loading.delete,
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
