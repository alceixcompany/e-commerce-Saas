'use client';
import { useState, useEffect } from 'react';
import ImageUpload from '@/components/ImageUpload';
import { FiTrash2, FiEdit2, FiPlus, FiSave, FiX } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
    fetchAdminBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    fetchAdminPopularCollections,
    updatePopularCollections
} from '@/lib/slices/contentSlice';

interface Banner {
    _id: string;
    title: string;
    description: string;
    image: string;
    buttonText: string;
    buttonUrl: string;
    order: number;
    status: 'active' | 'inactive';
}

function PopularCollectionsSettings() {
    const dispatch = useAppDispatch();
    const { popularCollections } = useAppSelector((state) => state.content);
    const [images, setImages] = useState({
        newArrivals: '',
        bestSellers: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        dispatch(fetchAdminPopularCollections())
            .unwrap()
            .then((data) => {
                if (data) setImages(data);
            })
            .catch((err) => console.error(err));
    }, [dispatch]);

    // Sync only initially or when fetched data changes significantly, actually local state is for editing.
    // If we want to start with fetched data:
    useEffect(() => {
        if (popularCollections.newArrivals || popularCollections.bestSellers) {
            setImages(popularCollections);
        }
    }, [popularCollections]);


    const handleSave = async () => {
        try {
            setLoading(true);
            await dispatch(updatePopularCollections(images)).unwrap();
            alert('Settings saved successfully!');
        } catch (error) {
            console.error('Failed to save settings:', error);
            alert('Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900">New Arrivals</h3>
                    <div className="border rounded-lg p-4 bg-gray-50">
                        <ImageUpload
                            label="Cover Image"
                            value={images.newArrivals}
                            onChange={(url) => setImages(prev => ({ ...prev, newArrivals: url }))}
                        />
                        <p className="text-xs text-gray-500 mt-2">Displayed in the New Arrivals card.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900">Best Sellers</h3>
                    <div className="border rounded-lg p-4 bg-gray-50">
                        <ImageUpload
                            label="Cover Image"
                            value={images.bestSellers}
                            onChange={(url) => setImages(prev => ({ ...prev, bestSellers: url }))}
                        />
                        <p className="text-xs text-gray-500 mt-2">Displayed in the Best Sellers card.</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    <FiSave />
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
}

export default function LayoutSettingsPage() {
    const dispatch = useAppDispatch();
    const { banners, isLoading } = useAppSelector((state) => state.content);

    // Local state for UI interactions
    const [isEditing, setIsEditing] = useState(false);
    const [currentBanner, setCurrentBanner] = useState<Partial<Banner>>({});
    const [openSection, setOpenSection] = useState<string | null>('home-banners');

    // Initial empty state for new banner
    const initialBannerState: Partial<Banner> = {
        title: '',
        description: '',
        image: '',
        buttonText: 'View Collection',
        buttonUrl: '/collections',
        order: 0,
        status: 'active'
    };

    useEffect(() => {
        dispatch(fetchAdminBanners());
    }, [dispatch]);

    const handleCreate = () => {
        setCurrentBanner({ ...initialBannerState, order: banners.length + 1 });
        setIsEditing(true);
    };

    const handleEdit = (banner: Banner) => {
        setCurrentBanner(banner);
        setIsEditing(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this banner?')) return;

        try {
            await dispatch(deleteBanner(id)).unwrap();
        } catch (error) {
            console.error('Failed to delete banner:', error);
            alert('Failed to delete banner');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentBanner.image) {
            alert('Please upload an image');
            return;
        }

        try {
            if (currentBanner._id) {
                // Update
                await dispatch(updateBanner({ id: currentBanner._id, data: currentBanner })).unwrap();
            } else {
                // Create
                await dispatch(createBanner(currentBanner)).unwrap();
            }
            setIsEditing(false);
        } catch (error: any) {
            console.error('Failed to save banner:', error);
            alert(error || 'Failed to save banner');
        }
    };

    const toggleSection = (section: string) => {
        setOpenSection(openSection === section ? null : section);
    };

    if (isLoading && banners.length === 0) return <div className="p-8">Loading settings...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Layout Settings</h1>
                <p className="text-gray-500 mt-1">Manage your website layout and content sections</p>
            </div>

            <div className="space-y-4">
                {/* Home / Banners Section */}
                <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
                    <button
                        onClick={() => toggleSection('home-banners')}
                        className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-xl">🏠</span>
                            <div>
                                <h2 className="font-bold text-gray-900">Home Page Banners</h2>
                                <p className="text-sm text-gray-500">Manage hero slider and promotional banners</p>
                            </div>
                        </div>
                        <span className={`transform transition-transform duration-200 ${openSection === 'home-banners' ? 'rotate-180' : ''}`}>
                            ▼
                        </span>
                    </button>

                    {openSection === 'home-banners' && (
                        <div className="p-6 border-t border-gray-200">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-gray-800">Active Banners ({banners.length})</h3>
                                {!isEditing && (
                                    <button
                                        onClick={handleCreate}
                                        className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
                                    >
                                        <FiPlus size={16} />
                                        Add Banner
                                    </button>
                                )}
                            </div>

                            {isEditing ? (
                                <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                                    <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-200">
                                        <h2 className="text-lg font-bold text-gray-900">
                                            {currentBanner._id ? 'Edit Banner' : 'Create New Banner'}
                                        </h2>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                                        >
                                            <FiX size={20} />
                                        </button>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            {/* Form Fields */}
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                                    <input
                                                        type="text"
                                                        value={currentBanner.title}
                                                        onChange={(e) => setCurrentBanner({ ...currentBanner, title: e.target.value })}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-black"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                                    <textarea
                                                        value={currentBanner.description}
                                                        onChange={(e) => setCurrentBanner({ ...currentBanner, description: e.target.value })}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-black"
                                                        rows={2}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                                                        <input
                                                            type="text"
                                                            value={currentBanner.buttonText}
                                                            onChange={(e) => setCurrentBanner({ ...currentBanner, buttonText: e.target.value })}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-black"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Button URL</label>
                                                        <input
                                                            type="text"
                                                            value={currentBanner.buttonUrl}
                                                            onChange={(e) => setCurrentBanner({ ...currentBanner, buttonUrl: e.target.value })}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-black"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                                                        <input
                                                            type="number"
                                                            value={currentBanner.order}
                                                            onChange={(e) => setCurrentBanner({ ...currentBanner, order: parseInt(e.target.value) })}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-black"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                                        <select
                                                            value={currentBanner.status}
                                                            onChange={(e) => setCurrentBanner({ ...currentBanner, status: e.target.value as any })}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-black"
                                                        >
                                                            <option value="active">Active</option>
                                                            <option value="inactive">Inactive</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Image Upload */}
                                            <div>
                                                <ImageUpload
                                                    label="Banner Image"
                                                    value={currentBanner.image}
                                                    onChange={(url) => setCurrentBanner({ ...currentBanner, image: url })}
                                                    required
                                                    isBanner={true}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                            <button
                                                type="button"
                                                onClick={() => setIsEditing(false)}
                                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-sm"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm"
                                            >
                                                <FiSave />
                                                Save Banner
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {banners.map((banner) => (
                                        <div key={banner._id} className="flex flex-col md:flex-row gap-4 p-4 border border-gray-100 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors group">
                                            <div className="w-full md:w-48 h-24 rounded-lg overflow-hidden flex-shrink-0">
                                                <img
                                                    src={banner.image}
                                                    alt={banner.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 flex flex-col justify-center">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-bold text-gray-900">{banner.title}</h4>
                                                        <p className="text-sm text-gray-500 line-clamp-1">{banner.description}</p>
                                                    </div>
                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleEdit(banner)}
                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                                        >
                                                            <FiEdit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(banner._id)}
                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                                        >
                                                            <FiTrash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex gap-3 mt-2 text-xs text-gray-500">
                                                    <span className={`px-2 py-0.5 rounded ${banner.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                                        {banner.status}
                                                    </span>
                                                    <span>Order: {banner.order}</span>
                                                    <span className="truncate max-w-[200px]">{banner.buttonUrl}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {banners.length === 0 && (
                                        <div className="text-center py-8 text-gray-500">No banners found. Create one above!</div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Popular Collections Section */}
                <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
                    <button
                        onClick={() => toggleSection('popular-collections')}
                        className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-xl">✨</span>
                            <div>
                                <h2 className="font-bold text-gray-900">Popular Collections</h2>
                                <p className="text-sm text-gray-500">Manage New Arrivals & Best Sellers images</p>
                            </div>
                        </div>
                        <span className={`transform transition-transform duration-200 ${openSection === 'popular-collections' ? 'rotate-180' : ''}`}>
                            ▼
                        </span>
                    </button>

                    {openSection === 'popular-collections' && (
                        <div className="p-6 border-t border-gray-200">
                            <PopularCollectionsSettings />
                        </div>
                    )}
                </div>

                {/* Future Sections Placeholder */}
                <div className="border border-gray-200 rounded-xl bg-white overflow-hidden opacity-50">
                    <button className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 text-left cursor-not-allowed">
                        <div className="flex items-center gap-3">
                            <span className="text-xl">🎨</span>
                            <div>
                                <h2 className="font-bold text-gray-900">Theme Settings</h2>
                                <p className="text-sm text-gray-500">Future update: Colors, Fonts etc.</p>
                            </div>
                        </div>
                        <span>▼</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
