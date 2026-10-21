import React from 'react';
import { t } from '../utils/i18n';
import { PAGE_SIZE_OPTIONS } from '../hooks/usePagination';

/** Builds [1, '…', 4, 5, 6, '…', 20] style list */
function buildPageList(page, totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  if (page <= 3) [2, 3, 4].forEach(p => pages.add(p));
  if (page >= totalPages - 2) [totalPages - 3, totalPages - 2, totalPages - 1].forEach(p => pages.add(p));
  const sorted = [...pages].filter(p => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const out = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push(`gap-${p}`);
    out.push(p);
  });
  return out;
}

/**
 * Pagination controls: range summary, page-size selector (25 / 49), page buttons.
 */
function Pagination({ page, pageSize, totalPages, total, onPageChange, onPageSizeChange }) {
  if (total === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const pages = buildPageList(page, totalPages);

  return (
    <div className="pagination-bar">
      <div className="pagination-info">
        {t('pagination.showing', { from, to, total })}
      </div>

      <div className="pagination-pagesize">
        <label htmlFor="page-size-select">{t('pagination.pageSize')}</label>
        <select
          id="page-size-select"
          value={pageSize}
          onChange={e => onPageSizeChange(Number(e.target.value))}
        >
          {PAGE_SIZE_OPTIONS.map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>

      {totalPages > 1 && (
        <nav className="pagination-nav" aria-label="Pagination">
          <button type="button" className="page-btn" onClick={() => onPageChange(1)}
            disabled={page === 1} title={t('pagination.first')} aria-label={t('pagination.first')}>«</button>
          <button type="button" className="page-btn" onClick={() => onPageChange(page - 1)}
            disabled={page === 1} title={t('pagination.prev')} aria-label={t('pagination.prev')}>‹</button>

          {pages.map(p =>
            typeof p === 'string' ? (
              <span key={p} className="page-gap">…</span>
            ) : (
              <button
                key={p}
                type="button"
                className={`page-btn${p === page ? ' active' : ''}`}
                onClick={() => onPageChange(p)}
                aria-label={t('pagination.page', { page: p })}
                aria-current={p === page ? 'page' : undefined}
              >
                {p}
              </button>
            )
          )}

          <button type="button" className="page-btn" onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages} title={t('pagination.next')} aria-label={t('pagination.next')}>›</button>
          <button type="button" className="page-btn" onClick={() => onPageChange(totalPages)}
            disabled={page === totalPages} title={t('pagination.last')} aria-label={t('pagination.last')}>»</button>
        </nav>
      )}
    </div>
  );
}

export default Pagination;
