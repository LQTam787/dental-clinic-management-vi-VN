import React, { useState, useEffect } from 'react';
import { patientAPI, appointmentAPI } from '../services/api';
import { t, getLocalizedErrorMessage } from '../utils/i18n';
import { isValidVietnamesePhone } from '../utils/formatters';

/**
 * PatientForm - Vietnamese Localized
 * Form bệnh nhân
 *
 * ✅ PROPERLY LOCALIZED - Maintains original UI structure, translates text only
 *
 * Modes
 * ──────
 * 1. CREATE   – selectMode=false, patient=null   → blank form, POST on save
 * 2. EDIT     – selectMode=false, patient={…}    → pre-filled, PUT on save
 * 3. SELECT   – selectMode=true, patient starts null
 *              → dropdown shown first; once a patient is picked the form
 *                fills in and the user can update or delete.
 *
 * Props
 * ──────
 * patient            – patient object to edit, or null
 * onClose            – close the modal
 * onSave             – called after a successful create or update
 * onDelete           – called after a successful delete
 * selectMode         – if true, show the patient-selection dropdown
 * onPatientSelected  – callback(patient) when user picks from dropdown
 */
function PatientForm({
  patient,
  onClose,
  onSave,
  onDelete,
  selectMode = false,
  onPatientSelected,
}) {
  // ============================================================
  // FORM DATA
  // ============================================================
  const [formData, setFormData] = useState({
    name: '',
    birthYear: '',
    gender: '',
    phone: '',
    address: '',
  });

  // ============================================================
  // SELECT-MODE STATE  (only used when selectMode === true)
  // ============================================================
  const [patients, setPatients] = useState([]); // dropdown options
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');

  // ============================================================
  // VALIDATION / SUBMISSION STATE
  // ============================================================
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cascade-warning state
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [loadingCount, setLoadingCount] = useState(false);

  // ============================================================
  // EFFECTS
  // ============================================================

  /** If selectMode is on, fetch the patient list for the dropdown */
  useEffect(() => {
    if (selectMode) {
      fetchPatientList();
    }
  }, [selectMode]);

  /**
   * Whenever `patient` changes (either passed in directly OR set after
   * the user picks one from the dropdown), populate the form.
   */
  useEffect(() => {
    if (patient) {
      setFormData({
        name: patient.name || '',
        birthYear: patient.birthYear || '',
        gender: patient.gender || '',
        phone: patient.phone || '',
        address: patient.address || '',
      });
      fetchAppointmentCount(patient.id);
    } else if (!selectMode) {
      // CREATE mode: keep form blank
      setFormData({
        name: '',
        birthYear: '',
        gender: '',
        phone: '',
        address: '',
      });
    }
  }, [patient, selectMode]);

  // ============================================================
  // DATA FETCHING
  // ============================================================

  /** Load all patients for the select dropdown */
  const fetchPatientList = async () => {
    setLoadingPatients(true);
    try {
      const response = await patientAPI.getAll();
      setPatients(response.data);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError(t('errors.loading'));
    } finally {
      setLoadingPatients(false);
    }
  };

  /** Count appointments for cascade-delete warning */
  const fetchAppointmentCount = async patientId => {
    setLoadingCount(true);
    try {
      const response = await appointmentAPI.getWithPatients({});
      const count = response.data.filter(
        apt => apt.patientId === patientId
      ).length;
      setAppointmentCount(count);
    } catch (err) {
      console.error('Error fetching appointment count:', err);
    } finally {
      setLoadingCount(false);
    }
  };

  // ============================================================
  // SELECT-MODE: dropdown change handler
  // ============================================================
  const handlePatientDropdownChange = e => {
    const id = e.target.value;
    setSelectedPatientId(id);
    setErrors({});
    setError(null);

    if (!id) {
      // User chose the placeholder — clear the form
      setFormData({
        name: '',
        birthYear: '',
        gender: '',
        phone: '',
        address: '',
      });
      setAppointmentCount(0);
      if (onPatientSelected) onPatientSelected(null);
      return;
    }

    // Find the full patient object from the already-fetched list
    const chosen = patients.find(p => String(p.id) === String(id));
    if (chosen && onPatientSelected) {
      onPatientSelected(chosen); // lift selection up to App so it has the id
    }
  };

  // ============================================================
  // FORM HANDLERS
  // ============================================================
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t('patient.validation.nameRequired');
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t('patient.validation.nameMinLength');
    }

    if (!formData.birthYear) {
      newErrors.birthYear = t('patient.validation.birthYearRequired');
    } else {
      const year = parseInt(formData.birthYear);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1900 || year > currentYear) {
        newErrors.birthYear = t('patient.validation.birthYearRange');
      }
    }

    if (!formData.gender) {
      newErrors.gender = t('patient.validation.genderRequired');
    }

    if (formData.phone.trim() && !isValidVietnamesePhone(formData.phone.trim())) {
      newErrors.phone = t('patient.validation.phoneInvalid');
    }

    return newErrors;
  };

  // In select mode, don't allow submission until a patient has been picked
  const validateSelection = () => {
    if (selectMode && !patient) {
      setErrors({ patientSelect: t('patient.fields.selectPlaceholder') });
      return false;
    }
    return true;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateSelection()) return;

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = { ...formData, birthYear: parseInt(formData.birthYear) };

      if (patient) {
        await patientAPI.update(patient.id, payload);
      } else {
        await patientAPI.create(payload);
      }
      onSave();
    } catch (err) {
      console.error('Error saving patient:', err);
      // Use localized error message from backend
      setError(getLocalizedErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // DELETE HANDLER
  // ============================================================
  const handleDelete = async () => {
    let confirmMessage;
    
    if (appointmentCount > 0) {
      if (appointmentCount === 1) {
        confirmMessage = t('patient.deleteConfirm.messageSingle', {
          name: formData.name,
          birthYear: formData.birthYear,
          phone: formData.phone,
          count: appointmentCount
        });
      } else {
        confirmMessage = t('patient.deleteConfirm.message', {
          name: formData.name,
          birthYear: formData.birthYear,
          phone: formData.phone,
          count: appointmentCount
        });
      }
    } else {
      confirmMessage = t('patient.deleteConfirm.messageNoAppointments', {
        name: formData.name,
        birthYear: formData.birthYear,
        phone: formData.phone
      });
    }

    if (!window.confirm(confirmMessage)) return;

    const nameConfirmation = window.prompt(
      `${t('patient.deleteConfirm.title')}\n\n` +
      `Vui lòng nhập "${formData.name}" để xác nhận xóa:`
    );
    
    if (nameConfirmation !== formData.name) {
      alert('Tên bệnh nhân không khớp. Đã hủy xóa.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await patientAPI.delete(patient.id);
      if (onDelete) onDelete();
    } catch (err) {
      console.error('Error deleting patient:', err);
      // Use localized error message from backend
      setError(getLocalizedErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  // Determine whether the form fields should be disabled:
  //   • During any API call → always disabled
  //   • In select mode before the user picks a patient → disabled
  const formDisabled = loading || (selectMode && !patient);

  return (
    <form onSubmit={handleSubmit} className="patient-form">
      {/* ── Global error banner ─────────────────────────── */}
      {error && <div className="form-error-message">⚠️ {error}</div>}

      {/* ── PATIENT SELECTION DROPDOWN (select mode only) ─ */}
      {selectMode && (
        <div className="patient-select-section">
          <label htmlFor="patientSelect" className="form-label">
            {t('patient.fields.selectPatient')} <span className="required">*</span>
          </label>
          <select
            id="patientSelect"
            className={`form-input patient-select-dropdown ${errors.patientSelect ? 'error' : ''}`}
            value={selectedPatientId}
            onChange={handlePatientDropdownChange}
            disabled={loadingPatients}
          >
            <option value="">
              {loadingPatients 
                ? t('patient.messages.loadingPatients')
                : t('patient.fields.selectPlaceholder')}
            </option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} · {p.phone} · {t('patient.fields.birthYear')} {p.birthYear}
              </option>
            ))}
          </select>
          {errors.patientSelect && (
            <span className="field-error">{errors.patientSelect}</span>
          )}
          {/* Hint text changes based on whether something is selected */}
          <span className="form-hint">
            {patient
              ? t('patient.messages.selectToEdit')
              : t('patient.fields.selectPlaceholder')}
          </span>
        </div>
      )}

      {/* ── Cascade warning (edit mode) ─────── */}
      {patient && appointmentCount > 0 && (
        <div className="form-info-message">
          ℹ️ {t('patient.appointmentCount', { count: appointmentCount })}
          {'. '}
          {appointmentCount === 1
            ? 'Xóa bệnh nhân này sẽ xóa luôn lịch hẹn này.'
            : 'Xóa bệnh nhân này sẽ xóa luôn các lịch hẹn này.'}
        </div>
      )}

      {/* ── Name ────────────────────────────────────────── */}
      <div className="form-group">
        <label htmlFor="name" className="form-label">
          {t('patient.fields.name')} <span className="required">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          className={`form-input ${errors.name ? 'error' : ''}`}
          value={formData.name}
          onChange={handleChange}
          placeholder={t('patient.fields.namePlaceholder')}
          disabled={formDisabled}
        />
        {errors.name && <span className="field-error">{errors.name}</span>}
      </div>

      {/* ── Birth Year ──────────────────────────────────── */}
      <div className="form-group">
        <label htmlFor="birthYear" className="form-label">
          {t('patient.fields.birthYear')} <span className="required">*</span>
        </label>
        <input
          type="number"
          id="birthYear"
          name="birthYear"
          className={`form-input ${errors.birthYear ? 'error' : ''}`}
          value={formData.birthYear}
          onChange={handleChange}
          placeholder={t('patient.fields.birthYearPlaceholder')}
          min="1900"
          max={new Date().getFullYear()}
          disabled={formDisabled}
        />
        {errors.birthYear && (
          <span className="field-error">{errors.birthYear}</span>
        )}
      </div>

      {/* ── Gender ──────────────────────────────────────── */}
      <div className="form-group">
        <label htmlFor="gender" className="form-label">
          {t('patient.fields.gender')} <span className="required">*</span>
        </label>
        <select
          id="gender"
          name="gender"
          className={`form-input ${errors.gender ? 'error' : ''}`}
          value={formData.gender}
          onChange={handleChange}
          disabled={formDisabled}
        >
          <option value="">{t('patient.fields.genderPlaceholder')}</option>
          <option value="Male">{t('patient.fields.genderOptions.male')}</option>
          <option value="Female">{t('patient.fields.genderOptions.female')}</option>
          <option value="Other">{t('patient.fields.genderOptions.other')}</option>
        </select>
        {errors.gender && <span className="field-error">{errors.gender}</span>}
      </div>

      {/* ── Phone ───────────────────────────────────────── */}
      <div className="form-group">
        <label htmlFor="phone" className="form-label">
          {t('patient.fields.phone')} <span className="optional">{t('patient.fields.phoneOptional')}</span>
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          className={`form-input ${errors.phone ? 'error' : ''}`}
          value={formData.phone}
          onChange={handleChange}
          placeholder={t('patient.fields.phonePlaceholder')}
          disabled={formDisabled}
        />
        {errors.phone && <span className="field-error">{errors.phone}</span>}
      </div>

      {/* ── Address ─────────────────────────────────────── */}
      <div className="form-group">
        <label htmlFor="address" className="form-label">
          {t('patient.fields.address')}
        </label>
        <textarea
          id="address"
          name="address"
          className="form-input"
          value={formData.address}
          onChange={handleChange}
          placeholder={t('patient.fields.addressPlaceholder')}
          rows="3"
          disabled={formDisabled}
        />
      </div>

      {/* ── Form actions ────────────────────────────────── */}
      <div className="form-actions">
        {/* Delete button – only shown when editing an existing patient */}
        {patient && (
          <button
            type="button"
            className="btn btn-delete"
            onClick={handleDelete}
            disabled={loading || loadingCount}
          >
            🗑️ {t('buttons.delete')} {t('patient.title.new')}
          </button>
        )}

        <div className="form-actions-right">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            {t('buttons.cancel')}
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || loadingCount || (selectMode && !patient)}
          >
            {loading
              ? t('loading.saving')
              : patient
                ? t('patient.messages.updated').replace('Đã cập nhật bệnh nhân thành công!', 'Cập nhật bệnh nhân')
                : t('patient.messages.created').replace('Đã tạo bệnh nhân thành công!', 'Tạo bệnh nhân')}
          </button>
        </div>
      </div>
    </form>
  );
}

export default PatientForm;
