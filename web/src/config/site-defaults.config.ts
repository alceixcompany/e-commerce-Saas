export const DEFAULT_NAVIGATION_LINKS = [
    { label: 'Our Story', path: '/about' },
    { label: 'Collections', path: '/collections' },
    { label: 'Journal', path: '/journal' },
    { label: 'Contact Us', path: '/contact' }
];

export const DEFAULT_SOCIAL_LINKS = [
    { platform: 'Instagram', url: 'https://instagram.com/alceix' },
    { platform: 'Facebook', url: 'https://facebook.com/alceix' }
];

export const DEFAULT_FOOTER_COLUMNS = [
    {
        title: 'Client Care',
        links: [
            { label: 'Shipping & Returns', path: '/shipping' },
            { label: 'FAQ', path: '/faq' },
            { label: 'Size Guide', path: '/size-guide' }
        ]
    },
    {
        title: 'Legal',
        links: [
            { label: 'Privacy Policy', path: '/privacy' },
            { label: 'Terms of Service', path: '/terms' }
        ]
    }
];

export const DEFAULT_GLOBAL_SETTINGS = {
    siteName: 'Alceix Luxury',
    tagline: 'Premium Jewelry & Lifestyle',
    logo: '/image/alceix/logo.png',
    favicon: '/image/alceix/icon.png',
    footerText: '© 2026 Alceix. All rights reserved.',
    contactEmail: 'contact@alceix.com',
    contactPhone: '+1 (555) 000-0000',
    contactAddress: 'Luxury Ave, NYC',
    metaTitle: 'Alceix - Premium E-Commerce',
    metaDescription: 'Discover the world of Alceix.',
    theme: {
        primaryColor: '#C5A059',
        secondaryColor: '#000000',
        backgroundColor: '#ffffff',
        textColor: '#18181b',
        headingFont: 'Playfair Display',
        bodyFont: 'Inter',
        cardStyle: 'classic' as const,
    },
    navbarLayout: 'classic' as const,
    footerLayout: 'classic' as const,
    topBannerText: 'ALCEIX - PREMIUM SHOPPING EXPERIENCE',
    navbarMenuLabel: 'Menu',
    navbarSubHeaderText: 'Exquisite Treasures By Alceix',
    showTopBanner: true,
    showSubHeader: true,
    navbarAccountLabel: 'Account',
    navbarContactLabel: 'Contact Us',
    navbarDiscoverText: 'Discover',
    currency: 'USD',
    activeLanguage: 'tr' as const,
    navigationLinks: DEFAULT_NAVIGATION_LINKS,
    socialLinks: DEFAULT_SOCIAL_LINKS,
    footerColumns: DEFAULT_FOOTER_COLUMNS,
    newsletterTitle: 'Join the Alceix Circle',
    newsletterDescription: 'Unlock exclusive access to Alceix collections and private events.',
};
