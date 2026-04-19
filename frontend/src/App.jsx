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
    isBeauty: null,
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
        isBeauty: filters.isBeauty,
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
    if (filters.isBeauty !== null) count++;
    return count;
  };

  const hasActiveFilters =
    debouncedSearchTerm ||
    filters.needsImplant !== null ||
    filters.needsDenture !== null ||
    filters.needsOrthodontics !== null ||
    filters.isBeauty !== null;

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
