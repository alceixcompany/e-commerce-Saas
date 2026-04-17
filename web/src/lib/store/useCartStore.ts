'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { CartItem } from '@/types/cart';

interface CartState {
    items: CartItem[];
    shippingAddress: any | null;
    paymentMethod: string;
    isSidebarOpen: boolean;

    // Actions
    addItem: (item: CartItem) => void;
    updateQuantity: (id: string, quantity: number) => void;
    removeItem: (id: string) => void;
    saveShippingAddress: (address: any) => void;
    savePaymentMethod: (method: string) => void;
    toggleSidebar: (open?: boolean) => void;
    clearCart: () => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set) => ({
            items: [],
            shippingAddress: null,
            paymentMethod: 'Iyzico',
            isSidebarOpen: false,

            addItem: (item) => set((state) => {
                const existItem = state.items.find((x) => x.id === item.id);
                let newItems;

                if (existItem) {
                    newItems = state.items.map((x) =>
                        x.id === existItem.id ? { ...x, quantity: x.quantity + item.quantity } : x
                    );
                } else {
                    newItems = [...state.items, item];
                }

                return { items: newItems, isSidebarOpen: true };
            }),

            updateQuantity: (id, quantity) => set((state) => ({
                items: state.items.map((item) => 
                    item.id === id ? { ...item, quantity } : item
                )
            })),

            removeItem: (id) => set((state) => ({
                items: state.items.filter((x) => x.id !== id)
            })),

            saveShippingAddress: (address) => set({ shippingAddress: address }),
            
            savePaymentMethod: (method) => set({ paymentMethod: method }),

            toggleSidebar: (open) => set((state) => ({ 
                isSidebarOpen: open !== undefined ? open : !state.isSidebarOpen 
            })),

            clearCart: () => set({ 
                items: [], 
                isSidebarOpen: false 
            }),
        }),
        {
            name: 'cart-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
