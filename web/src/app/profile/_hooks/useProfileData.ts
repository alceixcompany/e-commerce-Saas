import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import type { Address } from '@/types/profile';
import {
    fetchProfile,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    clearProfile,
} from '@/lib/slices/profileSlice';
import { logoutUser, setUser } from '@/lib/slices/authSlice';
import { getMyOrders } from '@/lib/slices/orderSlice';
import { useCart } from '@/contexts/CartContext';

type WishlistProduct = {
    _id: string;
    name: string;
    price: number;
    discountedPrice?: number;
    mainImage?: string;
    image?: string;
};

export function useProfileData() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const searchParams = useSearchParams();
    const { addItem } = useCart();

    // -- Redux State --
    const { isAuthenticated, isVerifying } = useAppSelector((state) => state.auth);
    const { profile, loading } = useAppSelector((state) => state.profile);
    const { orders, metadata: orderMetadata, loading: orderLoadingState } = useAppSelector((state) => state.order);

    // -- Component State --
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [orderPage, setOrderPage] = useState(1);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [isRecoveringSession, setIsRecoveringSession] = useState(false);

    // Forms
    const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
    const [addressForm, setAddressForm] = useState({
        title: '',
        fullAddress: '',
        city: '',
        district: '',
        postalCode: '',
        phone: '',
        isDefault: false,
    });

    // -- Initialization --
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && ['profile', 'addresses', 'wishlist', 'orders', 'dashboard'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    useEffect(() => {
        let cancelled = false;

        const initProfileData = async () => {
            if (!mounted || isVerifying) return;

            if (!isAuthenticated) {
                setIsRecoveringSession(true);

                const rescueResult = await dispatch(fetchProfile({ silent: true, forceRefresh: true }));

                if (cancelled) return;

                if (!fetchProfile.fulfilled.match(rescueResult)) {
                    const returnUrl = `/profile${window.location.search}`;
                    router.replace(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
                    setIsRecoveringSession(false);
                    return;
                }

                dispatch(setUser({
                    id: rescueResult.payload._id,
                    name: rescueResult.payload.name,
                    email: rescueResult.payload.email,
                    role: rescueResult.payload.role as 'user' | 'admin',
                }));
            }

            if (cancelled) return;

            dispatch(fetchProfile());
            dispatch(getMyOrders({ page: 1, limit: 10 }));
            setIsRecoveringSession(false);
        };

        void initProfileData();

        return () => {
            cancelled = true;
        };
    }, [isAuthenticated, isVerifying, router, dispatch, mounted]);

    useEffect(() => {
        if (profile) {
            setProfileForm({
                name: profile.name || '',
                phone: profile.phone || '',
            });
        }
    }, [profile]);

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
        await dispatch(logoutUser());
        dispatch(clearProfile());
        router.replace('/login');
    }, [dispatch, router]);

    const handleProfileUpdate = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await dispatch(updateProfile(profileForm)).unwrap();
            setIsEditingProfile(false);
        } catch (err) {
            console.error('Failed to update profile:', err);
        }
    }, [dispatch, profileForm]);

    const loadMoreOrders = useCallback(async () => {
        const ordersLoading = orderLoadingState.fetchMyOrders;
        if (ordersLoading || orderPage >= orderMetadata.pages) return;
        const nextPage = orderPage + 1;
        setOrderPage(nextPage);
        await dispatch(getMyOrders({ page: nextPage, limit: 10 }));
    }, [orderLoadingState.fetchMyOrders, orderPage, orderMetadata.pages, dispatch]);

    const handleAddAddress = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingAddress) {
                await dispatch(updateAddress({ addressId: editingAddress._id, data: addressForm })).unwrap();
            } else {
                await dispatch(addAddress(addressForm)).unwrap();
            }
            setShowAddressModal(false);
            setEditingAddress(null);
            resetAddressForm();
        } catch (err) {
            console.error('Failed to save address:', err);
        }
    }, [dispatch, editingAddress, addressForm, resetAddressForm]);

    const handleDeleteAddress = useCallback(async (addressId: string) => {
        if (!confirm('Are you sure you want to delete this address?')) return;
        try {
            await dispatch(deleteAddress(addressId)).unwrap();
        } catch (err) {
            console.error('Failed to delete address:', err);
        }
    }, [dispatch]);

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
        mounted,
        activeTab,
        setActiveTab,
        isAuthenticated,
        isVerifying: isVerifying || isRecoveringSession,
        profile,
        orders,
        orderMetadata,
        isLoading: loading.fetch,
        ordersLoading: orderLoadingState.fetchMyOrders,
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
