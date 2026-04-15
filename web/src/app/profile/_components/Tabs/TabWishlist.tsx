import Link from 'next/link';
import { FiHeart } from 'react-icons/fi';
import ProductCard from '@/components/ProductCard';
import { useTranslation } from '@/hooks/useTranslation';
import type { Product } from '@/types/product';

interface TabWishlistProps {
    wishlist: Array<string | Product>;
    handleAddToCart: (product: Product) => void;
}

export default function TabWishlist({
    wishlist,
    handleAddToCart
}: TabWishlistProps) {
    const { t } = useTranslation();
    return (
        <div className="p-4 md:p-8">
            <h2 className="text-lg md:text-xl font-bold text-foreground mb-6 md:mb-8 px-2">{t('profile.tabs.wishlist.title')}</h2>
            {wishlist && wishlist.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {wishlist.map((productRef) => {
                        const product = typeof productRef === 'object' && productRef !== null ? productRef : null;
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
                    <p className="text-foreground/40 italic">{t('profile.tabs.wishlist.empty')}</p>
                    <Link href="/collections" className="inline-block px-10 py-3 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/80 transition-all">{t('profile.tabs.wishlist.explore')}</Link>
                </div>
            )}
        </div>
    );
}
