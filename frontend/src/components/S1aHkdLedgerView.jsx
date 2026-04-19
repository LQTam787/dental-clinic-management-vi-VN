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
                    <tr key={idx} className={entry.isBeauty ? 'entry-beauty' : ''}>
                      <td className="s1a-date-cell">
                        {entry.entryDate
                          ? new Date(entry.entryDate).toLocaleDateString('vi-VN', {
                              day: '2-digit', month: '2-digit', year: 'numeric',
                            })
                          : ''}
                      </td>
                      <td className="s1a-desc-cell">
                        {entry.description}
                        {entry.isBeauty && (
                          <span className="beauty-badge screen-only">TM</span>
                        )}
                      </td>
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
              {Number(data.taxableRevenue ?? 0) > 0 && (
                <tr className="s1a-taxable-row screen-only">
                  <td />
                  <td className="s1a-total-label s1a-taxable-label">
                    Trong đó doanh thu chịu thuế TNCN
                  </td>
                  <td className="s1a-amount-cell s1a-taxable-amount">
                    {formatNumber(data.taxableRevenue)}
                  </td>
                </tr>
              )}
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
