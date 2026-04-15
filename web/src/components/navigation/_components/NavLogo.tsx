import Link from 'next/link';
import Image from 'next/image';

interface NavLogoProps {
    logoUrl: string;
    siteName: string;
    sizeClass?: string;
}

export default function NavLogo({ 
    logoUrl, 
    siteName, 
    sizeClass = "w-40 h-20 md:w-56 md:h-28 lg:w-64 lg:h-32" 
}: NavLogoProps) {
    return (
        <Link href="/" className="flex flex-col items-center group">
            <div className={`relative ${sizeClass} transition-transform duration-500 hover:scale-105`}>
                <Image
                    src={logoUrl}
                    alt={siteName}
                    fill
                    className="object-contain"
                />
            </div>
        </Link>
    );
}
