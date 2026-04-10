import ProductCard from '@/components/ProductCard';
import { FiGrid } from 'react-icons/fi';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

interface ProductGridProps {
    products: any[];
    isLoading: boolean;
    page: number;
    totalPages: number;
    onAddToCart: (product: any) => void;
    onClearFilters: () => void;
}

export default function ProductGrid({
    products,
    isLoading,
    page,
    totalPages,
    onAddToCart,
    onClearFilters
}: ProductGridProps) {
    const { t } = useTranslation();

    if (isLoading && products.length === 0) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <div key={n} className="aspect-[3/4] bg-foreground/5 rounded animate-pulse" />
                ))}
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="py-24 text-center">
                <div className="max-w-sm mx-auto">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-foreground/5 flex items-center justify-center">
                        <FiGrid className="text-foreground/30" size={28} />
                    </div>
                    <h3 className="text-lg font-serif text-foreground mb-2">{t('product.archive.noProducts')}</h3>
                    <p className="text-sm text-foreground/50 mb-6">
                        {t('product.archive.noProductsDesc')}
                    </p>
                    <div className="flex items-center justify-center gap-3">
                        <button
                            onClick={onClearFilters}
                            className="px-6 py-2 bg-foreground text-background text-xs uppercase tracking-wider rounded hover:bg-foreground/80 transition-colors"
                        >
                            {t('product.archive.clearFilters')}
                        </button>
                        <Link
                            href="/"
                            className="px-6 py-2 border border-foreground/10 text-foreground/70 text-xs uppercase tracking-wider rounded hover:border-foreground/20 transition-colors"
                        >
                            {t('product.archive.goHome')}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product, index) => (
                    <div
                        key={product._id}
                        className="animate-in fade-in duration-500"
                        style={{
                            animationDelay: `${index * 30}ms`,
                            animationFillMode: 'backwards'
                        }}
                    >
                        <ProductCard
                            product={product}
                            onAddToCart={() => onAddToCart(product)}
                        />
                    </div>
                ))}
            </div>

            {/* Loading More Indicator */}
            {page < totalPages && (
                <div className="flex flex-col items-center justify-center py-12 border-t border-foreground/5">
                    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
                    <p className="text-[10px] text-foreground/40 uppercase tracking-[0.3em]">{t('product.archive.moreTreasures')}</p>
                </div>
            )}
        </div>
    );
}
