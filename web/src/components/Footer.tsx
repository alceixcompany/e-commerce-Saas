'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      console.log('Subscribe:', email);
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-white pt-24 pb-12 border-t border-gray-100 font-sans">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">

        {/* Top Section: Logo & Nav */}
        <div className="flex flex-col items-center mb-20 text-center">
          <Link href="/" className="mb-10 hover:opacity-70 transition-opacity block relative w-48 h-24">
            <Image
              src="/image/logo_gem.png"
              alt="Ocean Gem"
              fill
              className="object-contain"
            />
          </Link>

          <nav className="flex flex-wrap justify-center gap-x-12 gap-y-4 mb-12">
            {[
              { name: 'Home', href: '/' },
              { name: 'Collections', href: '/collections' },
              { name: 'Our Story', href: '/about' },
              { name: 'Journal', href: '/journal' },
              { name: 'Contact', href: '/contact' },
            ].map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-[10px] font-normal uppercase tracking-[0.25em] text-gray-500 hover:text-black transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="w-px h-12 bg-gray-200 mb-12"></div>

          {/* Newsletter */}
          <div className="max-w-md w-full">
            <h4 className="font-serif text-2xl italic text-gray-900 mb-4">Join the Inner Circle</h4>
            <p className="text-sm text-gray-500 font-light mb-8 leading-relaxed">
              Unlock exclusive access to new collections and private events.
            </p>
            {subscribed ? (
              <div className="bg-gray-50 py-4 px-6 rounded-sm border border-[#C5A059]/10 animate-in fade-in zoom-in-95 duration-700">
                <p className="text-[#C5A059] text-[10px] font-normal uppercase tracking-[0.3em]">
                  Thank you for joining.
                </p>
                <p className="text-gray-400 text-[10px] mt-2 italic">
                  An invitation has been sent to your perspective.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex border-b border-gray-300 pb-2">
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-black placeholder-gray-400 focus:outline-none"
                  required
                />
                <button type="submit" className="text-[10px] font-normal uppercase tracking-widest text-[#C5A059] hover:text-black transition-colors">
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Middle Section: Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-gray-100 pt-16 pb-16 text-center md:text-left">
          {/* Column 1: Client Care */}
          <div className="flex flex-col items-center md:items-start">
            <h5 className="font-normal uppercase tracking-[0.3em] text-[10px] mb-6 text-gray-900">Client Care</h5>
            <ul className="space-y-3 text-xs text-gray-500 font-light tracking-wide">
              <li><Link href="/terms-of-service#shipping" className="hover:text-black transition-colors">Shipping & Returns</Link></li>
              <li><Link href="/terms-of-service#faq" className="hover:text-black transition-colors">FAQ</Link></li>
              <li><Link href="/terms-of-service#size-guide" className="hover:text-black transition-colors">Size Guide</Link></li>
              <li><Link href="/terms-of-service#product-care" className="hover:text-black transition-colors">Product Care</Link></li>
            </ul>
          </div>

          {/* Column 2: Social */}
          <div className="flex flex-col items-center">
            <h5 className="font-normal uppercase tracking-[0.3em] text-[10px] mb-6 text-gray-900">Social</h5>
            <ul className="flex gap-8">
              {[
                { name: 'Instagram', url: '#' },
                { name: 'Pinterest', url: '#' },
                { name: 'Facebook', url: '#' },
              ].map((social) => (
                <li key={social.name}>
                  <a href={social.url} className="text-xs text-gray-400 hover:text-[#C5A059] transition-colors uppercase tracking-widest">
                    {social.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div className="flex flex-col items-center md:items-end">
            <h5 className="font-normal uppercase tracking-[0.3em] text-[10px] mb-6 text-gray-900">Legal</h5>
            <ul className="space-y-3 text-xs text-gray-500 font-normal md:text-right">
              <li><Link href="/privacy-policy" className="hover:text-black transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-black transition-colors">Terms of Service</Link></li>
              <li><Link href="/accessibility" className="hover:text-black transition-colors">Accessibility</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-100 text-[9px] text-gray-400 uppercase tracking-[0.3em] font-light">
          <p>&copy; {new Date().getFullYear()} Ocean Gem. All rights reserved.</p>
          <div className="mt-4 md:mt-0">
            Designed with <span className="text-[#C5A059]">♥</span> for Luxury
          </div>
        </div>
      </div>
    </footer>
  );
}

