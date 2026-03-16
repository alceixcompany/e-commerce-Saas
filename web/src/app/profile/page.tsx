'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    FiUser,
    FiMapPin,
    FiHeart,
    FiPackage,
    FiEdit2,
    FiPlus,
    FiTrash2,
    FiLogOut,
    FiArrowRight,
    FiEye,
    FiShoppingBag,
    FiStar,
    FiSettings,
    FiCheckCircle,
    FiAlertCircle,
    FiX
} from 'react-icons/fi';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import {
    fetchProfile,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
} from '@/lib/slices/profileSlice';
import { logout } from '@/lib/slices/authSlice';
import { getMyOrders } from '@/lib/slices/orderSlice';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

function ProfileContent() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const searchParams = useSearchParams();
    const { isAuthenticated, user: authUser } = useAppSelector((state) => state.auth);
    const { profile, isLoading, error } = useAppSelector((state) => state.profile);
    const { orders, metadata: orderMetadata, isLoading: ordersLoading } = useAppSelector((state) => state.order);
    const { addItem } = useCart();

    const [orderPage, setOrderPage] = useState(1);

    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');

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
        if (mounted) {
            dispatch(getMyOrders({ page: 1, limit: 10 }));
        }
    }, [dispatch, mounted]);

    const loadMoreOrders = async () => {
        if (ordersLoading || orderPage >= orderMetadata.pages) return;
        const nextPage = orderPage + 1;
        setOrderPage(nextPage);
        await dispatch(getMyOrders({ page: nextPage, limit: 10 }));
    };

    const [isEditing, setIsEditing] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState<any>(null);

    const [profileForm, setProfileForm] = useState({
        name: '',
        phone: '',
    });

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
        if (!mounted) return;

        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        dispatch(fetchProfile());
    }, [isAuthenticated, router, dispatch, mounted]);

    useEffect(() => {
        if (profile) {
            setProfileForm({
                name: profile.name || '',
                phone: profile.phone || '',
            });
        }
    }, [profile]);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await dispatch(updateProfile(profileForm)).unwrap();
            setIsEditing(false);
        } catch (err: any) {
            console.error('Failed to update profile:', err);
        }
    };

    const handleAddAddress = async (e: React.FormEvent) => {
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
        } catch (err: any) {
            console.error('Failed to save address:', err);
        }
    };

    const handleDeleteAddress = async (addressId: string) => {
        if (!confirm('Are you sure you want to delete this address?')) return;
        try {
            await dispatch(deleteAddress(addressId)).unwrap();
        } catch (err: any) {
            console.error('Failed to delete address:', err);
        }
    };

    const openAddressModal = (address?: any) => {
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
    };

    const resetAddressForm = () => {
        setAddressForm({
            title: '',
            fullAddress: '',
            city: '',
            district: '',
            postalCode: '',
            phone: '',
            isDefault: false,
        });
    };

    const handleAddToCart = (product: any) => {
        addItem({
            id: product._id,
            name: product.name,
            price: product.discountedPrice || product.price,
            image: product.mainImage || product.image,
        }, 1);
    };

    if (!mounted) return null;
    if (!isAuthenticated) return null;

    if (isLoading && !profile) {
        return (
            <div className="min-h-screen bg-background pt-24 md:pt-[120px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
            </div>
        );
    }

    const statCards = [
        {
            title: 'Total Acquisitions',
            value: orders?.length || 0,
            icon: FiPackage,
            description: 'Processed transactions'
        },
        {
            title: 'Wishlist Volume',
            value: profile?.wishlist?.length || 0,
            icon: FiHeart,
            description: 'Saved treasures'
        },
        {
            title: 'Registry Status',
            value: 'Verified',
            icon: FiCheckCircle,
            description: 'Account security active'
        },
        {
            title: 'Shipping Grid',
            value: profile?.addresses?.length || 0,
            icon: FiMapPin,
            description: 'Registered destinations'
        }
    ];

    return (
        <div className="min-h-screen bg-background pt-24 md:pt-[120px] pb-40 font-sans">
            <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-20 space-y-8 md:space-y-12">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 border-b border-foreground/10 pb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Dashboard Summary</h1>
                        <p className="text-foreground/50 mt-2 font-medium">Manage your personal archive and account specifics.</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/collections" className="inline-flex items-center gap-2 px-6 py-2.5 bg-foreground text-background text-sm font-medium hover:bg-foreground/80 transition-all rounded-lg shadow-sm">
                            <FiShoppingBag /> Explore Boutique
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {statCards.map((stat, index) => (
                        <div key={index} className="bg-background p-4 md:p-6 rounded-xl border border-foreground/10 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center text-foreground group-hover:bg-foreground group-hover:text-background transition-colors">
                                    <stat.icon size={20} strokeWidth={1.5} />
                                </div>
                                <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">Active</span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-foreground mb-1">{stat.value}</h3>
                                <p className="text-sm font-medium text-foreground/50">{stat.title}</p>
                                <p className="text-xs text-foreground/40 mt-2 font-light">{stat.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-12 gap-6 lg:gap-10">
                    {/* Sidebar / Navigation */}
                    <aside className="lg:col-span-3">
                        <div className="bg-background rounded-xl border border-foreground/10 shadow-sm p-4 space-y-1 sticky top-24 lg:top-[140px]">
                            <p className="px-3 mb-4 text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Menu</p>
                            {[
                                { id: 'dashboard', label: 'Overview', icon: FiEye },
                                { id: 'orders', label: 'Acquisitions', icon: FiPackage },
                                { id: 'wishlist', label: 'Vault Items', icon: FiHeart },
                                { id: 'addresses', label: 'Destinations', icon: FiMapPin },
                                { id: 'profile', label: 'Account Data', icon: FiUser },
                            ].map((nav) => (
                                <button
                                    key={nav.id}
                                    onClick={() => setActiveTab(nav.id)}
                                    className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${activeTab === nav.id
                                        ? 'bg-foreground text-background shadow-lg shadow-foreground/5'
                                        : 'text-foreground/50 hover:bg-foreground/5 hover:text-foreground'
                                        }`}
                                >
                                    <nav.icon className={`w-4 h-4 ${activeTab === nav.id ? 'text-background' : 'text-foreground/40 group-hover:text-foreground'}`} />
                                    {nav.label}
                                </button>
                            ))}
                            <div className="pt-4 mt-4 border-t border-foreground/10">
                                <button
                                    onClick={() => {
                                        dispatch(logout());
                                        router.push('/login');
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 hover:text-red-700 transition-all"
                                >
                                    <FiLogOut className="w-4 h-4" /> Sign Out
                                </button>
                            </div>
                        </div>
                    </aside>

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
                                {/* Dashboard Section */}
                                {activeTab === 'dashboard' && (
                                    <div className="divide-y divide-foreground/10">
                                        <div className="p-4 md:p-10 lg:p-12 space-y-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-foreground/5 rounded-full flex items-center justify-center text-foreground/40 border border-foreground/10">
                                                    <FiUser size={24} />
                                                </div>
                                                <div>
                                                    <h2 className="text-2xl font-bold text-foreground">Welcome, {profile?.name.split(' ')[0]}</h2>
                                                    <p className="text-foreground/50">Your secure boutique profile is ready.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 md:p-10 lg:p-12 space-y-8">
                                            <div className="flex justify-between items-center">
                                                <h3 className="font-bold text-foreground uppercase tracking-widest text-xs">Recent History</h3>
                                                <button onClick={() => setActiveTab('orders')} className="text-xs font-bold text-foreground/40 hover:text-foreground">View All</button>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-6">
                                                {orders && orders.slice(0, 2).map((order: any) => (
                                                    <Link key={order._id} href={`/profile/orders/${order._id}`} className="p-6 border border-foreground/10 rounded-xl hover:border-foreground transition-all group">
                                                        <div className="flex justify-between items-start mb-6">
                                                            <p className="text-[10px] font-mono text-foreground/30">REF: {order._id.substring(order._id.length - 8).toUpperCase()}</p>
                                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${order.isPaid ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                                                {order.isPaid ? 'Settled' : 'Pending'}
                                                            </span>
                                                        </div>
                                                        <h4 className="text-xl font-bold text-foreground mb-6">${order.totalPrice.toFixed(2)}</h4>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex -space-x-2">
                                                                {order.orderItems.slice(0, 3).map((item: any, i: number) => (
                                                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-foreground/5 overflow-hidden shadow-sm">
                                                                        <img src={item.image} alt="" className="w-full h-full object-contain" />
                                                                    </div>
                                                                ))}
                                                                {order.orderItems.length > 3 && (
                                                                    <div className="w-8 h-8 rounded-full border-2 border-background bg-foreground text-background flex items-center justify-center text-[8px] font-bold">
                                                                        +{order.orderItems.length - 3}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <FiArrowRight className="text-foreground/20 group-hover:text-foreground transition-all -translate-x-2 group-hover:translate-x-0" size={18} />
                                                        </div>
                                                    </Link>
                                                ))}
                                                {(!orders || orders.length === 0) && (
                                                    <div className="col-span-2 py-10 text-center border border-dashed border-foreground/10 rounded-xl italic text-foreground/40 text-sm">
                                                        No recent acquisitions found.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Acquisitions Section */}
                                {activeTab === 'orders' && (
                                    <div className="p-4 md:p-8">
                                        <h2 className="text-lg md:text-xl font-bold text-foreground mb-6 md:mb-8 px-2">Acquisition Registry</h2>
                                        <div>
                                            {/* Desktop Table View */}
                                            <div className="hidden md:block overflow-x-auto custom-scrollbar pb-2">
                                                <table className="w-full min-w-[700px]">
                                                    <thead className="bg-foreground/5 border-b border-foreground/10">
                                                        <tr>
                                                            <th className="px-6 py-4 text-left text-xs font-bold text-foreground/40 uppercase tracking-widest whitespace-nowrap">Reference</th>
                                                            <th className="px-6 py-4 text-left text-xs font-bold text-foreground/40 uppercase tracking-widest whitespace-nowrap">Date</th>
                                                            <th className="px-6 py-4 text-left text-xs font-bold text-foreground/40 uppercase tracking-widest whitespace-nowrap">Status</th>
                                                            <th className="px-6 py-4 text-left text-xs font-bold text-foreground/40 uppercase tracking-widest text-right whitespace-nowrap">Total</th>
                                                            <th className="px-6 py-4 text-right text-xs font-bold text-foreground/40 uppercase tracking-widest whitespace-nowrap">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-foreground/10">
                                                        {orders && orders.length > 0 ? orders.map((order: any) => (
                                                            <tr key={order._id} className="hover:bg-foreground/5 transition-colors group">
                                                                <td className="px-6 py-6 font-mono text-[10px] text-foreground/40 whitespace-nowrap">
                                                                    {order._id.substring(order._id.length - 12).toUpperCase()}
                                                                </td>
                                                                <td className="px-6 py-6 text-sm text-foreground/60 whitespace-nowrap">
                                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                                </td>
                                                                <td className="px-6 py-6 whitespace-nowrap">
                                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${order.isDelivered ? 'bg-blue-500/10 text-blue-500' : 'bg-foreground/10 text-foreground/50'}`}>
                                                                        {order.isDelivered ? 'Fulfilled' : 'Processing'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-6 text-sm font-bold text-foreground text-right whitespace-nowrap">
                                                                    ${order.totalPrice.toFixed(2)}
                                                                </td>
                                                                <td className="px-6 py-6 text-right whitespace-nowrap">
                                                                    <Link href={`/profile/orders/${order._id}`} className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-4 py-2 border border-foreground/10 hover:border-foreground transition-all">
                                                                        View
                                                                    </Link>
                                                                </td>
                                                            </tr>
                                                        )) : (
                                                            <tr>
                                                                <td colSpan={5} className="py-20 text-center italic text-foreground/40 text-sm">
                                                                    <div className="flex flex-col items-center justify-center gap-4">
                                                                        <div className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center text-foreground/30">
                                                                            <FiPackage size={20} />
                                                                        </div>
                                                                        <p>Empty inventory records.</p>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Mobile Card View */}
                                            <div className="md:hidden space-y-4">
                                                {orders && orders.length > 0 ? orders.map((order: any) => (
                                                    <div key={order._id} className="p-5 border border-foreground/10 rounded-xl bg-background shadow-sm hover:shadow-md transition-all">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div className="space-y-1">
                                                                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Reference</p>
                                                                <p className="font-mono text-xs text-foreground">#{order._id.substring(order._id.length - 8).toUpperCase()}</p>
                                                            </div>
                                                            <div className="text-right space-y-1">
                                                                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Date</p>
                                                                <p className="text-xs font-medium text-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between py-4 border-t border-b border-foreground/5 mb-4">
                                                            <div>
                                                                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1">Status</p>
                                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${order.isDelivered ? 'bg-blue-500/10 text-blue-500' : 'bg-foreground/10 text-foreground/50'}`}>
                                                                    {order.isDelivered ? 'Fulfilled' : 'Processing'}
                                                                </span>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1">Total</p>
                                                                <p className="text-lg font-bold text-foreground">${order.totalPrice.toFixed(2)}</p>
                                                            </div>
                                                        </div>

                                                        <Link href={`/profile/orders/${order._id}`} className="flex items-center justify-center w-full py-3 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-foreground/80 transition-all shadow-lg">
                                                            View Acquisition Details
                                                        </Link>
                                                    </div>
                                                )) : (
                                                    <div className="py-12 text-center italic text-foreground/40 text-sm border border-dashed border-foreground/20 rounded-xl bg-foreground/5">
                                                        <div className="flex flex-col items-center justify-center gap-3">
                                                            <FiPackage size={20} className="text-foreground/30" />
                                                            <p>Empty inventory records.</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Load More Button for Orders */}
                                            {orderPage < orderMetadata.pages && (
                                                <div className="mt-8 flex justify-center">
                                                    <button
                                                        onClick={loadMoreOrders}
                                                        disabled={ordersLoading}
                                                        className="px-8 py-3 border border-foreground text-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-foreground hover:text-background transition-all rounded-lg disabled:opacity-50"
                                                    >
                                                        {ordersLoading ? 'Loading...' : 'Load More Acquisitions'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Vault Items Section */}
                                {activeTab === 'wishlist' && (
                                    <div className="p-4 md:p-8">
                                        <h2 className="text-lg md:text-xl font-bold text-foreground mb-6 md:mb-8 px-2">Saved Treasures</h2>
                                        {profile?.wishlist && profile.wishlist.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                {profile.wishlist.map((productId: any) => {
                                                    const product = typeof productId === 'object' ? productId : null;
                                                    if (!product) return null;
                                                    return (
                                                        <div key={product._id} className="p-4 border border-foreground/5 rounded-xl hover:border-foreground transition-all">
                                                            <ProductCard product={product} onAddToCart={handleAddToCart} />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="py-20 text-center space-y-6">
                                                <div className="w-16 h-16 bg-foreground/5 rounded-full flex items-center justify-center mx-auto text-foreground/20">
                                                    <FiHeart size={24} />
                                                </div>
                                                <p className="text-foreground/40 italic">No items found in your personal vault.</p>
                                                <Link href="/collections" className="inline-block px-10 py-3 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/80 transition-all">Explore Collections</Link>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Destinations Section */}
                                {activeTab === 'addresses' && (
                                    <div className="p-4 md:p-8">
                                        <div className="flex items-center justify-between mb-6 md:mb-8 px-2">
                                            <h2 className="text-lg md:text-xl font-bold text-foreground">Shipment Destinations</h2>
                                            <button onClick={() => openAddressModal()} className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/80 transition-all rounded-lg">
                                                <FiPlus /> New Registry
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                            {profile?.addresses?.map((address) => (
                                                <div key={address._id} className="p-4 md:p-6 border border-foreground/10 rounded-xl hover:border-foreground transition-all relative group bg-foreground/5">
                                                    {address.isDefault && <div className="absolute top-4 right-4 text-[8px] font-bold uppercase tracking-widest text-background bg-foreground px-2 py-1 rounded">Primary</div>}
                                                    <h4 className="font-bold text-foreground mb-4">{address.title}</h4>
                                                    <div className="text-sm text-foreground/50 space-y-1 mb-8">
                                                        <p className="font-medium text-foreground">{address.fullAddress}</p>
                                                        <p>{address.district}, {address.city}</p>
                                                        <p className="font-mono text-xs opacity-60">{address.postalCode}</p>
                                                        <p className="pt-2 font-mono text-xs text-foreground">{address.phone}</p>
                                                    </div>
                                                    <div className="flex gap-4 pt-4 border-t border-background group-hover:border-foreground/10 transition-all">
                                                        <button onClick={() => openAddressModal(address)} className="text-[10px] font-bold uppercase tracking-widest hover:text-foreground">Edit</button>
                                                        <button onClick={() => handleDeleteAddress(address._id)} className="text-[10px] font-bold uppercase tracking-widest text-red-500/60 hover:text-red-500">Delete</button>
                                                    </div>
                                                </div>
                                            ))}
                                            {(!profile?.addresses || profile.addresses.length === 0) && (
                                                <div className="col-span-2 py-20 text-center italic text-foreground/40 border border-dashed border-foreground/10 rounded-xl">
                                                    No delivery points registered.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Account Data Section */}
                                {activeTab === 'profile' && (
                                    <div className="p-4 md:p-8 max-w-xl mx-auto md:mx-0">
                                        <h2 className="text-lg md:text-xl font-bold text-foreground mb-6 md:mb-8">Account Registry</h2>
                                        <form onSubmit={handleProfileUpdate} className="space-y-8 px-2">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Identity Name</label>
                                                <input
                                                    type="text"
                                                    value={profileForm.name}
                                                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                                    disabled={!isEditing}
                                                    className="w-full bg-background border border-foreground/10 rounded-lg px-4 py-3 text-sm font-medium focus:ring-1 focus:ring-foreground disabled:opacity-50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Mobile Link</label>
                                                <input
                                                    type="tel"
                                                    value={profileForm.phone}
                                                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                                    disabled={!isEditing}
                                                    className="w-full bg-background border border-foreground/10 rounded-lg px-4 py-3 text-sm font-medium focus:ring-1 focus:ring-foreground disabled:opacity-50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Email Address (Secured)</label>
                                                <div className="bg-foreground/5 rounded-lg px-4 py-3 text-sm text-foreground/40 font-mono italic">{profile?.email}</div>
                                            </div>
                                            <div className="pt-6">
                                                {isEditing ? (
                                                    <div className="flex gap-3">
                                                        <button type="submit" className="flex-1 bg-foreground text-background px-8 py-3 text-[10px] font-bold tracking-widest uppercase hover:bg-foreground/80 transition-all rounded-lg">Save Registry</button>
                                                        <button type="button" onClick={() => setIsEditing(false)} className="flex-1 border border-foreground/20 px-8 py-3 text-[10px] font-bold tracking-widest uppercase hover:bg-foreground/5 transition-all rounded-lg">Cancel</button>
                                                    </div>
                                                ) : (
                                                    <button type="button" onClick={() => setIsEditing(true)} className="w-full bg-foreground text-background px-8 py-3 text-[10px] font-bold tracking-widest uppercase hover:bg-foreground/80 transition-all rounded-lg shadow-sm">
                                                        Modify Details
                                                    </button>
                                                )}
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </main>
                </div>
            </div>

            {/* Address Modal (Standardized) */}
            <AnimatePresence>
                {showAddressModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddressModal(false)}
                            className="absolute inset-0 bg-foreground/30 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-background max-w-xl w-full p-6 md:p-10 rounded-2xl shadow-2xl relative z-10 border border-foreground/10"
                        >
                            <button onClick={() => setShowAddressModal(false)} className="absolute top-6 right-6 text-foreground/40 hover:text-foreground transition-all">
                                <FiX size={20} />
                            </button>
                            <h3 className="text-xl font-bold text-foreground mb-8">Destination Registration</h3>
                            <form onSubmit={handleAddAddress} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Identifier</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Home, Studio"
                                        value={addressForm.title}
                                        onChange={(e) => setAddressForm({ ...addressForm, title: e.target.value })}
                                        required
                                        className="w-full bg-background border border-foreground/10 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-foreground"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Complete Address</label>
                                    <textarea
                                        placeholder="Enter full shipping details..."
                                        value={addressForm.fullAddress}
                                        onChange={(e) => setAddressForm({ ...addressForm, fullAddress: e.target.value })}
                                        required
                                        rows={2}
                                        className="w-full bg-background border border-foreground/10 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-foreground resize-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="City"
                                        value={addressForm.city}
                                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                        required
                                        className="w-full bg-background border border-foreground/10 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-foreground"
                                    />
                                    <input
                                        type="text"
                                        placeholder="District"
                                        value={addressForm.district}
                                        onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
                                        required
                                        className="w-full bg-background border border-foreground/10 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-foreground"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="Postal Code"
                                        value={addressForm.postalCode}
                                        onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                                        required
                                        className="w-full bg-background border border-foreground/10 rounded-lg px-4 py-3 text-sm font-mono focus:ring-1 focus:ring-foreground"
                                    />
                                    <input
                                        type="tel"
                                        placeholder="Contact Phone"
                                        value={addressForm.phone}
                                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                                        required
                                        className="w-full bg-background border border-foreground/10 rounded-lg px-4 py-3 text-sm font-mono focus:ring-1 focus:ring-foreground"
                                    />
                                </div>
                                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setAddressForm({ ...addressForm, isDefault: !addressForm.isDefault })}>
                                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${addressForm.isDefault ? 'bg-foreground border-foreground' : 'border-foreground/20 group-hover:border-foreground'}`}>
                                        {addressForm.isDefault && <FiCheckCircle className="text-background bg-foreground rounded-full" size={14} />}
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">Set as primary destination</span>
                                </div>
                                <button type="submit" className="w-full bg-foreground text-background py-4 rounded-xl text-[10px] font-bold tracking-widest uppercase hover:bg-foreground/80 transition-all shadow-lg mt-4">
                                    Save to Registry
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
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
