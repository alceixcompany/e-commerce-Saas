'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiMinus, FiPlus, FiX, FiShoppingBag, FiArrowRight, FiShield, FiTruck, FiRefreshCw } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';
import ProductCard from '@/components/ProductCard';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchPublicProducts } from '@/lib/slices/productSlice';

export default function CartPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items, updateQuantity, removeItem, getTotalPrice, addItem, discount, applyCoupon, removeDiscount, couponError, isLoadingCoupon, getFinalPrice } = useCart();
  const { products } = useAppSelector((state) => state.product);
  const [recommendations, setRecommendations] = useState<any[]>([]);
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
    } catch (error) {
      // Error is handled in context
    }
  };

  useEffect(() => {
    dispatch(fetchPublicProducts());
  }, [dispatch]);

  useEffect(() => {
    if (products.length > 0) {
      const recommended = products
        .filter((p: any) => p && p._id && !items.find(i => i.id === p._id))
        .slice(0, 4);
      setRecommendations(recommended);
    }
  }, [products, items]);

  const handleAddToCart = (product: any) => {
    addItem({
      id: product._id,
      name: product.name,
      price: product.discountedPrice || product.price,
      image: product.mainImage || product.image,
    }, 1);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-40 pb-32 bg-white animate-in fade-in duration-700 flex flex-col items-center justify-center">
        <div className="max-w-2xl px-6 text-center">
          <div className="w-24 h-24 bg-[#F9F9F9] rounded-full flex items-center justify-center mx-auto mb-10 text-gray-300">
            <FiShoppingBag size={40} strokeWidth={1} />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-light mb-8 text-gray-900">Your Shopping Bag is Empty</h1>
          <p className="text-gray-500 font-light mb-12 text-lg leading-relaxed">
            It looks like you haven't added any treasures yet. <br />
            Explore our curated collections to find the perfect piece for you.
          </p>
          <Link
            href="/collections"
            className="inline-block bg-[#1a1a1a] text-white px-12 py-5 text-xs font-bold uppercase tracking-[0.25em] hover:bg-[#C5A059] transition-all duration-300"
          >
            Discover Collections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 md:pt-40 pb-32 bg-white animate-in fade-in duration-700 font-sans">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 xl:gap-24">

          {/* Main Cart Content */}
          <div className="flex-1">
            <div className="flex items-end justify-between border-b border-gray-100 pb-8 mb-12">
              <h1 className="text-2xl md:text-4xl font-serif text-gray-900">Shopping Bag</h1>
              <span className="text-sm text-gray-400 font-light">{items.length} Items</span>
            </div>

            <div className="space-y-12">
              {items.map(item => (
                <div key={item.id} className="flex flex-col sm:flex-row gap-8 pb-12 border-b border-gray-100 group">
                  <div className="w-full sm:w-40 aspect-[3/4] overflow-hidden bg-gray-50 relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <Link href={`/products/${item.id}`} className="text-xl font-serif text-gray-900 hover:text-[#C5A059] transition-colors">
                          {item.name}
                        </Link>
                        <p className="text-lg font-medium text-gray-900 whitespace-nowrap ml-4">
                          $ {item.price.toLocaleString('en-US')}
                        </p>
                      </div>
                      <p className="text-[10px] text-[#C5A059] uppercase tracking-[0.2em] font-bold mb-6">
                        {item.material || 'Ready to Ship'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center border border-gray-200 h-10 w-fit">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-black transition-colors border-r border-gray-200"
                        >
                          <FiMinus size={12} />
                        </button>
                        <span className="w-12 text-center text-sm text-gray-900 font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-black transition-colors border-l border-gray-200"
                        >
                          <FiPlus size={12} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <span className="border-b border-transparent hover:border-red-500 pb-0.5 transition-all">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-16">
              <div className="flex items-center gap-4 group">
                <FiShield size={24} strokeWidth={1} className="text-[#C5A059] group-hover:scale-110 transition-transform duration-300" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-black transition-colors">Certified Authentic</span>
              </div>
              <div className="flex items-center gap-4 group">
                <FiTruck size={24} strokeWidth={1} className="text-[#C5A059] group-hover:scale-110 transition-transform duration-300" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-black transition-colors">Free Insured Shipping</span>
              </div>
              <div className="flex items-center gap-4 group">
                <FiRefreshCw size={24} strokeWidth={1} className="text-[#C5A059] group-hover:scale-110 transition-transform duration-300" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-black transition-colors">14-Day Returns</span>
              </div>
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="w-full lg:w-[420px]">
            <div className="bg-[#F9F9F9] p-6 md:p-10 lg:sticky lg:top-32">
              <h2 className="text-2xl font-serif mb-8 text-gray-900">Order Summary</h2>

              <div className="space-y-4 mb-8 pb-8 border-b border-gray-200">
                <div className="flex justify-between text-sm text-gray-500 font-light">
                  <span>Subtotal</span>
                  <span className="text-gray-900">$ {subtotal.toLocaleString('en-US')}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500 font-light">
                  <span>Shipping</span>
                  <span className="text-[#C5A059]">Free</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500 font-light">
                  <span>Tax</span>
                  <span className="text-gray-900">Included</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-10">
                <span className="text-lg font-serif text-gray-900">Total</span>
                <span className="text-xl font-medium text-gray-900">$ {total.toLocaleString('en-US')}</span>
              </div>

              <div className="mb-10">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 block">Promo Code</label>

                {discount ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-green-700 uppercase tracking-wider">{discount.code}</p>
                      <p className="text-[10px] text-green-600">
                        {discount.discountType === 'percentage' ? `-${discount.amount}%` : `-$${discount.amount}`} Applied
                      </p>
                    </div>
                    <button
                      onClick={removeDiscount}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex border-b border-gray-300 focus-within:border-black transition-colors relative">
                      <input
                        type="text"
                        placeholder="Enter code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                        className="flex-1 bg-transparent py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none uppercase"
                        disabled={isLoadingCoupon}
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={isLoadingCoupon || !couponCode.trim()}
                        className="text-[10px] font-bold uppercase tracking-widest text-gray-900 hover:text-[#C5A059] transition-colors disabled:opacity-50"
                      >
                        {isLoadingCoupon ? '...' : 'Apply'}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-xs text-red-500">{couponError}</p>
                    )}
                  </div>
                )}
              </div>

              {discount && (
                <div className="space-y-4 mb-4 pb-4 border-b border-gray-200">
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span>Discount</span>
                    <span>- $ {discount.discountAmount.toLocaleString('en-US')}</span>
                  </div>
                </div>
              )}

              <button
                onClick={() => router.push('/checkout')}
                className="w-full bg-[#1a1a1a] text-white py-5 font-bold uppercase tracking-[0.25em] text-[11px] hover:bg-[#C5A059] transition-all duration-300 flex items-center justify-center gap-3"
              >
                Proceed to Checkout <FiArrowRight size={16} />
              </button>

              <p className="mt-6 text-[10px] text-gray-400 text-center font-light leading-relaxed">
                Secure checkout powered by 256-bit SSL encryption.
              </p>
            </div>
          </div>
        </div>

        {/* You May Also Like Section */}
        {recommendations.length > 0 && (
          <div className="mt-16 md:mt-32 pt-16 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between mb-8 sm:mb-16 gap-4 sm:gap-0">
              <div className="text-center sm:text-left">
                <h2 className="text-2xl md:text-3xl font-serif text-gray-900 mb-2">You May Also Like</h2>
                <p className="text-gray-500 font-light">Curated selections just for you</p>
              </div>
              <Link
                href="/collections"
                className="hidden sm:block text-xs font-bold uppercase tracking-[0.2em] text-[#C5A059] hover:text-black transition-colors pb-1 border-b border-[#C5A059] hover:border-black"
              >
                View All
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
                className="text-xs font-bold uppercase tracking-[0.2em] text-[#C5A059] hover:text-black transition-colors pb-1 border-b border-[#C5A059] hover:border-black"
              >
                View All
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
