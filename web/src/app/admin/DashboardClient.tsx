'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAdminStore } from '@/lib/store/useAdminStore';
import { useContentStore } from '@/lib/store/useContentStore';
import { useTranslation } from '@/hooks/useTranslation';
import type { DashboardStats } from '@/types/admin';
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
import { getCurrencySymbol } from '@/utils/currency';

interface DashboardClientProps {
  initialStats?: DashboardStats | null;
}

export default function DashboardClient({ initialStats }: DashboardClientProps) {
  const { t } = useTranslation();
  const { stats: storeStats, isLoading: dashboardLoading, fetchDashboardStats } = useAdminStore();
  const { globalSettings } = useContentStore();
  const currencySymbol = getCurrencySymbol(globalSettings?.currency);

  const stats = storeStats || initialStats;
  const isLoading = dashboardLoading && !stats;

  useEffect(() => {
    // Optionally refresh stats on client mount if they weren't passed or to ensure freshness
    if (!initialStats) {
      fetchDashboardStats();
    }
  }, [fetchDashboardStats, initialStats]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 mx-auto mb-4"></div>
          <p className="text-zinc-600 font-medium">{t('admin.common.loading')}</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: t('admin.dashboard.stats.revenue'),
      value: `${currencySymbol}${stats?.totalSales?.toLocaleString() || 0}`,
      icon: FiDollarSign,
      trend: t('admin.dashboard.stats.trendUp', { value: '12.5%' }),
      trendUp: true,
      description: t('admin.dashboard.stats.revenueDesc')
    },
    {
      title: t('admin.dashboard.stats.orders'),
      value: stats?.totalOrders || 0,
      icon: FiShoppingBag,
      trend: t('admin.dashboard.stats.trendUp', { value: '8%' }),
      trendUp: true,
      description: t('admin.dashboard.stats.ordersDesc')
    },
    {
      title: t('admin.dashboard.stats.users'),
      value: stats?.totalUsers || 0,
      icon: FiUsers,
      trend: t('admin.dashboard.stats.trendUp', { value: '5%' }),
      trendUp: true,
      description: t('admin.dashboard.stats.usersDesc')
    },
    {
      title: t('admin.dashboard.stats.unpaid'),
      value: stats?.unpaidOrders || 0,
      icon: FiAlertCircle,
      trend: t('admin.dashboard.stats.reviewNeeded'),
      trendUp: false,
      description: t('admin.dashboard.stats.unpaidDesc')
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">{t('admin.dashboard.title')}</h1>
          <p className="text-foreground/50 mt-2">{t('admin.dashboard.welcome')}</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-foreground text-background text-sm font-medium hover:bg-foreground/80 transition-all rounded-lg shadow-sm"
          >
            <FiPlus size={18} />
            {t('admin.dashboard.quickActions.addProduct')}
          </Link>
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-background border border-foreground/10 text-foreground/70 text-sm font-medium hover:bg-foreground/5 transition-all rounded-lg shadow-sm"
          >
            <FiUserPlus size={18} />
            {t('admin.dashboard.quickActions.manageUsers')}
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-background p-6 rounded-xl border border-foreground/10 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center text-foreground group-hover:bg-foreground group-hover:text-background transition-colors">
                <stat.icon size={20} strokeWidth={1.5} />
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${stat.trendUp ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                {stat.trend}
              </span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-1">{stat.value}</h3>
              <p className="text-sm font-medium text-foreground/50">{stat.title}</p>
              <p className="text-xs text-foreground/40 mt-2 font-light">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Operational Hub */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-background p-6 rounded-xl border border-foreground/10 shadow-sm h-full">
            <h2 className="text-lg font-bold text-foreground mb-4">{t('admin.dashboard.operationalHub.title')}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { 
                  href: '/admin/orders', 
                  label: t('admin.dashboard.operationalHub.orders.label'), 
                  desc: t('admin.dashboard.operationalHub.orders.desc'), 
                  icon: FiShoppingBag 
                },
                { 
                  href: '/admin/products', 
                  label: t('admin.dashboard.operationalHub.inventory.label'), 
                  desc: t('admin.dashboard.operationalHub.inventory.desc'), 
                  icon: FiActivity 
                },
                { 
                  href: '/admin/users', 
                  label: t('admin.dashboard.operationalHub.members.label'), 
                  desc: t('admin.dashboard.operationalHub.members.desc'), 
                  icon: FiUsers 
                },
                { 
                  href: '/admin/layout-settings', 
                  label: t('admin.dashboard.operationalHub.curating.label'), 
                  desc: t('admin.dashboard.operationalHub.curating.desc'), 
                  icon: FiSettings 
                },
              ].map((link, i) => (
                <Link
                  key={i}
                  href={link.href}
                  className="flex items-center gap-4 p-4 rounded-lg border border-foreground/5 hover:border-foreground hover:bg-foreground/5 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-foreground/5 flex items-center justify-center group-hover:bg-background transition-colors">
                    <link.icon size={18} className="text-foreground/40 group-hover:text-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{link.label}</p>
                    <p className="text-xs text-foreground/50">{link.desc}</p>
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
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 mb-2">{t('admin.dashboard.systemStatus.title')}</p>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <p className="text-lg font-bold">{t('admin.dashboard.systemStatus.synchronized')}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 space-y-4">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest opacity-60">
                  <span>{t('admin.dashboard.systemStatus.apiResponse')}</span>
                  <span className="font-mono text-green-400">{t('admin.dashboard.systemStatus.optimal')}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest opacity-60">
                  <span>{t('admin.dashboard.systemStatus.database')}</span>
                  <span className="font-mono text-green-400">{t('admin.dashboard.systemStatus.connected')}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest opacity-60">
                  <span>{t('admin.dashboard.systemStatus.ssl')}</span>
                  <span className="font-mono text-green-400">{t('admin.dashboard.systemStatus.verified')}</span>
                </div>
              </div>

              <p className="text-[10px] font-mono text-zinc-600 uppercase pt-4 leading-relaxed tracking-wider">
                {t('admin.dashboard.systemStatus.monitorActive')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
