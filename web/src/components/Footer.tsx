'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useContentStore } from '@/lib/store/useContentStore';
import { useTranslation } from '@/hooks/useTranslation';
import { sanitizePlainTextWithLinks } from '@/lib/utils/safeHtml';
import PaymentTrustLogos from '@/components/PaymentTrustLogos';
import { REQUIRED_FOOTER_COLUMNS } from '@/config/footer.config';
import type { GlobalSettings } from '@/types/content';

interface FooterLinkItem {
  label: string;
  path: string;
}

const normalizeFooterHref = (path: string) => {
  const trimmedPath = path.trim();
  if (!trimmedPath) return '/';
  if (/^(https?:\/\/|mailto:|tel:|#)/i.test(trimmedPath)) return trimmedPath;
  return trimmedPath.startsWith('/') ? trimmedPath : `/${trimmedPath}`;
};

function FooterLink({ link, className, children }: { link: FooterLinkItem; className: string; children?: React.ReactNode }) {
  const href = normalizeFooterHref(link.path);
  const content = children || link.label;

  if (/^https?:\/\//i.test(href)) {
    return <a href={href} target="_blank" rel="noreferrer" className={className}>{content}</a>;
  }

  if (/^(mailto:|tel:|#)/i.test(href)) {
    return <a href={href} className={className}>{content}</a>;
  }

  return <Link href={href} className={className}>{content}</Link>;
}

export default function Footer({ initialSettings }: { initialSettings?: GlobalSettings }) {
  const { globalSettings: storedGlobalSettings } = useContentStore();
  const globalSettings = storedGlobalSettings || initialSettings || null;
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

  const configuredFooterColumns = (globalSettings?.footerColumns || [])
    .map((column) => ({
      ...column,
      title: column.title.trim(),
      links: column.links.filter((link) => link.label.trim() && link.path.trim()),
    }))
    .filter((column) => column.title || column.links.length > 0);
  const footerColumns = configuredFooterColumns.length > 0 ? configuredFooterColumns : REQUIRED_FOOTER_COLUMNS;

  const configuredSocialLinks = (globalSettings?.socialLinks || [])
    .filter((link) => link.platform.trim() && link.url.trim());
  const socialLinks = configuredSocialLinks;
  const showContact = globalSettings?.footerShowContact
    ?? Boolean(globalSettings?.contactEmail || globalSettings?.contactPhone || globalSettings?.contactAddress);
  const showNewsletter = globalSettings?.footerShowNewsletter
    ?? Boolean(globalSettings?.newsletterTitle || globalSettings?.newsletterDescription);
  const showSocialLinks = globalSettings?.footerShowSocialLinks ?? socialLinks.length > 0;

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
    if (!showContact || (!globalSettings?.contactEmail && !globalSettings?.contactPhone && !globalSettings?.contactAddress)) return null;
    return (
      <div className="space-y-4">
        {showTitle && <h5 className="font-bold text-[9px] uppercase tracking-[0.3em] opacity-30 mb-6">{t('footer.contact')}</h5>}
        <div className="text-[11px] font-light space-y-3 text-foreground/50 tracking-wide">
          {globalSettings.contactAddress && <p className="leading-relaxed">{globalSettings.contactAddress}</p>}
          {globalSettings.contactPhone && <a href={`tel:${globalSettings.contactPhone.replace(/\s+/g, '')}`} className="block hover:text-primary transition-colors">{globalSettings.contactPhone}</a>}
          {globalSettings.contactEmail && <a href={`mailto:${globalSettings.contactEmail}`} className="block hover:text-primary transition-colors break-all">{globalSettings.contactEmail}</a>}
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
                        <FooterLink link={link} className="text-[11px] font-light tracking-widest text-foreground/50 hover:text-primary transition-all duration-500 flex items-center group">
                          <span className="w-0 group-hover:w-4 h-px bg-primary mr-0 group-hover:mr-2 transition-all duration-500 opacity-0 group-hover:opacity-100"></span>
                          {link.label}
                        </FooterLink>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="lg:col-span-3 space-y-8 lg:border-l lg:border-foreground/5 lg:pl-12">
              {showNewsletter && <div className="space-y-6">
                <h5 className="font-bold text-[9px] uppercase tracking-[0.3em] opacity-30">{t('footer.newsletterTitle')}</h5>
                {renderNewsletter()}
              </div>}
              {showSocialLinks && <div className="pt-10 space-y-6">
                <h5 className="font-bold text-[9px] uppercase tracking-[0.3em] opacity-30">{t('common.discover')}</h5>
                <div className="flex gap-4">
                  {socialLinks.map((s, idx) => (
                    <a key={idx} href={s.url} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full border border-foreground/10 flex items-center justify-center text-[10px] text-foreground/40 hover:border-primary hover:text-primary transition-all duration-500">{s.platform.charAt(0)}</a>
                  ))}
                </div>
              </div>}
            </div>
          </div>
        );

      case 'minimal':
        return (
          <div className="py-20 flex flex-col items-center gap-16 border-b border-foreground/5">
            <div className="w-full flex flex-col md:flex-row justify-between items-center gap-12">
              {renderLogo("w-32 h-16")}
              <nav className="flex gap-x-12 gap-y-4 flex-wrap justify-center">
                {footerColumns.flatMap(c => c.links).map((link, idx) => (
                  <FooterLink key={`${link.path}-${idx}`} link={link} className="text-[9px] tracking-[0.3em] font-medium uppercase text-foreground/40 hover:text-foreground transition-all duration-500" />
                ))}
              </nav>
            </div>

            <div className="w-full grid md:grid-cols-12 gap-12 items-end">
              {showContact && <div className="md:col-span-4 border-t border-foreground/5 pt-12">
                <h5 className="text-[9px] font-bold tracking-[0.3em] uppercase opacity-20 mb-6">{t('footer.contact')}</h5>
                <div className="flex flex-col gap-y-2 text-[10px] text-foreground/40">
                  {globalSettings?.contactAddress && <p>{globalSettings.contactAddress}</p>}
                  {globalSettings?.contactEmail && <a href={`mailto:${globalSettings.contactEmail}`} className="hover:text-primary break-all">{globalSettings.contactEmail}</a>}
                  {globalSettings?.contactPhone && <a href={`tel:${globalSettings.contactPhone.replace(/\s+/g, '')}`} className="hover:text-primary">{globalSettings.contactPhone}</a>}
                </div>
              </div>}
              {showNewsletter && <div className={`${showContact ? 'md:col-span-8' : 'md:col-span-12'} flex flex-col items-center md:items-end text-center md:text-right`}>
                <div className="max-w-md w-full">{renderNewsletter()}</div>
              </div>}
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
                      <li key={lidx}><FooterLink link={link} className="text-[11px] font-light tracking-widest text-foreground/50 hover:text-primary transition-all duration-700" /></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-20 w-full max-w-5xl items-start pt-12 border-t border-foreground/5">
              <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-8">
                {renderContactInfo()}
              </div>
              {showNewsletter && <div className="flex flex-col items-center md:items-end text-center md:text-right space-y-8">
                <h5 className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-20">{t('footer.newsletterTitle')}</h5>
                <div className="w-full max-w-sm">{renderNewsletter()}</div>
              </div>}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-16 gap-y-12 w-full max-w-5xl">
              {footerColumns.map((col, idx) => (
                <div key={`${col.title}-${idx}`} className="space-y-6">
                  {col.title && <h5 className="text-[9px] font-bold uppercase tracking-[0.3em] text-foreground/30">{col.title}</h5>}
                  <ul className="space-y-4">
                    {col.links.map((link, linkIndex) => (
                      <li key={`${link.path}-${linkIndex}`}>
                        <FooterLink link={link} className="text-[10px] font-medium uppercase tracking-[0.22em] text-foreground/45 hover:text-primary transition-colors" />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {(showContact || showNewsletter) && (
              <div className="flex flex-col md:flex-row gap-24 items-center md:items-start justify-center w-full max-w-5xl pt-16 border-t border-foreground/5">
                {showContact && <div className="flex-1 w-full max-w-xs">{renderContactInfo()}</div>}
                {showContact && showNewsletter && <div className="w-px h-24 bg-foreground/5 hidden md:block" />}
                {showNewsletter && <div className="flex-1 w-full max-w-md">{renderNewsletter()}</div>}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <footer id="global-site-footer" className="bg-background border-t border-foreground/5 font-sans overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        {renderFooterBody()}

        <div className="border-b border-foreground/5 py-8">
          <PaymentTrustLogos compact />
        </div>

        {/* Global Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center py-12 text-[10px] text-foreground/30 uppercase tracking-[0.2em] font-light">
          <p
            dangerouslySetInnerHTML={{ __html: sanitizedCopyrightText }}
            className="[&_a]:text-blue-500 [&_a]:underline [&_a:hover]:text-primary [&_a]:transition-colors"
          />
          {showSocialLinks && <div className="flex flex-wrap justify-center gap-6 md:gap-10 mt-6 md:mt-0">
            {socialLinks.map((s, idx) => (
              <a key={idx} href={s.url} target="_blank" rel="noreferrer" className="hover:text-primary tracking-[0.2em] transition-all duration-500">{s.platform}</a>
            ))}
          </div>}
        </div>
      </div>
    </footer>
  );
}
