import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useUserStore } from '@/lib/store/useUserStore';
import { useOrderStore } from '@/lib/store/useOrderStore';
import { useCart } from '@/contexts/CartContext';
import type { Address } from '@/types/profile';
import { UserProfile } from '@/types/profile';

type WishlistProduct = {
    _id: string;
    name: string;
    price: number;
    discountedPrice?: number;
    mainImage?: string;
    image?: string;
};

export type ProfileTab = 'profile' | 'addresses' | 'wishlist' | 'orders' | 'dashboard';
const isProfileTab = (value: string | null): value is ProfileTab =>
    value === 'profile' ||
    value === 'addresses' ||
    value === 'wishlist' ||
    value === 'orders' ||
    value === 'dashboard';

const mapProfileToAuthUser = (profile: UserProfile) => ({
    id: profile._id,
    name: profile.name,
    email: profile.email,
    role: profile.role as 'user' | 'admin',
    phone: profile.phone,
});

type ProfileFormData = { name: string; phone: string };

export function useProfileData() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { addItem } = useCart();

    // -- Zustand Stores --
    const { 
        isAuthenticated, 
        isVerifying: authVerifying, 
        setUser, 
        logout
    } = useAuthStore();
    
    const { 
        profile, 
        isLoading: profileLoading, 
        fetchProfile: fetchUserProfile,
        updateProfile: updateUserProfile,
        addAddress: addUserAddress,
        updateAddress: updateUserAddress,
        deleteAddress: deleteUserAddress,
        clearUser: clearUserProfile
    } = useUserStore();
    
    const { 
        orders, 
        metadata: orderMetadata, 
        isLoading: ordersLoading,
        fetchMyOrders 
    } = useOrderStore();

    // -- Component State --
    const [activeTab, setActiveTab] = useState<ProfileTab>(() => {
        const tab = searchParams.get('tab');
        return isProfileTab(tab) ? tab : 'dashboard';
    });
    const [orderPage, setOrderPage] = useState(1);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [isRecoveringSession, setIsRecoveringSession] = useState(false);

    // Forms
    const baseProfileForm = useMemo<ProfileFormData>(() => ({
        name: profile?.name || '',
        phone: profile?.phone || '',
    }), [profile?.name, profile?.phone]);
    
    const [profileFormOverride, setProfileFormOverride] = useState<ProfileFormData | null>(null);
    const profileForm: ProfileFormData = profileFormOverride ?? baseProfileForm;
    
    const setProfileForm = useCallback((next: ProfileFormData) => {
        setProfileFormOverride(next);
    }, []);
    
    const [addressForm, setAddressForm] = useState({
        title: '',
        fullAddress: '',
        city: '',
        district: '',
        postalCode: '',
        phone: '',
        isDefault: false,
    });

    useEffect(() => {
        let cancelled = false;

        const initProfileData = async () => {
            if (authVerifying) return;

            if (!isAuthenticated) {
                setIsRecoveringSession(true);

                try {
                    const profileData = await fetchUserProfile(true);
                    
                    if (cancelled) return;

                    if (profileData) {
                        setUser(mapProfileToAuthUser(profileData));
                    } else {
                        const query = searchParams.toString();
                        const returnUrl = query ? `/profile?${query}` : '/profile';
                        router.replace(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
                        setIsRecoveringSession(false);
                        return;
                    }
                } catch (err) {
                    console.error('Session recovery failed:', err);
                    router.replace('/login');
                    setIsRecoveringSession(false);
                    return;
                }
            }

            if (cancelled) return;

            // Fetch data
            fetchUserProfile();
            fetchMyOrders({ page: 1, limit: 10 });
            setIsRecoveringSession(false);
        };

        void initProfileData();

        return () => {
            cancelled = true;
        };
    }, [isAuthenticated, authVerifying, router, searchParams, fetchUserProfile, fetchMyOrders, setUser]);

    const resetAddressForm = useCallback(() => {
        setAddressForm({
            title: '',
            fullAddress: '',
            city: '',
            district: '',
            postalCode: '',
            phone: '',
            isDefault: false,
        });
    }, []);

    // -- Handlers --
    const handleLogout = useCallback(async () => {
        await logout();
        clearUserProfile();
        router.replace('/login');
    }, [logout, clearUserProfile, router]);

    const handleProfileUpdate = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateUserProfile(profileForm);
            setIsEditingProfile(false);
            setProfileFormOverride(null);
        } catch (err) {
            console.error('Failed to update profile:', err);
        }
    }, [updateUserProfile, profileForm]);

    const loadMoreOrders = useCallback(async () => {
        if (ordersLoading || orderPage >= orderMetadata.pages) return;
        const nextPage = orderPage + 1;
        setOrderPage(nextPage);
        await fetchMyOrders({ page: nextPage, limit: 10 });
    }, [ordersLoading, orderPage, orderMetadata.pages, fetchMyOrders]);

    const handleAddAddress = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingAddress) {
                await updateUserAddress(editingAddress._id, addressForm);
            } else {
                await addUserAddress(addressForm);
            }
            setShowAddressModal(false);
            setEditingAddress(null);
            resetAddressForm();
        } catch (err) {
            console.error('Failed to save address:', err);
        }
    }, [editingAddress, addressForm, resetAddressForm, updateUserAddress, addUserAddress]);

    const handleDeleteAddress = useCallback(async (addressId: string) => {
        if (!confirm('Are you sure you want to delete this address?')) return;
        try {
            await deleteUserAddress(addressId);
        } catch (err) {
            console.error('Failed to delete address:', err);
        }
    }, [deleteUserAddress]);

    const openAddressModal = useCallback((address?: Address) => {
        if (address) {
            setEditingAddress(address);
            setAddressForm({
                title: address.title,
                fullAddress: address.fullAddress,
                city: address.city,
                district: address.district,
                postalCode: address.postalCode,
                phone: address.phone,
                isDefault: address.isDefault,
            });
        } else {
            setEditingAddress(null);
            resetAddressForm();
        }
        setShowAddressModal(true);
    }, [resetAddressForm]);

    const handleAddToCart = useCallback((product: WishlistProduct) => {
        addItem({
            id: product._id,
            name: product.name,
            price: product.discountedPrice || product.price,
            image: product.mainImage || product.image || '',
        }, 1);
    }, [addItem]);

    return {
        // State
        activeTab,
        setActiveTab,
        isAuthenticated,
        isVerifying: authVerifying || isRecoveringSession,
        profile,
        orders,
        orderMetadata,
        isLoading: profileLoading,
        ordersLoading,
        isEditingProfile,
        setIsEditingProfile,
        showAddressModal,
        setShowAddressModal,
        editingAddress,
        profileForm,
        setProfileForm,
        addressForm,
        setAddressForm,
        orderPage,

        // Handlers
        handleLogout,
        handleProfileUpdate,
        loadMoreOrders,
        handleAddAddress,
        handleDeleteAddress,
        openAddressModal,
        handleAddToCart
    };
}
