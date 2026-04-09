import { FiSearch, FiUser, FiShoppingBag } from 'react-icons/fi';
import Link from 'next/link';

interface NavIconsProps {
    mounted: boolean;
    isAuthenticated: boolean;
    totalItems: number;
    onSearchToggle: () => void;
    onCartToggle: () => void;
}

export default function NavIcons({
    mounted,
    isAuthenticated,
    totalItems,
    onSearchToggle,
    onCartToggle
}: NavIconsProps) {
    return (
        <div className="flex items-center space-x-5 md:space-x-8">
            {/* Search Icon */}
            <button
                onClick={onSearchToggle}
                className="text-foreground hover:text-primary transition-all hover:scale-105 active:scale-95 translate-y-0.5"
            >
                <FiSearch size={22} strokeWidth={1} />
            </button>

            {/* Account */}
            {mounted && (
                <Link
                    href={isAuthenticated ? "/profile" : "/login"}
                    className="text-foreground hover:text-primary transition-all hover:scale-105 active:scale-95"
                >
                    <FiUser size={20} strokeWidth={1} />
                </Link>
            )}

            {/* Cart Icon */}
            <button
                onClick={onCartToggle}
                className="relative text-foreground hover:text-primary transition-all hover:scale-105 active:scale-95 translate-y-0.5"
            >
                <FiShoppingBag size={22} strokeWidth={1} />
                {mounted && totalItems > 0 && (
                    <span className="absolute -top-1 -right-2 bg-primary text-background text-[8px] w-4 h-4 flex items-center justify-center rounded-full font-normal">
                        {totalItems}
                    </span>
                )}
            </button>
        </div>
    );
}
