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
