'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, LoginCredentials, RegisterCredentials } from '@/types/auth';
import { authService } from '../services/authService';
import { mapAuthError } from '@/utils/errorMapper';

interface AuthState {
    user: User | null;
    token: string | null; // Note: token is mainly handled via HttpOnly cookies, this is for UI markers
    isAuthenticated: boolean;
    isVerifying: boolean;
    error: string | null;
    isLoading: boolean;

    // Actions
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    setVerifying: (status: boolean) => void;
    clearError: () => void;
    
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (credentials: RegisterCredentials) => Promise<void>;
    googleLogin: (token: string) => Promise<void>;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isVerifying: true,
            error: null,
            isLoading: false,

            setUser: (user) => set({ 
                user, 
                isAuthenticated: !!user, 
                isVerifying: false 
            }),
            
            setToken: (token) => set({ 
                token, 
                isAuthenticated: !!token 
            }),
            
            setVerifying: (isVerifying) => set({ isVerifying }),
            
            clearError: () => set({ error: null }),

            login: async (credentials) => {
                set({ isLoading: true, error: null });
                try {
                    const data = await authService.login(credentials);
                    set({ 
                        user: data.user, 
                        token: 'verified', 
                        isAuthenticated: true, 
                        isLoading: false,
                        isVerifying: false
                    });
                } catch (error: any) {
                    const errorMsg = error.response?.data?.message || error.message || 'Login failed';
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
                        token: 'verified', 
                        isAuthenticated: true, 
                        isLoading: false,
                        isVerifying: false
                    });
                } catch (error: any) {
                    const errorMsg = error.response?.data?.message || error.message || 'Registration failed';
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
                        token: 'verified', 
                        isAuthenticated: true, 
                        isLoading: false,
                        isVerifying: false
                    });
                } catch (error: any) {
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
                        token: null, 
                        isAuthenticated: false, 
                        isVerifying: false 
                    });
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem('cart');
                    }
                }
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ 
                user: state.user, 
                isAuthenticated: state.isAuthenticated 
            }),
        }
    )
);
