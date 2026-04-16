import { FiLogOut, FiShoppingBag, FiUser, FiX } from 'react-icons/fi';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppDispatch } from '@/lib/hooks';
import { logoutUser } from '@/lib/slices/authSlice';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onCartOpen: () => void;
    navLinks: Array<{ label: string; path: string }>;
    isAuthenticated: boolean;
    mounted: boolean;
    siteName?: string;
    accountLabel?: string;
    accountDisplayName?: string;
    contactLabel?: string;
    cartLabel?: string;
}

export default function MobileMenu({
    isOpen,
    onClose,
    onCartOpen,
    navLinks,
    isAuthenticated,
    mounted,
    siteName = "Store",
    accountLabel = "ACCOUNT",
    accountDisplayName,
    cartLabel = "CART"
}: MobileMenuProps) {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();

    return (
        <div className={`fixed inset-0 z-[140] transition-all duration-500 ${isOpen ? 'visible' : 'invisible pointer-events-none'}`}>
            <button
                type="button"
                aria-label="Close mobile menu"
                onClick={onClose}
                className={`absolute inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
            />

            <aside className={`relative h-full w-[88vw] max-w-sm bg-background border-r border-foreground/10 shadow-[0_20px_80px_rgba(0,0,0,0.18)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex h-full flex-col px-6 py-6">
                    <div className="mb-8 flex items-center justify-between border-b border-foreground/10 pb-5">
                        <div>
                            <span className="block text-[11px] leading-none tracking-[0.28em] font-bold uppercase text-foreground/45">
                                {siteName}
                            </span>
                        </div>
                        <button onClick={onClose} className="rounded-full border border-foreground/10 p-2 text-foreground transition-colors hover:bg-foreground hover:text-background">
                            <FiX size={22} strokeWidth={1.5} />
                        </button>
                    </div>

                    <div className="mb-6 flex items-center gap-3">
                        <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-foreground/35 shrink-0">
                            {t('common.quickAccess')}
                        </span>
                        <div className="h-px flex-1 bg-foreground/10" />
                    </div>

                    <div className="mb-6 grid grid-cols-2 gap-3">
                            <Link
                                href={mounted && isAuthenticated ? "/profile" : "/login"}
                                className="rounded-2xl border border-foreground/10 bg-background px-4 py-3 transition-all duration-300 hover:border-foreground/20 hover:bg-foreground/[0.02]"
                                onClick={onClose}
                            >
                                <span className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-foreground/10 text-foreground/70">
                                    <FiUser size={14} />
                                </span>
                                <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/75">
                                    {mounted && isAuthenticated ? accountDisplayName : accountLabel}
                                </span>
                                <span className="mt-1 block text-[11px] text-foreground/45">
                                    {mounted && isAuthenticated ? t('common.goToProfile') : t('common.login')}
                                </span>
                            </Link>

                            <button
                                type="button"
                                className="rounded-2xl border border-foreground/10 bg-background px-4 py-3 text-left transition-all duration-300 hover:border-foreground/20 hover:bg-foreground/[0.02]"
                                onClick={() => {
                                    onClose();
                                    onCartOpen();
                                }}
                            >
                                <span className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-foreground/10 text-foreground/70">
                                    <FiShoppingBag size={14} />
                                </span>
                                <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/75">
                                    {cartLabel}
                                </span>
                                <span className="mt-1 block text-[11px] text-foreground/45">
                                    {t('common.openCart')}
                                </span>
                            </button>
                    </div>

                    <div className="flex flex-col space-y-3">
                        {navLinks.map((link, idx) => (
                            <Link
                                key={idx}
                                href={link.path}
                                className="rounded-2xl border border-transparent px-4 py-3 text-lg italic serif font-light tracking-wide text-foreground/75 transition-all duration-300 hover:border-foreground/10 hover:bg-foreground/[0.03] hover:text-foreground"
                                onClick={onClose}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {mounted && isAuthenticated && (
                        <div className="mt-auto pt-8 border-t border-foreground/10">
                            <button
                                type="button"
                                onClick={async () => {
                                    onClose();
                                    await dispatch(logoutUser());
                                }}
                                className="w-full rounded-2xl border border-red-500/20 px-4 py-3 text-[11px] tracking-[0.24em] uppercase font-medium text-red-500 transition-colors hover:bg-red-500/10 hover:text-red-700"
                            >
                                <span className="inline-flex items-center gap-2">
                                    <FiLogOut size={14} />
                                    {t('profile.sidebar.signOut')}
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            </aside>
        </div>
    );
}
