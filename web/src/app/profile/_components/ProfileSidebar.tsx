import { FiLogOut } from 'react-icons/fi';
import { PROFILE_NAV_ITEMS } from '../_config/profile.config';
import { useTranslation } from '@/hooks/useTranslation';

interface ProfileSidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    handleLogout: () => void;
}

export default function ProfileSidebar({
    activeTab,
    setActiveTab,
    handleLogout
}: ProfileSidebarProps) {
    const { t } = useTranslation();
    return (
        <aside className="lg:col-span-3">
            <div className="bg-background rounded-xl border border-foreground/10 shadow-sm p-4 space-y-1 sticky top-24 lg:top-[140px]">
                <p className="px-3 mb-4 text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{t('profile.sidebar.menu')}</p>
                {PROFILE_NAV_ITEMS.map((nav) => (
                    <button
                        key={nav.id}
                        onClick={() => setActiveTab(nav.id)}
                        className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${activeTab === nav.id
                            ? 'bg-foreground text-background shadow-lg shadow-foreground/5'
                            : 'text-foreground/50 hover:bg-foreground/5 hover:text-foreground'
                            }`}
                    >
                        <nav.icon className={`w-4 h-4 ${activeTab === nav.id ? 'text-background' : 'text-foreground/40 group-hover:text-foreground'}`} />
                        {t(nav.label as any)}
                    </button>
                ))}
                <div className="pt-4 mt-4 border-t border-foreground/10">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 hover:text-red-700 transition-all"
                    >
                        <FiLogOut className="w-4 h-4" /> {t('profile.sidebar.signOut')}
                    </button>
                </div>
            </div>
        </aside>
    );
}
