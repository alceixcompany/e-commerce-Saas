import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useContentStore } from '@/lib/store/useContentStore';
import { useCart } from '@/contexts/CartContext';
import { useTranslation } from '@/hooks/useTranslation';

export function useNavigation() {
    const router = useRouter();
    const pathname = usePathname();
    const isAdminPage = pathname?.startsWith('/admin');
    const [mounted, setMounted] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [menuState, setMenuState] = useState<{ isOpen: boolean; pathname: string | null }>({
        isOpen: false,
        pathname: pathname ?? null,
    });
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);

    const { toggleSidebar, getTotalItems } = useCart();
    
    // Zustand Stores
    const { isAuthenticated, user } = useAuthStore();
    const { globalSettings } = useContentStore();
    
    // Note: profile is still in Redux for now, we'll migrate it soon
    // For now, we'll try to use user from auth store which should be kept in sync
    const { t } = useTranslation();

    useEffect(() => {
        Promise.resolve().then(() => setMounted(true));
    }, []);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleOpenSearch = () => setSearchOpen(true);
        window.addEventListener('open-search', handleOpenSearch);
        return () => window.removeEventListener('open-search', handleOpenSearch);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        document.body.style.overflow = menuState.isOpen && menuState.pathname === (pathname ?? null) ? 'hidden' : '';

        return () => {
            document.body.style.overflow = '';
        };
    }, [menuState, mounted, pathname]);

    const handleSearchToggle = useCallback(() => {
        if (!searchOpen) {
            setSearchOpen(true);
        } else {
            setSearchOpen(false);
            setSearchQuery('');
        }
    }, [searchOpen]);

    const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && searchQuery.trim().length >= 2) {
            setSearchOpen(false);
            setSearchQuery('');
            router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
        }
        if (e.key === 'Escape') {
            setSearchOpen(false);
            setSearchQuery('');
        }
    }, [searchQuery, router]);

    const isMenuOpen = menuState.isOpen && menuState.pathname === (pathname ?? null) || false;
    const closeMenu = useCallback(() => {
        setMenuState((prev) => ({ ...prev, isOpen: false }));
    }, []);
    const toggleMenu = useCallback(() => {
        setMenuState((prev) => {
            const currentPath = pathname ?? null;
            if (prev.pathname !== currentPath) {
                return { isOpen: true, pathname: currentPath };
            }

            return { isOpen: !prev.isOpen, pathname: currentPath };
        });
    }, [pathname]);

    // Defaults if settings haven't loaded
    const layout = globalSettings?.navbarLayout || 'classic';
    const logoUrl = globalSettings?.logo || "/image/alceix/logo.png";
    const siteName = globalSettings?.siteName || "Alceix Group";
    const navLinks = globalSettings?.navigationLinks || [];
    const accountDisplayName = user?.name || globalSettings?.navbarAccountLabel || t('common.account');

    return {
        mounted,
        searchOpen,
        setSearchOpen,
        isMenuOpen,
        isScrolled,
        searchQuery,
        setSearchQuery,
        searchInputRef,
        isAuthenticated,
        globalSettings,
        t,
        layout,
        logoUrl,
        siteName,
        navLinks,
        accountDisplayName,
        isAdminPage,
        // Methods
        handleSearchToggle,
        handleSearchKeyDown,
        toggleSidebar,
        getTotalItems,
        closeMenu,
        toggleMenu,
        router,
        pathname
    };
}
