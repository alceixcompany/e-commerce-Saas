'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserProfile, UpdateProfilePayload, AddressPayload } from '@/types/profile';
import { profileService } from '../services/profileService';

interface UserState {
    profile: UserProfile | null;
    wishlist: string[]; // Array of product IDs for fast lookup
    isLoading: boolean;
    error: string | null;
    lastFetchedAt: number | null;

    // Actions
    fetchProfile: (forceRefresh?: boolean) => Promise<UserProfile | null>;
    updateProfile: (data: UpdateProfilePayload) => Promise<void>;
    addAddress: (data: AddressPayload) => Promise<void>;
    updateAddress: (addressId: string, data: Partial<AddressPayload>) => Promise<void>;
    deleteAddress: (addressId: string) => Promise<void>;
    
    // Wishlist Actions
    addToWishlist: (productId: string) => Promise<void>;
    removeFromWishlist: (productId: string) => Promise<void>;
    isInWishlist: (productId: string) => boolean;
    
    // Auth related
    clearUser: () => void;
    clearError: () => void;
}

const REUSE_WINDOW_MS = 2 * 60 * 1000;

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            profile: null,
            wishlist: [],
            isLoading: false,
            error: null,
            lastFetchedAt: null,

            fetchProfile: async (forceRefresh = false) => {
                const { profile, lastFetchedAt, isLoading } = get();
                const fetchedRecently = !!lastFetchedAt && Date.now() - lastFetchedAt < REUSE_WINDOW_MS;

                if (!forceRefresh && profile && !isLoading && fetchedRecently) {
                    return profile;
                }

                set({ isLoading: true, error: null });
                try {
                    const data = await profileService.fetchProfile();
                    set({ 
                        profile: data, 
                        wishlist: data.wishlist?.map((p: any) => typeof p === 'string' ? p : p._id) || [],
                        lastFetchedAt: Date.now(),
                        isLoading: false 
                    });
                    return data;
                } catch (error: any) {
                    set({ error: error.message || 'Failed to fetch profile', isLoading: false });
                    return null;
                }
            },

            updateProfile: async (data) => {
                set({ isLoading: true, error: null });
                try {
                    const updated = await profileService.updateProfile(data);
                    set({ profile: updated, lastFetchedAt: Date.now(), isLoading: false });
                } catch (error: any) {
                    set({ error: error.message || 'Update failed', isLoading: false });
                    throw error;
                }
            },

            addAddress: async (data) => {
                set({ isLoading: true, error: null });
                try {
                    const updated = await profileService.addAddress(data);
                    set({ profile: updated, lastFetchedAt: Date.now(), isLoading: false });
                } catch (error: any) {
                    set({ error: error.message || 'Failed to add address', isLoading: false });
                    throw error;
                }
            },

            updateAddress: async (addressId, data) => {
                set({ isLoading: true, error: null });
                try {
                    const updated = await profileService.updateAddress(addressId, data);
                    set({ profile: updated, lastFetchedAt: Date.now(), isLoading: false });
                } catch (error: any) {
                    set({ error: error.message || 'Failed to update address', isLoading: false });
                    throw error;
                }
            },

            deleteAddress: async (addressId) => {
                set({ isLoading: true, error: null });
                try {
                    const updated = await profileService.deleteAddress(addressId);
                    set({ profile: updated, lastFetchedAt: Date.now(), isLoading: false });
                } catch (error: any) {
                    set({ error: error.message || 'Failed to delete address', isLoading: false });
                    throw error;
                }
            },

            addToWishlist: async (productId) => {
                // Optimistic UI update
                const prevWishlist = get().wishlist;
                if (prevWishlist.includes(productId)) return;
                
                set({ wishlist: [...prevWishlist, productId] });
                
                try {
                    const updated = await profileService.addToWishlist(productId);
                    set({ 
                        profile: updated, 
                        wishlist: updated.wishlist?.map((p: any) => typeof p === 'string' ? p : p._id) || [],
                        lastFetchedAt: Date.now() 
                    });
                } catch (error: any) {
                    // Rollback on error
                    set({ wishlist: prevWishlist, error: error.message || 'Wishlist update failed' });
                }
            },

            removeFromWishlist: async (productId) => {
                const prevWishlist = get().wishlist;
                set({ wishlist: prevWishlist.filter(id => id !== productId) });
                
                try {
                    const updated = await profileService.removeFromWishlist(productId);
                    set({ 
                        profile: updated, 
                        wishlist: updated.wishlist?.map((p: any) => typeof p === 'string' ? p : p._id) || [],
                        lastFetchedAt: Date.now() 
                    });
                } catch (error: any) {
                    set({ wishlist: prevWishlist, error: error.message || 'Wishlist update failed' });
                }
            },

            isInWishlist: (productId) => {
                return get().wishlist.includes(productId);
            },

            clearUser: () => set({ profile: null, wishlist: [], lastFetchedAt: null, error: null }),
            clearError: () => set({ error: null })
        }),
        {
            name: 'user-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ wishlist: state.wishlist }), // Only persist wishlist locally for guest/performance
        }
    )
);
