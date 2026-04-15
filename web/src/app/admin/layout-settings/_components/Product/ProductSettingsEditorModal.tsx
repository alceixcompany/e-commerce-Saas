'use client';

import { useState, useEffect } from 'react';
import { FiX, FiCheck, FiRefreshCw, FiLayout } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { updateProductSettings } from '@/lib/slices/contentSlice';
import { ProductSettings } from '@/types/content';
import { useTranslation } from '@/hooks/useTranslation';

interface Props {
    sectionId: string;
    onClose: () => void;
    onSave: () => void;
}

export default function ProductSettingsEditorModal({ sectionId, onClose, onSave }: Props) {
    const { t } = useTranslation();
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

    const handleChange = <T extends keyof ProductSettings>(section: T, field: string, value: unknown) => {
        setFormData(prev => {
            if (!prev) return prev;
            const sectionData = prev[section] as Record<string, unknown> || {};
            return {
                ...prev,
                [section]: {
                    ...sectionData,
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
            alert(t('admin.saveError'));
        } finally {
            setIsSaving(false);
        }
    };

    if (!formData) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm shadow-2xl">
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
                            <FiLayout className="text-[var(--primary-color)]" />
                            {t('admin.productEditor.title')}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            {sectionId === 'product_details' ? t('admin.productEditor.detailsDesc') : t('admin.productEditor.relatedDesc')}
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
                            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4">{t('admin.productEditor.mainLayout')}</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-foreground/80 mb-4">{t('admin.productEditor.galleryStyle')}</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            {
                                                id: 'thumbnails-left',
                                                label: t('admin.productEditor.gallery.thumbnailsLeft'),
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
                                                label: t('admin.productEditor.gallery.thumbnailsBottom'),
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
                                                label: t('admin.productEditor.gallery.carousel'),
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
                                                label: t('admin.productEditor.gallery.grid'),
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
                                                className={`flex flex-col p-2 text-center rounded-xl border-2 transition-all hover:shadow-md ${formData.layout?.imageGallery === opt.id ? 'border-[var(--primary-color)] bg-[var(--primary-color)] text-white' : 'border-border hover:border-border text-muted-foreground bg-background'}`}
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
                                    <label className="block text-xs font-semibold text-foreground/80 mb-4">{t('admin.productEditor.pageLayoutStyle')}</label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {[
                                            {
                                                id: 'detailed',
                                                label: t('admin.productEditor.layout.detailed'),
                                                desc: t('admin.productEditor.layout.detailedDesc'),
                                                preview: (
                                                    <div className="w-full h-24 bg-muted rounded-lg p-2 flex gap-2">
                                                        <div className="w-3/5 h-full bg-gray-200 flex gap-1 p-1">
                                                            <div className="w-4 h-full bg-background opacity-50"></div>
                                                            <div className="flex-1 h-full bg-background"></div>
                                                        </div>
                                                        <div className="w-2/5 h-full flex flex-col gap-1 jusify-center">
                                                            <div className="w-full h-2 bg-gray-300"></div>
                                                            <div className="w-1/2 h-2 bg-gray-300"></div>
                                                            <div className="w-full h-4 bg-[var(--primary-color)] mt-2 opacity-50"></div>
                                                        </div>
                                                    </div>
                                                )
                                            },
                                            {
                                                id: 'minimal',
                                                label: t('admin.productEditor.layout.minimal'),
                                                desc: t('admin.productEditor.layout.minimalDesc'),
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
                                                label: t('admin.productEditor.layout.classic'),
                                                desc: t('admin.productEditor.layout.classicDesc'),
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
                                                className={`flex flex-col p-3 text-left rounded-xl border-2 transition-all group ${formData.layout?.infoBox === opt.id ? 'border-[var(--primary-color)] bg-[var(--primary-color)] text-white shadow-lg' : 'border-border hover:border-border text-muted-foreground bg-background'}`}
                                            >
                                                <div className="mb-3 transition-transform group-hover:scale-[1.02]">
                                                    {opt.preview}
                                                </div>
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-bold text-xs uppercase tracking-wider">{opt.label}</span>
                                                    {formData.layout?.infoBox === opt.id && <FiCheck className="text-white" />}
                                                </div>
                                                <p className={`text-[9px] leading-tight ${formData.layout?.infoBox === opt.id ? 'text-white/80' : 'text-muted-foreground/80'}`}>{opt.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-border">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={formData.layout.showBadges}
                                            onChange={(e) => handleChange('layout', 'showBadges', e.target.checked)}
                                            className="w-4 h-4 text-[var(--primary-color)] border-border rounded focus:ring-[var(--primary-color)]"
                                        />
                                        <span className="text-sm text-foreground/80 font-medium group-hover:text-foreground transition-colors">{t('admin.productEditor.showBadges')}</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={formData.layout.showBreadcrumbs}
                                            onChange={(e) => handleChange('layout', 'showBreadcrumbs', e.target.checked)}
                                            className="w-4 h-4 text-[var(--primary-color)] border-border rounded focus:ring-[var(--primary-color)]"
                                        />
                                        <span className="text-sm text-foreground/80 font-medium group-hover:text-foreground transition-colors">{t('admin.productEditor.showBreadcrumbs')}</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={formData.layout.showMaterialCategory}
                                            onChange={(e) => handleChange('layout', 'showMaterialCategory', e.target.checked)}
                                            className="w-4 h-4 text-[var(--primary-color)] border-border rounded focus:ring-[var(--primary-color)]"
                                        />
                                        <span className="text-sm text-foreground/80 font-medium group-hover:text-foreground transition-colors">{t('admin.productEditor.showMaterialCategory')}</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {sectionId === 'related_products' && (
                        <div className="space-y-6">
                            <div className="flex flex-col gap-1">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">{t('admin.productEditor.relatedTitle')}</h3>
                                <p className="text-xs text-muted-foreground">{t('admin.productEditor.relatedSub')}</p>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-foreground/80 uppercase tracking-widest mb-2">{t('admin.productEditor.sectionTitle')}</label>
                                    <input
                                        type="text"
                                        value={formData.relatedProductsLayout?.title || t('admin.productEditor.youMayAlsoLike')}
                                        onChange={(e) => handleChange('relatedProductsLayout', 'title', e.target.value)}
                                        placeholder={t('admin.productEditor.youMayAlsoLike')}
                                        className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-[var(--primary-color)] outline-none transition-all text-sm font-medium"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-foreground/80 uppercase tracking-widest mb-4">{t('admin.productEditor.displayStyle')}</label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {[
                                            {
                                                id: 'grid',
                                                label: t('admin.productEditor.styles.grid'),
                                                desc: t('admin.productEditor.styles.gridDesc'),
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
                                                label: t('admin.productEditor.styles.slider'),
                                                desc: t('admin.productEditor.styles.sliderDesc'),
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
                                                label: t('admin.productEditor.styles.minimal'),
                                                desc: t('admin.productEditor.styles.minimalDesc'),
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
                                                className={`flex flex-col p-3 text-left rounded-xl border-2 transition-all ${formData.relatedProductsLayout?.displayType === opt.id ? 'border-[var(--primary-color)] bg-[var(--primary-color)] text-white shadow-lg' : 'border-border hover:border-border text-muted-foreground bg-background'}`}
                                            >
                                                <div className="mb-3">{opt.preview}</div>
                                                <span className="font-bold text-[10px] uppercase tracking-wider mb-1">{opt.label}</span>
                                                <p className={`text-[9px] leading-tight ${formData.relatedProductsLayout?.displayType === opt.id ? 'text-white/80' : 'opacity-60'}`}>{opt.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-muted rounded-xl border border-border">
                                    <div>
                                        <p className="font-bold text-sm">{t('admin.productEditor.productsCount')}</p>
                                        <p className="text-xs text-muted-foreground">{t('admin.productEditor.productsCountDesc')}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleChange('relatedProductsLayout', 'itemsCount', Math.max(2, (formData.relatedProductsLayout?.itemsCount || 4) - 1))}
                                            className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-background transition-colors font-bold"
                                        >-</button>
                                        <span className="font-bold w-4 text-center">{formData.relatedProductsLayout?.itemsCount || 4}</span>
                                        <button
                                            onClick={() => handleChange('relatedProductsLayout', 'itemsCount', Math.min(12, (formData.relatedProductsLayout?.itemsCount || 4) + 1))}
                                            className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-background transition-colors font-bold"
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
                        {t('admin.cancel')}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-8 py-2.5 bg-[var(--primary-color)] text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 shadow-lg active:scale-95"
                    >
                        {isSaving ? <FiRefreshCw className="animate-spin" /> : <FiCheck />}
                        {isSaving ? t('admin.saving') : t('admin.productEditor.saveSettings')}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
