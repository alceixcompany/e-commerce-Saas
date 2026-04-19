'use client';

import { create } from 'zustand';
import { getErrorMessage } from '@/lib/utils/error';
import { AdminUser as User, DashboardStats, Message } from '@/types/admin';
import { Order } from '@/types/order';
import { adminService } from '../services/adminService';
import type { PaginationData } from '@/types/common';

interface AdminStatus {
    loading: boolean;
    error: string | null;
    success: boolean;
}

interface AdminState {
    users: User[];
    messages: Message[];
    stats: DashboardStats | null;
    selectedUser: User | null;
    selectedUserOrders: Order[];
    selectedUserOrdersMetadata: PaginationData;
    metadata: PaginationData;
    isLoading: Record<string, boolean>;
    error: string | null;

    // Actions
    fetchDashboardStats: () => Promise<DashboardStats>;
    fetchUsers: (params?: { page?: number; limit?: number; q?: string; sort?: string; role?: string }) => Promise<{ data: User[] } & PaginationData>;
    fetchUserDetails: (userId: string, params?: { page?: number; limit?: number }) => Promise<{ user: User; orders: Order[]; metadata: PaginationData }>;
    updateUserRole: (userId: string, role: 'user' | 'admin') => Promise<User>;
    deleteUser: (userId: string) => Promise<string>;
    bulkDeleteUsers: (ids: string[]) => Promise<string[]>;
    fetchMessages: () => Promise<Message[]>;
    
    clearError: () => void;
    clearUsers: () => void;
    clearMessages: () => void;
    clearSelectedUser: () => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
    users: [],
    messages: [],
    stats: null,
    selectedUser: null,
    selectedUserOrders: [],
    selectedUserOrdersMetadata: { total: 0, page: 1, pages: 1 },
    metadata: { total: 0, page: 1, pages: 1 },
    isLoading: {},
    error: null,

    fetchDashboardStats: async () => {
        set((state) => ({ isLoading: { ...state.isLoading, stats: true }, error: null }));
        try {
            const stats = await adminService.fetchDashboardStats();
            set((state) => ({ stats, isLoading: { ...state.isLoading, stats: false } }));
            return stats;
        } catch (error: unknown) {
            set((state) => ({ error: getErrorMessage(error) || 'Failed to fetch stats', isLoading: { ...state.isLoading, stats: false } }));
            throw error;
        }
    },

    fetchUsers: async (params) => {
        set((state) => ({ isLoading: { ...state.isLoading, fetchUsers: true }, error: null }));
        try {
            const response = await adminService.fetchUsers(params || {});
            const { data, total, page, pages } = response;
            set((state) => ({ 
                users: data, 
                metadata: { total, page, pages },
                isLoading: { ...state.isLoading, fetchUsers: false } 
            }));
            return response;
        } catch (error: unknown) {
            set((state) => ({ error: getErrorMessage(error) || 'Failed to fetch users', isLoading: { ...state.isLoading, fetchUsers: false } }));
            throw error;
        }
    },

    fetchUserDetails: async (userId, params) => {
        set((state) => ({ isLoading: { ...state.isLoading, userDetails: true }, error: null }));
        try {
            const response = await adminService.fetchUserDetails(userId, params);
            set((state) => ({ 
                selectedUser: response.user,
                selectedUserOrders: response.orders,
                selectedUserOrdersMetadata: response.metadata || { total: 0, page: 1, pages: 1 },
                isLoading: { ...state.isLoading, userDetails: false }
            }));
            return response;
        } catch (error: unknown) {
            set((state) => ({ error: getErrorMessage(error) || 'Failed to fetch user details', isLoading: { ...state.isLoading, userDetails: false } }));
            throw error;
        }
    },

    updateUserRole: async (userId, role) => {
        set((state) => ({ isLoading: { ...state.isLoading, updateRole: true }, error: null }));
        try {
            const updatedUser = await adminService.updateUserRole(userId, role);
            set((state) => ({
                users: state.users.map(u => u._id === userId ? { ...u, role } : u),
                selectedUser: state.selectedUser?._id === userId ? { ...state.selectedUser, role } : state.selectedUser,
                isLoading: { ...state.isLoading, updateRole: false }
            }));
            return updatedUser;
        } catch (error: unknown) {
            set((state) => ({ error: getErrorMessage(error) || 'Failed to update user role', isLoading: { ...state.isLoading, updateRole: false } }));
            throw error;
        }
    },

    deleteUser: async (userId) => {
        set((state) => ({ isLoading: { ...state.isLoading, deleteUser: true }, error: null }));
        try {
            await adminService.deleteUser(userId);
            set((state) => ({
                users: state.users.filter(u => u._id !== userId),
                selectedUser: state.selectedUser?._id === userId ? null : state.selectedUser,
                isLoading: { ...state.isLoading, deleteUser: false }
            }));
            return userId;
        } catch (error: unknown) {
            set((state) => ({ error: getErrorMessage(error) || 'Failed to delete user', isLoading: { ...state.isLoading, deleteUser: false } }));
            throw error;
        }
    },

    bulkDeleteUsers: async (ids) => {
        set((state) => ({ isLoading: { ...state.isLoading, deleteUser: true }, error: null }));
        try {
            await adminService.bulkDeleteUsers(ids);
            set((state) => ({
                users: state.users.filter(u => !ids.includes(u._id)),
                selectedUser: state.selectedUser && ids.includes(state.selectedUser._id) ? null : state.selectedUser,
                isLoading: { ...state.isLoading, deleteUser: false }
            }));
            return ids;
        } catch (error: unknown) {
            set((state) => ({ error: getErrorMessage(error) || 'Failed to delete users', isLoading: { ...state.isLoading, deleteUser: false } }));
            throw error;
        }
    },

    fetchMessages: async () => {
        set((state) => ({ isLoading: { ...state.isLoading, fetchMessages: true }, error: null }));
        try {
            const messages = await adminService.fetchMessages();
            set((state) => ({ 
                messages, 
                isLoading: { ...state.isLoading, fetchMessages: false } 
            }));
            return messages;
        } catch (error: unknown) {
            set((state) => ({ error: getErrorMessage(error) || 'Failed to fetch messages', isLoading: { ...state.isLoading, fetchMessages: false } }));
            throw error;
        }
    },

    clearError: () => set({ error: null }),
    clearUsers: () => set({ users: [], metadata: { total: 0, page: 1, pages: 1 } }),
    clearMessages: () => set({ messages: [] }),
    clearSelectedUser: () => set({ selectedUser: null, selectedUserOrders: [], selectedUserOrdersMetadata: { total: 0, page: 1, pages: 1 } })
}));
