import { FiX } from 'react-icons/fi';
import Link from 'next/link';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    navLinks: Array<{ label: string; path: string }>;
    isAuthenticated: boolean;
    mounted: boolean;
    discoverText?: string;
    accountLabel?: string;
    contactLabel?: string;
}

export default function MobileMenu({
    isOpen,
    onClose,
    navLinks,
    isAuthenticated,
    mounted,
    discoverText = "DISCOVER",
    accountLabel = "ACCOUNT",
    contactLabel = "CONTACT"
}: MobileMenuProps) {
    return (
        <div className={`fixed inset-0 z-[100] bg-background transition-all duration-700 ease-in-out ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
            <div className="flex flex-col h-full px-8 py-10">
                <div className="flex justify-between items-center mb-16">
                    <span className="text-[10px] tracking-[0.3em] font-normal uppercase text-foreground/50">
                        {discoverText}
                    </span>
                    <button onClick={onClose} className="text-foreground p-2">
                        <FiX size={32} strokeWidth={1} />
                    </button>
                </div>

                <div className="flex flex-col space-y-8">
                    {navLinks.map((link, idx) => (
                        <Link
                            key={idx}
                            href={link.path}
                            className="text-3xl md:text-5xl italic serif font-light tracking-wide text-foreground/60 hover:text-foreground hover:translate-x-[4px] transition-all duration-700"
                            onClick={onClose}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                <div className="mt-auto pt-10 border-t border-foreground/10 flex flex-col space-y-4">
                    <Link
                        href={mounted && isAuthenticated ? "/profile" : "/login"}
                        className="text-[10px] tracking-[0.3em] uppercase font-normal text-foreground/60 hover:text-foreground transition-colors"
                        onClick={onClose}
                    >
                        {accountLabel}
                    </Link>
                    <Link
                        href="/contact"
                        className="text-[10px] tracking-[0.3em] uppercase font-normal text-foreground/60 hover:text-foreground transition-colors"
                        onClick={onClose}
                    >
                        {contactLabel}
                    </Link>
                </div>
            </div>
        </div>
    );
}
