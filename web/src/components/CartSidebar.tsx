'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiX, FiMinus, FiPlus, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';
import { useAppSelector } from '@/lib/hooks';
import { getCurrencySymbol } from '@/utils/currency';

import { useTranslation } from '@/hooks/useTranslation';

export default function CartSidebar() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const { items, isSidebarOpen, toggleSidebar, updateQuantity, removeItem, getTotalPrice } = useCart();
  const { globalSettings } = useAppSelector((state) => state.content);
  const currencySymbol = getCurrencySymbol(globalSettings?.currency);
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
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-background z-[70] shadow-2xl transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full font-body">
          {/* Header */}
          <div className="p-8 border-b border-foreground/5 flex items-center justify-between">
            <h2 className="text-2xl font-light font-heading text-foreground">
              {t('cart.sidebar.title')} <span className="text-[10px] font-bold text-foreground/20 uppercase tracking-widest ml-2">({items.length})</span>
            </h2>
            <button onClick={toggleSidebar} className="p-2 hover:bg-foreground/5 rounded-full transition-colors text-foreground/40 hover:text-foreground">
              <FiX size={20} strokeWidth={1.5} />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-8 space-y-10">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-foreground/5 rounded-full flex items-center justify-center mb-6 text-foreground/20">
                  <FiShoppingBag size={32} strokeWidth={1} />
                </div>
                <p className="text-foreground/50 font-light mb-8 italic text-lg">{t('cart.sidebar.empty')}</p>
                <button
                  onClick={toggleSidebar}
                  className="text-xs font-bold uppercase tracking-[0.2em] text-primary border-b border-primary pb-1 hover:text-foreground hover:border-foreground transition-all"
                >
                  {t('cart.sidebar.startShopping')}
                </button>
              </div>
            ) : (
              items.filter(item => item && item.id).map(item => (
                <div key={item.id} className="flex gap-6 group">
                  <div className="w-24 aspect-[3/4] flex-shrink-0 bg-foreground/5 overflow-hidden relative">
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
                      <h4 className="text-base font-heading text-foreground leading-tight pr-4">{item.name}</h4>
                      <button onClick={() => removeItem(item.id)} className="text-foreground/20 hover:text-red-500 transition-colors">
                        <FiX size={14} />
                      </button>
                    </div>
                    <p className="text-[9px] text-primary uppercase tracking-[0.2em] font-bold mb-4">{item.material || t('cart.sidebar.readyToShip')}</p>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center border border-foreground/10 h-8">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="w-8 h-full flex items-center justify-center text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-colors"
                        >
                          <FiMinus size={10} />
                        </button>
                        <span className="w-8 text-center text-xs font-medium text-foreground">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-full flex items-center justify-center text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-colors"
                        >
                          <FiPlus size={10} />
                        </button>
                      </div>
                      <span className="text-sm font-medium text-foreground">{currencySymbol} {(item.price * item.quantity).toLocaleString(locale)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-8 border-t border-foreground/5 bg-foreground/5">
              <div className="flex justify-between mb-6 items-end">
                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">{t('cart.summary.subtotal')}</span>
                <span className="text-xl font-medium text-foreground">{currencySymbol} {total.toLocaleString(locale)}</span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={handleGoToCart}
                  className="w-full bg-background border border-foreground text-foreground py-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-foreground/5 transition-all text-center"
                >
                  {t('cart.sidebar.viewBag')}
                </button>
                <button
                  onClick={handleGoToCart} // Or navigate to checkout directly if that flow existed
                  className="w-full bg-foreground text-background py-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all flex items-center justify-center gap-3"
                >
                  {t('cart.sidebar.checkout')} <FiArrowRight size={14} />
                </button>
              </div>

              <p className="mt-6 text-[9px] text-foreground/30 text-center font-light tracking-widest uppercase">
                {t('cart.sidebar.complementary')}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}


