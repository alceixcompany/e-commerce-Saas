'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { updateComponentInstance } from '@/lib/slices/componentSlice';
import { searchProducts, fetchPublicProducts, resetProducts, fetchProductsByIds } from '@/lib/slices/productSlice';
import { fetchPublicCategories } from '@/lib/slices/categorySlice';
import { FiX, FiPlus, FiTrash2, FiSave, FiSearch, FiGrid, FiLayout, FiMaximize, FiMove, FiFilter } from 'react-icons/fi';
import { useTranslation } from '@/hooks/useTranslation';

export default function CustomProductsEditorModal({ onClose, onUpdate, instanceId }: { onClose: () => void; onUpdate: () => void; instanceId?: string }) {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { instances } = useAppSelector((state) => state.component);
    const { products, searchResults, loading } = useAppSelector((state) => state.product);
    const { categories } = useAppSelector((state) => state.category);
    const isSearching = loading.fetchList || loading.search;

    const instance = instanceId ? instances.find(i => i._id === instanceId) : null;

    const [settings, setSettings] = useState({
        title: 'Featured Collection',
        subtitle: 'Selected pieces for your home',
        productIds: [] as string[],
        variant: 'grid' as 'grid' | 'slider' | 'focused'
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        dispatch(fetchPublicCategories());
        
        // Fetch details for already selected products so they show images/names
        const productIds = instance?.data?.productIds;
        if (productIds && productIds.length > 0) {
            dispatch(fetchProductsByIds(productIds)).then((res: any) => {
                if (res.payload) {
                    setSelectedProducts(res.payload);
                }
            });
        }
    }, [instance?.data?.productIds, dispatch]);

    useEffect(() => {
        if (instanceId && instance) {
            setSettings(instance.data || { title: '', subtitle: '', productIds: [], variant: 'grid' });
        }
    }, [instance, instanceId]);

    useEffect(() => {
        if (selectedCategory === 'all' && !searchTerm) {
            dispatch(resetProducts());
            return;
        }
        
        dispatch(fetchPublicProducts({ 
            category: selectedCategory === 'all' ? undefined : selectedCategory,
            q: searchTerm
        }));
    }, [selectedCategory, dispatch]); // Now only triggers on category select

    // This effect should ideally fetch details for currently selected productIds 
    // to show them in the "Selected" list with names/images.
    // For now, we'll assume they get populated when searched and added.

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm && selectedCategory === 'all') {
             // Maybe show a toast or just do nothing
             return;
        }
        dispatch(fetchPublicProducts({ 
            q: searchTerm, 
            category: selectedCategory === 'all' ? undefined : selectedCategory 
        }));
    };

    const addProduct = (product: any) => {
        if (!settings.productIds.includes(product._id)) {
            setSettings({
                ...settings,
                productIds: [...settings.productIds, product._id]
            });
            setSelectedProducts([...selectedProducts, product]);
        }
    };

    const removeProduct = (id: string) => {
        setSettings({
            ...settings,
            productIds: settings.productIds.filter(pid => pid !== id)
        });
        setSelectedProducts(selectedProducts.filter(p => p._id !== id));
    };

    const handleSave = async () => {
        if (!instanceId) return;
        setIsSaving(true);
        try {
            await dispatch(updateComponentInstance({
                id: instanceId,
                data: settings
            })).unwrap();
            onUpdate();
            onClose();
        } catch (e) {
            alert(t('admin.saveError'));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm p-4">
            <div className="bg-background rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-border flex justify-between items-center bg-background z-10">
                    <div>
                        <h3 className="font-bold text-lg flex items-center gap-2 italic">
                            <FiGrid className="text-primary" /> {t('admin.customProductsEditor.title')}
                        </h3>
                        <p className="text-xs text-muted-foreground/80">{t('admin.customProductsEditor.subtitle')}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted/80 rounded-full text-muted-foreground/80 hover:text-foreground transition-colors">
                        <FiX size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-muted/30">
                    {/* Left Panel: Settings & Product Search */}
                    <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto border-r border-border space-y-8 bg-background">
                        <section className="space-y-6">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 border-b pb-2">Layout & Text</h4>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground/80 mb-1 block">Title</label>
                                    <input
                                        className="w-full p-3 border rounded-xl text-sm"
                                        value={settings.title}
                                        onChange={e => setSettings({ ...settings, title: e.target.value })}
                                        placeholder="Collection Title"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground/80 mb-1 block">Subtitle</label>
                                    <input
                                        className="w-full p-3 border rounded-xl text-sm"
                                        value={settings.subtitle}
                                        onChange={e => setSettings({ ...settings, subtitle: e.target.value })}
                                        placeholder="Subtitle"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold uppercase text-muted-foreground/80 mb-3 block">Display Variant</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {(['grid', 'slider', 'focused'] as const).map((v) => (
                                        <button
                                            key={v}
                                            onClick={() => setSettings({ ...settings, variant: v })}
                                            className={`py-3 px-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                                                settings.variant === v 
                                                ? 'border-primary bg-primary/5 text-primary shadow-sm' 
                                                : 'border-border hover:border-primary/20 bg-background text-muted-foreground'
                                            }`}
                                        >
                                            {v === 'grid' && <FiGrid size={18} />}
                                            {v === 'slider' && <FiLayout size={18} />}
                                            {v === 'focused' && <FiMaximize size={18} />}
                                            <span className="text-[9px] font-bold uppercase">{t(`admin.customProductsEditor.variants.${v}`)}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <section className="space-y-6">
                             <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 border-b pb-2">Search Products</h4>
                             <div className="flex gap-2">
                                <form onSubmit={handleSearch} className="relative flex-1">
                                    <input
                                        className="w-full p-4 pl-12 border rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        placeholder="Search by name, SKU or category..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 py-1.5 px-4 bg-primary text-background rounded-lg text-xs font-bold">
                                        {isSearching ? '...' : 'Search'}
                                    </button>
                                </form>
                                <div className="relative min-w-[140px]">
                                    <select
                                        className="w-full h-full p-4 pl-10 border rounded-2xl text-xs font-bold appearance-none bg-background cursor-pointer focus:ring-2 focus:ring-primary/20 outline-none"
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                    >
                                        <option value="all">All Categories</option>
                                        {categories.map((cat) => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                </div>
                             </div>

                             <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                 {products.map((product) => (
                                    <div key={product._id} className="flex items-center justify-between p-3 bg-muted/20 border border-border/50 rounded-xl group hover:border-primary/30 transition-all">
                                        <div className="flex items-center gap-3">
                                            <img src={(product as any).mainImage || (product as any).image} className="w-10 h-10 object-cover rounded-lg" alt="" />
                                             <div>
                                                <p className="text-xs font-bold truncate max-w-[150px]">{product.name}</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[9px] text-muted-foreground uppercase bg-muted px-1.5 py-0.5 rounded">{product.sku}</p>
                                                    {product.category && (
                                                        <p className="text-[9px] text-primary/70 font-bold uppercase truncate max-w-[80px]">
                                                            {(product.category as any).name || 'Default'}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => addProduct(product)}
                                            disabled={settings.productIds.includes(product._id)}
                                            className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-background disabled:opacity-30 transition-all"
                                        >
                                            <FiPlus />
                                        </button>
                                    </div>
                                ))}
                             </div>
                        </section>
                    </div>

                    {/* Right Panel: Selected Selection Reordering */}
                    <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto flex flex-col">
                        <section className="flex-1 space-y-4">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Selected Selection ({settings.productIds.length})</h4>
                                <button disabled={isSaving} onClick={handleSave} className="py-2 px-6 bg-foreground text-background rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-foreground/80 transition-all">
                                    {isSaving ? '...' : <><FiSave /> Save Changes</>}
                                </button>
                            </div>

                            <div className="space-y-3">
                                {settings.productIds.length === 0 ? (
                                    <div className="py-20 text-center border-2 border-dashed border-muted-foreground/10 rounded-3xl">
                                        <p className="text-xs text-muted-foreground">No products selected yet.</p>
                                    </div>
                                ) : (
                                    settings.productIds.map((id, index) => {
                                        // Find product info from selectedProducts list or searchResults
                                         const product = selectedProducts.find(p => p._id === id) || products.find(p => p._id === id) || searchResults.find(p => p._id === id);
                                        return (
                                            <div key={id} className="flex items-center justify-between p-4 bg-background border border-border shadow-sm rounded-2xl group transition-all">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-xs font-mono text-muted-foreground/40">{index + 1}</span>
                                                    {product && (
                                                        <img 
                                                            src={product.mainImage || product.image || (product.images?.[0]?.url) || (product.images?.[0])} 
                                                            className="w-10 h-10 object-cover rounded-lg" 
                                                            alt="" 
                                                        />
                                                    )}
                                                    <div>
                                                        <p className="text-xs font-bold leading-none mb-1">{product?.name || 'Selected Product'}</p>
                                                        <p className="text-[10px] text-muted-foreground uppercase">{product?.sku || id.slice(-6)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => removeProduct(id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
