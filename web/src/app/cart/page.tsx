'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiMinus, FiPlus, FiX, FiShoppingBag, FiArrowRight, FiShield, FiTruck, FiRefreshCw } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';
import ProductCard from '@/components/ProductCard';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchPublicProducts } from '@/lib/slices/productSlice';
import { getCurrencySymbol } from '@/utils/currency';
import { useTranslation } from '@/hooks/useTranslation';
import type { Product } from '@/types/product';

export default function CartPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t, locale } = useTranslation();
  const { items, updateQuantity, removeItem, getTotalPrice, addItem, discount, applyCoupon, removeDiscount, couponError, isLoadingCoupon, getFinalPrice } = useCart();
  const { products } = useAppSelector((state) => state.product);
  const { globalSettings } = useAppSelector((state) => state.content);
  const currencySymbol = getCurrencySymbol(globalSettings?.currency);
  const [couponCode, setCouponCode] = useState('');

  const subtotal = getTotalPrice();
  const finalPrice = getFinalPrice();
  const shipping = 0;
  const total = finalPrice + shipping;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      await applyCoupon(couponCode);
      setCouponCode('');
    } catch (_error) {
      // Error is handled in context
    }
  };

  useEffect(() => {
    dispatch(fetchPublicProducts());
  }, [dispatch]);

  const recommendations = useMemo<Product[]>(() => {
    if (products.length === 0) return [];
    return products
      .filter((p) => p && p._id && !items.find((i) => i.id === p._id))
      .slice(0, 4);
  }, [products, items]);

  type CartableProduct = Pick<Product, '_id' | 'name' | 'price'> &
    Partial<Pick<Product, 'discountedPrice' | 'mainImage' | 'image'>>;

  const handleAddToCart = (product: CartableProduct) => {
    addItem({
      id: product._id,
      name: product.name,
      price: product.discountedPrice || product.price,
      image: product.mainImage || product.image || '',
    }, 1);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-40 pb-32 bg-background animate-in fade-in duration-700 flex flex-col items-center justify-center">
        <div className="max-w-2xl px-6 text-center">
          <div className="w-24 h-24 bg-foreground/5 rounded-full flex items-center justify-center mx-auto mb-10 text-foreground/30">
            <FiShoppingBag size={40} strokeWidth={1} />
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-light mb-8 text-foreground">{t('cart.empty.title')}</h1>
          <p className="text-foreground/50 font-light mb-12 text-lg leading-relaxed">
            {t('cart.empty.desc')}
          </p>
          <Link
            href="/collections"
            className="inline-block bg-foreground text-background px-12 py-5 text-xs font-bold uppercase tracking-[0.25em] hover:bg-primary transition-all duration-300"
          >
            {t('cart.empty.btn')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 md:pt-40 pb-32 bg-background animate-in fade-in duration-700 font-body">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 xl:gap-24">

          {/* Main Cart Content */}
          <div className="flex-1">
            <div className="flex items-end justify-between border-b border-foreground/10 pb-8 mb-12">
              <h1 className="text-2xl md:text-4xl font-heading text-foreground">{t('cart.title')}</h1>
              <span className="text-sm text-foreground/40 font-light">{t('cart.items', { count: items.length })}</span>
            </div>

            <div className="space-y-12">
              {items.map(item => (
                <div key={item.id} className="flex flex-col sm:flex-row gap-8 pb-12 border-b border-foreground/10 group">
                  <div className="w-full sm:w-40 aspect-[3/4] overflow-hidden bg-foreground/5 relative">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <Link href={`/products/${item.id}`} className="text-xl font-heading text-foreground hover:text-primary transition-colors">
                          {item.name}
                        </Link>
                        <p className="text-lg font-medium text-foreground whitespace-nowrap ml-4">
                          {currencySymbol} {item.price.toLocaleString(locale)}
                        </p>
                      </div>
                      <p className="text-[10px] text-primary uppercase tracking-[0.2em] font-bold mb-6">
                        {item.material || t('cart.readyToShip')}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center border border-foreground/10 h-10 w-fit">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="w-10 h-full flex items-center justify-center text-foreground/40 hover:text-foreground transition-colors border-r border-foreground/10"
                        >
                          <FiMinus size={12} />
                        </button>
                        <span className="w-12 text-center text-sm text-foreground font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-10 h-full flex items-center justify-center text-foreground/40 hover:text-foreground transition-colors border-l border-foreground/10"
                        >
                          <FiPlus size={12} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-foreground/40 hover:text-red-500 transition-colors"
                      >
                        <span className="border-b border-transparent hover:border-red-500 pb-0.5 transition-all">{t('cart.remove')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-16">
               <div className="flex items-center gap-4 group">
                <FiShield size={24} strokeWidth={1} className="text-primary group-hover:scale-110 transition-transform duration-300" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 group-hover:text-foreground transition-colors">{t('cart.guarantees.authentic')}</span>
              </div>
              <div className="flex items-center gap-4 group">
                <FiTruck size={24} strokeWidth={1} className="text-primary group-hover:scale-110 transition-transform duration-300" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 group-hover:text-foreground transition-colors">{t('cart.guarantees.shipping')}</span>
              </div>
              <div className="flex items-center gap-4 group">
                <FiRefreshCw size={24} strokeWidth={1} className="text-primary group-hover:scale-110 transition-transform duration-300" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 group-hover:text-foreground transition-colors">{t('cart.guarantees.returns')}</span>
              </div>
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="w-full lg:w-[420px]">
            <div className="bg-foreground/5 p-6 md:p-10 lg:sticky lg:top-32">
              <h2 className="text-2xl font-heading mb-8 text-foreground">{t('cart.summary.title')}</h2>

              <div className="space-y-4 mb-8 pb-8 border-b border-foreground/10">
                <div className="flex justify-between text-sm text-foreground/50 font-light">
                  <span>{t('cart.summary.subtotal')}</span>
                  <span className="text-foreground">{currencySymbol} {subtotal.toLocaleString(locale)}</span>
                </div>
                <div className="flex justify-between text-sm text-foreground/50 font-light">
                  <span>{t('cart.summary.shipping')}</span>
                  <span className="text-primary">{t('cart.summary.shippingFree')}</span>
                </div>
                <div className="flex justify-between text-sm text-foreground/50 font-light">
                  <span>{t('cart.summary.tax')}</span>
                  <span className="text-foreground">{t('cart.summary.taxIncluded')}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-10">
                <span className="text-lg font-heading text-foreground">{t('cart.summary.total')}</span>
                <span className="text-xl font-medium text-foreground">{currencySymbol} {total.toLocaleString(locale)}</span>
              </div>

              <div className="mb-10">
                <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-3 block">{t('cart.summary.promoCode')}</label>

                {discount ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-green-700 uppercase tracking-wider">{discount.code}</p>
                      <p className="text-[10px] text-green-600">
                        {discount.discountType === 'percentage' ? `-${discount.amount}%` : `-${currencySymbol}${discount.amount}`} {t('cart.summary.applied')}
                      </p>
                    </div>
                    <button
                      onClick={removeDiscount}
                      className="text-foreground/40 hover:text-red-500 transition-colors"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex border-b border-foreground/30 focus-within:border-foreground transition-colors relative">
                      <input
                        type="text"
                        placeholder={t('cart.summary.promoPlaceholder')}
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                        className="flex-1 bg-transparent py-3 text-sm text-foreground placeholder-foreground/40 focus:outline-none uppercase"
                        disabled={isLoadingCoupon}
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={isLoadingCoupon || !couponCode.trim()}
                        className="text-[10px] font-bold uppercase tracking-widest text-foreground hover:text-primary transition-colors disabled:opacity-50"
                      >
                        {isLoadingCoupon ? '...' : t('cart.summary.apply')}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-xs text-red-500">{couponError}</p>
                    )}
                  </div>
                )}
              </div>

              {discount && (
                <div className="space-y-4 mb-4 pb-4 border-b border-foreground/10">
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span>{t('cart.summary.discount')}</span>
                    <span>- {currencySymbol} {discount.discountAmount.toLocaleString(locale)}</span>
                  </div>
                </div>
              )}

              <button
                onClick={() => router.push('/checkout')}
                className="w-full bg-foreground text-background py-5 font-bold uppercase tracking-[0.25em] text-[11px] hover:bg-primary transition-all duration-300 flex items-center justify-center gap-3"
              >
                {t('cart.summary.checkout')} <FiArrowRight size={16} />
              </button>

              <p className="mt-6 text-[10px] text-foreground/40 text-center font-light leading-relaxed">
                {t('cart.summary.secure')}
              </p>
            </div>
          </div>
        </div>

        {/* You May Also Like Section */}
        {recommendations.length > 0 && (
          <div className="mt-16 md:mt-32 pt-16 border-t border-foreground/10">
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between mb-8 sm:mb-16 gap-4 sm:gap-0">
              <div className="text-center sm:text-left">
                <h2 className="text-2xl md:text-3xl font-heading text-foreground mb-2">{t('cart.recommendations.title')}</h2>
                <p className="text-foreground/50 font-light">{t('cart.recommendations.subtitle')}</p>
              </div>
              <Link
                href="/collections"
                className="hidden sm:block text-xs font-bold uppercase tracking-[0.2em] text-primary hover:text-foreground transition-colors pb-1 border-b border-primary hover:border-foreground"
              >
                {t('cart.recommendations.viewAll')}
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-4 sm:gap-x-8">
              {recommendations.map(product => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>

            <div className="mt-12 text-center sm:hidden">
              <Link
                href="/collections"
                className="text-xs font-bold uppercase tracking-[0.2em] text-primary hover:text-foreground transition-colors pb-1 border-b border-primary hover:border-foreground"
              >
                {t('cart.recommendations.viewAll')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
