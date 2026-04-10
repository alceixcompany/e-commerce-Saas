import {
    FiEye,
    FiPackage,
    FiHeart,
    FiMapPin,
    FiUser
} from 'react-icons/fi';

export const PROFILE_NAV_ITEMS = [
    { id: 'dashboard', label: 'profile.sidebar.overview', icon: FiEye },
    { id: 'orders', label: 'profile.sidebar.acquisitions', icon: FiPackage },
    { id: 'wishlist', label: 'profile.sidebar.vaultItems', icon: FiHeart },
    { id: 'addresses', label: 'profile.sidebar.destinations', icon: FiMapPin },
    { id: 'profile', label: 'profile.sidebar.accountData', icon: FiUser },
];

export const getStatCardsConfig = (orderCount: number, wishlistCount: number, addressCount: number) => [
    {
        title: 'profile.stats.totalAcquisitions',
        value: orderCount,
        icon: FiPackage,
        description: 'profile.stats.processedTransactions'
    },
    {
        title: 'profile.stats.wishlistVolume',
        value: wishlistCount,
        icon: FiHeart,
        description: 'profile.stats.savedTreasures'
    },
    {
        title: 'profile.stats.registryStatus',
        value: 'profile.stats.verified',
        icon: FiHeart, 
        description: 'profile.stats.securityActive'
    },
    {
        title: 'profile.stats.shippingGrid',
        value: addressCount,
        icon: FiMapPin,
        description: 'profile.stats.registeredDestinations'
    }
];
