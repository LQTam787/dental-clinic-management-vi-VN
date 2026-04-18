import React from 'react';

/**
 * TabBar - Thanh điều hướng tab chính
 *
 * Props:
 *   activeTab   – 'appointments' | 'patients' | 'revenue'
 *   onTabChange – callback(tabId: string)
 */
function TabBar({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'appointments', label: '📅 Lịch hẹn' },
    { id: 'patients',     label: '👤 Bệnh nhân' },
    { id: 'revenue',      label: '💰 Doanh thu & Thuế' },
  ];

  return (
    <nav className="tab-bar" role="tablist" aria-label="Điều hướng chính">
      {tabs.map(tab => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          className={`tab-button${activeTab === tab.id ? ' active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

export default TabBar;
