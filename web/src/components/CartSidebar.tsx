'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiX, FiMinus, FiPlus, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';

export default function CartSidebar() {
  const router = useRouter();
  const { items, isSidebarOpen, toggleSidebar, updateQuantity, removeItem, getTotalPrice } = useCart();
  const total = getTotalPrice();

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSidebarOpen]);

  const handleGoToCart = () => {
    toggleSidebar();
    router.push('/cart');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity duration-500 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleSidebar}
      />

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full font-sans">
          {/* Header */}
          <div className="p-8 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-2xl font-light serif text-gray-900">
              Shopping Bag <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest ml-2">({items.length})</span>
            </h2>
            <button onClick={toggleSidebar} className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400 hover:text-gray-900">
              <FiX size={20} strokeWidth={1.5} />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-8 space-y-10">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-[#F9F9F9] rounded-full flex items-center justify-center mb-6 text-gray-300">
                  <FiShoppingBag size={32} strokeWidth={1} />
                </div>
                <p className="text-gray-500 font-light mb-8 italic text-lg">Your shopping bag is empty.</p>
                <button
                  onClick={toggleSidebar}
                  className="text-xs font-bold uppercase tracking-[0.2em] text-[#C5A059] border-b border-[#C5A059] pb-1 hover:text-black hover:border-black transition-all"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.filter(item => item && item.id).map(item => (
                <div key={item.id} className="flex gap-6 group">
                  <div className="w-24 aspect-[3/4] flex-shrink-0 bg-gray-50 overflow-hidden relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-base font-serif text-gray-900 leading-tight pr-4">{item.name}</h4>
                      <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                        <FiX size={14} />
                      </button>
                    </div>
                    <p className="text-[9px] text-[#C5A059] uppercase tracking-[0.2em] font-bold mb-4">{item.material || 'Ready to Ship'}</p>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center border border-gray-200 h-8">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-50 transition-colors"
                        >
                          <FiMinus size={10} />
                        </button>
                        <span className="w-8 text-center text-xs font-medium text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-50 transition-colors"
                        >
                          <FiPlus size={10} />
                        </button>
                      </div>
                      <span className="text-sm font-medium text-gray-900">$ {(item.price * item.quantity).toLocaleString('en-US')}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-8 border-t border-gray-100 bg-[#F9F9F9]">
              <div className="flex justify-between mb-6 items-end">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Subtotal</span>
                <span className="text-xl font-medium text-gray-900">$ {total.toLocaleString('en-US')}</span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={handleGoToCart}
                  className="w-full bg-white border border-gray-900 text-gray-900 py-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-gray-50 transition-all text-center"
                >
                  View Bag
                </button>
                <button
                  onClick={handleGoToCart} // Or navigate to checkout directly if that flow existed
                  className="w-full bg-[#1a1a1a] text-white py-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[#C5A059] transition-all flex items-center justify-center gap-3"
                >
                  Checkout <FiArrowRight size={14} />
                </button>
              </div>

              <p className="mt-6 text-[9px] text-gray-400 text-center font-light tracking-widest uppercase">
                Complimentary Shipping & Returns
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

