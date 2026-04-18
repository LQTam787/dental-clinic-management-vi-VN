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
