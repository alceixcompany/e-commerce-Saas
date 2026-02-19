'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { logout } from '@/lib/slices/authSlice';
import { FiGrid, FiBox, FiTag, FiLayout, FiUsers, FiLogOut, FiHome, FiMail, FiShoppingBag, FiBook } from 'react-icons/fi';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'admin') {
      router.push('/');
      return;
    }
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar Skeleton */}
        <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
          <div className="h-16 border-b border-gray-200"></div>
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-gray-100 rounded animate-pulse"></div>
            ))}
          </div>
        </aside>
        {/* Content Skeleton */}
        <div className="flex-1 p-8">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-8"></div>
          <div className="h-64 bg-white rounded-xl border border-gray-200 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  const menuItems = [
    { href: '/admin', label: 'Dashboard', icon: FiGrid },
    { href: '/admin/orders', label: 'Orders', icon: FiShoppingBag },
    { href: '/admin/products', label: 'Products', icon: FiBox },
    { href: '/admin/categories', label: 'Categories', icon: FiTag },
    { href: '/admin/coupons', label: 'Coupons', icon: FiTag },
    { href: '/admin/layout-settings', label: 'Layout & Content', icon: FiLayout },
    { href: '/admin/users', label: 'Users', icon: FiUsers },
    { href: '/admin/messages', label: 'Messages', icon: FiMail },
    { href: '/admin/journal', label: 'Journal', icon: FiBook },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 font-sans">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 hidden md:flex flex-col z-20">
          {/* Logo Area */}
          <div className="h-16 flex items-center px-6 border-b border-gray-100">
            <Link href="/" className="text-xl font-serif font-medium tracking-wide">
              Ocean Gem
            </Link>
            <span className="ml-2 px-2 py-0.5 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded">Admin</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
            <div className="px-3 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Menu</div>
            {menuItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${isActive
                    ? 'bg-black text-white shadow-lg shadow-black/5'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-900'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                {user?.name?.[0] || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  dispatch(logout());
                  router.push('/login');
                }}
                className="text-gray-400 hover:text-red-600 transition-colors"
                title="Sign Out"
              >
                <FiLogOut size={16} />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-[#FAFAFA] relative">
          <div className="sticky top-0 z-10 bg-[#FAFAFA]/80 backdrop-blur-md px-8 py-4 border-b border-gray-200/50 md:hidden flex justify-between items-center">
            <span className="font-serif text-lg">Ocean Gem Admin</span>
            {/* Mobile menu toggle could go here */}
          </div>

          <div className="max-w-7xl mx-auto p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

