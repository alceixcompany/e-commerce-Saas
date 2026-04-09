import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export default function AdminPagination({
  currentPage,
  totalPages,
  totalItems,
  limit,
  onPageChange,
  isLoading = false
}: AdminPaginationProps) {
  if (totalPages <= 1 && totalItems <= limit) return null;

  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems);

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    return pages.map((page, index) => (
      <button
        key={index}
        disabled={isLoading || page === '...'}
        onClick={() => typeof page === 'number' && onPageChange(page)}
        className={`min-w-[36px] h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
          page === currentPage
            ? 'bg-foreground text-background shadow-lg shadow-foreground/10'
            : page === '...'
            ? 'text-foreground/20 cursor-default'
            : 'text-foreground/40 hover:text-foreground hover:bg-foreground/5'
        } disabled:opacity-50`}
      >
        {page}
      </button>
    ));
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 px-6 border-t border-foreground/5 bg-foreground/5">
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">
        Showing <span className="text-foreground">{startItem}</span> to <span className="text-foreground">{endItem}</span> of <span className="text-foreground">{totalItems}</span> assets
      </div>

      <div className="flex items-center gap-1">
        <button
          disabled={isLoading || currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
          title="Previous Page"
        >
          <FiChevronLeft size={20} />
        </button>

        <div className="flex items-center gap-1 mx-2">
          {renderPageNumbers()}
        </div>

        <button
          disabled={isLoading || currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
          title="Next Page"
        >
          <FiChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
