'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, LoginCredentials, RegisterCredentials } from '@/types/auth';
import { authService } from '../services/authService';
import { mapAuthError } from '@/utils/errorMapper';
import { CART_STORAGE_KEY } from '@/contexts/cart/cartStorage';
import { AUTH_STORAGE_KEY } from '@/lib/auth/authStorage';

function getAuthErrorMessage(error: unknown, fallback: string) {
    if (typeof error === 'object' && error !== null) {
        const response = 'response' in error ? (error as { response?: unknown }).response : undefined;
        if (typeof response === 'object' && response !== null) {
            const data = 'data' in response ? (response as { data?: unknown }).data : undefined;
            if (typeof data === 'object' && data !== null) {
                const message = 'message' in data ? (data as { message?: unknown }).message : undefined;
                if (typeof message === 'string') return message;
            }
        }

        const message = 'message' in error ? (error as { message?: unknown }).message : undefined;
        if (typeof message === 'string') return message;
    }

    return fallback;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isVerifying: boolean;
    error: string | null;
    isLoading: boolean;

    // Actions
    setUser: (user: User | null) => void;
    setVerifying: (status: boolean) => void;
    clearError: () => void;
    
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (credentials: RegisterCredentials) => Promise<void>;
    googleLogin: (token: string) => Promise<void>;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isVerifying: true,
            error: null,
            isLoading: false,

            setUser: (user) => set({ 
                user, 
                isAuthenticated: !!user, 
                isVerifying: false 
            }),
            
            setVerifying: (isVerifying) => set({ isVerifying }),
            
            clearError: () => set({ error: null }),

            login: async (credentials) => {
                set({ isLoading: true, error: null });
                try {
                    const data = await authService.login(credentials);
                    set({ 
                        user: data.user, 
                        isAuthenticated: true, 
                        isLoading: false,
                        isVerifying: false
                    });
                } catch (error: unknown) {
                    const errorMsg = getAuthErrorMessage(error, 'Login failed');
                    set({ error: mapAuthError(errorMsg), isLoading: false });
                    throw error;
                }
            },

            register: async (credentials) => {
                set({ isLoading: true, error: null });
                try {
                    const data = await authService.register(credentials);
                    set({ 
                        user: data.user, 
                        isAuthenticated: true, 
                        isLoading: false,
                        isVerifying: false
                    });
                } catch (error: unknown) {
                    const errorMsg = getAuthErrorMessage(error, 'Registration failed');
                    set({ error: mapAuthError(errorMsg), isLoading: false });
                    throw error;
                }
            },

            googleLogin: async (token) => {
                set({ isLoading: true, error: null });
                try {
                    const data = await authService.googleLogin(token);
                    set({ 
                        user: data.user, 
                        isAuthenticated: true, 
                        isLoading: false,
                        isVerifying: false
                    });
                } catch (error: unknown) {
                    set({ error: 'Google login failed', isLoading: false });
                    throw error;
                }
            },

            logout: async () => {
                try {
                    await authService.logout();
                } catch (error) {
                    console.error('Logout failed on server', error);
                } finally {
                    set({ 
                        user: null, 
                        isAuthenticated: false, 
                        isVerifying: false 
                    });
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem(CART_STORAGE_KEY);
                        localStorage.removeItem(AUTH_STORAGE_KEY);
                    }
                }
            },
        }),
        {
            name: AUTH_STORAGE_KEY,
            storage: createJSONStorage(() => localStorage),
            partialize: () => ({}),
        }
    )
);
