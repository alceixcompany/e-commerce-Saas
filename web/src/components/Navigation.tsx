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
import { fetchBootstrapConfig } from '@/lib/slices/contentSlice';
import { useTranslation } from '@/hooks/useTranslation';

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { toggleSidebar, getTotalItems } = useCart();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { globalSettings } = useAppSelector((state) => state.content);
  const { t } = useTranslation();

  useEffect(() => {
    setMounted(true);
    dispatch(fetchBootstrapConfig());
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

  const handleSearchToggle = () => {
    setSearchOpen(!searchOpen);
  };

  // Hide navigation on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const layout = globalSettings.navbarLayout || 'classic';
  const logoUrl = globalSettings.logo || "/image/alceix/logo.png";
  const siteName = globalSettings.siteName || "Alceix Group";
  
  const navLinks = globalSettings.navigationLinks || [];

  const renderLogo = (sizeClass = "w-40 h-20 md:w-56 md:h-28 lg:w-64 lg:h-32") => (
    <Link href="/" className="flex flex-col items-center group">
      <div className={`relative ${sizeClass} transition-transform duration-500 hover:scale-105`}>
        <img
          src={logoUrl}
          alt={siteName}
          className="w-full h-full object-contain"
        />
      </div>
    </Link>
  );

  const renderIcons = () => (
    <div className="flex items-center space-x-5 md:space-x-8">
      {/* Search Icon */}
      <button 
        onClick={handleSearchToggle}
        className="text-foreground hover:text-primary transition-all hover:scale-105 active:scale-95 translate-y-0.5"
      >
        <FiSearch size={22} strokeWidth={1} />
      </button>

      {/* Account */}
      {mounted && (
        <Link
          href={isAuthenticated ? "/profile" : "/login"}
          className="text-foreground hover:text-primary transition-all hover:scale-105 active:scale-95"
        >
          <FiUser size={20} strokeWidth={1} />
        </Link>
      )}

      {/* Cart Icon */}
      <button
        onClick={toggleSidebar}
        className="relative text-foreground hover:text-primary transition-all hover:scale-105 active:scale-95 translate-y-0.5"
      >
        <FiShoppingBag size={22} strokeWidth={1} />
        {mounted && getTotalItems() > 0 && (
          <span className="absolute -top-1 -right-2 bg-primary text-background text-[8px] w-4 h-4 flex items-center justify-center rounded-full font-normal">
            {getTotalItems()}
          </span>
        )}
      </button>
    </div>
  );

  const renderNavLinks = (className = "hidden lg:flex items-center gap-8") => (
    <div className={className}>
      {navLinks.map((link, idx) => (
        <Link 
          key={idx} 
          href={link.path} 
          className="text-[10px] tracking-[0.3em] font-normal uppercase text-foreground/60 hover:text-foreground transition-colors whitespace-nowrap"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );

  const renderHeaderLayout = () => {
    switch (layout) {
      case 'centered':
        return (
          <div className="flex flex-col items-center gap-6 py-6 px-4 md:px-12">
            <div>{renderLogo("w-32 h-16 md:w-48 md:h-24")}</div>
            <div className="w-full flex justify-between items-center border-t border-foreground/5 pt-6">
               <div className="flex-1 shrink-0">
                  <button onClick={() => setIsMenuOpen(true)} className="text-foreground/60 hover:text-foreground flex items-center gap-2 group">
                    <FiMenu size={18} />
                    <span className="text-[9px] tracking-widest font-bold uppercase">{globalSettings.navbarMenuLabel || t('common.menu')}</span>
                  </button>
               </div>
               {renderNavLinks()}
               <div className="flex-1 flex justify-end">
                {renderIcons()}
               </div>
            </div>
          </div>
        );

      case 'minimal':
        return (
          <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-12 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-10">
                {renderLogo("w-28 h-14 md:w-36 md:h-18")}
                {renderNavLinks("hidden xl:flex items-center gap-6")}
              </div>
              <div className="flex items-center gap-6">
                {renderIcons()}
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className="p-2 border border-foreground/10 rounded-full hover:bg-foreground hover:text-background transition-all"
                >
                  <FiMenu size={18} />
                </button>
              </div>
            </div>
          </div>
        );

      case 'horizontal':
        return (
          <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-12 py-5">
            <div className="flex justify-between items-center">
              <div className="flex-1 flex items-center">
                {renderLogo("w-24 h-12 md:w-32 md:h-16")}
              </div>
              <div className="flex-1 hidden lg:flex justify-center">
                {renderNavLinks("flex items-center gap-10")}
              </div>
              <div className="flex-1 flex justify-end">
                {renderIcons()}
              </div>
            </div>
          </div>
        );

      case 'classic':
      default:
        return (
          <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-12 py-4 md:py-7">
            <div className="flex justify-between items-center relative">
              <div className="flex">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-foreground group flex items-center gap-3"
                >
                  <div className="flex flex-col gap-1.5">
                    <span className="w-5 h-[1px] bg-foreground transition-all group-hover:w-7"></span>
                    <span className="w-7 h-[1px] bg-foreground"></span>
                  </div>
                  <span className="text-[10px] tracking-[0.3em] font-normal hidden md:block group-hover:text-foreground/70 transition-colors uppercase">
                    {globalSettings.navbarMenuLabel || t('common.menu')}
                  </span>
                </button>
              </div>

              <div className="absolute left-1/2 -translate-x-1/2 scale-90 md:scale-100 transition-transform duration-500">
                {renderLogo()}
              </div>

              <div className="flex items-center space-x-5 md:space-x-8">
                {renderIcons()}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <header className="w-full relative z-50">
        {/* Top Banner */}
        {globalSettings.showTopBanner && (
          <div className="w-full bg-background py-2 text-center border-b border-foreground/10">
            <span className="text-[9px] md:text-[10px] tracking-[0.3em] font-normal uppercase text-foreground/60">
              {globalSettings.topBannerText || t('admin.bannerMessage')}
            </span>
          </div>
        )}

        <nav className={`w-full sticky top-0 transition-all duration-500 ${isScrolled ? 'bg-background/95 backdrop-blur-md shadow-sm py-0' : 'bg-background'}`}>
          {renderHeaderLayout()}

          {/* Sub Header */}
          {globalSettings.showSubHeader && (
            <div className={`w-full bg-background/50 backdrop-blur-sm border-b border-foreground/10 flex items-center justify-center transition-all duration-500 ${isScrolled ? 'h-0 opacity-0 overflow-hidden py-0' : 'h-10 py-2'}`}>
              <span className="text-[9px] md:text-[10px] font-normal tracking-[0.4em] uppercase text-foreground/50">
                {globalSettings.navbarSubHeaderText || t('admin.subHeaderText')}
              </span>
            </div>
          )}
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-[100] bg-background transition-all duration-700 ease-in-out ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className="flex flex-col h-full px-8 py-10">
          <div className="flex justify-between items-center mb-16">
            <span className="text-[10px] tracking-[0.3em] font-normal uppercase text-foreground/50">{globalSettings.navbarDiscoverText || t('common.discover')}</span>
            <button onClick={() => setIsMenuOpen(false)} className="text-foreground p-2">
              <FiX size={32} strokeWidth={1} />
            </button>
          </div>

          <div className="flex flex-col space-y-8">
            {navLinks.map((link, idx) => (
              <Link 
                key={idx} 
                href={link.path} 
                className="text-3xl md:text-5xl italic serif font-light tracking-wide text-foreground/60 hover:text-foreground hover:translate-x-[4px] transition-all duration-700" 
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="mt-auto pt-10 border-t border-foreground/10 flex flex-col space-y-4">
            <Link href={mounted && isAuthenticated ? "/profile" : "/login"} className="text-[10px] tracking-[0.3em] uppercase font-normal text-foreground/60 hover:text-foreground transition-colors" onClick={() => setIsMenuOpen(false)}>
              {globalSettings.navbarAccountLabel || t('common.account')}
            </Link>
            <Link href="/contact" className="text-[10px] tracking-[0.3em] uppercase font-normal text-foreground/60 hover:text-foreground transition-colors" onClick={() => setIsMenuOpen(false)}>
              {globalSettings.navbarContactLabel || t('common.contact')}
            </Link>
          </div>
        </div>
      </div>

      <SearchBar isOpen={searchOpen} onClose={handleSearchToggle} />
      <CartSidebar />
    </>
  );
}

