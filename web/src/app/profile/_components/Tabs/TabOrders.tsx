import Link from 'next/link';
import { FiPackage } from 'react-icons/fi';

interface TabOrdersProps {
    orders: any[];
    orderMetadata: any;
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
    return (
        <div className="p-4 md:p-8">
            <h2 className="text-lg md:text-xl font-bold text-foreground mb-6 md:mb-8 px-2">Acquisition Registry</h2>
            <div>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto custom-scrollbar pb-2">
                    <table className="w-full min-w-[700px]">
                        <thead className="bg-foreground/5 border-b border-foreground/10">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-foreground/40 uppercase tracking-widest whitespace-nowrap">Reference</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-foreground/40 uppercase tracking-widest whitespace-nowrap">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-foreground/40 uppercase tracking-widest whitespace-nowrap">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-foreground/40 uppercase tracking-widest text-right whitespace-nowrap">Total</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-foreground/40 uppercase tracking-widest whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-foreground/10">
                            {orders && orders.length > 0 ? orders.map((order: any) => (
                                <tr key={order._id} className="hover:bg-foreground/5 transition-colors group">
                                    <td className="px-6 py-6 font-mono text-[10px] text-foreground/40 whitespace-nowrap">
                                        {order._id.substring(order._id.length - 12).toUpperCase()}
                                    </td>
                                    <td className="px-6 py-6 text-sm text-foreground/60 whitespace-nowrap">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-6 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${order.isDelivered ? 'bg-blue-500/10 text-blue-500' : 'bg-foreground/10 text-foreground/50'}`}>
                                            {order.isDelivered ? 'Fulfilled' : 'Processing'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6 text-sm font-bold text-foreground text-right whitespace-nowrap">
                                        ${order.totalPrice.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-6 text-right whitespace-nowrap">
                                        <Link href={`/profile/orders/${order._id}`} className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-4 py-2 border border-foreground/10 hover:border-foreground transition-all">
                                            View
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
                                            <p>Empty inventory records.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                    {orders && orders.length > 0 ? orders.map((order: any) => (
                        <div key={order._id} className="p-5 border border-foreground/10 rounded-xl bg-background shadow-sm hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Reference</p>
                                    <p className="font-mono text-xs text-foreground">#{order._id.substring(order._id.length - 8).toUpperCase()}</p>
                                </div>
                                <div className="text-right space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Date</p>
                                    <p className="text-xs font-medium text-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between py-4 border-t border-b border-foreground/5 mb-4">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1">Status</p>
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${order.isDelivered ? 'bg-blue-500/10 text-blue-500' : 'bg-foreground/10 text-foreground/50'}`}>
                                        {order.isDelivered ? 'Fulfilled' : 'Processing'}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1">Total</p>
                                    <p className="text-lg font-bold text-foreground">${order.totalPrice.toFixed(2)}</p>
                                </div>
                            </div>

                            <Link href={`/profile/orders/${order._id}`} className="flex items-center justify-center w-full py-3 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-foreground/80 transition-all shadow-lg">
                                View Acquisition Details
                            </Link>
                        </div>
                    )) : (
                        <div className="py-12 text-center italic text-foreground/40 text-sm border border-dashed border-foreground/20 rounded-xl bg-foreground/5">
                            <div className="flex flex-col items-center justify-center gap-3">
                                <FiPackage size={20} className="text-foreground/30" />
                                <p>Empty inventory records.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Load More Button for Orders */}
                {orderPage < orderMetadata?.pages && (
                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={loadMoreOrders}
                            disabled={ordersLoading}
                            className="px-8 py-3 border border-foreground text-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-foreground hover:text-background transition-all rounded-lg disabled:opacity-50"
                        >
                            {ordersLoading ? 'Loading...' : 'Load More Acquisitions'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
