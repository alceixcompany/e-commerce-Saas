'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useProductStore } from '@/lib/store/useProductStore';
import { useContentStore } from '@/lib/store/useContentStore';
import { useTranslation } from '@/hooks/useTranslation';
import AdminPagination from '@/components/admin/AdminPagination';
import Link from 'next/link';
import { FiPlus, FiSearch, FiFilter, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import type { Product } from '@/types/product';
import type { Category } from '@/types/category';
import { getCurrencySymbol } from '@/utils/currency';

interface ProductListingClientProps {
  initialProducts?: Product[];
  initialMetadata?: any;
  categories: Category[];
}

function ProductImage({ src, alt }: { src: string; alt: string }) {
  const [hasError, setHasError] = useState(false);
  const fallbackImage = '/image/alceix/product.png';

  return (
    <div className="relative w-full h-full">
      <Image
        src={hasError ? fallbackImage : src}
        alt={alt}
        fill
        className="object-cover"
        onError={() => {
          if (!hasError) setHasError(true);
        }}
      />
    </div>
  );
}

export default function ProductListingClient({ initialProducts = [], initialMetadata, categories }: ProductListingClientProps) {
  const { t } = useTranslation();
  const { globalSettings } = useContentStore();
  
  const { 
    products: storeProducts, 
    metadata: storeMetadata, 
    isLoading: storeLoading, 
    error,
    fetchProducts,
    deleteProduct,
    bulkDeleteProducts
  } = useProductStore();
  
  const products = storeProducts.length > 0 ? storeProducts : initialProducts;
  const metadata = storeMetadata.total > 0 ? storeMetadata : (initialMetadata || { page: 1, pages: 1, total: initialProducts.length });
  const currencySymbol = getCurrencySymbol(globalSettings?.currency);
  
  const isLoading = storeLoading.list;
  const isDeleting = storeLoading.action;

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (storeProducts.length > 0 || initialProducts.length === 0) return;

    useProductStore.setState((state) => ({
      ...state,
      products: initialProducts,
      metadata: initialMetadata || { page: 1, pages: 1, total: initialProducts.length },
    }));
  }, [initialMetadata, initialProducts, storeProducts.length]);

  useEffect(() => {
    if (hasInitialized) {
        fetchProducts({
          page,
          limit,
          category: selectedCategory,
          q: searchQuery
        });
    } else {
        setHasInitialized(true);
    }
  }, [fetchProducts, selectedCategory, searchQuery, page, limit, hasInitialized]);

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.common.deleteConfirm'))) {
      return;
    }

    try {
      await deleteProduct(id);
      fetchProducts({ page, limit, category: selectedCategory, q: searchQuery });
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProductIds.length === 0) return;

    if (confirm(t('admin.catalog.products.bulk.confirmDelete', { count: selectedProductIds.length }))) {
      try {
        await bulkDeleteProducts(selectedProductIds);
        setSelectedProductIds([]);
        fetchProducts({ page, limit, category: selectedCategory, q: searchQuery });
      } catch (err) {
        console.error('Failed to bulk delete products:', err);
      }
    }
  };

  const toggleSelectAll = () => {
    if (selectedProductIds.length === products.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(products.map((p) => p._id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedProductIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const getCategoryName = (categoryId: Product['category']) => {
    if (typeof categoryId === 'object') return categoryId.name;
    const category = categories.find((c) => c._id === categoryId);
    return category?.name || 'N/A';
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">{t('admin.catalog.products.title')}</h1>
          <p className="text-foreground/50 mt-2">{t('admin.catalog.products.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedProductIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-all rounded-xl shadow-lg hover:shadow-red-500/20 disabled:opacity-50"
            >
              <FiTrash2 size={18} />
              {t('admin.common.selected')}: {selectedProductIds.length}
            </button>
          )}
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background text-[10px] font-black uppercase tracking-[0.2em] hover:bg-foreground/80 transition-all rounded-xl shadow-lg hover:shadow-foreground/20"
          >
            <FiPlus size={18} />
            {t('admin.catalog.products.addProduct')}
          </Link>
        </div>
      </div>

      {/* Filters & Toolbar */}
      <div className="bg-background p-4 rounded-xl border border-foreground/10 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder={t('admin.catalog.products.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2.5 bg-foreground/5 border-0 rounded-lg text-sm text-foreground placeholder:text-foreground/40 focus:ring-2 focus:ring-foreground/5 font-medium"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" size={16} />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="w-full md:w-48 pl-9 pr-8 py-2.5 bg-background border border-foreground/10 rounded-lg text-sm text-foreground focus:outline-none focus:border-foreground/30 transition-colors appearance-none cursor-pointer hover:border-foreground/20 font-medium"
            >
              <option value="all">{t('admin.catalog.products.allCategories')}</option>
              {categories.filter(cat => cat && cat._id).map((category) => (
                <option key={category._id} value={category._id} className="bg-background">
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          {(selectedCategory !== 'all' || searchQuery !== '') && (
            <button
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); setPage(1); }}
              className="text-xs text-red-500 hover:text-red-600 font-bold uppercase tracking-widest px-2"
            >
              {t('admin.common.reset')}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/5 text-red-500 rounded-xl border border-red-500/10 flex items-center gap-3">
          <FiTrash2 size={16} />
          <p className="text-xs font-bold uppercase tracking-widest">{error}</p>
        </div>
      )}

      {isLoading && products.length === 0 ? (
        <div className="flex justify-center py-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-background border border-dashed border-foreground/20 rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-foreground/5 rounded-full flex items-center justify-center mx-auto mb-4 text-foreground/20">
            <FiSearch size={24} />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">{t('admin.catalog.products.noProducts')}</h3>
          <p className="text-foreground/50 mb-6 max-w-sm mx-auto">
            {t('admin.catalog.products.noProductsDesc')}
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="px-6 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/80 font-bold uppercase tracking-widest text-[10px] transition-all"
          >
            {t('admin.common.reset')}
          </button>
        </div>
      ) : (
        <div className="bg-background border border-foreground/10 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-foreground/5 border-b border-foreground/5 font-bold text-[10px] uppercase tracking-[0.2em] text-foreground/40">
                <tr>
                  <th className="px-6 py-4 text-center w-12">
                    <input
                      type="checkbox"
                      checked={selectedProductIds.length === products.length && products.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-foreground/20 bg-background text-foreground focus:ring-foreground/10 transition-all cursor-pointer mx-auto"
                    />
                  </th>
                  <th className="px-6 py-4 text-left w-20">{t('admin.catalog.products.table.image')}</th>
                  <th className="px-6 py-4 text-left">{t('admin.catalog.products.table.product')}</th>
                  <th className="px-6 py-4 text-left">{t('admin.catalog.products.table.category')}</th>
                  <th className="px-6 py-4 text-left">{t('admin.catalog.products.table.price')}</th>
                  <th className="px-6 py-4 text-left">{t('admin.catalog.products.table.stock')}</th>
                  <th className="px-6 py-4 text-left">{t('admin.catalog.products.table.status')}</th>
                  <th className="px-6 py-4 text-right">{t('admin.catalog.products.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5">
                {products.filter(p => p && p._id).map((product) => (
                  <tr key={product._id} className={`hover:bg-foreground/5 transition-colors group ${selectedProductIds.includes(product._id) ? 'bg-foreground/[0.02]' : ''}`}>
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedProductIds.includes(product._id)}
                        onChange={() => toggleSelect(product._id)}
                        className="w-4 h-4 rounded border-foreground/20 bg-background text-foreground focus:ring-foreground/10 transition-all cursor-pointer mx-auto"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 rounded-xl bg-foreground/5 overflow-hidden border border-foreground/10 shadow-sm transition-transform group-hover:scale-110 relative">
                        {product.image ? (
                          <ProductImage
                            src={product.image}
                            alt={product.name}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-foreground/20 font-black uppercase tracking-tighter">NI</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-bold text-foreground text-sm leading-tight">{product.name}</div>
                        <div className="text-[10px] text-foreground/40 font-mono mt-0.5 tracking-wider uppercase">
                          {product.sku}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider bg-foreground/5 text-foreground/60 border border-foreground/5 shadow-sm">
                        {getCategoryName(product.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-black text-foreground text-sm tracking-tight text-nowrap">
                        {currencySymbol}{(product.discountedPrice || product.price).toFixed(2)}
                        {product.discountedPrice && (
                          <span className="text-[10px] text-foreground/30 line-through ml-2 font-medium opacity-60">
                            {currencySymbol}{product.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-xs font-bold ${product.stock <= 5 ? 'text-red-500 anim-pulse' : 'text-foreground/60'}`}>
                        {product.stock} <span className="text-[9px] font-black opacity-40 uppercase ml-0.5">{t('admin.catalog.products.table.units')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${product.status === 'active'
                          ? 'bg-green-500/10 text-green-600 border-green-500/20'
                          : 'bg-foreground/5 text-foreground/40 border-foreground/10'
                          }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${product.status === 'active' ? 'bg-green-600 animate-pulse' : 'bg-foreground/20'}`}></span>
                        {product.status === 'active' ? t('admin.catalog.products.table.active') : t('admin.catalog.products.table.draft')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        <Link
                          href={`/products/${product._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-foreground/30 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                        >
                          <FiEye size={18} />
                        </Link>
                        <Link
                          href={`/admin/products/edit/${product._id}`}
                          className="p-2 text-foreground/30 hover:text-foreground hover:bg-foreground/5 rounded-xl transition-all"
                        >
                          <FiEdit2 size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-2 text-foreground/30 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <AdminPagination
            currentPage={metadata.page ?? 1}
            totalPages={metadata.pages ?? 1}
            totalItems={metadata.total ?? 0}
            limit={limit}
            onPageChange={(p) => setPage(p)}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
}
