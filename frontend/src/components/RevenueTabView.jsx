import React from 'react';

/**
 * RevenueTabView - Placeholder for Tab 3 (Doanh thu & Thuế)
 * Full implementation in Session 5.
 */
function RevenueTabView() {
  return (
    <div className="revenue-tab-placeholder">
      <div className="revenue-placeholder-card">
        <div className="revenue-placeholder-icon">💰</div>
        <h2>Doanh thu &amp; Thuế</h2>
        <p className="revenue-placeholder-subtitle">
          Mẫu số S1a-HKD — Sổ Doanh thu Bán hàng hóa, Dịch vụ
        </p>
        <p className="revenue-placeholder-note">
          Tính năng này sẽ được triển khai trong phiên tiếp theo.
        </p>
        <div className="revenue-placeholder-features">
          <div className="feature-item">📊 Doanh thu tháng hiện tại</div>
          <div className="feature-item">📅 Tổng hợp theo năm</div>
          <div className="feature-item">📋 Sổ S1a-HKD (TT 152/2025/TT-BTC)</div>
          <div className="feature-item">🖨️ In &amp; xuất Excel</div>
        </div>
      </div>
    </div>
  );
}

export default RevenueTabView;
