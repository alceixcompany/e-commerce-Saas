import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { fetchBootstrapConfig } from '@/lib/slices/contentSlice';
import { useCart } from '@/contexts/CartContext';
import { useTranslation } from '@/hooks/useTranslation';

export function useNavigation() {
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const isAdminPage = pathname?.startsWith('/admin');
    const [mounted, setMounted] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);

    const { toggleSidebar, getTotalItems } = useCart();
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    const { globalSettings, hasLoadedOnce } = useAppSelector((state) => state.content);
    const { t } = useTranslation();

    useEffect(() => {
        Promise.resolve().then(() => setMounted(true));
    }, []);

    useEffect(() => {
        if (isAdminPage || !mounted) return;
        if (!hasLoadedOnce) {
            dispatch(fetchBootstrapConfig());
        }
    }, [dispatch, hasLoadedOnce, isAdminPage, mounted]);

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

    const closeMenu = useCallback(() => setIsMenuOpen(false), []);
    const toggleMenu = useCallback(() => setIsMenuOpen(prev => !prev), []);

    const layout = globalSettings.navbarLayout || 'classic';
    const logoUrl = globalSettings.logo || "/image/alceix/logo.png";
    const siteName = globalSettings.siteName || "Alceix Group";
    const navLinks = globalSettings.navigationLinks || [];

    return {
        mounted,
        searchOpen,
        setSearchOpen,
        isMenuOpen,
        setIsMenuOpen,
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
