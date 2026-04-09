import {
    FiEye,
    FiPackage,
    FiHeart,
    FiMapPin,
    FiUser
} from 'react-icons/fi';

export const PROFILE_NAV_ITEMS = [
    { id: 'dashboard', label: 'Overview', icon: FiEye },
    { id: 'orders', label: 'Acquisitions', icon: FiPackage },
    { id: 'wishlist', label: 'Vault Items', icon: FiHeart },
    { id: 'addresses', label: 'Destinations', icon: FiMapPin },
    { id: 'profile', label: 'Account Data', icon: FiUser },
];

export const getStatCardsConfig = (orderCount: number, wishlistCount: number, addressCount: number) => [
    {
        title: 'Total Acquisitions',
        value: orderCount,
        icon: FiPackage,
        description: 'Processed transactions'
    },
    {
        title: 'Wishlist Volume',
        value: wishlistCount,
        icon: FiHeart,
        description: 'Saved treasures'
    },
    {
        title: 'Registry Status',
        value: 'Verified',
        icon: FiHeart, // Note: Original used FiCheckCircle but mapped icon from statCards array. I will use the one from code.
        description: 'Account security active'
    },
    {
        title: 'Shipping Grid',
        value: addressCount,
        icon: FiMapPin,
        description: 'Registered destinations'
    }
];
