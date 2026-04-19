'use client';

import { create } from 'zustand';
import { getErrorMessage } from '@/lib/utils/error';
import type { Blog } from '@/types/blog';
import { blogService, type BlogAdminListParams, type BlogListParams } from '../services/blogService';

interface BlogMetadata {
    total: number;
    page: number;
    pages: number;
}

interface BlogState {
    blogs: Blog[];
    currentBlog: Blog | null;
    metadata: BlogMetadata;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchBlogs: (params?: (BlogListParams & { query?: string; admin?: false }) | (BlogAdminListParams & { query?: string; admin: true })) => Promise<void>;
    fetchBlogBySlug: (slug: string) => Promise<Blog | null>;
    createBlog: (data: Partial<Blog>) => Promise<Blog>;
    updateBlog: (id: string, data: Partial<Blog>) => Promise<Blog>;
    deleteBlog: (id: string) => Promise<void>;
    bulkDeleteBlogs: (ids: string[]) => Promise<void>;
    clearCurrentBlog: () => void;
}

export const useBlogStore = create<BlogState>((set, get) => ({
    blogs: [],
    currentBlog: null,
    metadata: { total: 0, page: 1, pages: 1 },
    isLoading: false,
    error: null,

    fetchBlogs: async (params) => {
        set({ isLoading: true, error: null });
        try {
            const response = params?.admin 
                ? await blogService.fetchAllBlogs({ page: params.page, limit: params.limit, q: params.q || params.query })
                : await blogService.fetchBlogs(params);
            
            set({ 
                blogs: response.data, 
                metadata: response.metadata,
                isLoading: false 
            });
        } catch (error: unknown) {
            set({ error: getErrorMessage(error) || 'Failed to fetch stories', isLoading: false });
        }
    },

    fetchBlogBySlug: async (slug) => {
        set({ isLoading: true, error: null });
        try {
            const blog = await blogService.fetchBlogBySlug(slug);
            set({ currentBlog: blog, isLoading: false });
            return blog;
        } catch (error: unknown) {
            set({ error: getErrorMessage(error) || 'Failed to fetch story', isLoading: false });
            return null;
        }
    },

    createBlog: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const blog = await blogService.createBlog(data);
            set((state) => ({ 
                blogs: [blog, ...state.blogs],
                isLoading: false 
            }));
            return blog;
        } catch (error: unknown) {
            set({ error: getErrorMessage(error) || 'Failed to create story', isLoading: false });
            throw error;
        }
    },

    updateBlog: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
            const blog = await blogService.updateBlog(id, data);
            set((state) => ({
                blogs: state.blogs.map(b => b._id === id ? blog : b),
                currentBlog: state.currentBlog?._id === id ? blog : state.currentBlog,
                isLoading: false
            }));
            return blog;
        } catch (error: unknown) {
            set({ error: getErrorMessage(error) || 'Failed to update story', isLoading: false });
            throw error;
        }
    },

    deleteBlog: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await blogService.deleteBlog(id);
            set((state) => ({
                blogs: state.blogs.filter(b => b._id !== id),
                isLoading: false
            }));
        } catch (error: unknown) {
            set({ error: getErrorMessage(error) || 'Failed to delete story', isLoading: false });
            throw error;
        }
    },

    bulkDeleteBlogs: async (ids) => {
        set({ isLoading: true, error: null });
        try {
            await blogService.bulkDeleteBlogs(ids);
            set((state) => ({
                blogs: state.blogs.filter(b => !ids.includes(b._id)),
                isLoading: false
            }));
        } catch (error: unknown) {
            set({ error: getErrorMessage(error) || 'Failed to delete stories', isLoading: false });
            throw error;
        }
    },

    clearCurrentBlog: () => set({ currentBlog: null })
}));
