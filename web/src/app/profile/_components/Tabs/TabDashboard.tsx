import Link from 'next/link';
import { FiUser, FiArrowRight } from 'react-icons/fi';

interface TabDashboardProps {
    profileName: string;
    orders: any[];
    setActiveTab: (tab: string) => void;
}

export default function TabDashboard({
    profileName,
    orders,
    setActiveTab
}: TabDashboardProps) {
    return (
        <div className="divide-y divide-foreground/10">
            <div className="p-4 md:p-10 lg:p-12 space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-foreground/5 rounded-full flex items-center justify-center text-foreground/40 border border-foreground/10">
                        <FiUser size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">Welcome, {profileName.split(' ')[0]}</h2>
                        <p className="text-foreground/50">Your secure boutique profile is ready.</p>
                    </div>
                </div>
            </div>

            <div className="p-4 md:p-10 lg:p-12 space-y-8">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-foreground uppercase tracking-widest text-xs">Recent History</h3>
                    <button onClick={() => setActiveTab('orders')} className="text-xs font-bold text-foreground/40 hover:text-foreground">View All</button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {orders && orders.slice(0, 2).map((order: any) => (
                        <Link key={order._id} href={`/profile/orders/${order._id}`} className="p-6 border border-foreground/10 rounded-xl hover:border-foreground transition-all group">
                            <div className="flex justify-between items-start mb-6">
                                <p className="text-[10px] font-mono text-foreground/30">REF: {order._id.substring(order._id.length - 8).toUpperCase()}</p>
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${order.isPaid ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                    {order.isPaid ? 'Settled' : 'Pending'}
                                </span>
                            </div>
                            <h4 className="text-xl font-bold text-foreground mb-6">${order.totalPrice.toFixed(2)}</h4>
                            <div className="flex items-center justify-between">
                                <div className="flex -space-x-2">
                                    {order.orderItems.slice(0, 3).map((item: any, i: number) => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-foreground/5 overflow-hidden shadow-sm">
                                            <img src={item.image} alt="" className="w-full h-full object-contain" />
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
                            No recent acquisitions found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
