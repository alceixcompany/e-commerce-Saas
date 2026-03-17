'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAppSelector } from '@/lib/hooks';

export default function Footer() {
  const { globalSettings } = useAppSelector((state) => state.content);
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
  const siteName = globalSettings?.siteName || 'Ocean Gem';
  const logo = globalSettings?.logo || "/image/logo_gem.png";
  
  const footerColumns = globalSettings?.footerColumns || [
    {
      title: 'Client Care', links: [
        { label: 'Shipping & Returns', path: '/shipping' },
        { label: 'FAQ', path: '/faq' },
        { label: 'Size Guide', path: '/size-guide' }
      ]
    },
    {
      title: 'Legal', links: [
        { label: 'Privacy Policy', path: '/privacy' },
        { label: 'Terms of Service', path: '/terms' }
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
        {globalSettings?.newsletterTitle || 'Join the Inner Circle'}
      </h4>
      <p className="text-sm text-foreground/50 font-light mb-8 leading-relaxed">
        {globalSettings?.newsletterDescription || 'Unlock exclusive access to new collections and private events.'}
      </p>
      {subscribed ? (
        <div className="bg-background py-4 px-6 rounded-sm border border-primary/20 animate-in fade-in zoom-in-95 duration-700">
          <p className="text-primary text-[10px] font-normal uppercase tracking-[0.3em]">Thank you for joining.</p>
        </div>
      ) : (
        <form onSubmit={handleSubscribe} className="flex border-b border-foreground/30 pb-2">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground placeholder-foreground/40 focus:outline-none"
            required
          />
          <button type="submit" className="text-[10px] font-normal uppercase tracking-widest text-primary hover:text-foreground transition-colors">
            Subscribe
          </button>
        </form>
      )}
    </div>
  );

  const renderLogo = () => (
    <Link href="/" className="hover:opacity-70 transition-opacity block relative w-48 h-24">
      <img src={logo} alt={siteName} className="w-full h-full object-contain" />
    </Link>
  );

  const renderFooterBody = () => {
    switch (layout) {
      case 'magazine':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 py-16">
            <div className="lg:col-span-5 space-y-10">
              {renderLogo()}
              <p className="text-xl font-serif italic text-foreground/70 max-w-sm">
                Crafting timeless elegance and preserving the beauty of every moment through exquisite artistry.
              </p>
            </div>
            <div className="lg:col-span-1" />
            <div className="lg:col-span-6 grid grid-cols-2 md:grid-cols-3 gap-10">
              {footerColumns.map((col, idx) => (
                <div key={idx}>
                  <h5 className="font-bold text-[10px] uppercase tracking-widest mb-6 opacity-40">{col.title}</h5>
                  <ul className="space-y-4 text-xs font-light">
                    {col.links.map((link, lIdx) => (
                      <li key={lIdx}><Link href={link.path} className="hover:text-primary transition-colors">{link.label}</Link></li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="col-span-full mt-10">
                {renderNewsletter()}
              </div>
            </div>
          </div>
        );

      case 'minimal':
        return (
          <div className="py-12 flex flex-col items-center">
            {renderLogo()}
            <nav className="flex gap-x-12 gap-y-4 my-10 flex-wrap justify-center">
                {footerColumns.flatMap(c => c.links).slice(0, 6).map((link, idx) => (
                    <Link key={idx} href={link.path} className="text-[10px] tracking-widest font-bold uppercase opacity-60 hover:opacity-100">{link.label}</Link>
                ))}
            </nav>
            <div className="w-full max-w-xl">{renderNewsletter()}</div>
          </div>
        );

      case 'centered':
        return (
            <div className="flex flex-col items-center py-20 text-center space-y-16">
                <div>{renderLogo()}</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 w-full max-w-4xl">
                   {footerColumns.map((col, idx) => (
                      <div key={idx} className="space-y-6">
                        <h5 className="text-[10px] font-bold tracking-widest uppercase opacity-30">{col.title}</h5>
                        <ul className="space-y-3">
                           {col.links.map((link, lidx) => (
                              <li key={lidx}><Link href={link.path} className="text-sm font-light hover:text-primary transition-all">{link.label}</Link></li>
                           ))}
                        </ul>
                      </div>
                   ))}
                </div>
                <div className="w-full max-w-md">{renderNewsletter()}</div>
            </div>
        );

      case 'classic':
      default:
        return (
          <div className="flex flex-col items-center py-20 text-center">
            {renderLogo()}
            <nav className="flex flex-wrap justify-center gap-x-12 gap-y-4 my-12">
              {globalSettings?.navigationLinks?.map((link, idx) => (
                <Link
                  key={idx}
                  href={link.path}
                  className="text-[10px] font-normal uppercase tracking-[0.25em] text-foreground/50 hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              )) || (
                <>
                <Link href="/" className="text-[10px] font-normal uppercase tracking-[0.25em] text-foreground/50 hover:text-foreground transition-colors">Home</Link>
                <Link href="/collections" className="text-[10px] font-normal uppercase tracking-[0.25em] text-foreground/50 hover:text-foreground transition-colors">Collections</Link>
                </>
              )}
            </nav>
            <div className="w-px h-12 bg-foreground/20 mb-12" />
            {renderNewsletter()}
          </div>
        );
    }
  };

  return (
    <footer className="bg-background pt-10 border-t border-foreground/10 font-sans">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        {renderFooterBody()}

        {/* Global Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center py-10 border-t border-foreground/10 text-[9px] text-foreground/40 uppercase tracking-[0.3em] font-light mt-10">
          <p>&copy; {new Date().getFullYear()} {siteName}. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
             {socialLinks.map((s, idx) => (
                <a key={idx} href={s.url} target="_blank" rel="noreferrer" className="hover:text-primary transition-all">{s.platform}</a>
             ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

