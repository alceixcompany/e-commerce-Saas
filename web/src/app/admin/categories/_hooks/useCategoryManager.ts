'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import {
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
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
        } catch (err: any) {
            console.error('Submit error:', err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;
        try {
            await dispatch(deleteCategory(id)).unwrap();
        } catch (err: any) {
            alert(err || 'Failed to delete category');
        }
    };

    return {
        categories,
        metadata,
        page,
        setPage,
        limit,
        isLoading: loading.fetchList,
        isSubmitting: loading.create || loading.update,
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
    };
}
