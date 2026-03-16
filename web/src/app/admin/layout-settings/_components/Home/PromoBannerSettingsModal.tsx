'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
    fetchAdminBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    updateHomeSettings,
    updateProductSettings,
    Banner
} from '@/lib/slices/contentSlice';
import { FiImage, FiX, FiCheck, FiPlus, FiSave, FiTrash2, FiLayout, FiMaximize, FiGrid } from 'react-icons/fi';
import ImageUpload from '@/components/ImageUpload';

export default function PromoBannerSettingsModal({ onClose, onUpdate, isProductPage }: { onClose: () => void; onUpdate: () => void; isProductPage?: boolean }) {
    const dispatch = useAppDispatch();
    const { banners, homeSettings, productSettings, isLoading } = useAppSelector((state) => state.content);

    const [showNewForm, setShowNewForm] = useState(false);
    const [layout, setLayout] = useState<'classic' | 'split' | 'minimal'>(() => {
        return homeSettings?.bannerLayout || 'classic';
    });

    useEffect(() => {
        dispatch(fetchAdminBanners());
    }, [dispatch]);

    const gridBanners = banners.filter(b => b.section === 'grid').sort((a, b) => (a.order || 0) - (b.order || 0));

    const handleLayoutSave = async () => {
        if (!homeSettings) return;
        try {
            await dispatch(updateHomeSettings({ ...homeSettings, bannerLayout: layout })).unwrap();
            onUpdate();
        } catch (err) {
            alert('Failed to save layout');
        }
    };

    // --- Sub-component for individual banner editing ---
    const BannerItemForm = ({ banner, isNew = false, onCancel }: { banner: Partial<Banner>, isNew?: boolean, onCancel?: () => void }) => {
        const [localData, setLocalData] = useState(banner);
        const [isSaving, setIsSaving] = useState(false);

        const onSaveAction = async (e: React.FormEvent) => {
            e.preventDefault();
            setIsSaving(true);
            try {
                if (isNew) {
                    await dispatch(createBanner({ ...localData, section: 'grid' as any })).unwrap();
                    setShowNewForm(false);
                } else {
                    await dispatch(updateBanner({ id: localData._id!, data: localData })).unwrap();
                }
                onUpdate();
            } catch (err) {
                alert('Failed to save');
            } finally {
                setIsSaving(false);
            }
        };

        const onDeleteAction = async () => {
            if (!confirm('Are you sure you want to delete this promotional banner?')) return;
            try {
                await dispatch(deleteBanner(localData._id!)).unwrap();
                onUpdate();
            } catch (err) {
                alert('Failed to delete');
            }
        };

        return (
            <form onSubmit={onSaveAction} className={`space-y-6 border p-6 rounded-2xl bg-background shadow-sm transition-all hover:shadow-md ${isNew ? 'border-dashed border-blue-400 bg-blue-50/10' : 'border-border'}`}>
                <div className="flex justify-between items-center pb-4 border-b border-border">
                    <h4 className="font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                        {isNew ? <span className="text-blue-600 flex items-center gap-2"><FiPlus /> New Promo Banner</span> : <span>Banner: {localData.title || 'Draft'}</span>}
                    </h4>
                    <div className="flex gap-2">
                        {!isNew && (
                            <button type="button" onClick={onDeleteAction} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                <FiTrash2 size={16} />
                            </button>
                        )}
                        {isNew && (
                            <button type="button" onClick={onCancel} className="p-2 text-muted-foreground/80 hover:text-foreground">
                                <FiX size={16} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid md:grid-cols-12 gap-8">
                    <div className="md:col-span-8 space-y-6">
                        <div className="grid grid-cols-4 gap-4">
                            <div className="col-span-3">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">Hero Title</label>
                                <input className="w-full p-2.5 bg-muted border border-border rounded-lg text-sm focus:bg-background focus:ring-2 focus:ring-black/5" value={localData.title} onChange={e => setLocalData({ ...localData, title: e.target.value })} required />
                            </div>
                            <div className="col-span-1">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">Priority / Order</label>
                                <input type="number" className="w-full p-2.5 bg-muted border border-border rounded-lg text-sm" value={localData.order} onChange={e => setLocalData({ ...localData, order: parseInt(e.target.value) })} />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">Subheading / Description</label>
                            <textarea className="w-full p-2.5 bg-muted border border-border rounded-lg text-sm resize-none" rows={2} value={localData.description} onChange={e => setLocalData({ ...localData, description: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div>
                                <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">Button Label</label>
                                <input className="w-full p-2.5 bg-muted border border-border rounded-lg text-sm" value={localData.buttonText} onChange={e => setLocalData({ ...localData, buttonText: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">Destination Path (URL)</label>
                                <input className="w-full p-2.5 bg-muted border border-border rounded-lg text-sm" value={localData.buttonUrl} onChange={e => setLocalData({ ...localData, buttonUrl: e.target.value })} placeholder="e.g. /collections/rings" />
                            </div>
                        </div>
                    </div>
                    <div className="md:col-span-4 space-y-4">
                        <div className="p-1 bg-muted rounded-xl border border-border flex justify-center scale-90 origin-top h-[180px]">
                            <ImageUpload value={localData.image} onChange={url => setLocalData({ ...localData, image: url })} required isBanner />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase text-muted-foreground/80 mb-1 block">Status</label>
                            <select className="w-full p-2.5 bg-muted border border-border rounded-lg text-sm" value={localData.status} onChange={e => setLocalData({ ...localData, status: e.target.value as any })}>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <button type="submit" disabled={isSaving} className="w-full py-2.5 bg-foreground text-background rounded-xl text-xs font-bold hover:bg-gray-800 disabled:bg-gray-400 flex items-center justify-center gap-2">
                            {isSaving ? 'Saving...' : <><FiSave /> Save Banner</>}
                        </button>
                    </div>
                </div>
            </form>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4">
            <div className="bg-background rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">
                <div className="p-6 border-b border-border flex justify-between items-center bg-background z-10 shrink-0">
                    <div>
                        <h3 className="font-bold text-lg">Promo Banners</h3>
                        <p className="text-xs text-muted-foreground/80 font-medium">Manage wide promotional segments shown on the homepage</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted/80 rounded-full text-muted-foreground/80 hover:text-foreground transition-colors">
                        <FiX size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-muted/30">
                    <div className="space-y-6">

                        {/* Layout Selector */}
                        <div className="bg-background p-6 rounded-2xl border border-border shadow-sm">
                            <h4 className="font-bold text-sm mb-4">Banner Layout Style</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { id: 'classic', label: 'Classic Overlay', icon: FiMaximize, desc: 'Full width image with elegant text overlay' },
                                    { id: 'split', label: 'Split Screen', icon: FiLayout, desc: 'Image on one side, clean text on the other' },
                                    { id: 'minimal', label: 'Minimal Inset', icon: FiGrid, desc: 'Contained image box with floating text' }
                                ].map(lt => (
                                    <button
                                        key={lt.id}
                                        onClick={() => setLayout(lt.id as any)}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${layout === lt.id ? 'border-foreground bg-muted shadow-inner' : 'border-border hover:border-border bg-background'}`}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${layout === lt.id ? 'bg-foreground text-background' : 'bg-muted/80 text-muted-foreground/80'}`}>
                                                <lt.icon size={16} />
                                            </div>
                                            <h5 className="font-bold text-sm text-foreground">{lt.label}</h5>
                                            {layout === lt.id && <FiCheck className="ml-auto text-foreground" size={16} />}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{lt.desc}</p>
                                    </button>
                                ))}
                            </div>
                            {layout !== (homeSettings?.bannerLayout || 'classic') && (
                                <div className="mt-4 pt-4 border-t border-border flex justify-end">
                                    <button
                                        onClick={handleLayoutSave}
                                        className="px-6 py-2.5 bg-foreground text-background rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors"
                                    >
                                        Save Layout Configuration
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center bg-background p-4 rounded-2xl border border-border shadow-sm mt-8">
                            <div>
                                <h4 className="font-bold text-sm">Active Promo Banners</h4>
                                <p className="text-[10px] text-muted-foreground/80">Add or edit banners below the collections grid.</p>
                            </div>
                            <button onClick={() => setShowNewForm(true)} className="px-4 py-2 bg-foreground text-background rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg hover:bg-gray-800 transition-all">
                                <FiPlus /> Add New Banner
                            </button>
                        </div>

                        {showNewForm && (
                            <BannerItemForm
                                isNew
                                banner={{ title: '', description: '', image: '', buttonText: 'Shop Now', buttonUrl: '/collections', order: gridBanners.length + 1, status: 'active' }}
                                onCancel={() => setShowNewForm(false)}
                            />
                        )}

                        <div className="space-y-4">
                            {gridBanners.map((banner, idx) => (
                                <BannerItemForm key={banner._id || idx} banner={banner} />
                            ))}
                            {gridBanners.length === 0 && !showNewForm && (
                                <div className="text-center py-20 bg-background rounded-2xl border border-dashed border-border">
                                    <h4 className="font-bold text-muted-foreground/80">No Banners Found</h4>
                                    <p className="text-xs text-muted-foreground/80 mt-2">Click Add New Banner to create your first promo section.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
