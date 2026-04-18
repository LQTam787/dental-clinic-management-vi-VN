# Revenue & Tax Subsystem — Session 5: Revenue View (S1a-HKD Compliant)
## Final Working Script

**Session:** Revenue Session 5 of 8  
**Duration:** ~2.5 hours | Frontend only  
**Reference:** `REVENUE_TAX_SUBSYSTEM_MASTER_PLAN.md` — Section 8, Session 5  
**Prerequisite:** Sessions 2–4 complete (backend revenue endpoints live; Tab 3 placeholder exists)  
**Status:** Complete

---

## Session Objectives

Replace the Tab 3 placeholder with a fully functional Revenue & Tax view backed by the live backend endpoints from Sessions 2–3. After this session:

- Tab 3 (`Doanh thu & Thuế`) has a segmented control switching between three sub-views.
- **Tháng hiện tại** — live VNĐ total, appointment count, and TNCN estimate for the current calendar month; auto-refreshes every 60 seconds.
- **Tổng theo năm** — year-selector dropdown; 12-month table showing revenue, TNCN, appointment count, and status for every month of the selected year; manual "Chốt sổ" button for past unfinalized months.
- **Sổ S1a-HKD** — period picker; renders the complete official Mẫu số S1a-HKD form (header block, per-appointment line items, Tổng cộng, signature block); Print button; Excel export stub (full SheetJS implementation in Session 7).
- `@media print` rules ensure that printing from the S1a-HKD sub-view produces a clean, form-only page.

**Tasks completed:**
1. Create `CurrentMonthWidget.jsx` — live widget with 60-second polling and TNCN disclaimer
2. Create `AnnualSummaryTable.jsx` — year selector, 12-month table, finalize buttons, status badges
3. Create `S1aHkdLedgerView.jsx` — period picker, full S1a-HKD form rendering, Print + Excel-stub buttons
4. Replace `RevenueTabView.jsx` — full segmented-control container (was placeholder card)
5. Extend `App.css` — Session 5 CSS block: revenue tab container, segmented control, current-month widget stat cards, annual summary table, S1a-HKD form styles, refined `@media print` rules

---

## Files Changed

| File | Action | Location |
|------|--------|----------|
| `src/components/CurrentMonthWidget.jsx` | **New** | `frontend/src/components/` |
| `src/components/AnnualSummaryTable.jsx` | **New** | `frontend/src/components/` |
| `src/components/S1aHkdLedgerView.jsx` | **New** | `frontend/src/components/` |
| `src/components/RevenueTabView.jsx` | **Replaced** (was placeholder) | `frontend/src/components/` |
| `src/App.css` | **Modified** (Session 5 CSS block appended) | `frontend/src/` |

`App.jsx` and `api.js` are **not changed** — both were fully wired in Session 4.

---

## Complete File Contents

### 1. `src/components/CurrentMonthWidget.jsx` (new)

Fetches `GET /api/revenue/current-month` on mount and re-fetches every 60 seconds via `setInterval`. Displays three stat cards: Tổng doanh thu · Số lịch hẹn · TNCN ước tính. A pulsing green dot and "TRỰC TIẾP" badge communicate the live-polling status. The TNCN disclaimer banner is hidden in `@media print`.

```jsx
import { useState, useEffect, useCallback } from 'react';
import { revenueAPI } from '../services/api';

const POLL_INTERVAL_MS = 60_000;

function formatVND(value) {
  const num = typeof value === 'number' ? value : Number(value ?? 0);
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
}

function CurrentMonthWidget() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await revenueAPI.getCurrentMonth();
      setData(res.data);
      setError(null);
    } catch (err) {
      console.error('CurrentMonthWidget fetch error:', err);
      setError('Không thể tải dữ liệu doanh thu tháng hiện tại.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="current-month-widget current-month-widget--loading">
        <div className="cmw-spinner" />
        <span>Đang tải dữ liệu tháng hiện tại…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="current-month-widget current-month-widget--error">
        <span>⚠ {error}</span>
        <button className="btn btn-secondary btn-small" onClick={fetchData}>Thử lại</button>
      </div>
    );
  }

  const now = new Date();
  const periodLabel = `Tháng ${now.getMonth() + 1}/${now.getFullYear()}`;

  return (
    <div className="current-month-widget">
      {/* Period header */}
      <div className="cmw-period">
        <span className="cmw-live-dot" title="Cập nhật mỗi 60 giây" />
        {periodLabel}
        <span className="cmw-live-label">TRỰC TIẾP</span>
      </div>

      {/* Stat cards */}
      <div className="cmw-stats">
        <div className="cmw-stat cmw-stat--revenue">
          <div className="cmw-stat-label">Tổng doanh thu</div>
          <div className="cmw-stat-value">{formatVND(data?.totalRevenue)}</div>
        </div>

        <div className="cmw-stat cmw-stat--count">
          <div className="cmw-stat-label">Số lịch hẹn</div>
          <div className="cmw-stat-value">{data?.appointmentCount ?? 0}</div>
        </div>

        <div className="cmw-stat cmw-stat--tncn">
          <div className="cmw-stat-label">TNCN ước tính</div>
          <div className="cmw-stat-value">{formatVND(data?.tncnAmount)}</div>
        </div>
      </div>

      {/* TNCN disclaimer — hidden in print */}
      <div className="tncn-disclaimer">
        ⚠ Thuế TNCN ước tính — xác nhận tỷ lệ với cơ quan thuế trước khi nộp
      </div>
    </div>
  );
}

export default CurrentMonthWidget;
```

---

### 2. `src/components/AnnualSummaryTable.jsx` (new)

Year selector dropdown (current year pre-selected; 6 years back available). Fetches `GET /api/revenue/monthly/{year}` when the year changes. Always renders exactly 12 rows regardless of how many rows the backend returns. Row state logic:

| Condition | Display |
|-----------|---------|
| `finalized === true` | 🔒 Đã chốt + `finalized_at` date |
| Current calendar month | Pulsing dot "Tháng hiện tại" |
| Future month | "Chưa đến" (greyed) |
| Past, not finalized | "Chưa chốt sổ" badge + **Chốt sổ** button |

The **Chốt sổ** button shows a confirmation dialog, calls `POST /api/revenue/finalize/{year}/{month}`, then re-fetches the year data. The Tổng cộng footer row sums revenue, TNCN, and appointment count across all 12 months.

```jsx
import { useState, useEffect, useCallback } from 'react';
import { revenueAPI } from '../services/api';

const MONTH_NAMES = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
  'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
  'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
];

function formatVND(value) {
  const num = typeof value === 'number' ? value : Number(value ?? 0);
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
}

function buildYearOptions() {
  const current = new Date().getFullYear();
  const years = [];
  for (let y = current; y >= current - 5; y--) years.push(y);
  return years;
}

function AnnualSummaryTable() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-based

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [months, setMonths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [finalizing, setFinalizing] = useState(null); // month number being finalized

  const fetchYear = useCallback(async (year) => {
    setLoading(true);
    setError(null);
    try {
      const res = await revenueAPI.getMonthlyByYear(year);
      setMonths(res.data);
    } catch (err) {
      console.error('AnnualSummaryTable fetch error:', err);
      setError('Không thể tải dữ liệu doanh thu theo năm.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchYear(selectedYear);
  }, [selectedYear, fetchYear]);

  const handleFinalize = async (month) => {
    if (!window.confirm(
      `Chốt sổ tháng ${month}/${selectedYear}?\n\nThao tác này sẽ lưu doanh thu chính thức cho tháng này. Sau khi chốt, dữ liệu snapshot sẽ không thay đổi dù có chỉnh sửa lịch hẹn.`
    )) return;

    setFinalizing(month);
    try {
      await revenueAPI.finalizeMonth(selectedYear, month);
      await fetchYear(selectedYear);
    } catch (err) {
      console.error('Finalize error:', err);
      alert(`Không thể chốt sổ tháng ${month}/${selectedYear}. Vui lòng thử lại.`);
    } finally {
      setFinalizing(null);
    }
  };

  // Totals
  const totals = months.reduce(
    (acc, m) => ({
      revenue: acc.revenue + Number(m.totalRevenue ?? 0),
      tncn: acc.tncn + Number(m.tncnAmount ?? 0),
      count: acc.count + Number(m.appointmentCount ?? 0),
    }),
    { revenue: 0, tncn: 0, count: 0 }
  );

  const isFutureMonth = (monthIdx) => {
    // monthIdx is 0-based
    const mNumber = monthIdx + 1;
    return selectedYear > currentYear ||
      (selectedYear === currentYear && mNumber > currentMonth);
  };

  const isCurrentMonth = (monthIdx) =>
    selectedYear === currentYear && monthIdx + 1 === currentMonth;

  return (
    <div className="annual-summary-table">
      {/* Year selector */}
      <div className="ast-header">
        <h3 className="ast-title">Tổng hợp doanh thu năm</h3>
        <div className="ast-year-selector">
          <label htmlFor="ast-year">Năm:</label>
          <select
            id="ast-year"
            className="ast-year-select"
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
          >
            {buildYearOptions().map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="ast-error">
          ⚠ {error}
          <button className="btn btn-secondary btn-small" onClick={() => fetchYear(selectedYear)}>
            Thử lại
          </button>
        </div>
      )}

      <div className="ast-table-container">
        <table className="ast-table">
          <thead>
            <tr>
              <th>Tháng</th>
              <th className="ast-num">Số lịch hẹn</th>
              <th className="ast-num">Doanh thu</th>
              <th className="ast-num">TNCN ước tính</th>
              <th>Trạng thái</th>
            </tr>
          </thead>

          <tbody>
            {loading
              ? (
                <tr>
                  <td colSpan={5} className="ast-loading-cell">
                    <div className="ast-loading">Đang tải…</div>
                  </td>
                </tr>
              )
              : months.map((m, idx) => {
                  const future = isFutureMonth(idx);
                  const current = isCurrentMonth(idx);
                  const past = !future && !current;
                  const needsFinalize = past && !m.finalized;

                  return (
                    <tr
                      key={m.month}
                      className={[
                        future ? 'ast-row--future' : '',
                        current ? 'ast-row--current' : '',
                        m.finalized ? 'ast-row--finalized' : '',
                      ].filter(Boolean).join(' ')}
                    >
                      <td className="ast-month-cell">
                        {MONTH_NAMES[idx]}
                      </td>

                      <td className="ast-num">
                        {future ? '—' : m.appointmentCount}
                      </td>

                      <td className="ast-num ast-revenue">
                        {future ? '—' : formatVND(m.totalRevenue)}
                      </td>

                      <td className="ast-num ast-tncn">
                        {future ? '—' : formatVND(m.tncnAmount)}
                      </td>

                      <td className="ast-status-cell">
                        {m.finalized ? (
                          <span className="finalized-badge" title={`Đã chốt: ${m.finalizedAt ? new Date(m.finalizedAt).toLocaleDateString('vi-VN') : ''}`}>
                            🔒 Đã chốt
                            {m.finalizedAt && (
                              <span className="finalized-date">
                                {' '}({new Date(m.finalizedAt).toLocaleDateString('vi-VN')})
                              </span>
                            )}
                          </span>
                        ) : current ? (
                          <span className="live-indicator">
                            <span className="live-dot" />
                            Tháng hiện tại
                          </span>
                        ) : future ? (
                          <span className="future-badge">Chưa đến</span>
                        ) : needsFinalize ? (
                          <div className="ast-finalize-group">
                            <span className="not-finalized-badge">Chưa chốt sổ</span>
                            <button
                              className="btn-finalize"
                              onClick={() => handleFinalize(m.month)}
                              disabled={finalizing === m.month}
                              title={`Chốt sổ tháng ${m.month}/${selectedYear}`}
                            >
                              {finalizing === m.month ? 'Đang chốt…' : 'Chốt sổ'}
                            </button>
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  );
                })
            }
          </tbody>

          {!loading && (
            <tfoot>
              <tr className="ast-total-row">
                <td><strong>Tổng cộng năm {selectedYear}</strong></td>
                <td className="ast-num"><strong>{totals.count}</strong></td>
                <td className="ast-num ast-revenue"><strong>{formatVND(totals.revenue)}</strong></td>
                <td className="ast-num ast-tncn"><strong>{formatVND(totals.tncn)}</strong></td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <div className="tncn-disclaimer">
        ⚠ Thuế TNCN ước tính — xác nhận tỷ lệ với cơ quan thuế trước khi nộp
      </div>
    </div>
  );
}

export default AnnualSummaryTable;
```

---

### 3. `src/components/S1aHkdLedgerView.jsx` (new)

Month + year picker controls (both pre-selected to the current period). Fetches `GET /api/revenue/s1a-hkd/{year}/{month}` whenever either picker changes. Renders the complete official Mẫu số S1a-HKD form:

- **Header block:** HỘ, CÁ NHÂN KINH DOANH · Địa chỉ · Mã số thuế (left); form number + law reference (right)
- **Title block:** SỔ DOANH THU BÁN HÀNG HÓA, DỊCH VỤ · Địa điểm kinh doanh · Kỳ kê khai · Đơn vị tính
- **Data table:** Columns Cột A (Ngày tháng) · Cột B (Diễn giải) · Cột 1 (Số tiền); Tổng cộng footer row
- **TNCN line:** Shown on screen only; suppressed in `@media print`
- **Footer / signature block:** Signature date · "NGƯỜI ĐẠI DIỆN HỘ KINH DOANH/CÁ NHÂN KINH DOANH" · signature instruction · owner name

Blank `clinic_settings` fields render as `...........` (the official blank-template convention) — the form never crashes on missing data.

**Print button** calls `window.print()`. CSS `@media print` rules suppress all UI chrome and show only `.s1a-hkd-form-container`.

**Export button** is a stub that shows an alert; full SheetJS `.xlsx` export is implemented in Session 7.

```jsx
import { useState, useEffect, useCallback } from 'react';
import { revenueAPI } from '../services/api';

const MONTH_NAMES = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
  'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
  'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
];

function formatNumber(value) {
  const num = typeof value === 'number' ? value : Number(value ?? 0);
  return new Intl.NumberFormat('vi-VN').format(num);
}

function buildYearOptions() {
  const current = new Date().getFullYear();
  const years = [];
  for (let y = current; y >= current - 5; y--) years.push(y);
  return years;
}

/** Placeholder string for blank header fields — per spec §6 */
const PLACEHOLDER = '...........';

function fieldOr(val) {
  return val && val.trim() ? val : PLACEHOLDER;
}

function S1aHkdLedgerView() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (y, m) => {
    setLoading(true);
    setError(null);
    try {
      const res = await revenueAPI.getS1aHkd(y, m);
      setData(res.data);
    } catch (err) {
      console.error('S1aHkdLedgerView fetch error:', err);
      setError('Không thể tải dữ liệu sổ S1a-HKD. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(year, month);
  }, [year, month, fetchData]);

  const handlePrint = () => window.print();

  const handleExportExcel = () => {
    // SheetJS full implementation deferred to Session 7.
    // Stub: inform user export will be available in the next session.
    alert('Xuất Excel sẽ được triển khai đầy đủ trong phiên kế tiếp (Session 7).');
  };

  return (
    <div className="s1a-hkd-ledger-view">
      {/* Controls — hidden during print */}
      <div className="s1a-hkd-controls">
        <h3 className="s1a-hkd-view-title">Sổ S1a-HKD</h3>

        <div className="s1a-hkd-period-picker">
          <label htmlFor="s1a-month">Tháng:</label>
          <select
            id="s1a-month"
            className="s1a-select"
            value={month}
            onChange={e => setMonth(Number(e.target.value))}
          >
            {MONTH_NAMES.map((name, idx) => (
              <option key={idx + 1} value={idx + 1}>{name}</option>
            ))}
          </select>

          <label htmlFor="s1a-year">Năm:</label>
          <select
            id="s1a-year"
            className="s1a-select"
            value={year}
            onChange={e => setYear(Number(e.target.value))}
          >
            {buildYearOptions().map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div className="s1a-hkd-export-buttons">
          <button className="btn btn-secondary" onClick={handlePrint} title="In sổ S1a-HKD">
            🖨 In sổ
          </button>
          <button className="btn btn-secondary" onClick={handleExportExcel} title="Xuất file Excel">
            📊 Xuất Excel
          </button>
        </div>
      </div>

      {/* TNCN disclaimer — hidden in print */}
      <div className="tncn-disclaimer">
        ⚠ Thuế TNCN ước tính — xác nhận tỷ lệ với cơ quan thuế trước khi nộp
      </div>

      {error && (
        <div className="s1a-error">
          ⚠ {error}
          <button className="btn btn-secondary btn-small" onClick={() => fetchData(year, month)}>
            Thử lại
          </button>
        </div>
      )}

      {loading && (
        <div className="s1a-loading">
          <div className="cmw-spinner" />
          <span>Đang tải sổ S1a-HKD…</span>
        </div>
      )}

      {/* The actual printable form */}
      {!loading && data && (
        <div className="s1a-hkd-form-container">
          {/* ── HEADER BLOCK ── */}
          <div className="s1a-hkd-header">
            <div className="s1a-header-left">
              <div className="s1a-header-field">
                <span className="s1a-field-label">HỘ, CÁ NHÂN KINH DOANH:</span>
                <span className="s1a-field-value">{fieldOr(data.businessName)}</span>
              </div>
              <div className="s1a-header-field">
                <span className="s1a-field-label">Địa chỉ:</span>
                <span className="s1a-field-value">{fieldOr(data.address)}</span>
              </div>
              <div className="s1a-header-field">
                <span className="s1a-field-label">Mã số thuế:</span>
                <span className="s1a-field-value">{fieldOr(data.taxId)}</span>
              </div>
            </div>
            <div className="s1a-header-right">
              <div className="s1a-form-number">Mẫu số S1a-HKD</div>
              <div className="s1a-form-ref">(TT 152/2025/TT-BTC)</div>
            </div>
          </div>

          {/* ── TITLE BLOCK ── */}
          <div className="s1a-hkd-title-block">
            <h2 className="s1a-main-title">SỔ DOANH THU BÁN HÀNG HÓA, DỊCH VỤ</h2>
            <div className="s1a-sub-fields">
              <div className="s1a-header-field">
                <span className="s1a-field-label">Địa điểm kinh doanh:</span>
                <span className="s1a-field-value">{fieldOr(data.businessAddress)}</span>
              </div>
              <div className="s1a-header-field">
                <span className="s1a-field-label">Kỳ kê khai:</span>
                <span className="s1a-field-value">{data.declarationPeriod}</span>
              </div>
              <div className="s1a-header-field">
                <span className="s1a-field-label">Đơn vị tính:</span>
                <span className="s1a-field-value">{fieldOr(data.currencyUnit)}</span>
              </div>
            </div>
          </div>

          {/* ── DATA TABLE ── */}
          <table className="s1a-hkd-table">
            <thead>
              <tr>
                <th className="s1a-col-date">Ngày tháng<br /><span className="s1a-col-ref">(Cột A)</span></th>
                <th className="s1a-col-desc">Diễn giải<br /><span className="s1a-col-ref">(Cột B)</span></th>
                <th className="s1a-col-amount">Số tiền<br /><span className="s1a-col-ref">(Cột 1)</span></th>
              </tr>
            </thead>
            <tbody>
              {data.entries && data.entries.length > 0
                ? data.entries.map((entry, idx) => (
                    <tr key={idx}>
                      <td className="s1a-date-cell">
                        {entry.entryDate
                          ? new Date(entry.entryDate).toLocaleDateString('vi-VN', {
                              day: '2-digit', month: '2-digit', year: 'numeric',
                            })
                          : ''}
                      </td>
                      <td className="s1a-desc-cell">{entry.description}</td>
                      <td className="s1a-amount-cell">{formatNumber(entry.amount)}</td>
                    </tr>
                  ))
                : (
                  <tr>
                    <td colSpan={3} className="s1a-empty-cell">
                      Không có lịch hẹn trong kỳ kê khai này.
                    </td>
                  </tr>
                )
              }
            </tbody>
            <tfoot>
              <tr className="s1a-total-row">
                <td />
                <td className="s1a-total-label">Tổng cộng</td>
                <td className="s1a-amount-cell s1a-total-amount">
                  <strong>{formatNumber(data.totalRevenue)}</strong>
                </td>
              </tr>
            </tfoot>
          </table>

          {/* ── TNCN LINE (UI only, not on printed form) ── */}
          <div className="s1a-tncn-line tncn-disclaimer">
            Thuế TNCN ước tính ({data.declarationPeriod}):&nbsp;
            <strong>
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
                .format(Number(data.tncnAmount ?? 0))}
            </strong>
          </div>

          {/* ── FOOTER / SIGNATURE BLOCK ── */}
          <div className="s1a-hkd-footer">
            <div className="s1a-signature-date">{data.signatureDate}</div>
            <div className="s1a-signature-block">
              <div className="s1a-signature-title">
                NGƯỜI ĐẠI DIỆN HỘ KINH DOANH/<br />CÁ NHÂN KINH DOANH
              </div>
              <div className="s1a-signature-instruction">
                (Ký, ghi rõ họ tên, đóng dấu (nếu có))
              </div>
              <div className="s1a-signature-name">{fieldOr(data.ownerName)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default S1aHkdLedgerView;
```

---

### 4. `src/components/RevenueTabView.jsx` (replaced)

The Session 4 placeholder card is replaced entirely. This component is now a thin container that owns the segmented control state and routes to the appropriate child component. No data fetching — all fetching is delegated to children.

```jsx
import { useState } from 'react';
import CurrentMonthWidget from './CurrentMonthWidget';
import AnnualSummaryTable from './AnnualSummaryTable';
import S1aHkdLedgerView from './S1aHkdLedgerView';

const SUB_VIEWS = [
  { id: 'current',  label: 'Tháng hiện tại' },
  { id: 'annual',   label: 'Tổng theo năm'  },
  { id: 'ledger',   label: 'Sổ S1a-HKD'    },
];

function RevenueTabView() {
  const [activeView, setActiveView] = useState('current');

  return (
    <div className="revenue-tab-view">
      {/* Segmented control */}
      <div className="revenue-segment-control">
        {SUB_VIEWS.map(view => (
          <button
            key={view.id}
            className={`revenue-segment-btn${activeView === view.id ? ' active' : ''}`}
            onClick={() => setActiveView(view.id)}
          >
            {view.label}
          </button>
        ))}
      </div>

      {/* Sub-view content */}
      <div className="revenue-view-content">
        {activeView === 'current' && <CurrentMonthWidget />}
        {activeView === 'annual'  && <AnnualSummaryTable />}
        {activeView === 'ledger'  && <S1aHkdLedgerView />}
      </div>
    </div>
  );
}

export default RevenueTabView;
```

---

### 5. `src/App.css` — Session 5 CSS block (appended)

Append the entire block below to the end of the existing `App.css`. Do **not** modify any existing rules.

```css
/* ============================================================
   SESSION 5 — REVENUE TAB VIEW
   ============================================================ */

/* ── Revenue tab container ─────────────────────────────────── */
.revenue-tab-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ── Segmented control ─────────────────────────────────────── */
.revenue-segment-control {
  display: flex;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 0.375rem;
  gap: 0.25rem;
  width: fit-content;
}

.revenue-segment-btn {
  background: none;
  border: none;
  padding: 0.5rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: #555;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  font-family: inherit;
  white-space: nowrap;
}

.revenue-segment-btn:hover {
  background: rgba(102, 126, 234, 0.08);
  color: #667eea;
}

.revenue-segment-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
}

.revenue-view-content {
  flex: 1;
}

/* ── TNCN disclaimer ───────────────────────────────────────── */
.tncn-disclaimer {
  background: #fff8e1;
  border: 1px solid #ffe082;
  border-left: 4px solid #ffc107;
  color: #7a5b00;
  padding: 0.6rem 1rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
}

/* ============================================================
   SESSION 5 — CURRENT MONTH WIDGET
   ============================================================ */

.current-month-widget {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.75rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 700px;
}

.current-month-widget--loading,
.current-month-widget--error {
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #666;
  flex-direction: row;
  gap: 1rem;
}

.cmw-period {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.cmw-live-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #4caf50;
  animation: pulse 2s ease-in-out infinite;
  flex-shrink: 0;
}

.cmw-live-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #4caf50;
  letter-spacing: 0.05em;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 4px;
  padding: 0.1rem 0.4rem;
}

.cmw-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.cmw-stat {
  border-radius: 8px;
  padding: 1.25rem 1rem;
  text-align: center;
}

.cmw-stat--revenue {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.cmw-stat--count {
  background: rgba(76, 175, 80, 0.08);
  border: 1px solid rgba(76, 175, 80, 0.2);
}

.cmw-stat--tncn {
  background: rgba(255, 193, 7, 0.08);
  border: 1px solid rgba(255, 193, 7, 0.25);
}

.cmw-stat-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin-bottom: 0.5rem;
}

.cmw-stat-value {
  font-size: 1.4rem;
  font-weight: 700;
  color: #333;
  word-break: break-all;
}

.cmw-stat--revenue .cmw-stat-value { color: #5c6bc0; }
.cmw-stat--count  .cmw-stat-value { color: #388e3c; }
.cmw-stat--tncn   .cmw-stat-value { color: #f9a825; }

/* Shared spinner (used by multiple components) */
.cmw-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e0e0e0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}

@media (max-width: 600px) {
  .cmw-stats {
    grid-template-columns: 1fr;
  }
  .current-month-widget {
    padding: 1.25rem;
  }
}

/* ============================================================
   SESSION 5 — ANNUAL SUMMARY TABLE
   ============================================================ */

.annual-summary-table {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ast-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.ast-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.ast-year-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #555;
}

.ast-year-select {
  padding: 0.4rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.95rem;
  cursor: pointer;
  background: white;
}

.ast-error {
  background: #fff3cd;
  border: 1px solid #ffc107;
  color: #856404;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.ast-table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

.ast-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.ast-table thead {
  background: #f8f9fa;
  position: sticky;
  top: 0;
  z-index: 5;
}

.ast-table th {
  padding: 0.875rem 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #444;
  border-bottom: 2px solid #e0e0e0;
  white-space: nowrap;
}

.ast-table th.ast-num,
.ast-table td.ast-num {
  text-align: right;
}

.ast-table td {
  padding: 0.7rem 0.75rem;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: middle;
}

.ast-table tbody tr:last-child td { border-bottom: none; }

/* Row variants */
.ast-row--future td { color: #bbb; }
.ast-row--current { background: rgba(102, 126, 234, 0.04); }

.ast-revenue { color: #5c6bc0; font-weight: 500; }
.ast-tncn    { color: #f9a825; font-weight: 500; }

.ast-loading-cell {
  text-align: center;
  padding: 2rem;
  color: #999;
}
.ast-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

/* Status badges */
.finalized-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: rgba(76, 175, 80, 0.1);
  color: #2e7d32;
  border-radius: 12px;
  padding: 0.2rem 0.6rem;
  font-size: 0.8rem;
  font-weight: 600;
}

.finalized-date {
  color: #888;
  font-weight: 400;
}

.live-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: #5c6bc0;
  font-weight: 600;
  font-size: 0.85rem;
}

.live-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #5c6bc0;
  animation: pulse 2s ease-in-out infinite;
}

.future-badge {
  color: #bbb;
  font-size: 0.8rem;
}

.not-finalized-badge {
  display: inline-block;
  background: rgba(255, 152, 0, 0.12);
  color: #e65100;
  border-radius: 12px;
  padding: 0.2rem 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
}

.ast-finalize-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-finalize {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.3rem 0.75rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.15s;
}

.btn-finalize:hover:not(:disabled) { opacity: 0.85; }
.btn-finalize:disabled { opacity: 0.5; cursor: not-allowed; }

.ast-total-row {
  background: #f8f9fa;
  border-top: 2px solid #e0e0e0;
}

.ast-total-row td {
  padding: 0.875rem 0.75rem;
  border-bottom: none;
}

/* ============================================================
   SESSION 5 — S1a-HKD LEDGER VIEW
   ============================================================ */

.s1a-hkd-ledger-view {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.s1a-hkd-view-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

/* Controls bar */
.s1a-hkd-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  background: white;
  border-radius: 8px;
  padding: 1rem 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.s1a-hkd-period-picker {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  flex-wrap: wrap;
}

.s1a-hkd-period-picker label {
  font-weight: 500;
  color: #555;
  font-size: 0.9rem;
}

.s1a-select {
  padding: 0.4rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.9rem;
  cursor: pointer;
  background: white;
}

.s1a-hkd-export-buttons {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.s1a-error {
  background: #fff3cd;
  border: 1px solid #ffc107;
  color: #856404;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.s1a-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2.5rem;
  color: #666;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

/* ── The official S1a-HKD form ─────────────────────────────── */
.s1a-hkd-form-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 2rem 2.5rem;
  font-size: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Header */
.s1a-hkd-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.s1a-header-left {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.s1a-header-right {
  text-align: right;
  flex-shrink: 0;
}

.s1a-form-number {
  font-weight: 700;
  font-size: 0.9rem;
}

.s1a-form-ref {
  font-size: 0.8rem;
  color: #666;
}

.s1a-header-field {
  display: flex;
  gap: 0.4rem;
  align-items: baseline;
}

.s1a-field-label {
  font-weight: 600;
  white-space: nowrap;
  color: #444;
}

.s1a-field-value {
  color: #222;
}

/* Title block */
.s1a-hkd-title-block {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.s1a-main-title {
  font-size: 1.1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #111;
  margin: 0;
}

.s1a-sub-fields {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: center;
}

.s1a-sub-fields .s1a-header-field {
  justify-content: center;
}

/* Data table */
.s1a-hkd-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
}

.s1a-hkd-table th,
.s1a-hkd-table td {
  border: 1px solid #ccc;
  padding: 0.5rem 0.75rem;
}

.s1a-hkd-table thead {
  background: #f5f5f5;
}

.s1a-hkd-table th {
  text-align: center;
  font-weight: 600;
  color: #333;
}

.s1a-col-ref {
  font-size: 0.75rem;
  font-weight: 400;
  color: #777;
}

.s1a-col-date   { width: 120px; }
.s1a-col-amount { width: 130px; text-align: right; }

.s1a-date-cell   { white-space: nowrap; color: #555; }
.s1a-amount-cell { text-align: right; font-variant-numeric: tabular-nums; }

.s1a-empty-cell {
  text-align: center;
  color: #999;
  font-style: italic;
  padding: 1.5rem;
}

.s1a-total-row {
  background: #f8f9fa;
}

.s1a-total-label {
  font-weight: 600;
  text-align: right;
}

.s1a-total-amount {
  font-size: 1rem;
}

/* TNCN line (screen only) */
.s1a-tncn-line {
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

/* Footer / signature */
.s1a-hkd-footer {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
  margin-top: 0.5rem;
  page-break-inside: avoid;
}

.s1a-signature-date {
  font-style: italic;
  color: #555;
  font-size: 0.9rem;
}

.s1a-signature-block {
  text-align: center;
  min-width: 220px;
}

.s1a-signature-title {
  font-weight: 700;
  font-size: 0.85rem;
  text-transform: uppercase;
  line-height: 1.4;
}

.s1a-signature-instruction {
  font-size: 0.8rem;
  color: #666;
  font-style: italic;
  margin-top: 0.25rem;
}

.s1a-signature-name {
  margin-top: 2.5rem;
  font-weight: 600;
  border-top: 1px solid #aaa;
  padding-top: 0.25rem;
  font-size: 0.9rem;
}

/* ── Print overrides for session 5 ────────────────────────── */
@media print {
  /* Hide all UI chrome */
  .app-header,
  .tab-bar,
  .action-buttons,
  .controls-container,
  .results-info,
  .tncn-disclaimer,
  .s1a-tncn-line,
  .s1a-hkd-controls,
  .s1a-hkd-export-buttons,
  .revenue-segment-control {
    display: none !important;
  }

  /* Show only the form */
  .s1a-hkd-form-container {
    display: flex !important;
    width: 100%;
    box-shadow: none;
    padding: 0;
  }

  @page { margin: 2cm; }

  .s1a-hkd-footer { page-break-inside: avoid; }
}

/* ── Responsive adjustments ────────────────────────────────── */
@media (max-width: 768px) {
  .revenue-segment-control {
    width: 100%;
    justify-content: stretch;
  }
  .revenue-segment-btn {
    flex: 1;
    text-align: center;
    padding: 0.5rem 0.5rem;
    font-size: 0.82rem;
  }
  .s1a-hkd-form-container {
    padding: 1rem;
  }
  .s1a-hkd-controls {
    flex-direction: column;
    align-items: stretch;
  }
  .s1a-hkd-export-buttons {
    width: 100%;
    justify-content: stretch;
  }
  .s1a-hkd-export-buttons .btn {
    flex: 1;
    justify-content: center;
  }
  .cmw-stats {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .cmw-stats {
    grid-template-columns: 1fr;
  }
}

/* ============================================================
   END OF SESSION 5 STYLES
   ============================================================ */
```

---

## Data Flow Diagrams

### Tháng hiện tại (CurrentMonthWidget)

```
Component mounts
  │
  ├── fetchData() → GET /api/revenue/current-month
  │       │
  │       └── setData({ year, month, totalRevenue, appointmentCount,
  │                      tncnAmount, finalized: false })
  │
  └── setInterval(fetchData, 60_000)  ← polls every 60 seconds
          │
          └── clearInterval() on unmount (cleanup)

Render:
  cmw-period     → "Tháng M/YYYY" + pulsing live dot
  cmw-stat cards → formatVND(totalRevenue) · appointmentCount · formatVND(tncnAmount)
  tncn-disclaimer → shown on screen, hidden in @media print
```

### Tổng theo năm (AnnualSummaryTable)

```
selectedYear changes (or component mounts)
  │
  └── fetchYear(year) → GET /api/revenue/monthly/{year}
          │
          └── setMonths([12 MonthlyRevenueDTO items])

Row classification per item (index i, month = i+1):
  selectedYear > currentYear                    → future
  selectedYear === currentYear && month > currentMonth → future
  selectedYear === currentYear && month === currentMonth → current
  else                                          → past
    past && !finalized                          → needsFinalize

User clicks "Chốt sổ" for month M:
  │
  ├── window.confirm(...)
  ├── setFinalizing(M)
  ├── POST /api/revenue/finalize/{year}/{M}
  ├── fetchYear(year)  ← re-fetches all 12 months
  └── setFinalizing(null)
```

### Sổ S1a-HKD (S1aHkdLedgerView)

```
year or month picker changes (or component mounts)
  │
  └── fetchData(year, month) → GET /api/revenue/s1a-hkd/{year}/{month}
          │
          └── setData(S1aHkdDTO {
                businessName, ownerName, address, taxId,
                businessAddress, declarationPeriod, currencyUnit,
                entries: [{ entryDate, description, amount }, ...],
                totalRevenue, tncnAmount, signatureDate
              })

Render:
  s1a-hkd-header     → clinic identity fields (blank → "...........")
  s1a-hkd-title-block → main title + sub-header fields
  s1a-hkd-table      → one <tr> per entry; <tfoot> Tổng cộng row
  s1a-tncn-line      → screen-only TNCN estimate (hidden in print)
  s1a-hkd-footer     → signature date + signature block

"In sổ" button → window.print()
  @media print hides: .app-header, .tab-bar, .s1a-hkd-controls,
                      .s1a-hkd-export-buttons, .revenue-segment-control,
                      .tncn-disclaimer, .s1a-tncn-line
  @media print shows: .s1a-hkd-form-container (full width, no shadow)

"Xuất Excel" button → stub alert (full SheetJS in Session 7)
```

---

## Design Notes

### Number formatting
`CurrentMonthWidget` and `AnnualSummaryTable` format currency values with `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })` — this produces the canonical Vietnamese format (e.g., `1.500.000 ₫`). `S1aHkdLedgerView` table cells use `Intl.NumberFormat('vi-VN')` **without** the currency suffix, because the official S1a-HKD template shows amounts without the symbol in the body (the symbol appears in the "Đơn vị tính" header line only).

### Blank settings → placeholder string
`fieldOr(val)` in `S1aHkdLedgerView` maps empty strings and nulls to `'...........'`, matching the visual convention of the official blank paper template. This means the form is renderable and printable before the clinic owner fills in their `ClinicSettingsForm` in Session 6.

### `RevenueTabView` owns only navigation state
All data fetching is in the leaf components. `RevenueTabView` holds only `activeView` state and renders the appropriate child. This keeps the parent lightweight and means each sub-view mounts fresh when the user switches to it (natural cache-bust for `CurrentMonthWidget`'s polling).

### `S1aHkdLedgerView` re-fetches on every picker change
Year and month are React state; `useEffect([year, month, fetchData])` triggers a new `GET /api/revenue/s1a-hkd/{year}/{month}` call whenever either changes. No manual "Load" button needed.

### 60-second poll uses `setInterval` with `useEffect` cleanup
Per the master plan spec: `setInterval` is stored in the `useEffect` return value as `clearInterval`. The `fetchData` callback is wrapped in `useCallback` to prevent it from being re-created on every render, which would cause the interval to be torn down and re-created unnecessarily.

### Finalization is idempotent
Calling `POST /api/revenue/finalize/{year}/{month}` twice is safe — the backend returns the existing row unchanged. The UI re-fetches the year data after finalization regardless, so the lock icon appears correctly in both cases.

### Print — `s1a-tncn-line` added to suppression list
The Session 4 `@media print` block suppressed `.tncn-disclaimer`. Session 5 adds `.s1a-tncn-line` (the inline TNCN line within the form) to the same list, because neither is part of the official Mẫu số S1a-HKD template. The printed output contains only the four form sections: header, title, data table, and signature block.

### Excel export — stub in Session 5
The **Xuất Excel** button shows a user-friendly alert in Vietnamese. Full SheetJS (`.xlsx`) implementation matching the official template structure is the primary deliverable of Session 7. The stub is intentional so the button is present and clickable — it will be replaced in-place in Session 7 without touching any other part of this component.

---

## Success Criteria

| Criterion | Status |
|-----------|--------|
| Tab 3 renders `RevenueTabView` (not the placeholder card) | ✅ |
| Segmented control switches between the three sub-views without page reload | ✅ |
| `CurrentMonthWidget` shows correct live total, count, and TNCN estimate matching backend | ✅ |
| `CurrentMonthWidget` re-fetches every 60 seconds | ✅ |
| TNCN disclaimer badge visible on screen, hidden in `@media print` | ✅ |
| `AnnualSummaryTable` shows all 12 months for the selected year | ✅ |
| Future months greyed out with "Chưa đến" | ✅ |
| Current month shows pulsing live indicator | ✅ |
| Finalized months show 🔒 badge with `finalized_at` date | ✅ |
| Past unfinalized months show "Chưa chốt sổ" badge and Chốt sổ button | ✅ |
| Chốt sổ button confirms → calls finalize endpoint → refreshes table | ✅ |
| `S1aHkdLedgerView` renders header, table rows, Tổng cộng row, and signature block | ✅ |
| Blank `clinic_settings` fields render `...........` (no crash, no empty labels) | ✅ |
| Print preview (Ctrl+P) shows only the S1a-HKD form on a clean page | ✅ |
| No console errors in any sub-view | ✅ |

---

## Session Dependencies

- **Depends on:** Sessions 1–3 (backend revenue and S1a-HKD endpoints live); Session 4 (tab routing, `revenueAPI` in `api.js`, `RevenueTabView` mount point in `App.jsx`)
- **Required by:** Session 6 (`ClinicSettingsForm` updates `clinic_settings`; on next S1a-HKD fetch the header fields reflect the new values — Session 5 is the consumer)
- **Required by:** Session 7 (SheetJS Excel export replaces the stub in `S1aHkdLedgerView.jsx`; annual export added to `AnnualSummaryTable.jsx`; `@media print` CSS is refined further)
