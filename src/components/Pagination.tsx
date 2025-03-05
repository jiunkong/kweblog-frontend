import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const itemsPerPage = 5;
  const currentPageBlock = Math.floor((currentPage - 1) / itemsPerPage) * itemsPerPage + 1;
  const nextPageBlock = currentPageBlock + itemsPerPage;
  const prevPageBlock = currentPageBlock - itemsPerPage;

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const renderPageButtons = () => {
    const pages = [];
    for (let i = currentPageBlock; i < currentPageBlock + itemsPerPage && i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          disabled={i === currentPage}
          className={`px-4 py-2 mx-1 rounded-md ${i === currentPage ? 'bg-blue-500 text-white' : 'bg-transparent'}`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="flex items-center mt-20 mx-auto">
      <button
        onClick={() => handlePageChange(prevPageBlock)}
        disabled={prevPageBlock < 1}
        className="px-4 py-2 mx-1 bg-transparent disabled:text-gray-400"
      >
        이전
      </button>

      {renderPageButtons()}

      <button
        onClick={() => handlePageChange(nextPageBlock)}
        disabled={nextPageBlock > totalPages}
        className="px-4 py-2 mx-1 bg-transparent disabled:text-gray-400"
      >
        다음
      </button>
    </div>
  );
};
export const PAGE_SIZE = 10
