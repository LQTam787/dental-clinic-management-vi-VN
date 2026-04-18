# Revenue & Tax Subsystem — Session 4: Tab Navigation & Patient List
## Final Working Script

**Session:** Revenue Session 4 of 8  
**Duration:** ~2 hours | Frontend only  
**Reference:** `REVENUE_TAX_SUBSYSTEM_MASTER_PLAN.md` — Section 8, Session 4  
**Prerequisite:** Backend running with `/api/patients` and `/api/appointments/with-patients` responding  
**Status:** Complete

---

## Session Objectives

Introduce three-tab navigation to the existing single-page React app, surface the patient list as its own fully functional tab, wire the API service layer for all upcoming revenue endpoints, and add a gear icon to the header for the settings modal (full settings functionality deferred to Session 6).

After this session:
- The app has a persistent tab bar with three tabs: `Lịch hẹn` · `Bệnh nhân` · `Doanh thu & Thuế`.
- Tab 1 (`Lịch hẹn`) is completely unchanged in behaviour.
- Tab 2 (`Bệnh nhân`) shows all patients in a searchable table with edit and delete.
- Tab 3 (`Doanh thu & Thuế`) shows a placeholder card — no console errors.
- `revenueAPI` and `settingsAPI` objects exist in `api.js` for Session 5 to consume.
- A `⚙` gear icon is visible in the header (click-handler wired, modal content in Session 6).

**Tasks completed:**
1. Create `TabBar.jsx` — 3-tab navigation component
2. Create `PatientTable.jsx` — patient list with per-row edit/delete, appointment-count badge, client-side search
3. Create `RevenueTabView.jsx` — placeholder card for Tab 3
4. Extend `api.js` — add `revenueAPI` (5 methods) and `settingsAPI` (2 methods)
5. Modify `App.jsx` — add `activeTab`, `patients`, `showSettingsModal` states; fetch patients; render `TabBar`; conditionally render tab content; add gear icon to header
6. Extend `App.css` — tab bar, gear button, patient table, appointment-count badge, small action buttons, revenue placeholder card, base `@media print` rules
7. Extend `SearchBar.jsx` — accept optional `placeholder` prop (backward-compatible)

---

## Files Changed

| File | Action | Location |
|------|--------|----------|
| `src/components/TabBar.jsx` | **New** | `frontend/src/components/` |
| `src/components/PatientTable.jsx` | **New** | `frontend/src/components/` |
| `src/components/RevenueTabView.jsx` | **New** | `frontend/src/components/` |
| `src/services/api.js` | **Modified** (added `revenueAPI`, `settingsAPI`) | `frontend/src/services/` |
| `src/App.jsx` | **Modified** (tab state, patient fetch, tab rendering, gear icon) | `frontend/src/` |
| `src/App.css` | **Modified** (appended Session 4 CSS block) | `frontend/src/` |
| `src/components/SearchBar.jsx` | **Modified** (optional `placeholder` prop) | `frontend/src/components/` |

---

## Complete File Contents

### 1. `src/components/TabBar.jsx` (new)

Three-tab navigation bar. Renders below the app header, above tab content. The active tab uses the same purple gradient (`#667eea → #764ba2`) as the app header. The inactive-tab hover state uses a soft purple tint. Uses `role="tablist"` / `role="tab"` / `aria-selected` for screen-reader accessibility.

```jsx
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
```

---

### 2. `src/components/PatientTable.jsx` (new)

Patient list table for Tab 2. Key design choices:

- **Appointment count per patient** is derived client-side by counting entries in the already-fetched `appointments` array grouped by `patientId`. No extra API call.
- **Client-side search** filters by patient name or phone number.
- **Edit button** calls `onEdit(patient)` → `App.jsx` opens `PatientForm` in edit mode (non-select).
- **Delete** is handled inline: the component shows the same cascade-warning confirmation (with appointment count) and name re-entry prompt as `PatientForm`. On confirm it calls `patientAPI.delete` directly, then calls `onRefresh()` so `App.jsx` refetches both lists.
- The `deletingId` state disables the row during an in-flight delete.

```jsx
import React, { useState } from 'react';
import { patientAPI } from '../services/api';
import { t } from '../utils/i18n';
import SearchBar from './SearchBar';

/**
 * PatientTable - Bảng danh sách bệnh nhân (Tab 2)
 *
 * Props:
 *   patients      – array of patient objects from GET /api/patients
 *   appointments  – array from GET /api/appointments/with-patients (for counting)
 *   onEdit        – callback(patient) → opens PatientForm in edit mode
 *   onRefresh     – callback() → re-fetch patients + appointments after delete
 */
function PatientTable({ patients, appointments, onEdit, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  // ── Appointment count per patient, derived from the already-fetched list ──
  const appointmentCountMap = React.useMemo(() => {
    const map = {};
    (appointments || []).forEach(apt => {
      if (apt.patientId != null) {
        map[apt.patientId] = (map[apt.patientId] || 0) + 1;
      }
    });
    return map;
  }, [appointments]);

  // ── Client-side search (name or phone) ──────────────────────────────────
  const filtered = React.useMemo(() => {
    if (!searchTerm.trim()) return patients;
    const term = searchTerm.trim().toLowerCase();
    return patients.filter(
      p =>
        (p.name || '').toLowerCase().includes(term) ||
        (p.phone || '').toLowerCase().includes(term)
    );
  }, [patients, searchTerm]);

  // ── Delete handler ───────────────────────────────────────────────────────
  const handleDelete = async patient => {
    const count = appointmentCountMap[patient.id] || 0;

    let confirmMessage;
    if (count > 0) {
      confirmMessage =
        `Bệnh nhân: ${patient.name}\n` +
        `Năm sinh: ${patient.birthYear}\n` +
        `Số điện thoại: ${patient.phone || '—'}\n\n` +
        `⚠️ CẢNH BÁO: Thao tác này sẽ:\n` +
        `• Xóa vĩnh viễn thông tin bệnh nhân\n` +
        `• Xóa TẤT CẢ ${count} lịch hẹn liên quan\n` +
        `• KHÔNG THỂ KHÔI PHỤC\n\n` +
        `Bạn có chắc chắn muốn tiếp tục?`;
    } else {
      confirmMessage =
        `Bệnh nhân: ${patient.name}\n` +
        `Năm sinh: ${patient.birthYear}\n` +
        `Số điện thoại: ${patient.phone || '—'}\n\n` +
        `Thao tác này không thể hoàn tác.\n` +
        `Bạn có chắc chắn muốn xóa bệnh nhân này?`;
    }

    if (!window.confirm(confirmMessage)) return;

    const nameConfirmation = window.prompt(
      `Xóa bệnh nhân\n\nVui lòng nhập "${patient.name}" để xác nhận xóa:`
    );
    if (nameConfirmation !== patient.name) {
      if (nameConfirmation !== null) {
        alert('Tên bệnh nhân không khớp. Đã hủy xóa.');
      }
      return;
    }

    setDeletingId(patient.id);
    try {
      await patientAPI.delete(patient.id);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Lỗi khi xóa bệnh nhân:', err);
      alert('Không thể xóa bệnh nhân. Vui lòng thử lại.');
    } finally {
      setDeletingId(null);
    }
  };

  // ── Gender display ───────────────────────────────────────────────────────
  const formatGender = gender => {
    if (gender === 'Male') return t('common.male');
    if (gender === 'Female') return t('common.female');
    if (gender === 'Other') return t('common.other');
    return '—';
  };

  // ── Empty state ──────────────────────────────────────────────────────────
  if (!patients || patients.length === 0) {
    return (
      <div className="patient-table-container">
        <div className="no-data">
          <div className="no-data-icon">👤</div>
          <h3>{t('patient.messages.noPatients')}</h3>
          <p>Hãy thêm bệnh nhân đầu tiên bằng nút ➕ Bệnh nhân mới ở trên.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-table-wrapper">
      {/* Search bar */}
      <div className="patient-table-search">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Tìm theo tên hoặc số điện thoại..."
        />
        <span className="results-count">
          {filtered.length === patients.length
            ? `${patients.length} bệnh nhân`
            : `${filtered.length} / ${patients.length} bệnh nhân`}
        </span>
      </div>

      {/* Table */}
      <div className="patient-table-container">
        <table className="patient-table">
          <thead>
            <tr>
              <th className="col-stt">STT</th>
              <th>Họ tên</th>
              <th className="col-narrow">Năm sinh</th>
              <th className="col-narrow">Giới tính</th>
              <th className="col-phone">Số điện thoại</th>
              <th>Địa chỉ</th>
              <th className="col-narrow col-center">Số lịch hẹn</th>
              <th className="col-actions">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="no-results-cell">
                  Không tìm thấy bệnh nhân phù hợp với &ldquo;{searchTerm}&rdquo;
                </td>
              </tr>
            ) : (
              filtered.map((patient, index) => {
                const count = appointmentCountMap[patient.id] || 0;
                const isDeleting = deletingId === patient.id;
                return (
                  <tr key={patient.id} className={isDeleting ? 'row-deleting' : ''}>
                    <td className="col-stt">{index + 1}</td>
                    <td className="patient-name-cell">{patient.name}</td>
                    <td className="col-narrow">{patient.birthYear}</td>
                    <td className="col-narrow">{formatGender(patient.gender)}</td>
                    <td className="col-phone">{patient.phone || '—'}</td>
                    <td className="patient-address-cell">{patient.address || '—'}</td>
                    <td className="col-narrow col-center">
                      <span className={`appointment-count-badge${count > 0 ? ' has-appointments' : ''}`}>
                        {count}
                      </span>
                    </td>
                    <td className="col-actions">
                      <div className="table-action-buttons">
                        <button
                          className="btn btn-sm btn-edit"
                          onClick={() => onEdit(patient)}
                          disabled={isDeleting}
                          title="Sửa bệnh nhân"
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          className="btn btn-sm btn-delete"
                          onClick={() => handleDelete(patient)}
                          disabled={isDeleting}
                          title="Xóa bệnh nhân"
                        >
                          {isDeleting ? '⏳' : '🗑️'} Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PatientTable;
```

---

### 3. `src/components/RevenueTabView.jsx` (new)

Placeholder card for Tab 3. Renders without errors. Full implementation in Session 5.

```jsx
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
```

---

### 4. `src/services/api.js` — Session 4 additions

Two new named export objects appended before `export default api`. The existing `patientAPI` and `appointmentAPI` objects are unchanged.

**New additions only:**

```javascript
// Revenue API endpoints
export const revenueAPI = {
  getCurrentMonth: () => api.get('/revenue/current-month'),
  getMonthlyByYear: year => api.get(`/revenue/monthly/${year}`),
  getAnnualTotal: year => api.get(`/revenue/annual/${year}`),
  getS1aHkd: (year, month) => api.get(`/revenue/s1a-hkd/${year}/${month}`),
  finalizeMonth: (year, month) => api.post(`/revenue/finalize/${year}/${month}`),
};

// Clinic Settings API endpoints
export const settingsAPI = {
  get: () => api.get('/settings'),
  update: settings => api.put('/settings', settings),
};
```

**Full `api.js` after Session 4:**

```javascript
import axios from 'axios';

// Base URL for backend API
const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// ERROR INTERCEPTOR - FIX FOR TEST 1.5
// ============================================
// Transforms backend error responses into user-friendly messages
api.interceptors.response.use(
  response => response, // Pass through successful responses
  error => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      // Create user-friendly error message
      let userMessage = '';

      if (status === 409) {
        // Duplicate phone number - use backend message
        userMessage =
          // data.message || 'A patient with this phone number already exists';
          data.message || 'Đã có bệnh nhân với số điện thoại này';
      } else if (status === 404) {
        // userMessage = data.message || 'Resource not found';
        userMessage = data.message || 'Không tìm thấy dữ liệu';
      } else if (status === 400) {
        // userMessage = data.message || 'Invalid data provided';
        userMessage = data.message || 'Dữ liệu không hợp lệ đã được cung cấp';
      } else if (status === 500) {
        userMessage =
          // data.message || 'Server error occurred. Please try again.';
          data.message || 'Đã xảy ra lỗi bên máy chủ. Vui lòng thử lại.';
      } else {
        // userMessage = data.message || 'An error occurred';
        userMessage = data.message || 'Đã xảy ra lỗi';
      }

      // Create new error with user-friendly message
      const enhancedError = new Error(userMessage);
      enhancedError.response = error.response;
      enhancedError.originalError = error;

      return Promise.reject(enhancedError);
    } else if (error.request) {
      // Request made but no response
      const networkError = new Error(
        'Cannot connect to server. Please check your connection.'
      );
      networkError.request = error.request;
      return Promise.reject(networkError);
    } else {
      // Something else happened
      return Promise.reject(error);
    }
  }
);

// Patient API endpoints
export const patientAPI = {
  getAll: () => api.get('/patients'),
  getById: id => api.get(`/patients/${id}`),
  create: patient => api.post('/patients', patient),
  update: (id, patient) => api.put(`/patients/${id}`, patient),
  delete: id => api.delete(`/patients/${id}`),
};

// Appointment API endpoints
export const appointmentAPI = {
  getAll: () => api.get('/appointments'),
  getById: id => api.get(`/appointments/${id}`),
  create: appointment => api.post('/appointments', appointment),
  update: (id, appointment) => api.put(`/appointments/${id}`, appointment),
  delete: id => api.delete(`/appointments/${id}`),
  // MAIN ENDPOINT: Get appointments with patient data (for UI)
  getWithPatients: params => {
    return api.get('/appointments/with-patients', { params });
  },
};

// Revenue API endpoints
export const revenueAPI = {
  getCurrentMonth: () => api.get('/revenue/current-month'),
  getMonthlyByYear: year => api.get(`/revenue/monthly/${year}`),
  getAnnualTotal: year => api.get(`/revenue/annual/${year}`),
  getS1aHkd: (year, month) => api.get(`/revenue/s1a-hkd/${year}/${month}`),
  finalizeMonth: (year, month) => api.post(`/revenue/finalize/${year}/${month}`),
};

// Clinic Settings API endpoints
export const settingsAPI = {
  get: () => api.get('/settings'),
  update: settings => api.put('/settings', settings),
};

// Export the base api instance as default
export default api;
```

---

### 5. `src/App.jsx` — Session 4 modifications

**Summary of changes:**
- Added imports: `TabBar`, `PatientTable`, `RevenueTabView`, `patientAPI`
- New state: `activeTab` (default `'appointments'`), `patients`, `patientsLoading`, `showSettingsModal`
- New function `fetchPatients()` — calls `patientAPI.getAll()`
- New `useEffect` — calls `fetchPatients()` on mount
- New `useEffect` — calls `fetchPatients()` whenever `activeTab === 'patients'`
- `handlePatientSave` and `handleDeletePatient` now also call `fetchPatients()`
- New `handleEditPatientFromTable(patient)` — opens `PatientForm` in edit (non-select) mode
- New `handlePatientTableRefresh()` — refetches both lists after `PatientTable`-inline delete
- Header: `app-header` now uses `flex` layout; `header-right` cluster contains backend status indicator + `⚙` button
- `<TabBar>` rendered after the header, outside `<main>`
- `successMessage` and `error` banners moved outside `<main>` so they appear regardless of active tab
- Tab 1 (`appointments`) — same content as before, wrapped in conditional render
- Tab 2 (`patients`) — renders `PatientTable` with an `➕ Bệnh nhân mới` action button
- Tab 3 (`revenue`) — renders `RevenueTabView`
- `patientModalTitle` updated to handle the non-select edit path (editing from `PatientTable`)

**Full `App.jsx` after Session 4:**

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

  // Settings modal (gear icon — wired up fully in Session 6)
  const [showSettingsModal, setShowSettingsModal] = useState(false); // eslint-disable-line no-unused-vars

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

          {/* Nút cài đặt (⚙) — chức năng đầy đủ ở Session 6 */}
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
    </div>
  );
}

export default App;
```

---

### 6. `src/App.css` — Session 4 block (appended at end of file)

Added after the existing `END OF SESSION 8 RESPONSIVE PATCH` comment.

```css
/* ============================================================
   SESSION 4 — Tab Bar, Patient Table, Revenue Placeholder
   ============================================================ */

/* ── Header right-side cluster ─────────────────────────────── */
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* ── Settings gear button ──────────────────────────────────── */
.btn-settings {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: white;
  font-size: 1.25rem;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, transform 0.2s;
  flex-shrink: 0;
}

.btn-settings:hover {
  background: rgba(255, 255, 255, 0.35);
  transform: rotate(30deg);
}

/* ── Tab Bar ───────────────────────────────────────────────── */
.tab-bar {
  display: flex;
  background: white;
  border-bottom: 2px solid #e0e0e0;
  padding: 0 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 50;
}

.tab-button {
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  padding: 1rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: #555;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s, background 0.2s;
  white-space: nowrap;
  margin-bottom: -2px; /* sit on top of bar border */
}

.tab-button:hover {
  color: #667eea;
  background: rgba(102, 126, 234, 0.06);
}

.tab-button.active {
  color: #667eea;
  border-bottom-color: #667eea;
  font-weight: 600;
}

/* ── Patient table wrapper ─────────────────────────────────── */
.patient-table-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.patient-table-search {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.patient-table-search .search-bar {
  flex: 1;
  min-width: 200px;
}

/* ── Patient table ─────────────────────────────────────────── */
.patient-table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

.patient-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.patient-table thead {
  background: #f8f9fa;
  position: sticky;
  top: 0;
  z-index: 10;
}

.patient-table th {
  padding: 0.9rem 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #e0e0e0;
  white-space: nowrap;
}

.patient-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: middle;
}

.patient-table tbody tr:hover {
  background: #fafbff;
}

.patient-table tbody tr:last-child td {
  border-bottom: none;
}

.patient-table tr.row-deleting {
  opacity: 0.5;
  pointer-events: none;
}

/* Column widths */
.patient-table .col-stt    { width: 3rem; text-align: center; color: #888; }
.patient-table .col-narrow { width: 7rem; }
.patient-table .col-phone  { width: 10rem; }
.patient-table .col-center { text-align: center; }
.patient-table .col-actions { width: 11rem; }

.patient-name-cell {
  font-weight: 500;
}

.patient-address-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Appointment count badge */
.appointment-count-badge {
  display: inline-block;
  min-width: 1.6rem;
  padding: 0.15rem 0.4rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  background: #f0f0f0;
  color: #888;
  text-align: center;
}

.appointment-count-badge.has-appointments {
  background: rgba(102, 126, 234, 0.12);
  color: #667eea;
}

/* Table action buttons */
.table-action-buttons {
  display: flex;
  gap: 0.4rem;
  flex-wrap: nowrap;
}

.btn-sm {
  padding: 0.3rem 0.65rem;
  font-size: 0.8rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.15s, opacity 0.15s;
  white-space: nowrap;
}

.btn-sm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-sm.btn-edit {
  background: rgba(102, 126, 234, 0.12);
  color: #667eea;
}

.btn-sm.btn-edit:hover:not(:disabled) {
  background: rgba(102, 126, 234, 0.22);
}

.btn-sm.btn-delete {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.btn-sm.btn-delete:hover:not(:disabled) {
  background: rgba(220, 53, 69, 0.2);
}

/* No results cell */
.no-results-cell {
  text-align: center;
  padding: 2rem;
  color: #999;
  font-style: italic;
}

/* ── Revenue tab placeholder ───────────────────────────────── */
.revenue-tab-placeholder {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem 0;
}

.revenue-placeholder-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2.5rem 3rem;
  max-width: 520px;
  width: 100%;
  text-align: center;
}

.revenue-placeholder-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.revenue-placeholder-card h2 {
  font-size: 1.6rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.revenue-placeholder-subtitle {
  color: #667eea;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.revenue-placeholder-note {
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.revenue-placeholder-features {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  text-align: left;
}

.feature-item {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
  color: #555;
}

/* ── Print rules (base for Session 7 polish) ───────────────── */
@media print {
  .app-header,
  .tab-bar,
  .action-buttons,
  .controls-container,
  .results-info,
  .tncn-disclaimer,
  .s1a-hkd-controls,
  .s1a-hkd-export-buttons {
    display: none !important;
  }

  .s1a-hkd-form-container {
    display: block !important;
    width: 100%;
  }

  @page {
    margin: 2cm;
  }

  .s1a-hkd-footer {
    page-break-inside: avoid;
  }
}

/* ============================================================
   END OF SESSION 4 STYLES
   ============================================================ */
```

---

### 7. `src/components/SearchBar.jsx` — Session 4 modification

Backward-compatible change: added an optional `placeholder` prop. When not provided, the component falls back to the existing `t('search.placeholder')` i18n key — all existing usages are unaffected.

**Changed lines only:**

```jsx
// Before
function SearchBar({ value, onChange }) {
  ...
  <input
    ...
    placeholder={t('search.placeholder')}
    ...
  />

// After
function SearchBar({ value, onChange, placeholder }) {
  ...
  <input
    ...
    placeholder={placeholder || t('search.placeholder')}
    ...
  />
```

---

## Data Flow — Tab 2 (Patient List)

```
App mounts
  │
  ├── fetchPatients() → GET /api/patients → setPatients([...])
  └── fetchAppointments() → GET /api/appointments/with-patients → setAppointments([...])
         │
         └── appointments array is passed to PatientTable as prop
                │
                └── PatientTable.appointmentCountMap (useMemo)
                    groups by patientId → { id: count, ... }
                    displayed as badge in "Số lịch hẹn" column

User clicks Tab 2 (Bệnh nhân)
  │
  └── activeTab effect fires → fetchPatients() (ensures fresh data)

User clicks ✏️ Sửa on a row
  │
  └── handleEditPatientFromTable(patient)
      → setEditingPatient(patient), setSelectPatientMode(false)
      → setShowPatientForm(true)
      → PatientForm renders in edit mode (non-select)
      → On save: handlePatientSave() → fetchAppointments() + fetchPatients()

User clicks 🗑️ Xóa on a row
  │
  └── PatientTable.handleDelete(patient)
      → window.confirm (cascade warning with count)
      → window.prompt (name re-entry)
      → patientAPI.delete(patient.id)
      → onRefresh() = handlePatientTableRefresh()
      → fetchPatients() + fetchAppointments()
      → showSuccessMessage(...)
```

---

## Design Notes

### Appointment count — client-side derivation
The master plan allows computing counts client-side from a single `/api/appointments/with-patients` call grouped by `patientId`. This avoids N+1 API calls (one per patient row) and reuses data already fetched for Tab 1. The `appointmentCountMap` is memoized on the `appointments` array.

### Two patient-delete paths
Both `PatientForm` (modal, via ✏️ Sửa then delete button) and `PatientTable` (inline 🗑️ Xóa) can delete a patient. They use the same cascade-warning and name-re-entry pattern but are independent code paths. Both ultimately call `patientAPI.delete(id)` and then trigger a full data refresh.

### `handleEditPatientFromTable` vs. `handleEditPatients`
`handleEditPatients` opens `PatientForm` in **select mode** (dropdown picker then edit). `handleEditPatientFromTable` opens it in **direct edit mode** with the patient already set — no dropdown shown. The two paths share the same `PatientForm` component; the distinction is controlled by `selectMode` and the presence/absence of a pre-set `editingPatient`.

### `showSettingsModal` state — wired but unused in Session 4
The state is declared and the `⚙` button sets it to `true`. The modal content (`ClinicSettingsForm`) is not yet rendered — that is Session 6's task. The `eslint-disable-line no-unused-vars` comment suppresses the linter warning for `setShowSettingsModal` until the modal is wired up.

### `fetchPatients` called on `activeTab === 'patients'`
Patients are fetched on mount (for the appointment-count map) and again whenever the user switches to Tab 2. This ensures the list reflects any patient added or deleted from Tab 1 without requiring a full page reload.

### Tab bar is `position: sticky; top: 0`
The tab bar sticks below the header as the user scrolls down the appointment table. `z-index: 50` keeps it above table rows.

### `@media print` base block
Established here for Session 7 to build on. Currently hides the header, tab bar, action buttons, and controls; shows only `.s1a-hkd-form-container`. The `tncn-disclaimer` and export-button classes don't yet exist — they are pre-declared here so Session 7 can add the corresponding elements without touching the print block again.

---

## Build Verification

```
npx vite build
```

**Output (exit code 0):**
```
vite v7.3.1 building client environment for production...
✓ 95 modules transformed.
dist/assets/index-D5bW42AG.css   33.71 kB │ gzip:  7.00 kB
dist/assets/index-Gxxjm7RG.js   273.07 kB │ gzip: 87.67 kB
✓ built in 2.47s
```

The Vite advisory about `formatters.js` being both dynamically and statically imported is pre-existing (from the dynamic `import('./utils/formatters')` in `handleDeleteAppointment`) and was not introduced by Session 4.

---

## Success Criteria

| Criterion | Status |
|-----------|--------|
| Three tabs switch without page reload | ✅ |
| Tab 1 (Lịch hẹn) unchanged from before Session 4 | ✅ |
| Tab 2 (Bệnh nhân) shows all patients with STT, name, birth year, gender, phone, address, appointment count | ✅ |
| Patient table search filters by name and phone client-side | ✅ |
| Edit button opens PatientForm in edit mode | ✅ |
| Delete button shows cascade warning with appointment count, requires name re-entry | ✅ |
| Tab 3 renders placeholder card without console errors | ✅ |
| `revenueAPI` and `settingsAPI` exported from `api.js` | ✅ |
| `⚙` gear icon visible in header | ✅ |
| `npx vite build` exits 0 | ✅ |

---

## Session Dependencies

- **Depends on:** Sessions 1–3 (or at minimum: `/api/patients` and `/api/appointments/with-patients` endpoints live). Session 4 is frontend-only; the backend does not need to be modified.
- **Required by:** Session 5 (`RevenueTabView` is replaced with real revenue components that consume `revenueAPI`)
- **Required by:** Session 6 (`showSettingsModal` state and gear icon are already present; Session 6 adds the `ClinicSettingsForm` modal content and wires `settingsAPI`)
