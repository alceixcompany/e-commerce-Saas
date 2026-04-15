import { getStatCardsConfig } from '../_config/profile.config';
import { useTranslation } from '@/hooks/useTranslation';

interface ProfileStatsProps {
    orderCount: number;
    wishlistCount: number;
    addressCount: number;
}

export default function ProfileStats({
    orderCount,
    wishlistCount,
    addressCount
}: ProfileStatsProps) {
    const { t } = useTranslation();
    const tUnsafe = (key: string) => t(key as never);
    const statCards = getStatCardsConfig(orderCount, wishlistCount, addressCount);

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {statCards.map((stat, index) => (
                <div key={index} className="bg-background p-4 md:p-6 rounded-xl border border-foreground/10 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center text-foreground group-hover:bg-foreground group-hover:text-background transition-colors">
                            <stat.icon size={20} strokeWidth={1.5} />
                        </div>
                        <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">{t('profile.stats.active')}</span>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-foreground mb-1">{stat.value === 'profile.stats.verified' ? tUnsafe(stat.value) : stat.value}</h3>
                        <p className="text-sm font-medium text-foreground/50">{tUnsafe(stat.title)}</p>
                        <p className="text-xs text-foreground/40 mt-2 font-light">{tUnsafe(stat.description)}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
