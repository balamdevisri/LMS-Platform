import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 pt-6 font-['Sora'] text-xs">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-xl bg-white border border-sky-200 text-slate-700 hover:bg-sky-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-xs"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
        <button
          key={pageNum}
          onClick={() => onPageChange(pageNum)}
          className={`w-8 h-8 rounded-xl font-bold transition-all cursor-pointer ${
            pageNum === currentPage
              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
              : 'bg-white border border-sky-200 text-slate-700 hover:bg-sky-50'
          }`}
        >
          {pageNum}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-xl bg-white border border-sky-200 text-slate-700 hover:bg-sky-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-xs"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
