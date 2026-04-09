import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX } from 'react-icons/fi';
import SearchBar from '../../SearchBar';

interface SearchOverlayProps {
    searchOpen: boolean;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onClose: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    searchInputRef: React.RefObject<HTMLInputElement | null>;
}

export default function SearchOverlay({
    searchOpen,
    searchQuery,
    setSearchQuery,
    onClose,
    onKeyDown,
    searchInputRef
}: SearchOverlayProps) {
    return (
        <AnimatePresence>
            {searchOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="absolute inset-0 z-50 flex items-center justify-center bg-background px-4"
                >
                    <div
                        className="w-full max-w-2xl relative flex items-center gap-4 bg-foreground/5 rounded-full px-6 py-1.5 md:py-2.5 border border-foreground/5 shadow-inner"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <FiSearch className="text-foreground/40 w-4 h-4 flex-shrink-0" />
                        <input
                            ref={searchInputRef}
                            autoFocus
                            type="text"
                            placeholder="SEARCH PIECES, COLLECTIONS..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={onKeyDown}
                            className="w-full bg-transparent border-none outline-none text-xs md:text-sm tracking-[0.2em] font-light placeholder:text-foreground/20 text-foreground"
                        />
                        <button
                            onClick={onClose}
                            className="p-1 px-2 hover:bg-foreground/10 rounded-full transition-colors group"
                        >
                            <FiX size={16} className="text-foreground/40 group-hover:text-foreground transition-colors" />
                        </button>

                        {/* Dropdown Results */}
                        <div className="absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 w-screen max-w-2xl px-4 md:px-0">
                            <SearchBar
                                isOpen={searchOpen && searchQuery.length >= 2}
                                searchQuery={searchQuery}
                                onClose={onClose}
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
