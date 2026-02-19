'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { FiSearch, FiHeart, FiShoppingBag, FiUser, FiMenu, FiX } from 'react-icons/fi';
import CartSidebar from './CartSidebar';
import SearchBar from './SearchBar';
import { useCart } from '@/contexts/CartContext';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { logout } from '@/lib/slices/authSlice';
import { fetchProfile } from '@/lib/slices/profileSlice';

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { toggleSidebar, getTotalItems } = useCart();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { profile } = useAppSelector((state) => state.profile);


  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) {
      dispatch(fetchProfile());
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen for custom event to open search
  useEffect(() => {
    const handleOpenSearch = () => setSearchOpen(true);
    window.addEventListener('open-search', handleOpenSearch);
    return () => window.removeEventListener('open-search', handleOpenSearch);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
  };

  const handleSearchToggle = () => {
    setSearchOpen(!searchOpen);
  };

  // Determine if we're on homepage (for transparent navbar)
  const isHomePage = pathname === '/';
  const shouldBeTransparent = isHomePage && !isScrolled;

  // Hide navigation on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <header className="w-full relative z-50">
        {/* Top Banner */}
        <div className="w-full bg-[#fcfcfc] py-2 text-center border-b border-gray-100/50">
          <span className="text-[9px] md:text-[10px] tracking-[0.3em] font-normal uppercase text-gray-400">
            FAMILY-OWNED AND OPERATED IN NEW YORK CITY
          </span>
        </div>

        <nav className={`w-full sticky top-0 transition-all duration-500 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-0' : 'bg-white py-2'}`}>
          <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-12 py-4 md:py-7">
            <div className="flex justify-between items-center relative">
              {/* Left: Menu Toggle */}
              <div className="flex">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-gray-900 group flex items-center gap-3"
                >
                  <div className="flex flex-col gap-1.5">
                    <span className="w-5 h-[1px] bg-gray-900 transition-all group-hover:w-7"></span>
                    <span className="w-7 h-[1px] bg-gray-900"></span>
                  </div>
                  <span className="text-[10px] tracking-[0.3em] font-normal hidden md:block group-hover:text-gray-600 transition-colors uppercase">Menu</span>
                </button>
              </div>

              {/* Center: Logo */}
              <div className="absolute left-1/2 -translate-x-1/2 scale-90 md:scale-100 transition-transform duration-500">
                <Link href="/" className="flex flex-col items-center group">
                  <div className="relative w-40 h-20 md:w-56 md:h-28 lg:w-64 lg:h-32 transition-transform duration-500 hover:scale-105">
                    <Image
                      src="/image/logo_gem.png"
                      alt="Ocean Gem"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-2 px-1 relative">
                    <div className="h-[0.5px] w-8 bg-blue-100 group-hover:w-12 transition-all duration-700"></div>
                    <span className="text-[8px] md:text-[9px] tracking-[0.7em] uppercase font-light text-gray-400 group-hover:text-cyan-800 transition-colors duration-700">EXQUISITE JEWELRY</span>
                    <div className="h-[0.5px] w-8 bg-blue-100 group-hover:w-12 transition-all duration-700"></div>
                  </div>
                </Link>
              </div>

              {/* Right: Icons */}
              <div className="flex items-center space-x-5 md:space-x-8">
                {/* Account - added back for "premium" feel */}
                {mounted && (
                  <Link
                    href={isAuthenticated ? "/profile" : "/login"}
                    className="text-gray-900 hover:text-gray-500 transition-all hover:scale-105 active:scale-95"
                  >
                    <FiUser size={20} strokeWidth={1} />
                  </Link>
                )}

                {/* Cart Icon */}
                <button
                  onClick={toggleSidebar}
                  className="relative text-gray-900 hover:text-gray-500 transition-all hover:scale-105 active:scale-95 translate-y-0.5"
                >
                  <FiShoppingBag size={22} strokeWidth={1} />
                  {mounted && getTotalItems() > 0 && (
                    <span className="absolute -top-1 -right-2 bg-gray-900 text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full font-normal">
                      {getTotalItems()}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Sub Header - Refined Minimal Style */}
          <div className={`w-full bg-white/50 backdrop-blur-sm border-b border-gray-50 flex items-center justify-center transition-all duration-500 ${isScrolled ? 'h-0 opacity-0 overflow-hidden py-0' : 'h-10 py-2'}`}>
            <span className="text-[9px] md:text-[10px] font-normal tracking-[0.4em] uppercase text-gray-400">
              Exquisite Treasures From The Deep
            </span>
          </div>
        </nav>
      </header>


      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-[100] bg-white transition-all duration-700 ease-in-out ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className="flex flex-col h-full px-8 py-10">
          <div className="flex justify-between items-center mb-16">
            <span className="text-[10px] tracking-[0.3em] font-normal uppercase text-gray-400">Discover Tilo</span>
            <button onClick={() => setIsMenuOpen(false)} className="text-gray-900 p-2">
              <FiX size={32} strokeWidth={1} />
            </button>
          </div>

          <div className="flex flex-col space-y-8">
            <Link href="/about" className="text-3xl md:text-5xl italic serif font-light tracking-wide text-zinc-500 hover:text-zinc-800 hover:translate-x-[4px] transition-all duration-700" onClick={() => setIsMenuOpen(false)}>Our Story</Link>
            <Link href="/collections" className="text-3xl md:text-5xl italic serif font-light tracking-wide text-zinc-500 hover:text-zinc-800 hover:translate-x-[4px] transition-all duration-700" onClick={() => setIsMenuOpen(false)}>Collections</Link>
            <Link href="/journal" className="text-3xl md:text-5xl italic serif font-light tracking-wide text-zinc-500 hover:text-zinc-800 hover:translate-x-[4px] transition-all duration-700" onClick={() => setIsMenuOpen(false)}>Journal</Link>
            <Link href="/products?tag=best-seller" className="text-3xl md:text-5xl italic serif font-light tracking-wide text-zinc-500 hover:text-zinc-800 hover:translate-x-[4px] transition-all duration-700" onClick={() => setIsMenuOpen(false)}>Gift Guide</Link>
          </div>

          <div className="mt-auto pt-10 border-t border-gray-100 flex flex-col space-y-4">
            <Link href={mounted && isAuthenticated ? "/profile" : "/login"} className="text-[10px] tracking-[0.3em] uppercase font-normal text-gray-500 hover:text-gray-900 transition-colors" onClick={() => setIsMenuOpen(false)}>Account</Link>
            <Link href="/contact" className="text-[10px] tracking-[0.3em] uppercase font-normal text-gray-500 hover:text-gray-900 transition-colors" onClick={() => setIsMenuOpen(false)}>Contact Us</Link>
          </div>
        </div>
      </div>

      {/* Search Bar Component */}
      <SearchBar isOpen={searchOpen} onClose={handleSearchToggle} />

      {/* Cart Sidebar */}
      <CartSidebar />
    </>
  );
}

