'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useContentStore } from '@/lib/store/useContentStore';
import { useTranslation } from '@/hooks/useTranslation';
import { sanitizePlainTextWithLinks } from '@/lib/utils/safeHtml';

export default function Footer() {
  const { globalSettings } = useContentStore();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const layout = globalSettings?.footerLayout || 'classic';
  const siteName = globalSettings?.siteName || 'Alceix Group';
  const logo = globalSettings?.logo || "/image/alceix/logo.png";

  const footerColumns = globalSettings?.footerColumns || [
    {
      title: t('footer.clientCare'), links: [
        { label: t('footer.shipping'), path: '/shipping' },
        { label: t('footer.faq'), path: '/faq' },
        { label: t('footer.sizeGuide'), path: '/size-guide' }
      ]
    },
    {
      title: t('footer.legal'), links: [
        { label: t('footer.privacy'), path: '/privacy' },
        { label: t('footer.terms'), path: '/terms' }
      ]
    }
  ];

  const socialLinks = globalSettings?.socialLinks || [
    { platform: 'Instagram', url: 'https://instagram.com' },
    { platform: 'Facebook', url: 'https://facebook.com' }
  ];

  const renderNewsletter = () => (
    <div className="max-w-md w-full">
      <h4 className="font-serif text-2xl italic text-foreground mb-4">
        {globalSettings?.newsletterTitle || t('footer.newsletterTitle')}
      </h4>
      <p className="text-sm text-foreground/50 font-light mb-8 leading-relaxed">
        {globalSettings?.newsletterDescription || t('footer.newsletterDesc')}
      </p>
      {subscribed ? (
        <div className="bg-background py-4 px-6 rounded-sm border border-primary/20 animate-in fade-in zoom-in-95 duration-700">
          <p className="text-primary text-[10px] font-normal uppercase tracking-[0.3em]">{t('footer.thanks')}</p>
        </div>
      ) : (
        <form onSubmit={handleSubscribe} className="flex border-b border-foreground/30 pb-2">
          <input
            type="email"
            placeholder={t('footer.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground placeholder-foreground/40 focus:outline-none"
            required
          />
          <button type="submit" className="text-[10px] font-normal uppercase tracking-widest text-primary hover:text-foreground transition-colors">
            {t('footer.subscribe')}
          </button>
        </form>
      )}
    </div>
  );

  const renderLogo = (sizeClass = "w-48 h-24") => (
    <Link href="/" className={`hover:opacity-70 transition-opacity block relative ${sizeClass}`}>
      <Image src={logo} alt={siteName} fill className="object-contain" />
    </Link>
  );

  const renderContactInfo = (showTitle = true) => {
    if (!globalSettings?.contactEmail && !globalSettings?.contactPhone && !globalSettings?.contactAddress) return null;
    return (
      <div className="space-y-4">
        {showTitle && <h5 className="font-bold text-[9px] uppercase tracking-[0.3em] opacity-30 mb-6">{t('footer.contact')}</h5>}
        <div className="text-[11px] font-light space-y-3 text-foreground/50 tracking-wide">
          {globalSettings.contactAddress && <p className="leading-relaxed">{globalSettings.contactAddress}</p>}
          {globalSettings.contactPhone && <p className="hover:text-primary transition-colors cursor-pointer">{globalSettings.contactPhone}</p>}
          {globalSettings.contactEmail && <p className="hover:text-primary transition-colors cursor-pointer">{globalSettings.contactEmail}</p>}
        </div>
      </div>
    );
  };

  const currentYear = new Date().getFullYear().toString();
  const copyrightText = (globalSettings?.footerText || `© {year} ${siteName}. ${t('footer.rights')}`)
    .replace('{year}', currentYear);
  const sanitizedCopyrightText = useMemo(
    () => sanitizePlainTextWithLinks(copyrightText),
    [copyrightText]
  );

  const renderFooterBody = () => {
    switch (layout) {
      case 'magazine':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-16 py-20 border-b border-foreground/5">
            <div className="lg:col-span-4 space-y-12">
              <div className="flex flex-col gap-6">
                {renderLogo()}
                <p className="text-lg font-serif italic text-foreground/60 leading-relaxed max-w-sm">
                  {globalSettings?.tagline || t('footer.magazineTagline')}
                </p>
              </div>
              <div className="pt-8 border-t border-foreground/5">
                {renderContactInfo()}
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 md:grid-cols-2 gap-x-8 gap-y-12">
              {footerColumns.map((col, idx) => (
                <div key={idx} className="space-y-8">
                  <h5 className="font-bold text-[9px] uppercase tracking-[0.3em] opacity-30">{col.title}</h5>
                  <ul className="space-y-5">
                    {col.links.map((link, lIdx) => (
                      <li key={lIdx}>
                        <Link href={link.path} className="text-[11px] font-light tracking-widest text-foreground/50 hover:text-primary transition-all duration-500 flex items-center group">
                          <span className="w-0 group-hover:w-4 h-px bg-primary mr-0 group-hover:mr-2 transition-all duration-500 opacity-0 group-hover:opacity-100"></span>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="lg:col-span-3 space-y-8 lg:border-l lg:border-foreground/5 lg:pl-12">
              <div className="space-y-6">
                <h5 className="font-bold text-[9px] uppercase tracking-[0.3em] opacity-30">{t('footer.newsletterTitle')}</h5>
                {renderNewsletter()}
              </div>
              <div className="pt-10 space-y-6">
                <h5 className="font-bold text-[9px] uppercase tracking-[0.3em] opacity-30">{t('common.discover')}</h5>
                <div className="flex gap-4">
                  {socialLinks.map((s, idx) => (
                    <a key={idx} href={s.url} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full border border-foreground/10 flex items-center justify-center text-[10px] text-foreground/40 hover:border-primary hover:text-primary transition-all duration-500">{s.platform.charAt(0)}</a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'minimal':
        return (
          <div className="py-20 flex flex-col items-center gap-16 border-b border-foreground/5">
            <div className="w-full flex flex-col md:flex-row justify-between items-center gap-12">
              {renderLogo("w-32 h-16")}
              <nav className="flex gap-x-12 gap-y-4 flex-wrap justify-center">
                {footerColumns.flatMap(c => c.links).slice(0, 6).map((link, idx) => (
                  <Link key={idx} href={link.path} className="text-[9px] tracking-[0.3em] font-medium uppercase text-foreground/40 hover:text-foreground transition-all duration-500">{link.label}</Link>
                ))}
              </nav>
            </div>

            <div className="w-full grid md:grid-cols-12 gap-12 items-end">
              <div className="md:col-span-4 border-t border-foreground/5 pt-12">
                <h5 className="text-[9px] font-bold tracking-[0.3em] uppercase opacity-20 mb-6">{t('footer.contact')}</h5>
                <div className="flex flex-wrap gap-x-8 gap-y-2">
                  {globalSettings?.contactEmail && <p className="text-[10px] text-foreground/40">{globalSettings.contactEmail}</p>}
                  {globalSettings?.contactPhone && <p className="text-[10px] text-foreground/40">{globalSettings.contactPhone}</p>}
                </div>
              </div>
              <div className="md:col-span-8 flex flex-col items-center md:items-end text-center md:text-right">
                <div className="max-w-md w-full">{renderNewsletter()}</div>
              </div>
            </div>
          </div>
        );

      case 'centered':
        return (
          <div className="flex flex-col items-center py-28 text-center gap-24 border-b border-foreground/5">
            <div className="space-y-12">
              {renderLogo("w-48 h-24")}
              <div className="w-12 h-px bg-primary mx-auto opacity-30" />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-20 gap-y-16 w-full max-w-6xl">
              {footerColumns.map((col, idx) => (
                <div key={idx} className="space-y-10 group">
                  <h5 className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-20 group-hover:opacity-40 transition-opacity">{col.title}</h5>
                  <ul className="space-y-4">
                    {col.links.map((link, lidx) => (
                      <li key={lidx}><Link href={link.path} className="text-[11px] font-light tracking-widest text-foreground/50 hover:text-primary transition-all duration-700">{link.label}</Link></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-20 w-full max-w-5xl items-start pt-12 border-t border-foreground/5">
              <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-8">
                {renderContactInfo()}
              </div>
              <div className="flex flex-col items-center md:items-end text-center md:text-right space-y-8">
                <h5 className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-20">{t('footer.newsletterTitle')}</h5>
                <div className="w-full max-w-sm">{renderNewsletter()}</div>
              </div>
            </div>
          </div>
        );

      case 'classic':
      default:
        return (
          <div className="flex flex-col items-center py-28 text-center gap-16 border-b border-foreground/5">
            <div className="space-y-8">
              {renderLogo("w-56 h-28")}
              <p className="text-[10px] tracking-[0.4em] uppercase text-foreground/40 font-light">{t('footer.established')} MMXXVI</p>
            </div>

            <nav className="flex flex-wrap justify-center gap-x-16 gap-y-6">
              {(globalSettings?.navigationLinks && globalSettings.navigationLinks.length > 0) ? globalSettings.navigationLinks.map((link, idx) => (
                <Link
                  key={idx}
                  href={link.path}
                  className="text-[10px] font-medium uppercase tracking-[0.3em] text-foreground/40 hover:text-primary transition-all duration-500 relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-2 left-0 w-0 h-px bg-primary transition-all duration-500 group-hover:w-full"></span>
                </Link>
              )) : (
                <>
                  <Link href="/" className="text-[10px] font-medium uppercase tracking-[0.3em] text-foreground/40 hover:text-primary transition-all">{t('footer.home')}</Link>
                  <Link href="/collections" className="text-[10px] font-medium uppercase tracking-[0.3em] text-foreground/40 hover:text-primary transition-all">{t('footer.collections')}</Link>
                </>
              )}
            </nav>

            <div className="flex flex-col md:flex-row gap-24 items-center md:items-start justify-center w-full max-w-5xl pt-16 border-t border-foreground/5">
              <div className="flex-1 w-full max-w-xs">{renderContactInfo()}</div>
              <div className="w-px h-24 bg-foreground/5 hidden md:block" />
              <div className="flex-1 w-full max-w-md">{renderNewsletter()}</div>
            </div>
          </div>
        );
    }
  };

  return (
    <footer className="bg-background border-t border-foreground/5 font-sans overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        {renderFooterBody()}

        {/* Global Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center py-12 text-[10px] text-foreground/30 uppercase tracking-[0.2em] font-light">
          <p
            dangerouslySetInnerHTML={{ __html: sanitizedCopyrightText }}
            className="[&_a]:text-blue-500 [&_a]:underline [&_a:hover]:text-primary [&_a]:transition-colors"
          />
          <div className="flex gap-10 mt-6 md:mt-0">
            {socialLinks.map((s, idx) => (
              <a key={idx} href={s.url} target="_blank" rel="noreferrer" className="hover:text-primary tracking-[0.2em] transition-all duration-500">{s.platform}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
