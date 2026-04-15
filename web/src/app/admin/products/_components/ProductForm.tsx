import { FiSave, FiX, FiInfo, FiDollarSign, FiImage, FiSettings } from 'react-icons/fi';
import MultipleImageUpload from '@/components/MultipleImageUpload';
import { ProductFormData } from '@/types/product';
import { Category } from '@/types/category';
import { useAppSelector } from '@/lib/hooks';
import { getCurrencySymbol } from '@/utils/currency';
import { useTranslation } from '@/hooks/useTranslation';

interface ProductFormProps {
    title: string;
    subtitle: string;
    formData: ProductFormData;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    setManualField: <K extends keyof ProductFormData>(name: K, value: ProductFormData[K]) => void;
    handleSubmit: (e: React.FormEvent) => void;
    isLoading: boolean;
    error: string | null;
    categories: Category[];
    onCancel: () => void;
    submitLabel: string;
    formId: string;
}

export default function ProductForm({
    title,
    subtitle,
    formData,
    handleChange,
    setManualField,
    handleSubmit,
    isLoading,
    error,
    categories,
    onCancel,
    submitLabel,
    formId
}: ProductFormProps) {
    const { t } = useTranslation();
    const { globalSettings } = useAppSelector((state) => state.content);
    const currencySymbol = getCurrencySymbol(globalSettings?.currency);

    return (
        <div className="max-w-5xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
                    <p className="text-gray-500 mt-2">{subtitle}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={onCancel}
                        type="button"
                        className="px-4 py-2 border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                        <FiX size={18} />
                        {t('admin.common.cancel')}
                    </button>
                    <button
                        form={formId}
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2 bg-black text-white font-medium rounded-lg hover:bg-zinc-800 transition-all shadow-sm hover:shadow active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSave size={18} />}
                        {isLoading ? t('admin.catalog.products.form.submitting') : submitLabel}
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-medium flex items-center gap-3">
                    <FiInfo size={20} />
                    {error}
                </div>
            )}

            <form id={formId} onSubmit={handleSubmit} className="space-y-8">

                {/* Basic Info */}
                <section className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <FiInfo size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">{t('admin.catalog.products.form.basicInfo')}</h2>
                    </div>
                    <div className="p-6 grid gap-6 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('admin.catalog.products.form.name')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all placeholder:text-gray-400"
                                placeholder={t('admin.catalog.products.form.name')}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('admin.catalog.products.form.category')} <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all appearance-none"
                                >
                                    <option value="">{t('admin.catalog.products.form.selectCategory')}</option>
                                    {categories.map((cat) => (
                                        <option key={cat._id} value={cat._id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('admin.catalog.products.form.status')} <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all appearance-none"
                                >
                                    <option value="active">{t('admin.catalog.products.form.active')}</option>
                                    <option value="inactive">{t('admin.catalog.products.form.draft')}</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('admin.catalog.products.form.shortDescription')}
                            </label>
                            <textarea
                                name="shortDescription"
                                value={formData.shortDescription}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all placeholder:text-gray-400"
                                placeholder={t('admin.catalog.products.form.shortDescPlaceholder')}
                            />
                        </div>
                    </div>
                </section>

                {/* Pricing & Stock */}
                <section className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                            <FiDollarSign size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">{t('admin.catalog.products.form.pricing')}</h2>
                    </div>

                    <div className="p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <div className="md:col-span-2 lg:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('admin.catalog.products.form.price')} <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">{currencySymbol}</span>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    step="0.01"
                                    className="w-full pl-8 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2 lg:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('admin.catalog.products.form.discountedPrice')}
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">{currencySymbol}</span>
                                <input
                                    type="number"
                                    name="discountedPrice"
                                    value={formData.discountedPrice}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    className="w-full pl-8 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2 lg:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('admin.catalog.products.form.stock')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                required
                                min="0"
                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                placeholder="0"
                            />
                        </div>

                        <div className="md:col-span-2 lg:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('admin.catalog.products.form.sku')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="sku"
                                value={formData.sku}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all uppercase font-mono text-sm"
                                placeholder="PRD-001"
                            />
                        </div>
                    </div>
                </section>

                {/* Media */}
                <section className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                            <FiImage size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">{t('admin.catalog.products.form.media')}</h2>
                    </div>
                    <div className="p-6">
                        <MultipleImageUpload
                            mainImage={formData.mainImage}
                            images={formData.images}
                            onMainImageChange={(url) => setManualField('mainImage', url)}
                            onImagesChange={(urls) => setManualField('images', urls)}
                        />
                    </div>
                </section>

                {/* Shipping & Additional Settings */}
                <section className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                            <FiSettings size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">{t('admin.catalog.products.form.shipping')}</h2>
                    </div>
                    <div className="p-6 grid gap-6 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('admin.catalog.products.form.weight')} <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="shippingWeight"
                                    value={formData.shippingWeight}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    step="0.01"
                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                    placeholder="0.00"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">g</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('admin.catalog.products.form.rating')}
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="rating"
                                    value={formData.rating}
                                    onChange={handleChange}
                                    min="0"
                                    max="5"
                                    step="0.1"
                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                    placeholder="4.5"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">/ 5</span>
                            </div>
                        </div>

                        <div className="md:col-span-2 border-t border-gray-100 pt-6 mt-2">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input
                                        type="checkbox"
                                        name="isNewArrival"
                                        checked={formData.isNewArrival}
                                        onChange={handleChange}
                                        className="mt-1 w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                                    />
                                    <div>
                                        <span className="block text-sm font-bold text-gray-900">{t('admin.catalog.products.form.newArrival')}</span>
                                        <span className="block text-xs text-gray-500 mt-0.5">{t('admin.catalog.products.form.newArrivalDesc')}</span>
                                    </div>
                                </label>

                                <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input
                                        type="checkbox"
                                        name="isBestSeller"
                                        checked={formData.isBestSeller}
                                        onChange={handleChange}
                                        className="mt-1 w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                                    />
                                    <div>
                                        <span className="block text-sm font-bold text-gray-900">{t('admin.catalog.products.form.bestSeller')}</span>
                                        <span className="block text-xs text-gray-500 mt-0.5">{t('admin.catalog.products.form.bestSellerDesc')}</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </section>
            </form>
        </div>
    );
}
