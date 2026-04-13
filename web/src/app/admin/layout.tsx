
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { logoutUser } from '@/lib/slices/authSlice';
import { clearProfile } from '@/lib/slices/profileSlice';
import { fetchGlobalSettings } from '@/lib/slices/contentSlice'; // Import fetch action
import {
  FiGrid, FiBox, FiTag, FiLayout, FiUsers, FiLogOut,
  FiShoppingBag, FiBook, FiMail, FiMenu, FiX,
  FiSearch, FiBell, FiChevronLeft, FiChevronRight,
  FiSettings, FiHelpCircle, FiCreditCard
} from 'react-icons/fi';
import { useTranslation } from '@/hooks/useTranslation';

import { motion, AnimatePresence } from 'framer-motion';

// Menu Configuration

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const pathname = usePathname();

  // Menu Configuration
  const MENU_GROUPS = [
    {
      title: t('admin.menu.overview'),
      items: [
        { href: '/admin', label: t('admin.menu.dashboard'), icon: FiGrid }
      ]
    },
    {
      title: t('admin.menu.ecommerce'),
      items: [
        { href: '/admin/products', label: t('admin.menu.products'), icon: FiBox },
        { href: '/admin/orders', label: t('admin.menu.orders'), icon: FiShoppingBag },
        { href: '/admin/categories', label: t('admin.menu.categories'), icon: FiTag },
        { href: '/admin/coupons', label: t('admin.menu.coupons'), icon: FiTag },
      ]
    },
    {
      title: t('admin.menu.content'),
      items: [
        { href: '/admin/journal', label: t('admin.menu.journal'), icon: FiBook },
        { href: '/admin/layout-settings', label: t('admin.menu.layout'), icon: FiLayout },
        { href: '/admin/messages', label: t('admin.menu.messages'), icon: FiMail },
      ]
    },
    {
      title: t('admin.menu.management'),
      items: [
        { href: '/admin/users', label: t('admin.menu.users'), icon: FiUsers },
        { href: '/admin/settings/payment', label: t('admin.menu.payment'), icon: FiCreditCard },
      ]
    }
  ];

  const { isAuthenticated, user, isVerifying } = useAppSelector((state) => state.auth);
  const { globalSettings, hasLoadedOnce } = useAppSelector((state) => state.content); // Get global settings

  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Desktop toggle
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile toggle

  useEffect(() => {
    setMounted(true);
    if (!hasLoadedOnce) {
      dispatch(fetchGlobalSettings());
    }
  }, [dispatch, hasLoadedOnce]);

  useEffect(() => {
    if (!mounted || isVerifying) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'admin') {
      router.push('/');
      return;
    }
  }, [mounted, isAuthenticated, user, router, isVerifying]);

  // Handle screen resize to auto-close/open sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-collapse sidebar in Layout Settings
  useEffect(() => {
    if (pathname === '/admin/layout-settings') {
      setIsSidebarOpen(false);
    }
  }, [pathname]);

  if (!mounted || isVerifying) {
     return (
        <div className="flex h-screen items-center justify-center bg-background">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto"></div>
        </div>
     );
  }
  
  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  // If we are authenticated but user role is not yet confirmed (edge case) or still loading initial settings
  if (!user || user.role !== 'admin') {
     return (
        <div className="flex h-screen items-center justify-center bg-background">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto"></div>
        </div>
     );
  }

  const handleLogout = async () => {
    await dispatch(logoutUser());
    dispatch(clearProfile());
    router.replace('/login');
  };

  return (
    <div className="min-h-screen bg-background flex text-foreground font-sans overflow-hidden">

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-foreground/50 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <motion.aside
        initial={false}
        animate={{
          width: isSidebarOpen ? 280 : 80,
          translateX: isMobileMenuOpen ? 0 : (window.innerWidth < 1024 ? -280 : 0)
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed lg:relative inset-y-0 left-0 bg-background border-r border-foreground/10 z-50 flex flex-col h-screen shadow-xl lg:shadow-none
          ${!isMobileMenuOpen && 'hidden lg:flex'}
        `}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center px-6 border-b border-foreground/5 justify-between relative group">
          <Link href="/" className={`flex items-center gap-3 overflow-hidden ${!isSidebarOpen && 'justify-center w-full px-0'}`}>
            {globalSettings?.logo ? (
              <div className="w-8 h-8 rounded-lg relative overflow-hidden shrink-0">
                <img src={globalSettings.logo} alt={t('admin.menu.logo')} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center font-serif font-bold shrink-0">
                {globalSettings?.siteName?.charAt(0) || 'A'}
              </div>
            )}

            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-serif font-medium text-lg whitespace-nowrap"
              >
                {globalSettings?.siteName || 'Alceix Group'}
              </motion.div>
            )}
          </Link>

          {/* Collapse Toggle Button (Desktop Only) - Moved Here */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute -right-3 top-[44px] lg:flex hidden items-center justify-center w-6 h-6 bg-background border border-foreground/10 rounded-full shadow-md text-foreground/50 hover:text-foreground hover:scale-110 transition-all z-50 cursor-pointer"
            title={isSidebarOpen ? t('admin.menu.collapse') : t('admin.menu.expand')}
          >
            {isSidebarOpen ? <FiChevronLeft size={14} /> : <FiChevronRight size={14} />}
          </button>

          {/* Close button for mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-foreground/5"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3 custom-scrollbar">
          {MENU_GROUPS.map((group, groupIndex) => (
            <div key={group.title} className={`mb-6 ${!isSidebarOpen && 'text-center'}`}>
              {isSidebarOpen && (
                <div className="px-3 mb-2 text-[11px] font-bold text-foreground/40 uppercase tracking-wider">
                  {group.title}
                </div>
              )}
              {/* Separator for collapsed state */}
              {!isSidebarOpen && groupIndex > 0 && <div className="h-px bg-foreground/10 w-10 mx-auto my-4" />}

              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={!isSidebarOpen ? item.label : ''}
                      className={`group flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-200 font-medium text-sm
                        ${isActive
                          ? 'bg-foreground text-background shadow-lg shadow-foreground/10'
                          : 'text-foreground/50 hover:bg-background hover:shadow-sm hover:text-foreground'
                        }
                        ${!isSidebarOpen ? 'justify-center px-2' : ''}
                      `}
                    >
                      <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-background' : 'text-foreground/40 group-hover:text-foreground/60'}`} />

                      {isSidebarOpen && (
                        <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                      )}

                      {/* Floating tooltip for collapsed state */}
                      {!isSidebarOpen && (
                        <div className="absolute left-16 bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                          {item.label}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-t border-foreground/10 bg-foreground/5">

          <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'justify-center' : ''}`}>
            <div className="w-9 h-9 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-medium shrink-0 shadow-md">
              {user?.name?.[0] || 'A'}
            </div>

            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
                <p className="text-xs text-foreground/50 truncate">{t('admin.menu.management')}</p>
              </div>
            )}

            {isSidebarOpen && (
              <button
                onClick={handleLogout}
                className="p-1.5 text-foreground/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                title={t('admin.menu.logout')}
              >
                <FiLogOut size={18} />
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">

        {/* Top Header */}
        <header className="h-16 bg-background border-b border-foreground/10 flex items-center justify-between px-4 lg:px-8 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.innerWidth < 1024 ? setIsMobileMenuOpen(true) : setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-foreground/5 rounded-lg text-foreground/60 transition-colors"
            >
              <FiMenu size={20} />
            </button>

            {/* Search Bar - Visual Only for now */}
            <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-foreground/5 rounded-lg w-64 focus-within:ring-2 focus-within:ring-foreground/10 transition-all">
              <FiSearch className="text-foreground/40" />
              <input
                type="text"
                placeholder={t('admin.menu.search')}
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-foreground/40"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 relative hover:bg-foreground/5 rounded-lg text-foreground/60 transition-colors">
              <FiBell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
            </button>
            <button className="p-2 hover:bg-foreground/5 rounded-lg text-foreground/60 transition-colors">
              <FiHelpCircle size={20} />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Breadcrumb / Title Area could go here */}
            {children}
          </div>
        </main>
      </div>

    </div>
  );
}
