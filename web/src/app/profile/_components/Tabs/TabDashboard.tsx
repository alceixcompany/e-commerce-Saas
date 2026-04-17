import { FiUser, FiArrowRight } from 'react-icons/fi';
import Image from 'next/image';
import { useContentStore } from '@/lib/store/useContentStore';
import { getCurrencySymbol } from '@/utils/currency';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import type { Order, OrderItem } from '@/types/order';

import { ProfileTab } from '../../_hooks/useProfileData';

interface TabDashboardProps {
    profileName: string;
    orders: Order[];
    setActiveTab: (tab: ProfileTab) => void;
}

export default function TabDashboard({
    profileName,
    orders,
    setActiveTab
}: TabDashboardProps) {
    const { t } = useTranslation();
    const { globalSettings } = useContentStore();
    const currencySymbol = getCurrencySymbol(globalSettings?.currency);

    return (
        <div className="divide-y divide-foreground/10">
            <div className="p-4 md:p-10 lg:p-12 space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-foreground/5 rounded-full flex items-center justify-center text-foreground/40 border border-foreground/10">
                        <FiUser size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">{t('profile.tabs.dashboard.welcome', { name: profileName.split(' ')[0] })}</h2>
                        <p className="text-foreground/50">{t('profile.tabs.dashboard.ready')}</p>
                    </div>
                </div>
            </div>

            <div className="p-4 md:p-10 lg:p-12 space-y-8">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-foreground uppercase tracking-widest text-xs">{t('profile.tabs.dashboard.recentHistory')}</h3>
                    <button onClick={() => setActiveTab('orders')} className="text-xs font-bold text-foreground/40 hover:text-foreground">{t('profile.tabs.dashboard.viewAll')}</button>
                </div>

	                <div className="grid md:grid-cols-2 gap-6">
	                    {orders && orders.slice(0, 2).map((order: Order) => (
	                        <Link key={order._id} href={`/profile/orders/${order._id}`} className="p-6 border border-foreground/10 rounded-xl hover:border-foreground transition-all group">
                            <div className="flex justify-between items-start mb-6">
                                <p className="text-[10px] font-mono text-foreground/30">{t('profile.tabs.orders.reference')}: {order._id.substring(order._id.length - 8).toUpperCase()}</p>
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${order.isPaid ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                    {order.isPaid ? t('profile.tabs.dashboard.settled') : t('profile.tabs.dashboard.pending')}
                                </span>
                            </div>
	                            <h4 className="text-xl font-bold text-foreground mb-6">{currencySymbol}{order.totalPrice.toFixed(2)}</h4>
	                            <div className="flex items-center justify-between">
	                                <div className="flex -space-x-2">
 	                                    {order.orderItems.slice(0, 3).map((item: OrderItem, i: number) => (
 	                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-foreground/5 overflow-hidden shadow-sm relative">
 	                                            <Image src={item.image} alt="" fill className="object-contain" />
 	                                        </div>
 	                                    ))}
                                    {order.orderItems.length > 3 && (
                                        <div className="w-8 h-8 rounded-full border-2 border-background bg-foreground text-background flex items-center justify-center text-[8px] font-bold">
                                            +{order.orderItems.length - 3}
                                        </div>
                                    )}
                                </div>
                                <FiArrowRight className="text-foreground/20 group-hover:text-foreground transition-all -translate-x-2 group-hover:translate-x-0" size={18} />
                            </div>
                        </Link>
                    ))}
                    {(!orders || orders.length === 0) && (
                        <div className="col-span-2 py-10 text-center border border-dashed border-foreground/10 rounded-xl italic text-foreground/40 text-sm">
                            {t('profile.tabs.dashboard.emptyHistory')}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
