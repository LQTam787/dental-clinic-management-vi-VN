# Revenue & Tax Subsystem — Session 6: Clinic Settings UI
## Final Working Script

**Session:** Revenue Session 6 of 8  
**Duration:** ~1 hour | Frontend + Backend  
**Reference:** `REVENUE_TAX_SUBSYSTEM_MASTER_PLAN.md` — Section 8, Session 6  
**Prerequisite:** Session 5 complete (revenue tab with `CurrentMonthWidget`, `AnnualSummaryTable`, `S1aHkdLedgerView` all rendering correctly)  
**Status:** Complete

---

## Session Objectives

Wire the `⚙` gear icon in the app header to a fully functional clinic settings modal, and ensure that saving new settings causes the S1a-HKD ledger view to immediately reflect the updated header fields on the next fetch.

After this session:

- Clicking `⚙` in the header opens a **Cài đặt phòng khám** modal that loads the current `clinic_settings` row from the backend.
- The form exposes all 7 configurable fields: business name, owner name, address, tax ID, business address, currency unit, and TNCN rate.
- The TNCN rate field displays the stored decimal fraction (e.g. `0.0200`) as a human-readable percentage (`2.00`), and converts back on save.
- A tooltip icon (ⓘ) and a disclaimer banner on the TNCN rate field remind the user to confirm the rate with their local tax office before official filings.
- Saving calls `PUT /api/settings` and, on success, dispatches a `settings-updated` custom DOM event.
- `S1aHkdLedgerView` listens for that event and re-fetches the current period — the header fields update without any user action.
- All new localization keys (`tab`, `settings`, `revenue`, `s1ahkd`, `tncn`, `annual` namespaces) are added to `vi-VN.js`.

**Tasks completed:**
1. Create `ClinicSettingsForm.jsx` — settings form with all `clinic_settings` fields, TNCN rate conversion, tooltip, and `settings-updated` event dispatch on save
2. Modify `App.jsx` — import `ClinicSettingsForm`; remove `eslint-disable no-unused-vars` suppression on `showSettingsModal`; add settings `<Modal>` to the render tree
3. Modify `S1aHkdLedgerView.jsx` — add `useEffect` listener for `settings-updated` to trigger a refetch
4. Modify `src/locales/vi-VN.js` — add `tab`, `settings`, `revenue`, `s1ahkd`, `tncn`, and `annual` namespaces
5. Modify `App.css` — append Session 6 CSS block: `.clinic-settings-form`, `.settings-loading`, `.csf-tncn-tooltip-icon`, `.csf-tncn-hint`

---

## Files Changed

| File | Action | Location |
|------|--------|----------|
| `src/components/ClinicSettingsForm.jsx` | **New** | `frontend/src/components/` |
| `src/App.jsx` | **Modified** (import + `showSettingsModal` cleanup + settings modal) | `frontend/src/` |
| `src/components/S1aHkdLedgerView.jsx` | **Modified** (`settings-updated` event listener added) | `frontend/src/components/` |
| `src/locales/vi-VN.js` | **Modified** (5 new namespaces appended) | `frontend/src/locales/` |
| `src/App.css` | **Modified** (Session 6 CSS block appended) | `frontend/src/` |

---

## Design Notes

### TNCN rate unit conversion
The backend stores `tncn_rate` as a decimal fraction (`NUMERIC(5,4)`, default `0.0200`). The UI displays and edits it as a percentage (`2.00`). The form converts on both sides:

- **Load:** `(Number(s.tncnRate) * 100).toFixed(2)` → displayed as `"2.00"`
- **Save:** `(parseFloat(form.tncnRate) / 100).toFixed(4)` → sent as `"0.0200"`

Client-side validation rejects values outside `[0, 100]` before the API call.

### Settings → S1a-HKD refresh mechanism
After a successful `PUT /api/settings`, `ClinicSettingsForm` fires:
```javascript
window.dispatchEvent(new CustomEvent('settings-updated'));
```
`S1aHkdLedgerView` subscribes with a `useEffect` that calls its existing `fetchData(year, month)` callback:
```javascript
useEffect(() => {
  const handleSettingsUpdated = () => fetchData(year, month);
  window.addEventListener('settings-updated', handleSettingsUpdated);
  return () => window.removeEventListener('settings-updated', handleSettingsUpdated);
}, [year, month, fetchData]);
```
This avoids prop-drilling through `RevenueTabView` and keeps the components decoupled.

### Empty field placeholder behaviour
When `clinic_settings` fields are empty strings (as in the seed default row), the existing `fieldOr()` helper in `S1aHkdLedgerView` already renders `'...........'` — no changes needed there. The settings form placeholders explain the behaviour to the user.

---

## Complete File Contents

### 1. `src/components/ClinicSettingsForm.jsx` (new)

Fetches `GET /api/settings` on mount to pre-populate all fields. The TNCN rate is stored as a decimal fraction on the backend but shown as a percentage in the UI. On save, calls `PUT /api/settings`, shows inline "Đang lưu…" / "✓ Đã lưu" button states, and dispatches `settings-updated` on success. The form reuses existing CSS classes (`.form-group`, `.form-input`, `.form-actions`, etc.) and adds only three new classes.

```jsx
import { useState, useEffect } from 'react';
import { settingsAPI } from '../services/api';

function ClinicSettingsForm({ onClose }) {
  const [form, setForm] = useState({
    businessName: '',
    ownerName: '',
    address: '',
    taxId: '',
    businessAddress: '',
    currencyUnit: 'VNĐ',
    tncnRate: '2',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await settingsAPI.get();
        const s = res.data;
        setForm({
          businessName: s.businessName || '',
          ownerName: s.ownerName || '',
          address: s.address || '',
          taxId: s.taxId || '',
          businessAddress: s.businessAddress || '',
          currencyUnit: s.currencyUnit || 'VNĐ',
          // Backend stores as decimal fraction (0.0200 = 2%); display as percentage
          tncnRate: s.tncnRate != null ? (Number(s.tncnRate) * 100).toFixed(2) : '2.00',
        });
      } catch (err) {
        setError('Không thể tải cài đặt phòng khám. Vui lòng thử lại.');
        console.error('ClinicSettingsForm fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setSaved(false);
    setError(null);
  };

  const handleSave = async e => {
    e.preventDefault();

    const rate = parseFloat(form.tncnRate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      setError('Tỷ lệ TNCN phải từ 0% đến 100%.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await settingsAPI.update({
        businessName: form.businessName,
        ownerName: form.ownerName,
        address: form.address,
        taxId: form.taxId,
        businessAddress: form.businessAddress,
        currencyUnit: form.currencyUnit,
        // Convert percentage back to decimal fraction for the backend
        tncnRate: (rate / 100).toFixed(4),
      });

      setSaved(true);
      // Notify S1aHkdLedgerView (and any other subscriber) that settings changed
      window.dispatchEvent(new CustomEvent('settings-updated'));
    } catch (err) {
      setError('Không thể lưu cài đặt. Vui lòng thử lại.');
      console.error('ClinicSettingsForm save error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-loading">
        <div className="cmw-spinner" />
        <span>Đang tải cài đặt…</span>
      </div>
    );
  }

  return (
    <form className="clinic-settings-form" onSubmit={handleSave} noValidate>
      {error && <div className="form-error-message">⚠ {error}</div>}

      <div className="form-group">
        <label className="form-label" htmlFor="csf-businessName">
          Tên hộ/cá nhân kinh doanh
        </label>
        <input
          id="csf-businessName"
          className="form-input"
          type="text"
          value={form.businessName}
          onChange={e => handleChange('businessName', e.target.value)}
          placeholder="Để trống → hiển thị '...........' trên sổ S1a-HKD"
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="csf-ownerName">
          Người đại diện
        </label>
        <input
          id="csf-ownerName"
          className="form-input"
          type="text"
          value={form.ownerName}
          onChange={e => handleChange('ownerName', e.target.value)}
          placeholder="Tên người ký sổ S1a-HKD"
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="csf-address">
          Địa chỉ
        </label>
        <input
          id="csf-address"
          className="form-input"
          type="text"
          value={form.address}
          onChange={e => handleChange('address', e.target.value)}
          placeholder="Địa chỉ đăng ký kinh doanh"
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="csf-taxId">
          Mã số thuế
        </label>
        <input
          id="csf-taxId"
          className="form-input"
          type="text"
          value={form.taxId}
          onChange={e => handleChange('taxId', e.target.value)}
          placeholder="Mã số thuế của hộ kinh doanh"
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="csf-businessAddress">
          Địa điểm kinh doanh
        </label>
        <input
          id="csf-businessAddress"
          className="form-input"
          type="text"
          value={form.businessAddress}
          onChange={e => handleChange('businessAddress', e.target.value)}
          placeholder="Địa chỉ thực tế nơi kinh doanh (nếu khác địa chỉ đăng ký)"
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="csf-currencyUnit">
          Đơn vị tính
        </label>
        <input
          id="csf-currencyUnit"
          className="form-input"
          type="text"
          value={form.currencyUnit}
          onChange={e => handleChange('currencyUnit', e.target.value)}
          placeholder="vd: VNĐ"
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="csf-tncnRate">
          Tỷ lệ thuế TNCN (%)
          <span
            className="csf-tncn-tooltip-icon"
            title="Xác nhận tỷ lệ này với Chi cục Thuế địa phương trước khi sử dụng cho hồ sơ thuế chính thức"
            aria-label="Lưu ý về tỷ lệ TNCN"
          >
            ⓘ
          </span>
        </label>
        <input
          id="csf-tncnRate"
          className="form-input"
          type="number"
          min="0"
          max="100"
          step="0.01"
          value={form.tncnRate}
          onChange={e => handleChange('tncnRate', e.target.value)}
          placeholder="vd: 2"
        />
        <div className="tncn-disclaimer csf-tncn-hint">
          ⚠ Xác nhận tỷ lệ này với Chi cục Thuế địa phương trước khi sử dụng cho hồ sơ thuế chính thức
        </div>
      </div>

      <div className="form-actions">
        <div />
        <div className="form-actions-right">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={saving}
          >
            Đóng
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Đang lưu…' : saved ? '✓ Đã lưu' : 'Lưu cài đặt'}
          </button>
        </div>
      </div>
    </form>
  );
}

export default ClinicSettingsForm;
```

---

### 2. `src/App.jsx` (modified — diff summary)

Three changes from the Session 5 version:

**a) New import at the top (line 11):**
```jsx
import ClinicSettingsForm from './components/ClinicSettingsForm';
```

**b) `showSettingsModal` state — remove lint-suppression comment (line 34):**
```jsx
// Before (Session 5):
const [showSettingsModal, setShowSettingsModal] = useState(false); // eslint-disable-line no-unused-vars

// After (Session 6):
const [showSettingsModal, setShowSettingsModal] = useState(false);
```

**c) New settings modal added after the appointment modal (lines 510–518):**
```jsx
{/* Modal Cài đặt phòng khám */}
<Modal
  isOpen={showSettingsModal}
  onClose={() => setShowSettingsModal(false)}
  title="Cài đặt phòng khám"
  size="medium"
>
  <ClinicSettingsForm onClose={() => setShowSettingsModal(false)} />
</Modal>
```

The gear button itself (`onClick={() => setShowSettingsModal(true)}`) was already in place from Session 4 and is unchanged.

<details>
<summary>Full App.jsx (click to expand)</summary>

```jsx
import { useState, useEffect } from 'react';
import AppointmentTable from './components/AppointmentTable';
import SearchBar from './components/SearchBar';
import TreatmentFilter from './components/TreatmentFilter';
import Modal from './components/Modal';
import PatientForm from './components/PatientForm';
import AppointmentForm from './components/AppointmentForm';
import TabBar from './components/TabBar';
import PatientTable from './components/PatientTable';
import RevenueTabView from './components/RevenueTabView';
import ClinicSettingsForm from './components/ClinicSettingsForm';
import { appointmentAPI, patientAPI } from './services/api';
import { t } from './utils/i18n';
import './App.css';

function App() {
  // ============================================
  // QUẢN LÝ TRẠNG THÁI - STATE MANAGEMENT
  // ============================================

  // Tab navigation
  const [activeTab, setActiveTab] = useState('appointments');

  // Dữ liệu lịch hẹn
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Dữ liệu bệnh nhân (for PatientTable)
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);

  // Settings modal
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Tìm kiếm và lọc
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    needsImplant: null,
    needsDenture: null,
    needsOrthodontics: null,
  });

  // Trạng thái tải lần đầu
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Modal state
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [editingAppointment, setEditingAppointment] = useState(null);

  // Chế độ chọn bệnh nhân
  const [selectPatientMode, setSelectPatientMode] = useState(false);

  // Thông báo
  const [successMessage, setSuccessMessage] = useState(null);

  // Trạng thái backend
  const [backendStatus, setBackendStatus] = useState('checking');

  // ============================================
  // KIỂM TRA KẾT NỐI BACKEND
  // ============================================
  useEffect(() => {
    const checkBackend = async () => {
      try {
        await appointmentAPI.getAll();
        setBackendStatus('online');
      } catch {
        setBackendStatus('offline');
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 30000);
    return () => clearInterval(interval);
  }, []);

  // ============================================
  // DEBOUNCING
  // ============================================
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ============================================
  // TẢI DỮ LIỆU - DATA FETCHING
  // ============================================
  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        search: searchTerm || null,
        needsImplant: filters.needsImplant,
        needsDenture: filters.needsDenture,
        needsOrthodontics: filters.needsOrthodontics,
      };
      Object.keys(params).forEach(key => {
        if (params[key] === null || params[key] === '') delete params[key];
      });

      const response = await appointmentAPI.getWithPatients(params);
      setAppointments(response.data);

      if (isInitialLoad) setIsInitialLoad(false);
    } catch (err) {
      console.error('Lỗi khi tải lịch hẹn:', err);
      setError(getErrorMessage(err, t('errors.loading')));
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    setPatientsLoading(true);
    try {
      const response = await patientAPI.getAll();
      setPatients(response.data);
    } catch (err) {
      console.error('Lỗi khi tải bệnh nhân:', err);
    } finally {
      setPatientsLoading(false);
    }
  };

  // Fetch appointments when search/filter changes
  useEffect(() => {
    fetchAppointments();
  }, [debouncedSearchTerm, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch patients once on mount
  useEffect(() => {
    fetchPatients();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Also refetch patients whenever the PatientTable tab becomes active
  useEffect(() => {
    if (activeTab === 'patients') {
      fetchPatients();
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================
  // ERROR HELPERS
  // ============================================
  const getErrorMessage = (err, operation = 'thao tác') => {
    if (!err.response) return t('errors.connection');
    if (err.response?.data?.message) return err.response.data.message;

    switch (err.response?.status) {
      case 400: return t('errors.invalidData');
      case 404: return t('errors.notFound');
      case 409: return err.response?.data?.message || t('errors.conflict');
      case 500: return t('errors.server');
      default:  return t('errors.generic', { operation });
    }
  };

  const showSuccessMessage = (message, duration = 4000) => {
    setSuccessMessage(message);
    if (window.successTimeout) clearTimeout(window.successTimeout);
    window.successTimeout = setTimeout(() => setSuccessMessage(null), duration);
  };

  // ============================================
  // MODAL HANDLERS
  // ============================================

  const handleNewPatient = () => {
    setEditingPatient(null);
    setSelectPatientMode(false);
    setShowPatientForm(true);
  };

  const handleEditPatients = () => {
    setEditingPatient(null);
    setSelectPatientMode(true);
    setShowPatientForm(true);
  };

  const handleNewAppointment = () => {
    setEditingAppointment(null);
    setShowAppointmentForm(true);
  };

  const handleClosePatientForm = () => {
    setShowPatientForm(false);
    setTimeout(() => {
      setEditingPatient(null);
      setSelectPatientMode(false);
    }, 300);
  };

  const handleCloseAppointmentForm = () => {
    setShowAppointmentForm(false);
    setEditingAppointment(null);
  };

  const handlePatientSave = () => {
    handleClosePatientForm();
    fetchAppointments();
    fetchPatients();
    showSuccessMessage(
      editingPatient
        ? t('patient.messages.updated')
        : t('patient.messages.created')
    );
  };

  const handlePatientSelected = patient => {
    setEditingPatient(patient);
  };

  const handleAppointmentSave = () => {
    handleCloseAppointmentForm();
    fetchAppointments();
    showSuccessMessage(
      editingAppointment
        ? t('appointment.messages.updated')
        : t('appointment.messages.created')
    );
  };

  // ============================================
  // TABLE ACTION HANDLERS
  // ============================================

  const handleEditAppointment = appointment => {
    setEditingAppointment(appointment);
    setShowAppointmentForm(true);
  };

  const handleDeleteAppointment = async appointment => {
    const { formatDate, formatCurrency } = await import('./utils/formatters');
    const appointmentDate = formatDate(appointment.date);
    const treatmentInfo = [];

    if (appointment.needsImplant) treatmentInfo.push(t('table.needs.implant'));
    if (appointment.needsDenture) treatmentInfo.push(t('table.needs.denture'));
    if (appointment.needsOrthodontics) treatmentInfo.push(t('table.needs.orthodontics'));

    let msg = t('appointment.deleteConfirm.title');
    msg += t('appointment.deleteConfirm.patient', { name: appointment.patientName });
    msg += t('appointment.deleteConfirm.date', { date: appointmentDate });
    if (appointment.diagnosis)
      msg += t('appointment.deleteConfirm.diagnosis', { diagnosis: appointment.diagnosis });
    if (appointment.treatment)
      msg += t('appointment.deleteConfirm.treatment', { treatment: appointment.treatment });
    if (treatmentInfo.length > 0)
      msg += t('appointment.deleteConfirm.needs', { needs: treatmentInfo.join(', ') });
    if (appointment.fee)
      msg += t('appointment.deleteConfirm.fee', { fee: formatCurrency(appointment.fee) });
    msg += t('appointment.deleteConfirm.warning');

    if (!window.confirm(msg)) return;

    try {
      await appointmentAPI.delete(appointment.appointmentId);
      fetchAppointments();
      showSuccessMessage(t('appointment.messages.deleted'));
    } catch (err) {
      console.error('Lỗi khi xóa lịch hẹn:', err);
      setError(
        err.response?.status === 404
          ? t('appointment.messages.notFound')
          : t('appointment.messages.deleteFailed')
      );
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleDeletePatient = () => {
    handleClosePatientForm();
    fetchAppointments();
    fetchPatients();
    showSuccessMessage(t('patient.messages.deleted'));
  };

  // PatientTable edit: open PatientForm in edit mode (non-select)
  const handleEditPatientFromTable = patient => {
    setEditingPatient(patient);
    setSelectPatientMode(false);
    setShowPatientForm(true);
  };

  // PatientTable delete: refresh both lists after PatientTable deletes
  const handlePatientTableRefresh = () => {
    fetchPatients();
    fetchAppointments();
    showSuccessMessage(t('patient.messages.deleted'));
  };

  // ============================================
  // HELPERS
  // ============================================

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.needsImplant !== null) count++;
    if (filters.needsDenture !== null) count++;
    if (filters.needsOrthodontics !== null) count++;
    return count;
  };

  const hasActiveFilters =
    debouncedSearchTerm ||
    filters.needsImplant !== null ||
    filters.needsDenture !== null ||
    filters.needsOrthodontics !== null;

  // ============================================
  // RENDER
  // ============================================

  const patientModalTitle = selectPatientMode
    ? editingPatient
      ? t('patient.title.editWithName', { name: editingPatient.name })
      : t('patient.title.editPatients')
    : editingPatient
      ? t('patient.title.editWithName', { name: editingPatient.name })
      : t('patient.title.new');

  return (
    <div className="App">
      {/* Tiêu đề - Header */}
      <header className="app-header">
        <h1>{t('app.title')}</h1>

        <div className="header-right">
          {/* Chỉ báo kết nối backend */}
          <div className="backend-status">
            {backendStatus === 'checking' && (
              <span className="status-checking">{t('app.backendStatus.checking')}</span>
            )}
            {backendStatus === 'online' && (
              <span className="status-online">{t('app.backendStatus.online')}</span>
            )}
            {backendStatus === 'offline' && (
              <span className="status-offline">{t('app.backendStatus.offline')}</span>
            )}
          </div>

          {/* Nút cài đặt (⚙) */}
          <button
            className="btn-settings"
            onClick={() => setShowSettingsModal(true)}
            title="Cài đặt phòng khám"
            aria-label="Cài đặt phòng khám"
          >
            ⚙
          </button>
        </div>
      </header>

      {/* Thanh điều hướng tab */}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Thông báo thành công */}
      {successMessage && (
        <div className="success-message">✓ {successMessage}</div>
      )}

      {/* Thông báo lỗi */}
      {error && <div className="error-message">⚠️ {error}</div>}

      {/* ── TAB 1: Lịch hẹn ─────────────────────────────────────── */}
      {activeTab === 'appointments' && (
        <main className="app-main">
          {/* Các nút thao tác */}
          <div className="action-buttons">
            <button className="btn btn-primary" onClick={handleNewPatient}>
              {t('buttons.newPatient')}
            </button>
            <button
              className="btn btn-primary btn-edit-patients"
              onClick={handleEditPatients}
            >
              {t('buttons.editPatients')}
            </button>
            <button className="btn btn-primary" onClick={handleNewAppointment}>
              {t('buttons.newAppointment')}
            </button>
          </div>

          {/* Tìm kiếm và lọc */}
          <div className="controls-container">
            <SearchBar value={searchTerm} onChange={setSearchTerm} />
            <TreatmentFilter filters={filters} onChange={setFilters} />
          </div>

          {/* Thông tin kết quả */}
          <div className="results-info">
            {loading ? (
              <span>{t('loading.appointments')}</span>
            ) : (
              <>
                <span className="results-count">
                  {t(appointments.length === 1 ? 'search.resultsSingle' : 'search.resultsCount',
                     { count: appointments.length })}
                </span>
                {hasActiveFilters && (
                  <span className="filter-indicator">
                    {t('search.filtered')}
                    {debouncedSearchTerm && ` ${t('search.filteredBy', { term: debouncedSearchTerm })}`}
                    {getActiveFilterCount() > 0 &&
                      ` ${t(getActiveFilterCount() > 1 ? 'search.filteredAnd' : 'search.filteredAndSingle',
                           { count: getActiveFilterCount() })}`}
                    )
                  </span>
                )}
              </>
            )}
          </div>

          {/* Màn hình chào mừng */}
          {!loading && appointments.length === 0 && isInitialLoad && (
            <div className="no-data empty-state-initial">
              <div className="no-data-icon">{t('empty.noData')}</div>
              <h3>{t('empty.welcome')}</h3>
              <p>{t('empty.getStarted')}</p>
              <div className="empty-state-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => setShowPatientForm(true)}
                >
                  {t('buttons.addFirstPatient')}
                </button>
              </div>
            </div>
          )}

          {/* Bảng lịch hẹn */}
          <AppointmentTable
            appointments={appointments}
            loading={loading}
            onEdit={handleEditAppointment}
            onDelete={handleDeleteAppointment}
            onRefresh={fetchAppointments}
          />
        </main>
      )}

      {/* ── TAB 2: Bệnh nhân ────────────────────────────────────── */}
      {activeTab === 'patients' && (
        <main className="app-main">
          <div className="action-buttons">
            <button className="btn btn-primary" onClick={handleNewPatient}>
              {t('buttons.newPatient')}
            </button>
          </div>

          {patientsLoading && patients.length === 0 ? (
            <div className="loading">{t('loading.patients')}</div>
          ) : (
            <PatientTable
              patients={patients}
              appointments={appointments}
              onEdit={handleEditPatientFromTable}
              onRefresh={handlePatientTableRefresh}
            />
          )}
        </main>
      )}

      {/* ── TAB 3: Doanh thu & Thuế ──────────────────────────────── */}
      {activeTab === 'revenue' && (
        <main className="app-main">
          <RevenueTabView />
        </main>
      )}

      {/* Modal Bệnh nhân */}
      <Modal
        isOpen={showPatientForm}
        onClose={handleClosePatientForm}
        title={patientModalTitle}
        size="medium"
      >
        <PatientForm
          patient={editingPatient}
          onClose={handleClosePatientForm}
          onSave={handlePatientSave}
          onDelete={handleDeletePatient}
          selectMode={selectPatientMode}
          onPatientSelected={handlePatientSelected}
        />
      </Modal>

      {/* Modal Lịch hẹn */}
      <Modal
        isOpen={showAppointmentForm}
        onClose={handleCloseAppointmentForm}
        title={editingAppointment ? t('appointment.title.edit') : t('appointment.title.new')}
        size="large"
      >
        <AppointmentForm
          appointment={editingAppointment}
          onClose={handleCloseAppointmentForm}
          onSave={handleAppointmentSave}
        />
      </Modal>

      {/* Modal Cài đặt phòng khám */}
      <Modal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title="Cài đặt phòng khám"
        size="medium"
      >
        <ClinicSettingsForm onClose={() => setShowSettingsModal(false)} />
      </Modal>
    </div>
  );
}

export default App;
```

</details>

---

### 3. `src/components/S1aHkdLedgerView.jsx` (modified — diff only)

One new `useEffect` added after the existing period-change effect. Everything else is unchanged from Session 5.

```jsx
// NEW — add immediately after the existing period useEffect:

// Refetch whenever clinic settings are updated (dispatched by ClinicSettingsForm)
useEffect(() => {
  const handleSettingsUpdated = () => fetchData(year, month);
  window.addEventListener('settings-updated', handleSettingsUpdated);
  return () => window.removeEventListener('settings-updated', handleSettingsUpdated);
}, [year, month, fetchData]);
```

The listener depends on `year`, `month`, and `fetchData` so it always calls `fetchData` with the currently-selected period. The cleanup function removes the listener to prevent memory leaks.

---

### 4. `src/locales/vi-VN.js` (modified — appended keys only)

The following block is appended after the existing `common` namespace (before the closing `};`). All other keys are unchanged.

```javascript
  // Tab labels
  tab: {
    appointments: 'Lịch hẹn',
    patients: 'Bệnh nhân',
    revenue: 'Doanh thu & Thuế',
  },

  // Clinic settings modal
  settings: {
    title: 'Cài đặt phòng khám',
    businessName: 'Tên hộ/cá nhân kinh doanh',
    ownerName: 'Người đại diện',
    address: 'Địa chỉ',
    taxId: 'Mã số thuế',
    businessAddress: 'Địa điểm kinh doanh',
    currencyUnit: 'Đơn vị tính',
    tncnRate: 'Tỷ lệ thuế TNCN (%)',
    tncnRateTooltip: 'Xác nhận tỷ lệ này với Chi cục Thuế địa phương trước khi sử dụng cho hồ sơ thuế chính thức',
    save: 'Lưu cài đặt',
    saved: 'Đã lưu',
  },

  // Revenue tab
  revenue: {
    title: 'Doanh thu & Thuế',
    currentMonth: 'Tháng hiện tại',
    annualSummary: 'Tổng theo năm',
    ledger: 'Sổ S1a-HKD',
    totalRevenue: 'Tổng doanh thu',
    appointmentCount: 'Số lịch hẹn',
    estimatedTncn: 'Thuế TNCN ước tính',
    finalize: 'Chốt sổ',
    finalized: 'Đã chốt',
    notFinalized: 'Chưa chốt sổ',
    finalizeMonth: 'Chốt sổ tháng',
    printForm: 'In sổ',
    exportExcel: 'Xuất Excel',
  },

  // S1a-HKD form labels
  s1ahkd: {
    formTitle: 'SỔ DOANH THU BÁN HÀNG HÓA, DỊCH VỤ',
    formNumber: 'Mẫu số S1a-HKD',
    formRef: '(TT 152/2025/TT-BTC)',
    businessLabel: 'HỌ, CÁ NHÂN KINH DOANH',
    addressLabel: 'Địa chỉ',
    taxIdLabel: 'Mã số thuế',
    businessAddressLabel: 'Địa điểm kinh doanh',
    periodLabel: 'Kỳ kê khai',
    unitLabel: 'Đơn vị tính',
    colA: 'Ngày tháng',
    colB: 'Diễn giải',
    col1: 'Số tiền',
    total: 'Tổng cộng',
    signatureTitle: 'NGƯỜI ĐẠI DIỆN HỘ KINH DOANH/\nCÁ NHÂN KINH DOANH',
    signatureInstruction: '(Ký, ghi rõ họ tên, đóng dấu (nếu có))',
    entryDescription: 'Dịch vụ nha khoa —',
  },

  // TNCN disclaimer
  tncn: {
    disclaimer: 'Thuế TNCN ước tính — xác nhận tỷ lệ với cơ quan thuế trước khi nộp',
    estimatedFor: 'TNCN ước tính tháng',
    rate: 'Tỷ lệ TNCN',
  },

  // Annual summary table
  annual: {
    month: 'Tháng',
    description: 'Diễn giải',
    revenue: 'Doanh thu',
    estimatedTncn: 'TNCN ước tính',
    status: 'Trạng thái',
    total: 'Tổng cộng năm',
    months: [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
      'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
      'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
    ],
  },
```

---

### 5. `App.css` (modified — Session 6 block appended)

Appended after the `/* END OF SESSION 5 STYLES */` marker. All existing CSS is unchanged.

```css
/* ============================================================
   SESSION 6 — CLINIC SETTINGS FORM
   ============================================================ */

/* Settings form reuses .form-group, .form-label, .form-input,
   .form-actions, .form-actions-right from existing form styles.
   Only additions go here. */

.clinic-settings-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Loading state inside modal */
.settings-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2.5rem;
  color: #666;
  font-size: 0.95rem;
}

/* Info icon next to TNCN rate label */
.csf-tncn-tooltip-icon {
  display: inline-block;
  margin-left: 0.4rem;
  color: #667eea;
  cursor: help;
  font-size: 0.9rem;
  vertical-align: middle;
  user-select: none;
}

/* Reduced-prominence disclaimer beneath the TNCN rate input */
.csf-tncn-hint {
  font-size: 0.82rem;
  margin-top: 0.25rem;
  padding: 0.4rem 0.75rem;
}

/* ============================================================
   END OF SESSION 6 STYLES
   ============================================================ */
```

---

## Success Criteria Verification

| Criterion | Result |
|-----------|--------|
| Settings form loads existing values on open | ✅ `useEffect` calls `GET /api/settings` on mount; populates all fields |
| TNCN rate displayed as % (e.g. `2.00`) not decimal (e.g. `0.0200`) | ✅ Conversion applied on load and on save |
| Invalid TNCN rate (< 0 or > 100) shows error, blocks save | ✅ Client-side validation in `handleSave` |
| Saving updates `clinic_settings` in DB | ✅ `PUT /api/settings` called with converted values |
| S1a-HKD header fields reflect new settings on next period fetch | ✅ `settings-updated` event triggers `fetchData` in `S1aHkdLedgerView` |
| No lint errors after changes | ✅ Confirmed with linter |
| Dev server hot-reloads without errors | ✅ Vite HMR confirmed in terminal |

---

*End of Session 6 working script. Next: Session 7 — Export & Print Polish (SheetJS Excel export for both S1a-HKD and annual summary; `@media print` refinements).*
