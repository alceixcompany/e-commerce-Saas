'use client';

import { useState, useEffect } from 'react';
import { FiX, FiCheck, FiRefreshCw, FiDroplet, FiLayout, FiGrid } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { updateProductSettings, ProductSettings } from '@/lib/slices/contentSlice';

interface Props {
    sectionId: string;
    onClose: () => void;
    onSave: () => void;
}

export default function ProductSettingsEditorModal({ sectionId, onClose, onSave }: Props) {
    const dispatch = useAppDispatch();
    const { productSettings } = useAppSelector((state) => state.content);
    const [formData, setFormData] = useState<ProductSettings | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (productSettings) {
            const data = JSON.parse(JSON.stringify(productSettings));
            // Ensure we have a layout object and preserve existing order/hidden sections
            if (!data.layout) {
                data.layout = {
                    imageGallery: 'thumbnails-left',
                    infoBox: 'detailed',
                    showBadges: true,
                    showRelatedProducts: true,
                    showBreadcrumbs: true,
                    showMaterialCategory: true,
                };
            }
            if (!data.sectionOrder) {
                data.sectionOrder = ['product_details', 'related_products', 'advantages', 'journal', 'banner'];
            }
            if (!data.hiddenSections) {
                data.hiddenSections = ['advantages', 'journal', 'banner'];
            }
            setFormData(data);
        }
    }, [productSettings]);

    const handleChange = (section: 'layout' | 'relatedProductsLayout', field: string, value: any) => {
        setFormData(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                [section]: {
                    ...(prev[section as keyof typeof prev] as any || {}),
                    [field]: value
                }
            };
        });
    };

    const handleSave = async () => {
        if (!formData) return;
        setIsSaving(true);
        try {
            await dispatch(updateProductSettings(formData)).unwrap();
            onSave();
        } catch (error) {
            console.error('Failed to save product settings:', error);
            alert('Failed to save settings. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!formData) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-background rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div>
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <FiLayout className="text-[#C5A059]" />
                            Product Details Layout Settings
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            {sectionId === 'product_details' ? 'Customize how your product information and images are displayed.' : 'Configure the recommendations section layout.'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-muted-foreground/80 hover:text-muted-foreground hover:bg-muted/80 rounded-full transition-colors"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    {sectionId === 'product_details' && formData.layout && (
                        <div className="space-y-6">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4">Main Product Layout</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-foreground/80 mb-4">Image Gallery Style</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            {
                                                id: 'thumbnails-left',
                                                label: 'Thumbnails (Left)',
                                                preview: (
                                                    <div className="w-full h-16 bg-muted flex gap-1 p-1 rounded border border-border">
                                                        <div className="w-4 h-full flex flex-col gap-1">
                                                            <div className="w-full h-3 bg-gray-300"></div>
                                                            <div className="w-full h-3 bg-gray-200"></div>
                                                            <div className="w-full h-3 bg-gray-200"></div>
                                                        </div>
                                                        <div className="flex-1 h-full bg-gray-300"></div>
                                                    </div>
                                                )
                                            },
                                            {
                                                id: 'thumbnails-bottom',
                                                label: 'Thumbnails (Bottom)',
                                                preview: (
                                                    <div className="w-full h-16 bg-muted flex flex-col gap-1 p-1 rounded border border-border">
                                                        <div className="flex-1 w-full bg-gray-300"></div>
                                                        <div className="w-full h-3 flex gap-1">
                                                            <div className="flex-1 h-full bg-gray-200"></div>
                                                            <div className="flex-1 h-full bg-gray-200"></div>
                                                            <div className="flex-1 h-full bg-gray-200"></div>
                                                        </div>
                                                    </div>
                                                )
                                            },
                                            {
                                                id: 'carousel',
                                                label: 'Full Carousel',
                                                preview: (
                                                    <div className="w-full h-16 bg-muted flex flex-col p-1 rounded border border-border relative overflow-hidden">
                                                        <div className="w-full h-full bg-gray-300"></div>
                                                        <div className="absolute bottom-2 left-0 w-full flex justify-center gap-1">
                                                            <div className="w-1 h-1 rounded-full bg-foreground/40"></div>
                                                            <div className="w-2 h-1 rounded-full bg-foreground/80"></div>
                                                            <div className="w-1 h-1 rounded-full bg-foreground/40"></div>
                                                        </div>
                                                    </div>
                                                )
                                            },
                                            {
                                                id: 'grid',
                                                label: 'Balanced Grid',
                                                preview: (
                                                    <div className="w-full h-16 bg-muted grid grid-cols-2 gap-1 p-1 rounded border border-border">
                                                        <div className="col-span-2 h-6 bg-gray-300"></div>
                                                        <div className="h-6 bg-gray-200"></div>
                                                        <div className="h-6 bg-gray-200"></div>
                                                    </div>
                                                )
                                            }
                                        ].map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => handleChange('layout', 'imageGallery', opt.id)}
                                                className={`flex flex-col p-2 text-center rounded-xl border-2 transition-all hover:shadow-md ${formData.layout?.imageGallery === opt.id ? 'border-foreground bg-foreground text-background' : 'border-border hover:border-border text-muted-foreground bg-background'}`}
                                            >
                                                <div className="mb-2">
                                                    {opt.preview}
                                                </div>
                                                <span className="text-[10px] font-bold leading-tight">{opt.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-foreground/80 mb-4">Choose Page Layout Style</label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {[
                                            {
                                                id: 'detailed',
                                                label: 'Detailed',
                                                desc: 'Premium jewelry store feel. Image on left, boxed info on right.',
                                                preview: (
                                                    <div className="w-full h-24 bg-muted rounded-lg p-2 flex gap-2">
                                                        <div className="w-3/5 h-full bg-gray-200 flex gap-1 p-1">
                                                            <div className="w-4 h-full bg-background opacity-50"></div>
                                                            <div className="flex-1 h-full bg-background"></div>
                                                        </div>
                                                        <div className="w-2/5 h-full flex flex-col gap-1 jusify-center">
                                                            <div className="w-full h-2 bg-gray-300"></div>
                                                            <div className="w-1/2 h-2 bg-gray-300"></div>
                                                            <div className="w-full h-4 bg-[#C5A059] mt-2 opacity-50"></div>
                                                        </div>
                                                    </div>
                                                )
                                            },
                                            {
                                                id: 'minimal',
                                                label: 'Split Minimal',
                                                desc: 'Modern editorial style. 50/50 split with full-height graphics.',
                                                preview: (
                                                    <div className="w-full h-24 bg-muted/80 rounded-lg flex border border-border overflow-hidden">
                                                        <div className="w-1/2 h-full bg-gray-300"></div>
                                                        <div className="w-1/2 h-full bg-background flex flex-col items-center justify-center p-2 gap-2">
                                                            <div className="w-10 h-2 bg-gray-200"></div>
                                                            <div className="w-14 h-2 bg-muted/80"></div>
                                                            <div className="w-8 h-8 rounded-full bg-foreground/5"></div>
                                                        </div>
                                                    </div>
                                                )
                                            },
                                            {
                                                id: 'classic',
                                                label: 'Reverse Classic',
                                                desc: 'Traditional reversed layout. Image on Right, Title on Left.',
                                                preview: (
                                                    <div className="w-full h-24 bg-muted rounded-lg p-2 flex flex-row-reverse gap-2">
                                                        <div className="w-1/2 h-full bg-gray-200"></div>
                                                        <div className="w-1/2 h-full flex flex-col gap-1 py-2">
                                                            <div className="w-full h-2 bg-gray-300"></div>
                                                            <div className="w-2/3 h-2 bg-gray-300"></div>
                                                            <div className="w-full h-4 bg-foreground opacity-30 mt-auto"></div>
                                                        </div>
                                                    </div>
                                                )
                                            }
                                        ].map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => handleChange('layout', 'infoBox', opt.id)}
                                                className={`flex flex-col p-3 text-left rounded-xl border-2 transition-all group ${formData.layout?.infoBox === opt.id ? 'border-foreground bg-foreground text-background shadow-lg' : 'border-border hover:border-border text-muted-foreground bg-background'}`}
                                            >
                                                <div className="mb-3 transition-transform group-hover:scale-[1.02]">
                                                    {opt.preview}
                                                </div>
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-bold text-xs uppercase tracking-wider">{opt.label}</span>
                                                    {formData.layout?.infoBox === opt.id && <FiCheck className="text-[#C5A059]" />}
                                                </div>
                                                <p className={`text-[9px] leading-tight ${formData.layout?.infoBox === opt.id ? 'text-muted-foreground/80' : 'text-muted-foreground/80'}`}>{opt.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-border">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.layout.showBadges}
                                            onChange={(e) => handleChange('layout', 'showBadges', e.target.checked)}
                                            className="w-4 h-4 text-[#C5A059] border-border rounded focus:ring-[#C5A059]"
                                        />
                                        <span className="text-sm text-foreground/80 font-medium">Show Trust Badges (Quality, Secure Shipping)</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.layout.showBreadcrumbs}
                                            onChange={(e) => handleChange('layout', 'showBreadcrumbs', e.target.checked)}
                                            className="w-4 h-4 text-[#C5A059] border-border rounded focus:ring-[#C5A059]"
                                        />
                                        <span className="text-sm text-foreground/80 font-medium">Show Breadcrumb Path</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.layout.showMaterialCategory}
                                            onChange={(e) => handleChange('layout', 'showMaterialCategory', e.target.checked)}
                                            className="w-4 h-4 text-[#C5A059] border-border rounded focus:ring-[#C5A059]"
                                        />
                                        <span className="text-sm text-foreground/80 font-medium">Show Material/Category Label</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {sectionId === 'related_products' && (
                        <div className="space-y-6">
                            <div className="flex flex-col gap-1">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Recommended Products Settings</h3>
                                <p className="text-xs text-muted-foreground">Customize how similar products are presented to your customers.</p>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-foreground/80 uppercase tracking-widest mb-2">Section Title</label>
                                    <input
                                        type="text"
                                        value={formData.relatedProductsLayout?.title || 'You May Also Like'}
                                        onChange={(e) => handleChange('relatedProductsLayout', 'title', e.target.value)}
                                        placeholder="E.g. You May Also Like"
                                        className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-black outline-none transition-all text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-foreground/80 uppercase tracking-widest mb-4">Choose Display Style</label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {[
                                            {
                                                id: 'grid',
                                                label: 'Modern Grid',
                                                desc: 'Clean 4-column balanced grid layout.',
                                                preview: (
                                                    <div className="w-full h-20 bg-muted rounded-lg p-2 grid grid-cols-4 gap-1">
                                                        <div className="bg-gray-200 rounded-sm"></div>
                                                        <div className="bg-gray-200 rounded-sm"></div>
                                                        <div className="bg-gray-200 rounded-sm"></div>
                                                        <div className="bg-gray-200 rounded-sm"></div>
                                                    </div>
                                                )
                                            },
                                            {
                                                id: 'slider',
                                                label: 'Dynamic Slider',
                                                desc: 'Interactive draggable horizontal carousel.',
                                                preview: (
                                                    <div className="w-full h-20 bg-muted rounded-lg p-2 flex gap-2 overflow-hidden relative">
                                                        <div className="w-1/3 shrink-0 bg-gray-300 rounded-sm"></div>
                                                        <div className="w-1/3 shrink-0 bg-gray-200 rounded-sm"></div>
                                                        <div className="w-1/3 shrink-0 bg-gray-200 rounded-sm"></div>
                                                        <div className="absolute right-1 top-1/2 -translate-y-1/2 w-4 h-4 bg-background rounded-full shadow-sm flex items-center justify-center">
                                                            <div className="w-1 h-1 border-t border-r border-foreground rotate-45"></div>
                                                        </div>
                                                    </div>
                                                )
                                            },
                                            {
                                                id: 'minimal',
                                                label: 'Minimal List',
                                                desc: 'Elegant side-by-side card items.',
                                                preview: (
                                                    <div className="w-full h-20 bg-muted rounded-lg p-2 flex flex-col gap-1">
                                                        <div className="w-full h-4 bg-gray-200 rounded-sm"></div>
                                                        <div className="w-full h-4 bg-muted/80 rounded-sm"></div>
                                                        <div className="w-full h-4 bg-muted rounded-sm"></div>
                                                    </div>
                                                )
                                            }
                                        ].map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => handleChange('relatedProductsLayout', 'displayType', opt.id)}
                                                className={`flex flex-col p-3 text-left rounded-xl border-2 transition-all ${formData.relatedProductsLayout?.displayType === opt.id ? 'border-foreground bg-foreground text-background' : 'border-border hover:border-border text-muted-foreground bg-background'}`}
                                            >
                                                <div className="mb-3">{opt.preview}</div>
                                                <span className="font-bold text-[10px] uppercase tracking-wider mb-1">{opt.label}</span>
                                                <p className="text-[9px] leading-tight opacity-60">{opt.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-muted rounded-xl border border-border">
                                    <div>
                                        <p className="font-bold text-sm">Products Count</p>
                                        <p className="text-xs text-muted-foreground">Number of products to display.</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleChange('relatedProductsLayout', 'itemsCount', Math.max(2, (formData.relatedProductsLayout?.itemsCount || 4) - 1))}
                                            className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-background"
                                        >-</button>
                                        <span className="font-bold w-4 text-center">{formData.relatedProductsLayout?.itemsCount || 4}</span>
                                        <button
                                            onClick={() => handleChange('relatedProductsLayout', 'itemsCount', Math.min(12, (formData.relatedProductsLayout?.itemsCount || 4) + 1))}
                                            className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-background"
                                        >+</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border bg-muted flex items-center justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-8 py-2.5 bg-foreground text-background text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                        {isSaving ? <FiRefreshCw className="animate-spin" /> : <FiCheck />}
                        {isSaving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
