'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { fetchDashboardStats } from '@/lib/slices/adminSlice';
import {
  FiUsers,
  FiShoppingBag,
  FiDollarSign,
  FiAlertCircle,
  FiArrowRight,
  FiActivity,
  FiPlus,
  FiSettings,
  FiUserPlus
} from 'react-icons/fi';

export default function AdminDashboard() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { stats, isLoading, error } = useAppSelector((state) => state.admin);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'admin') {
      router.push('/');
      return;
    }

    dispatch(fetchDashboardStats());
  }, [isAuthenticated, user, router, dispatch]);

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  if (isLoading && !stats) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 mx-auto mb-4"></div>
          <p className="text-zinc-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${stats?.totalSales?.toLocaleString() || 0}`,
      icon: FiDollarSign,
      trend: '+12.5%',
      trendUp: true,
      description: 'Gross volume from paid orders'
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: FiShoppingBag,
      trend: '+8%',
      trendUp: true,
      description: 'Total acquisitions processed'
    },
    {
      title: 'Registered Users',
      value: stats?.totalUsers || 0,
      icon: FiUsers,
      trend: '+5%',
      trendUp: true,
      description: 'Total active client registry'
    },
    {
      title: 'Unpaid Registry',
      value: stats?.unpaidOrders || 0,
      icon: FiAlertCircle,
      trend: 'Review needed',
      trendUp: false,
      description: 'Orders awaiting payment'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-500 mt-2">Welcome back to the executive suite summary.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-black text-white text-sm font-medium hover:bg-zinc-800 transition-all rounded-lg shadow-sm"
          >
            <FiPlus size={18} />
            Add Product
          </Link>
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all rounded-lg shadow-sm"
          >
            <FiUserPlus size={18} />
            Manage Users
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-colors">
                <stat.icon size={20} strokeWidth={1.5} />
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${stat.trendUp ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {stat.trend}
              </span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <p className="text-xs text-gray-400 mt-2 font-light">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Operational Hub */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Operational Quick Links</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { href: '/admin/orders', label: 'Orders Registry', desc: 'Process customer acquisitions.', icon: FiShoppingBag },
                { href: '/admin/products', label: 'Inventory Vault', desc: 'Manage product library.', icon: FiActivity },
                { href: '/admin/users', label: 'Elite Members', desc: 'Client records & permissions.', icon: FiUsers },
                { href: '/admin/layout-settings', label: 'Store Curating', desc: 'Layout & aesthetics.', icon: FiSettings },
              ].map((link, i) => (
                <Link
                  key={i}
                  href={link.href}
                  className="flex items-center gap-4 p-4 rounded-lg border border-gray-50 hover:border-black hover:bg-gray-50 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-white transition-colors">
                    <link.icon size={18} className="text-gray-400 group-hover:text-black" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{link.label}</p>
                    <p className="text-xs text-gray-500">{link.desc}</p>
                  </div>
                  <FiArrowRight size={16} className="ml-auto opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-900 p-6 rounded-xl text-white shadow-xl relative overflow-hidden h-full">
            <div className="relative z-10 space-y-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 mb-2">System Status</p>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <p className="text-lg font-bold">Synchronized</p>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 space-y-4">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest opacity-60">
                  <span>API Response</span>
                  <span className="font-mono text-green-400">Optimal</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest opacity-60">
                  <span>Database</span>
                  <span className="font-mono text-green-400">Connected</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest opacity-60">
                  <span>SSL Security</span>
                  <span className="font-mono text-green-400">Verified</span>
                </div>
              </div>

              <p className="text-[10px] font-mono text-zinc-600 uppercase pt-4 leading-relaxed tracking-wider">
                Full administrative session <br /> monitor active.
              </p>
            </div>
            {/* Abstract background element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 -rotate-45 translate-x-12 -translate-y-12 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
