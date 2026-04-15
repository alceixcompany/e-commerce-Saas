'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { FiShoppingBag } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

// --- Hooks & Logic ---
import { useProfileData } from './_hooks/useProfileData';
import { useTranslation } from '@/hooks/useTranslation';

// --- Components ---
import ProfileSidebar from './_components/ProfileSidebar';
import ProfileStats from './_components/ProfileStats';
import AddressModal from './_components/AddressModal';

// --- Tabs ---
import TabDashboard from './_components/Tabs/TabDashboard';
import TabOrders from './_components/Tabs/TabOrders';
import TabWishlist from './_components/Tabs/TabWishlist';
import TabAddresses from './_components/Tabs/TabAddresses';
import TabAccount from './_components/Tabs/TabAccount';

function ProfileContent() {
    const { t } = useTranslation();
    const {
        // State
        activeTab,
        setActiveTab,
        isAuthenticated,
        isVerifying,
        profile,
        orders,
        orderMetadata,
        isLoading,
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
    } = useProfileData();

    if (isVerifying || (isLoading && !profile)) {
        return (
            <div className="min-h-screen bg-background pt-24 md:pt-[120px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
                    <p className="text-xs font-bold uppercase tracking-widest text-foreground/40">{t('profile.tabs.orders.loading')}</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-background pt-24 md:pt-[120px] pb-40 font-sans">
            <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-20 space-y-8 md:space-y-12">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 border-b border-foreground/10 pb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{t('profile.summary')}</h1>
                        <p className="text-foreground/50 mt-2 font-medium">{t('profile.summaryDesc')}</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/collections" className="inline-flex items-center gap-2 px-6 py-2.5 bg-foreground text-background text-sm font-medium hover:bg-foreground/80 transition-all rounded-lg shadow-sm">
                            <FiShoppingBag /> {t('profile.exploreBoutique')}
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <ProfileStats 
                    orderCount={orders?.length || 0}
                    wishlistCount={profile?.wishlist?.length || 0}
                    addressCount={profile?.addresses?.length || 0}
                />

                <div className="grid lg:grid-cols-12 gap-6 lg:gap-10">
                    {/* Sidebar / Navigation */}
                    <ProfileSidebar 
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        handleLogout={handleLogout}
                    />

                    {/* Main Content Pane */}
                    <main className="lg:col-span-9 min-h-[500px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="bg-background rounded-xl border border-foreground/10 shadow-sm overflow-hidden"
                            >
                                {activeTab === 'dashboard' && (
                                    <TabDashboard 
                                        profileName={profile?.name || ''}
                                        orders={orders}
                                        setActiveTab={setActiveTab}
                                    />
                                )}

                                {activeTab === 'orders' && (
                                    <TabOrders 
                                        orders={orders}
                                        orderMetadata={orderMetadata}
                                        orderPage={orderPage}
                                        ordersLoading={ordersLoading}
                                        loadMoreOrders={loadMoreOrders}
                                    />
                                )}

                                {activeTab === 'wishlist' && (
                                    <TabWishlist 
                                        wishlist={profile?.wishlist || []}
                                        handleAddToCart={handleAddToCart}
                                    />
                                )}

                                {activeTab === 'addresses' && (
                                    <TabAddresses 
                                        addresses={profile?.addresses || []}
                                        openAddressModal={openAddressModal}
                                        handleDeleteAddress={handleDeleteAddress}
                                    />
                                )}

                                {activeTab === 'profile' && (
                                    <TabAccount 
                                        profile={profile}
                                        profileForm={profileForm}
                                        setProfileForm={setProfileForm}
                                        isEditing={isEditingProfile}
                                        setIsEditing={setIsEditingProfile}
                                        handleUpdate={handleProfileUpdate}
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </main>
                </div>
            </div>

            <AddressModal 
                show={showAddressModal}
                onClose={() => setShowAddressModal(false)}
                onSubmit={handleAddAddress}
                editingAddress={editingAddress}
                addressForm={addressForm}
                setAddressForm={setAddressForm}
            />
        </div>
    );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <ProfileContent />
        </Suspense>
    );
}
