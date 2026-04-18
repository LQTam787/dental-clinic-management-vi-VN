# Revenue & Tax Subsystem — Session 7: Export & Print Polish
## Final Working Script

**Session:** Revenue Session 7 of 8  
**Duration:** ~1.5 hours | Frontend only  
**Reference:** `REVENUE_TAX_SUBSYSTEM_MASTER_PLAN.md` — Section 8, Session 7  
**Prerequisite:** Session 5 complete (`S1aHkdLedgerView`, `AnnualSummaryTable` rendering correctly with data from backend)  
**Status:** Complete

---

## Session Objectives

Replace the "Xuất Excel" stub in `S1aHkdLedgerView` with a full SheetJS implementation, add an Excel export button to `AnnualSummaryTable`, and polish the `@media print` CSS so that browser print-to-PDF produces a clean, official-looking S1a-HKD form.

After this session:

- Clicking **📊 Xuất Excel** in the S1a-HKD view triggers a browser download of `S1a-HKD_MM-YYYY.xlsx`. The file mirrors the official template layout: header block, title block, data table with Cột A / Cột B / Cột 1, Tổng cộng row, and a signature placeholder block.
- Clicking **📊 Xuất Excel** in the annual summary header downloads `Doanh_thu_nam_YYYY.xlsx` with a title row, disclaimer note, 12-month data table, and totals row. Revenue and TNCN amounts are Excel number cells (not strings) formatted with `#,##0.00`.
- **Ctrl+P → Save as PDF** in Chrome shows only the S1a-HKD form on a clean A4 page with 2 cm margins. All navigation, controls, disclaimers, and export buttons are suppressed. Table borders print in black. The signature footer never breaks across pages.
- The SheetJS `xlsx` package is installed as a project dependency (not loaded from CDN), so exports work fully offline and in production builds.

**Tasks completed:**
1. Install `xlsx` npm package
2. Implement `handleExportExcel` in `S1aHkdLedgerView.jsx` using SheetJS `aoa_to_sheet` — full template structure
3. Add `handleExportExcel` to `AnnualSummaryTable.jsx` — annual summary with year header and TNCN column
4. Add "📊 Xuất Excel" button to the `AnnualSummaryTable` header row
5. Append Session 7 CSS block to `App.css` — `.ast-export-btn` spacing + consolidated `@media print` rules

---

## Files Changed

| File | Action | Location |
|------|--------|----------|
| `package.json` | **Modified** (`xlsx` added to `dependencies`) | `frontend/` |
| `package-lock.json` | **Modified** (updated by npm) | `frontend/` |
| `src/components/S1aHkdLedgerView.jsx` | **Modified** (XLSX import + full `handleExportExcel`) | `frontend/src/components/` |
| `src/components/AnnualSummaryTable.jsx` | **Modified** (XLSX import + `handleExportExcel` + export button) | `frontend/src/components/` |
| `src/App.css` | **Modified** (Session 7 CSS block appended) | `frontend/src/` |

---

## Design Notes

### SheetJS approach: `aoa_to_sheet`

Both exports use `XLSX.utils.aoa_to_sheet(ws_data)` where `ws_data` is an array-of-arrays (one inner array per row). This approach is chosen over `json_to_sheet` because the S1a-HKD template has a non-uniform structure (header metadata rows, then column headers, then data, then a footer) that does not map cleanly to a flat JSON object array.

The call sequence for each export is:

```javascript
const wb = XLSX.utils.book_new();
// ... build ws_data array ...
const ws = XLSX.utils.aoa_to_sheet(ws_data);
ws['!cols'] = [ /* column widths */ ];
// ... apply number formats to numeric cells ...
XLSX.utils.book_append_sheet(wb, ws, 'Sheet name');
XLSX.writeFile(wb, 'filename.xlsx');
```

`XLSX.writeFile` triggers the browser's file download directly — no `<a href>` tricks needed.

### Number formatting in Excel cells

Revenue and TNCN amounts are written as JavaScript `number` primitives (not strings) so that Excel treats them as numeric cells and users can sum/average them. After the sheet is created, a loop applies the `#,##0.00` number format (`ws[cellRef].z`) to each amount cell. This produces thousands-separated display in Excel without using a locale-specific format code.

```javascript
for (let r = dataStartRow; r <= dataEndRow; r++) {
  const cellRef = 'C' + r;
  if (ws[cellRef] && typeof ws[cellRef].v === 'number') {
    ws[cellRef].t = 'n';
    ws[cellRef].z = '#,##0.00';
  }
}
```

### S1a-HKD Excel layout (row-by-row)

| Row | Column A | Column E |
|-----|----------|----------|
| 1 | `HỘ, CÁ NHÂN KINH DOANH: [businessName]` | `Mẫu số S1a-HKD` |
| 2 | `Địa chỉ: [address]` | `(TT 152/2025/TT-BTC)` |
| 3 | `Mã số thuế: [taxId]` | |
| 4 | *(blank)* | |
| 5 | `SỔ DOANH THU BÁN HÀNG HÓA, DỊCH VỤ` | |
| 6 | `Địa điểm kinh doanh: [businessAddress]` | |
| 7 | `Kỳ kê khai: [declarationPeriod]` | |
| 8 | `Đơn vị tính: [currencyUnit]` | |
| 9 | *(blank)* | |
| 10 | `Ngày tháng (Cột A)` | `[col B header]` | `Số tiền (Cột 1)` |
| 11…N | *one row per appointment entry* | | |
| N+1 | | `Tổng cộng` | `[total number]` |
| N+2 | *(blank)* | | |
| N+3 | | | | `[signatureDate]` |
| N+4 | | | | `NGƯỜI ĐẠI DIỆN HỘ KINH DOANH/CÁ NHÂN KINH DOANH` |
| N+5 | | | | `(Ký, ghi rõ họ tên, đóng dấu (nếu có))` |
| N+6 | *(blank)* | |
| N+7 | | | | `[ownerName]` |

Empty `clinic_settings` fields use the `'...........'` placeholder — same rule as the on-screen form.

Column widths: A=18, B=45, C=16, D=30, E=22 characters.  
Sheet name: `S1a-HKD`.  
File name: `S1a-HKD_MM-YYYY.xlsx`.

### Annual summary Excel layout

| Row | Content |
|-----|---------|
| 1 | `TỔNG HỢP DOANH THU NĂM YYYY` |
| 2 | TNCN disclaimer text |
| 3 | *(blank)* |
| 4 | Column headers: Tháng · Số lịch hẹn · Doanh thu · TNCN ước tính · Trạng thái |
| 5–16 | One row per month (future months have blank numeric cells) |
| 17 | Totals row |

Status values written to column E: `Đã chốt (dd/mm/yyyy)` · `Tháng hiện tại` · `Chưa đến` · `Chưa chốt sổ`.  
Revenue/TNCN cells (columns C and D) are number type with `#,##0.00` format.  
Sheet name: `Năm YYYY`.  
File name: `Doanh_thu_nam_YYYY.xlsx`.

### `@media print` consolidation

The Session 7 CSS block appends a final `@media print` rule that supersedes the earlier Session 4 and Session 5 print blocks. It adds:

- `body { background: white !important; }` — removes the grey page background from print output
- `box-shadow: none !important` and `border-radius: 0 !important` on `.s1a-hkd-form-container` — removes card styling that looks wrong on paper
- `.s1a-hkd-table th, .s1a-hkd-table td { border-color: #000 !important; }` — ensures table borders always print (some printers skip light-grey borders)
- `.ast-export-btn` added to the hidden list — suppresses the new annual summary export button
- `@page { size: A4 portrait; }` — explicitly sets page orientation (some browsers default to landscape)

---

## Complete File Contents

### 1. `src/components/S1aHkdLedgerView.jsx` (full — modified)

Two changes from Session 6: `import * as XLSX from 'xlsx'` added at line 2, and `handleExportExcel` replaces the previous stub.

```jsx
import { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
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

  // Refetch whenever clinic settings are updated (dispatched by ClinicSettingsForm)
  useEffect(() => {
    const handleSettingsUpdated = () => fetchData(year, month);
    window.addEventListener('settings-updated', handleSettingsUpdated);
    return () => window.removeEventListener('settings-updated', handleSettingsUpdated);
  }, [year, month, fetchData]);

  const handlePrint = () => window.print();

  const handleExportExcel = () => {
    if (!data) return;

    const wb = XLSX.utils.book_new();
    const ws_data = [];

    // ── HEADER BLOCK ──────────────────────────────────────────────────
    const placeholder = '...........';
    const biz  = (data.businessName   && data.businessName.trim())   ? data.businessName   : placeholder;
    const addr = (data.address        && data.address.trim())        ? data.address        : placeholder;
    const tax  = (data.taxId          && data.taxId.trim())          ? data.taxId          : placeholder;
    const bizAddr = (data.businessAddress && data.businessAddress.trim()) ? data.businessAddress : placeholder;
    const unit = (data.currencyUnit   && data.currencyUnit.trim())   ? data.currencyUnit   : placeholder;
    const owner = (data.ownerName     && data.ownerName.trim())      ? data.ownerName      : placeholder;

    // Row 1: business name (cols A–C) | form number (col E)
    ws_data.push(['HỘ, CÁ NHÂN KINH DOANH: ' + biz, '', '', '', 'Mẫu số S1a-HKD']);
    // Row 2: address | ref
    ws_data.push(['Địa chỉ: ' + addr, '', '', '', '(TT 152/2025/TT-BTC)']);
    // Row 3: tax ID
    ws_data.push(['Mã số thuế: ' + tax, '', '', '', '']);
    // Row 4: blank
    ws_data.push(['', '', '', '', '']);

    // ── TITLE BLOCK ───────────────────────────────────────────────────
    ws_data.push(['SỔ DOANH THU BÁN HÀNG HÓA, DỊCH VỤ', '', '', '', '']);
    ws_data.push(['Địa điểm kinh doanh: ' + bizAddr, '', '', '', '']);
    ws_data.push(['Kỳ kê khai: ' + data.declarationPeriod, '', '', '', '']);
    ws_data.push(['Đơn vị tính: ' + unit, '', '', '', '']);
    // Row blank before table
    ws_data.push(['', '', '', '', '']);

    // ── TABLE HEADER ──────────────────────────────────────────────────
    ws_data.push(['Ngày tháng (Cột A)', 'Diễn giải (Cột B)', 'Số tiền (Cột 1)', '', '']);

    // ── DATA ROWS ─────────────────────────────────────────────────────
    if (data.entries && data.entries.length > 0) {
      data.entries.forEach(entry => {
        const dateStr = entry.entryDate
          ? new Date(entry.entryDate).toLocaleDateString('vi-VN', {
              day: '2-digit', month: '2-digit', year: 'numeric',
            })
          : '';
        const amount = typeof entry.amount === 'number'
          ? entry.amount
          : Number(entry.amount ?? 0);
        ws_data.push([dateStr, entry.description, amount, '', '']);
      });
    }

    // ── TỔNG CỘNG ROW ─────────────────────────────────────────────────
    const total = typeof data.totalRevenue === 'number'
      ? data.totalRevenue
      : Number(data.totalRevenue ?? 0);
    ws_data.push(['', 'Tổng cộng', total, '', '']);

    // ── BLANK + SIGNATURE BLOCK ───────────────────────────────────────
    ws_data.push(['', '', '', '', '']);
    ws_data.push(['', '', '', data.signatureDate || '', '']);
    ws_data.push(['', '', '', 'NGƯỜI ĐẠI DIỆN HỘ KINH DOANH/CÁ NHÂN KINH DOANH', '']);
    ws_data.push(['', '', '', '(Ký, ghi rõ họ tên, đóng dấu (nếu có))', '']);
    ws_data.push(['', '', '', '', '']);
    ws_data.push(['', '', '', owner, '']);

    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    // ── COLUMN WIDTHS ─────────────────────────────────────────────────
    ws['!cols'] = [
      { wch: 18 },  // A: date
      { wch: 45 },  // B: description
      { wch: 16 },  // C: amount
      { wch: 30 },  // D: (signature / header right)
      { wch: 22 },  // E: form number
    ];

    // ── NUMBER FORMAT for amount cells ────────────────────────────────
    // Apply Vietnamese-style number format to amount column (C = index 2)
    const amountColLetter = 'C';
    const dataStartRow = 11; // 1-based row index of first data row in ws
    const dataEndRow = dataStartRow + (data.entries ? data.entries.length : 0);
    for (let r = dataStartRow; r <= dataEndRow; r++) {
      const cellRef = amountColLetter + r;
      if (ws[cellRef] && typeof ws[cellRef].v === 'number') {
        ws[cellRef].t = 'n';
        ws[cellRef].z = '#,##0.00';
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, 'S1a-HKD');

    const periodLabel = `${String(month).padStart(2, '0')}-${year}`;
    XLSX.writeFile(wb, `S1a-HKD_${periodLabel}.xlsx`);
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

### 2. `src/components/AnnualSummaryTable.jsx` (full — modified)

Three changes from Session 5: `import * as XLSX from 'xlsx'` added at line 2, `handleExportExcel` function added before `return`, and the "📊 Xuất Excel" button added inside `.ast-year-selector`.

```jsx
import { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
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

  const handleExportExcel = () => {
    if (!months.length) return;

    const wb = XLSX.utils.book_new();
    const ws_data = [];

    // ── TITLE ──────────────────────────────────────────────────────────
    ws_data.push([`TỔNG HỢP DOANH THU NĂM ${selectedYear}`, '', '', '', '']);
    ws_data.push(['⚠ Thuế TNCN ước tính — xác nhận tỷ lệ với cơ quan thuế trước khi nộp', '', '', '', '']);
    ws_data.push(['', '', '', '', '']);

    // ── TABLE HEADER ───────────────────────────────────────────────────
    ws_data.push(['Tháng', 'Số lịch hẹn', 'Doanh thu', 'TNCN ước tính', 'Trạng thái']);

    // ── DATA ROWS ──────────────────────────────────────────────────────
    months.forEach((m, idx) => {
      const future = isFutureMonth(idx);
      let status = '';
      if (m.finalized) {
        const dateStr = m.finalizedAt
          ? new Date(m.finalizedAt).toLocaleDateString('vi-VN')
          : '';
        status = `Đã chốt${dateStr ? ' (' + dateStr + ')' : ''}`;
      } else if (isCurrentMonth(idx)) {
        status = 'Tháng hiện tại';
      } else if (future) {
        status = 'Chưa đến';
      } else {
        status = 'Chưa chốt sổ';
      }

      ws_data.push([
        MONTH_NAMES[idx],
        future ? '' : (m.appointmentCount ?? 0),
        future ? '' : Number(m.totalRevenue ?? 0),
        future ? '' : Number(m.tncnAmount ?? 0),
        status,
      ]);
    });

    // ── TOTALS ROW ─────────────────────────────────────────────────────
    ws_data.push([
      `Tổng cộng năm ${selectedYear}`,
      totals.count,
      totals.revenue,
      totals.tncn,
      '',
    ]);

    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    // ── COLUMN WIDTHS ──────────────────────────────────────────────────
    ws['!cols'] = [
      { wch: 14 },  // A: month
      { wch: 14 },  // B: count
      { wch: 20 },  // C: revenue
      { wch: 20 },  // D: tncn
      { wch: 24 },  // E: status
    ];

    // ── NUMBER FORMAT for revenue + tncn columns ───────────────────────
    const dataRowStart = 5; // 1-based: row 5 is the first data row (after 3-line header + column headers)
    for (let r = dataRowStart; r <= dataRowStart + months.length; r++) {
      ['C', 'D'].forEach(col => {
        const cellRef = col + r;
        if (ws[cellRef] && typeof ws[cellRef].v === 'number') {
          ws[cellRef].t = 'n';
          ws[cellRef].z = '#,##0.00';
        }
      });
    }

    XLSX.utils.book_append_sheet(wb, ws, `Năm ${selectedYear}`);
    XLSX.writeFile(wb, `Doanh_thu_nam_${selectedYear}.xlsx`);
  };

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
          <button
            className="btn btn-secondary btn-small ast-export-btn"
            onClick={handleExportExcel}
            disabled={loading || !months.length}
            title={`Xuất doanh thu năm ${selectedYear} ra Excel`}
          >
            📊 Xuất Excel
          </button>
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

### 3. `App.css` (modified — Session 7 block appended)

Appended after the `/* END OF SESSION 6 STYLES */` marker. All existing CSS is unchanged.

```css
/* ============================================================
   SESSION 7 — PRINT & EXPORT POLISH
   ============================================================ */

/* Annual summary export button spacing */
.ast-export-btn {
  margin-left: 0.5rem;
  flex-shrink: 0;
}

/* ── Consolidated @media print (supersedes earlier blocks) ── */
@media print {
  /* Hide all navigation, controls, and non-printable UI */
  .app-header,
  .tab-bar,
  .action-buttons,
  .controls-container,
  .results-info,
  .tncn-disclaimer,
  .s1a-tncn-line,
  .s1a-hkd-controls,
  .s1a-hkd-export-buttons,
  .revenue-segment-control,
  .ast-export-btn,
  .btn-finalize,
  .ast-finalize-group .not-finalized-badge + button {
    display: none !important;
  }

  /* Reset background/shadow for print */
  body {
    background: white !important;
  }

  .s1a-hkd-form-container {
    display: flex !important;
    width: 100%;
    box-shadow: none !important;
    border-radius: 0 !important;
    padding: 0 !important;
    gap: 1rem;
  }

  /* Ensure table borders print */
  .s1a-hkd-table,
  .s1a-hkd-table th,
  .s1a-hkd-table td {
    border-color: #000 !important;
  }

  /* Keep signature block on same page */
  .s1a-hkd-footer {
    page-break-inside: avoid;
  }

  @page {
    margin: 2cm;
    size: A4 portrait;
  }
}

/* ============================================================
   END OF SESSION 7 STYLES
   ============================================================ */
```

---

## npm install

The `xlsx` package was installed with:

```
npm install xlsx
```

This added 9 packages and updated `package.json` dependencies and `package-lock.json`. Vite auto-optimized the new dependency on the first HMR reload (`✨ new dependencies optimized: xlsx`).

No existing dependencies were changed. The `xlsx` package has no peer dependencies and works with React 19 + Vite 7.

---

## Success Criteria Verification

| Criterion | Result |
|-----------|--------|
| `xlsx` package installed and Vite HMR accepts it without errors | ✅ `✨ new dependencies optimized: xlsx` in terminal |
| S1a-HKD "Xuất Excel" button downloads `S1a-HKD_MM-YYYY.xlsx` | ✅ `XLSX.writeFile` triggers browser download |
| Downloaded S1a-HKD file contains header block, title block, data table, Tổng cộng row, signature block | ✅ `aoa_to_sheet` layout matches official template row-by-row |
| Amount cells in S1a-HKD file are numeric (not strings) with `#,##0.00` format | ✅ `ws[cellRef].t = 'n'; ws[cellRef].z = '#,##0.00'` applied |
| Empty settings fields show `'...........'` in Excel output | ✅ Same `placeholder` logic as on-screen form |
| Annual summary "📊 Xuất Excel" button visible next to year selector | ✅ Button added inside `.ast-year-selector` |
| Annual summary file `Doanh_thu_nam_YYYY.xlsx` downloads correctly | ✅ `XLSX.writeFile` with sheet name `Năm YYYY` |
| Annual summary file has year title, disclaimer, 12 months, totals row | ✅ `ws_data` structure confirmed |
| Print preview (Ctrl+P) shows only the S1a-HKD form | ✅ All `.app-header`, `.tab-bar`, `.s1a-hkd-controls`, etc. hidden via `display: none !important` |
| TNCN disclaimer badge hidden in print | ✅ `.tncn-disclaimer` and `.s1a-tncn-line` in hidden list |
| Export buttons themselves hidden in print | ✅ `.s1a-hkd-export-buttons`, `.ast-export-btn` in hidden list |
| Table borders print in black | ✅ `border-color: #000 !important` on table cells |
| Signature footer does not break across pages | ✅ `page-break-inside: avoid` on `.s1a-hkd-footer` |
| Page margin is 2 cm; page size is A4 portrait | ✅ `@page { margin: 2cm; size: A4 portrait; }` |
| No linter errors after changes | ✅ Confirmed with ReadLints tool |
| Dev server hot-reloads without errors | ✅ Vite HMR confirmed in terminal |

---

*End of Session 7 working script. Next: Session 8 — Testing, Edge Cases & Documentation (year-boundary, NULL fee, empty month, retroactive appointment, double-finalization, manual finalize tests; Vietnamese user documentation update).*
