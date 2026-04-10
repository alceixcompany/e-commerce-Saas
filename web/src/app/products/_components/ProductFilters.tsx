import { FiChevronDown, FiCheck, FiX } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';

interface ProductFiltersProps {
    hasActiveFilters: boolean;
    selectedCategory: string;
    categories: any[];
    sortBy: string;
    showCategoryDropdown: boolean;
    setShowCategoryDropdown: (show: boolean) => void;
    showSortDropdown: boolean;
    setShowSortDropdown: (show: boolean) => void;
    updateFilters: (newCategory?: string, newSort?: string) => void;
    totalProductsInCategories?: number;
}

export default function ProductFilters({
    hasActiveFilters,
    selectedCategory,
    categories,
    sortBy,
    showCategoryDropdown,
    setShowCategoryDropdown,
    showSortDropdown,
    setShowSortDropdown,
    updateFilters,
    totalProductsInCategories
}: ProductFiltersProps) {
    const router = useRouter();
    const { t } = useTranslation();

    const sortOptions = [
        { label: t('product.archive.sortOptions.newest'), value: 'newest' },
        { label: t('product.archive.sortOptions.bestSelling'), value: 'best-selling' },
        { label: t('product.archive.sortOptions.priceLow'), value: 'price-low' },
        { label: t('product.archive.sortOptions.priceHigh'), value: 'price-high' },
        { label: t('product.archive.sortOptions.name'), value: 'name' },
    ];

    return (
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-foreground/10">
            {/* Left - Clear Filters */}
            <div className="flex items-center gap-3">
                {hasActiveFilters && (
                    <button
                        onClick={() => {
                            router.push('/products');
                        }}
                        className="group flex items-center gap-2 text-xs text-foreground/50 hover:text-red-500 transition-colors"
                    >
                        <FiX size={14} className="group-hover:rotate-90 transition-transform duration-300" />
                        <span className="uppercase tracking-wider">{t('product.archive.clearFilters')}</span>
                    </button>
                )}
            </div>

            {/* Right - Filter Controls */}
            <div className="flex items-center gap-3">
                {/* Category Filter */}
                <div className="relative category-dropdown">
                    <button
                        onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                        className="group flex items-center gap-2 px-4 py-2 border border-foreground/10 hover:border-foreground/20 rounded-lg transition-all text-xs"
                    >
                        <span className="text-foreground/50">{t('product.archive.category')}:</span>
                        <span className="font-medium text-foreground">
                            {selectedCategory === 'all' ? t('product.archive.all') : categories.find(c => c._id === selectedCategory)?.name}
                        </span>
                        <FiChevronDown
                            size={14}
                            className={`text-foreground/40 transition-transform duration-300 ${showCategoryDropdown ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {showCategoryDropdown && (
                        <div className="absolute right-0 md:left-0 md:right-auto top-full mt-2 bg-background rounded-lg shadow-xl border border-foreground/10 min-w-[220px] py-2 z-50 animate-in fade-in duration-200">
                            <button
                                onClick={() => {
                                    updateFilters('all');
                                    setShowCategoryDropdown(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-foreground/5 transition-colors ${selectedCategory === 'all' ? 'font-semibold text-primary bg-primary/5' : 'text-foreground/70'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <span>{t('product.archive.allCategories')}</span>
                                    {totalProductsInCategories !== undefined && (
                                        <span className="px-1.5 py-0.5 rounded-full bg-foreground/5 text-[9px] text-foreground/40 font-mono">
                                            {totalProductsInCategories}
                                        </span>
                                    )}
                                </div>
                                {selectedCategory === 'all' && <FiCheck size={14} />}
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category._id}
                                    onClick={() => {
                                        updateFilters(category._id);
                                        setShowCategoryDropdown(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-foreground/5 transition-colors ${selectedCategory === category._id ? 'font-semibold text-primary bg-primary/5' : 'text-foreground/70'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span>{category.name}</span>
                                        <span className="px-1.5 py-0.5 rounded-full bg-foreground/5 text-[9px] text-foreground/40 font-mono">
                                            {category.productCount || 0}
                                        </span>
                                    </div>
                                    {selectedCategory === category._id && <FiCheck size={14} />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sort Dropdown */}
                <div className="relative sort-dropdown">
                    <button
                        onClick={() => setShowSortDropdown(!showSortDropdown)}
                        className="group flex items-center gap-2 px-4 py-2 border border-foreground/10 hover:border-foreground/20 rounded-lg transition-all text-xs"
                    >
                        <span className="text-foreground/50">{t('product.archive.sortBy')}:</span>
                        <span className="font-medium text-foreground">
                            {sortOptions.find(opt => opt.value === sortBy)?.label || sortBy.replace('-', ' ')}
                        </span>
                        <FiChevronDown
                            size={14}
                            className={`text-foreground/40 transition-transform duration-300 ${showSortDropdown ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {showSortDropdown && (
                        <div className="absolute right-0 top-full mt-2 bg-background rounded-lg shadow-xl border border-foreground/10 min-w-[200px] py-2 z-50 animate-in fade-in duration-200">
                            {sortOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        updateFilters(undefined, option.value);
                                        setShowSortDropdown(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-foreground/5 transition-colors ${sortBy === option.value ? 'font-semibold text-primary bg-primary/5' : 'text-foreground/70'}`}
                                >
                                    <span>{option.label}</span>
                                    {sortBy === option.value && <FiCheck size={14} />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
