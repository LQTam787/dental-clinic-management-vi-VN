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
