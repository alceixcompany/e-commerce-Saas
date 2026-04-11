'use client';

import { useNavigation } from './navigation/_hooks/useNavigation';
import NavLogo from './navigation/_components/NavLogo';
import NavIcons from './navigation/_components/NavIcons';
import DesktopNav from './navigation/_components/DesktopNav';
import SearchOverlay from './navigation/_components/SearchOverlay';
import MobileMenu from './navigation/_components/MobileMenu';
import CartSidebar from './CartSidebar';
import { FiMenu } from 'react-icons/fi';

export default function Navigation() {
    const {
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
        handleSearchToggle,
        handleSearchKeyDown,
        toggleSidebar,
        getTotalItems,
        closeMenu,
        toggleMenu
    } = useNavigation();

    if (isAdminPage) return null;

    const commonIconsProps = {
        mounted,
        isAuthenticated,
        totalItems: getTotalItems(),
        onSearchToggle: handleSearchToggle,
        onCartToggle: toggleSidebar
    };

    const commonSearchProps = {
        searchOpen,
        searchQuery,
        setSearchQuery,
        onClose: handleSearchToggle,
        onKeyDown: handleSearchKeyDown,
        searchInputRef
    };

    const commonMobileMenuProps = {
        isOpen: isMenuOpen,
        onClose: closeMenu,
        navLinks,
        isAuthenticated,
        mounted,
        discoverText: globalSettings.navbarDiscoverText || t('common.discover'),
        accountLabel: globalSettings.navbarAccountLabel || t('common.account'),
        contactLabel: globalSettings.navbarContactLabel || t('common.contact')
    };

    const renderHeaderLayout = () => {
        switch (layout) {
            case 'centered':
                return (
                    <div className="flex flex-col items-center gap-6 py-6 px-4 md:px-12">
                        <div><NavLogo logoUrl={logoUrl} siteName={siteName} sizeClass="w-32 h-16 md:w-48 md:h-24" /></div>
                        <div className={`w-full flex justify-between items-center border-t border-foreground/5 pt-6 relative px-4 transition-all duration-300 ${searchOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                            <div className="flex-1 shrink-0">
                                <button onClick={toggleMenu} className="text-foreground/60 hover:text-foreground flex items-center gap-2 group">
                                    <FiMenu size={18} />
                                    <span className="text-[9px] tracking-widest font-bold uppercase">{globalSettings.navbarMenuLabel || t('common.menu')}</span>
                                </button>
                            </div>
                            <div className="transition-opacity duration-300">
                                <DesktopNav navLinks={navLinks} />
                            </div>
                            <div className="flex-1 flex justify-end">
                                <NavIcons {...commonIconsProps} />
                            </div>
                        </div>
                        <div className={`absolute inset-0 pointer-events-none flex justify-center items-center transition-all duration-300 ${searchOpen ? 'opacity-100 z-[60]' : 'opacity-0'}`}>
                            <div className="pointer-events-auto w-full max-w-2xl">
                                <SearchOverlay {...commonSearchProps} />
                            </div>
                        </div>
                    </div>
                );

            case 'minimal':
                return (
                    <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-12 py-4">
                        <div className={`flex justify-between items-center relative transition-all duration-300 ${searchOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                            <div className="flex items-center gap-10">
                                <NavLogo logoUrl={logoUrl} siteName={siteName} sizeClass="w-28 h-14 md:w-36 md:h-18" />
                                <div>
                                    <DesktopNav navLinks={navLinks} className="hidden xl:flex items-center gap-6" />
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <NavIcons {...commonIconsProps} />
                                <button onClick={toggleMenu} className="p-2 border border-foreground/10 rounded-full hover:bg-foreground hover:text-background transition-all">
                                    <FiMenu size={18} />
                                </button>
                            </div>
                        </div>
                        <div className={`absolute inset-0 pointer-events-none flex justify-center items-center transition-all duration-300 ${searchOpen ? 'opacity-100 z-[60]' : 'opacity-0'}`}>
                            <div className="pointer-events-auto w-full max-w-2xl">
                                <SearchOverlay {...commonSearchProps} />
                            </div>
                        </div>
                    </div>
                );

            case 'horizontal':
                return (
                    <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-12 py-5">
                        <div className={`flex justify-between items-center relative transition-all duration-300 ${searchOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                            <div className="flex-1 flex items-center">
                                <NavLogo logoUrl={logoUrl} siteName={siteName} sizeClass="w-24 h-12 md:w-32 md:h-16" />
                            </div>
                            <div className="flex-1 hidden lg:flex justify-center">
                                <DesktopNav navLinks={navLinks} className="flex items-center gap-10" />
                            </div>
                            <div className="flex-1 flex justify-end">
                                <NavIcons {...commonIconsProps} />
                            </div>
                        </div>
                        <div className={`absolute inset-x-0 inset-y-0 pointer-events-none flex justify-center items-center transition-all duration-300 ${searchOpen ? 'opacity-100 z-[60]' : 'opacity-0'}`}>
                            <div className="pointer-events-auto w-full max-w-2xl">
                                <SearchOverlay {...commonSearchProps} />
                            </div>
                        </div>
                    </div>
                );

            case 'classic':
            default:
                return (
                    <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-12 py-4 md:py-7">
                        <div className={`flex justify-between items-center relative min-h-[40px] transition-all duration-300 ${searchOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                            <div>
                                <button onClick={toggleMenu} className="text-foreground group flex items-center gap-3">
                                    <div className="flex flex-col gap-1.5">
                                        <span className="w-5 h-[1px] bg-foreground transition-all group-hover:w-7"></span>
                                        <span className="w-7 h-[1px] bg-foreground"></span>
                                    </div>
                                    <span className="text-[10px] tracking-[0.3em] font-normal hidden md:block group-hover:text-foreground/70 transition-colors uppercase">
                                        {globalSettings.navbarMenuLabel || t('common.menu')}
                                    </span>
                                </button>
                            </div>
                            <div className="absolute left-1/2 -translate-x-1/2 scale-90 md:scale-100 transition-transform duration-500">
                                <NavLogo logoUrl={logoUrl} siteName={siteName} />
                            </div>
                            <NavIcons {...commonIconsProps} />
                        </div>
                        <div className={`absolute inset-0 pointer-events-none flex justify-center items-center transition-all duration-300 ${searchOpen ? 'opacity-100 z-[60]' : 'opacity-0'}`}>
                            <div className="pointer-events-auto w-full max-w-xl">
                                <SearchOverlay {...commonSearchProps} />
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <>
            <header className="w-full sticky top-0 z-[100] bg-background">
                {/* Top Banner */}
                {globalSettings.showTopBanner && (
                    <div className="w-full bg-background py-2 text-center border-b border-foreground/10">
                        <span className="text-[9px] md:text-[10px] tracking-[0.3em] font-normal uppercase text-foreground/60">
                            {globalSettings.topBannerText || t('admin.bannerMessage')}
                        </span>
                    </div>
                )}

                <nav className={`w-full sticky top-0 transition-all duration-500 ${isScrolled ? 'bg-background shadow-sm py-0' : 'bg-background'}`}>
                    {renderHeaderLayout()}

                    {/* Sub Header */}
                    {globalSettings.showSubHeader && (
                        <div className={`w-full bg-background border-b border-foreground/10 flex items-center justify-center transition-all duration-500 ${isScrolled ? 'h-0 opacity-0 overflow-hidden py-0' : 'h-10 py-2'}`}>
                            <span className="text-[9px] md:text-[10px] font-normal tracking-[0.4em] uppercase text-foreground/50">
                                {globalSettings.navbarSubHeaderText || t('admin.subHeaderText')}
                            </span>
                        </div>
                    )}
                </nav>
            </header>

            <MobileMenu {...commonMobileMenuProps} />
            <CartSidebar />
        </>
    );
}
