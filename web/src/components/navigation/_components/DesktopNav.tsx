import Link from 'next/link';

interface DesktopNavProps {
    navLinks: Array<{ label: string; path: string }>;
    className?: string;
}

export default function DesktopNav({ 
    navLinks, 
    className = "hidden lg:flex items-center gap-8" 
}: DesktopNavProps) {
    if (!navLinks || navLinks.length === 0) return null;

    return (
        <div className={className}>
            {navLinks.map((link, idx) => (
                <Link
                    key={idx}
                    href={link.path}
                    className="text-[10px] tracking-[0.3em] font-normal uppercase text-foreground/60 hover:text-foreground transition-colors whitespace-nowrap"
                >
                    {link.label}
                </Link>
            ))}
        </div>
    );
}
