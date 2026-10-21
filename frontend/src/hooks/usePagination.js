import { useState, useMemo, useCallback } from 'react';

export const PAGE_SIZE_OPTIONS = [25, 49];

/**
 * Client-side pagination.
 * - items:    the full (already filtered) array
 * - resetKey: when this value changes (e.g. search term), go back to page 1
 */
export default function usePagination(items, resetKey = '') {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  // Reset to page 1 when resetKey changes (adjust state during render)
  const [prevKey, setPrevKey] = useState(resetKey);
  if (prevKey !== resetKey) {
    setPrevKey(resetKey);
    setPage(1);
  }

  const total = items ? items.length : 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  // Clamp so deleting the last row of the last page doesn't show an empty page
  const currentPage = Math.min(page, totalPages);


  const pageItems = useMemo(() => {
    if (!items) return [];
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  const changePageSize = useCallback(size => {
    setPageSize(size);
    setPage(1);
  }, []);

  return {
    pageItems,
    page: currentPage,
    pageSize,
    totalPages,
    total,
    offset: (currentPage - 1) * pageSize,
    setPage,
    setPageSize: changePageSize,
  };
}
