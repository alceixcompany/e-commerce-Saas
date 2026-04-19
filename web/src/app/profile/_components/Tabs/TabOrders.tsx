import { FiPackage } from 'react-icons/fi';
import { useContentStore } from '@/lib/store/useContentStore';
import { getCurrencySymbol } from '@/utils/currency';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import type { Order } from '@/types/order';

interface TabOrdersProps {
    orders: Order[];
    orderMetadata: { pages: number } | null;
    orderPage: number;
    ordersLoading: boolean;
    loadMoreOrders: () => void;
}

export default function TabOrders({
    orders,
    orderMetadata,
    orderPage,
    ordersLoading,
    loadMoreOrders
}: TabOrdersProps) {
    const { t } = useTranslation();
    const { globalSettings } = useContentStore();

    return (
        <div className="p-4 md:p-8">
            <h2 className="text-lg md:text-xl font-bold text-foreground mb-6 md:mb-8 px-2">{t('profile.tabs.orders.title')}</h2>
            <div>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto custom-scrollbar pb-2">
                    <table className="w-full min-w-[700px]">
                        <thead className="bg-foreground/5 border-b border-foreground/10">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-foreground/40 uppercase tracking-widest whitespace-nowrap">{t('profile.tabs.orders.reference')}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-foreground/40 uppercase tracking-widest whitespace-nowrap">{t('profile.tabs.orders.date')}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-foreground/40 uppercase tracking-widest whitespace-nowrap">{t('profile.tabs.orders.status')}</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-foreground/40 uppercase tracking-widest text-right whitespace-nowrap">{t('profile.tabs.orders.total')}</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-foreground/40 uppercase tracking-widest whitespace-nowrap">{t('profile.tabs.orders.actions')}</th>
	                    </tr>
	                        </thead>
	                        <tbody className="divide-y divide-foreground/10">
	                            {orders && orders.length > 0 ? orders.map((order) => (
	                                <tr key={order._id} className="hover:bg-foreground/5 transition-colors group">
                                    <td className="px-6 py-6 font-mono text-[10px] text-foreground/40 whitespace-nowrap">
                                        {order._id.substring(order._id.length - 12).toUpperCase()}
                                    </td>
                                    <td className="px-6 py-6 text-sm text-foreground/60 whitespace-nowrap">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-6 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${order.isDelivered ? 'bg-blue-500/10 text-blue-500' : 'bg-foreground/10 text-foreground/50'}`}>
                                            {order.isDelivered ? t('profile.tabs.orders.fulfilled') : t('profile.tabs.orders.processing')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6 text-sm font-bold text-foreground text-right whitespace-nowrap">
                                        {getCurrencySymbol(order.currency || globalSettings?.currency)}{order.totalPrice.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-6 text-right whitespace-nowrap">
                                        <Link href={`/profile/orders/${order._id}`} className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-4 py-2 border border-foreground/10 hover:border-foreground transition-all">
                                            {t('profile.tabs.orders.view')}
                                        </Link>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center italic text-foreground/40 text-sm">
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center text-foreground/30">
                                                <FiPackage size={20} />
                                            </div>
                                            <p>{t('profile.tabs.orders.empty')}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

	                {/* Mobile Card View */}
	                <div className="md:hidden space-y-4">
	                    {orders && orders.length > 0 ? orders.map((order) => (
	                        <div key={order._id} className="p-5 border border-foreground/10 rounded-xl bg-background shadow-sm hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">{t('profile.tabs.orders.reference')}</p>
                                    <p className="font-mono text-xs text-foreground">#{order._id.substring(order._id.length - 8).toUpperCase()}</p>
                                </div>
                                <div className="text-right space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">{t('profile.tabs.orders.date')}</p>
                                    <p className="text-xs font-medium text-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between py-4 border-t border-b border-foreground/5 mb-4">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1">{t('profile.tabs.orders.status')}</p>
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${order.isDelivered ? 'bg-blue-500/10 text-blue-500' : 'bg-foreground/10 text-foreground/50'}`}>
                                        {order.isDelivered ? t('profile.tabs.orders.fulfilled') : t('profile.tabs.orders.processing')}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1">{t('profile.tabs.orders.total')}</p>
                                    <p className="text-lg font-bold text-foreground">{getCurrencySymbol(order.currency || globalSettings?.currency)}{order.totalPrice.toFixed(2)}</p>
                                </div>
                            </div>

                            <Link href={`/profile/orders/${order._id}`} className="flex items-center justify-center w-full py-3 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-foreground/80 transition-all shadow-lg">
                                {t('profile.tabs.orders.viewDetails')}
                            </Link>
                        </div>
                    )) : (
                        <div className="py-12 text-center italic text-foreground/40 text-sm border border-dashed border-foreground/20 rounded-xl bg-foreground/5">
                            <div className="flex flex-col items-center justify-center gap-3">
                                <FiPackage size={20} className="text-foreground/30" />
                                <p>{t('profile.tabs.orders.empty')}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Load More Button for Orders */}
                {orderPage < (orderMetadata?.pages || 0) && (
                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={loadMoreOrders}
                            disabled={ordersLoading}
                            className="px-8 py-3 border border-foreground text-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-foreground hover:text-background transition-all rounded-lg disabled:opacity-50"
                        >
                            {ordersLoading ? t('profile.tabs.orders.loading') : t('profile.tabs.orders.loadMore')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
