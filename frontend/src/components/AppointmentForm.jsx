import React, { useState, useEffect } from 'react';
import { appointmentAPI, patientAPI } from '../services/api';
import { t } from '../utils/i18n';
import { parseVietnameseDate, isoToVietnameseDate, isValidVietnameseDate } from '../utils/formatters';

/**
 * AppointmentForm Component - Vietnamese Localized
 * Form lịch hẹn
 *
 * ✅ PROPERLY LOCALIZED - Maintains original UI structure, translates text only
 *
 * Form for creating and editing appointment records.
 *
 * Features:
 * - Create new appointments (when appointment prop is null)
 * - Edit existing appointments (when appointment prop provided)
 * - Patient selection from dropdown
 * - All appointment fields
 * - Treatment need checkboxes
 * - Client-side validation
 * - Error handling
 *
 * @param {Object} props
 * @param {Object|null} props.appointment - Appointment to edit (null for create)
 * @param {Function} props.onClose - Callback to close form
 * @param {Function} props.onSave - Callback after successful save
 */
function AppointmentForm({ appointment, onClose, onSave }) {
  // ============================================
  // STATE MANAGEMENT
  // ============================================

  // Form data state
  const [formData, setFormData] = useState({
    patientId: '',
    date: '',
    diagnosis: '',
    treatment: '',
    needsImplant: false,
    needsDenture: false,
    needsOrthodontics: false,
    isBeauty: false,
    fee: '',
    note: '',
  });

  // List of patients for dropdown
  const [patients, setPatients] = useState([]);

  // Validation errors state
  const [errors, setErrors] = useState({});

  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);

  // Error message
  const [error, setError] = useState(null);

  // ============================================
  // SIDE EFFECTS
  // ============================================

  /**
   * Fetch patients for dropdown on component mount
   */
  useEffect(() => {
    fetchPatients();
  }, []);

  /**
   * Initialize form data when editing
   */
  useEffect(() => {
    if (appointment) {
      setFormData({
        patientId: appointment.patientId || '',
        date: appointment.date ? isoToVietnameseDate(appointment.date) : '',
        diagnosis: appointment.diagnosis || '',
        treatment: appointment.treatment || '',
        needsImplant: appointment.needsImplant || false,
        needsDenture: appointment.needsDenture || false,
        needsOrthodontics: appointment.needsOrthodontics || false,
        isBeauty: appointment.isBeauty || false,
        fee: appointment.fee || '',
        note: appointment.note || '',
      });
    }
  }, [appointment]);

  // ============================================
  // DATA FETCHING
  // ============================================

  /**
   * Fetch all patients for dropdown
   */
  const fetchPatients = async () => {
    setLoadingPatients(true);
    try {
      const response = await patientAPI.getAll();
      setPatients(response.data);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError(t('appointment.messages.loadingPatients'));
    } finally {
      setLoadingPatients(false);
    }
  };

  // ============================================
  // EVENT HANDLERS
  // ============================================

  /**
   * Handle text input changes
   */
  const handleChange = e => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  /**
   * Validate form data
   */
  const validateForm = () => {
    const newErrors = {};

    // Patient is required
    if (!formData.patientId) {
      newErrors.patientId = t('appointment.validation.patientRequired');
    }

    // Date is required and must be valid Vietnamese format
    if (!formData.date) {
      newErrors.date = t('appointment.validation.dateRequired');
    } else if (!isValidVietnameseDate(formData.date)) {
      newErrors.date = 'Ngày không hợp lệ. Vui lòng nhập theo định dạng dd/MM/yyyy';
    } else {
      // Check if date is not in the past (optional - remove if past dates allowed)
      const isoDate = parseVietnameseDate(formData.date);
      const selectedDate = new Date(isoDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        // Only warn, don't prevent (clinic might schedule past appointments)
        // newErrors.date = 'Date cannot be in the past';
      }
    }

    // Fee validation (if provided, must be valid number)
    if (formData.fee && isNaN(parseFloat(formData.fee))) {
      newErrors.fee = t('appointment.validation.feeInvalid');
    } else if (formData.fee && parseFloat(formData.fee) < 0) {
      newErrors.fee = t('appointment.validation.feeInvalid');
    }

    // Diagnosis, treatment, note are optional (no validation)

    return newErrors;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async e => {
    e.preventDefault();

    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Convert Vietnamese date format to ISO format for API
      const isoDate = parseVietnameseDate(formData.date);
      
      // Prepare payload
      const payload = {
        date: isoDate,
        diagnosis: formData.diagnosis || null,
        treatment: formData.treatment || null,
        needsImplant: formData.needsImplant,
        needsDenture: formData.needsDenture,
        needsOrthodontics: formData.needsOrthodontics,
        isBeauty: formData.isBeauty,
        fee: formData.fee ? parseFloat(formData.fee) : null,
        note: formData.note || null,
        patient: {
          id: parseInt(formData.patientId),
        },
      };

      if (appointment) {
        // Edit mode: Update existing appointment
        await appointmentAPI.update(appointment.appointmentId, payload);
      } else {
        // Create mode: Create new appointment
        await appointmentAPI.create(payload);
      }

      // Success! Call onSave callback
      onSave();
    } catch (err) {
      console.error('Error saving appointment:', err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(t('errors.invalidData'));
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <form onSubmit={handleSubmit} className="appointment-form">
      {/* Error Message Display */}
      {error && <div className="form-error-message">⚠️ {error}</div>}

      {/* Patient Selection */}
      <div className="form-group">
        <label htmlFor="patientId" className="form-label">
          {t('appointment.fields.patient')} <span className="required">*</span>
        </label>
        <select
          id="patientId"
          name="patientId"
          className={`form-input ${errors.patientId ? 'error' : ''}`}
          value={formData.patientId}
          onChange={handleChange}
          disabled={loading || loadingPatients || appointment !== null}
        >
          <option value="">
            {loadingPatients 
              ? t('appointment.messages.loadingPatients')
              : t('appointment.fields.patientPlaceholder')}
          </option>
          {patients.map(patient => (
            <option key={patient.id} value={patient.id}>
              {patient.name} - {patient.phone}
            </option>
          ))}
        </select>
        {errors.patientId && (
          <span className="field-error">{errors.patientId}</span>
        )}
        {appointment && (
          <span className="form-hint">
            Không thể thay đổi bệnh nhân khi đang sửa lịch hẹn
          </span>
        )}
      </div>

      {/* Date Field */}
      <div className="form-group">
        <label htmlFor="date" className="form-label">
          {t('appointment.fields.date')} <span className="required">*</span>
        </label>
        <input
          type="text"
          id="date"
          name="date"
          className={`form-input ${errors.date ? 'error' : ''}`}
          value={formData.date}
          onChange={handleChange}
          placeholder="dd/MM/yyyy (ví dụ: 31/12/2025)"
          disabled={loading}
        />
        {errors.date && <span className="field-error">{errors.date}</span>}
        <span className="form-hint">Định dạng: ngày/tháng/năm (dd/MM/yyyy)</span>
      </div>

      {/* Diagnosis Field */}
      <div className="form-group">
        <label htmlFor="diagnosis" className="form-label">
          {t('appointment.fields.diagnosis')}
        </label>
        <input
          type="text"
          id="diagnosis"
          name="diagnosis"
          className="form-input"
          value={formData.diagnosis}
          onChange={handleChange}
          placeholder={t('appointment.fields.diagnosisPlaceholder')}
          disabled={loading}
        />
      </div>

      {/* Treatment Field */}
      <div className="form-group">
        <label htmlFor="treatment" className="form-label">
          {t('appointment.fields.treatment')}
        </label>
        <input
          type="text"
          id="treatment"
          name="treatment"
          className="form-input"
          value={formData.treatment}
          onChange={handleChange}
          placeholder={t('appointment.fields.treatmentPlaceholder')}
          disabled={loading}
        />
      </div>

      {/* Treatment Needs Checkboxes */}
      <div className="form-group">
        <label className="form-label">{t('appointment.fields.treatmentNeeds')}</label>
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="needsImplant"
              checked={formData.needsImplant}
              onChange={handleChange}
              disabled={loading}
            />
            <span>{t('appointment.fields.needsImplant')}</span>
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              name="needsDenture"
              checked={formData.needsDenture}
              onChange={handleChange}
              disabled={loading}
            />
            <span>{t('appointment.fields.needsDenture')}</span>
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              name="needsOrthodontics"
              checked={formData.needsOrthodontics}
              onChange={handleChange}
              disabled={loading}
            />
            <span>{t('appointment.fields.needsOrthodontics')}</span>
          </label>
        </div>
      </div>

      {/* Beauty / Taxable Checkbox */}
      <div className="form-group">
        <label className="form-label">Loại dịch vụ</label>
        <div className="checkbox-group">
          <label className="checkbox-label checkbox-label--beauty">
            <input
              type="checkbox"
              name="isBeauty"
              checked={formData.isBeauty}
              onChange={handleChange}
              disabled={loading}
            />
            <span>{t('appointment.fields.isBeauty')}</span>
          </label>
        </div>
        <span className="form-hint">
          Chỉ dịch vụ thẩm mỹ mới được tính thuế TNCN. Điều trị nha khoa được miễn thuế.
        </span>
      </div>

      {/* Fee Field */}
      <div className="form-group">
        <label htmlFor="fee" className="form-label">
          {t('appointment.fields.fee')}
        </label>
        <input
          type="number"
          id="fee"
          name="fee"
          className={`form-input ${errors.fee ? 'error' : ''}`}
          value={formData.fee}
          onChange={handleChange}
          placeholder={t('appointment.fields.feePlaceholder')}
          step="0.01"
          min="0"
          disabled={loading}
        />
        {errors.fee && <span className="field-error">{errors.fee}</span>}
      </div>

      {/* Note Field */}
      <div className="form-group">
        <label htmlFor="note" className="form-label">
          {t('table.headers.note')}
        </label>
        <textarea
          id="note"
          name="note"
          className="form-input"
          value={formData.note}
          onChange={handleChange}
          placeholder="Ghi chú hoặc nhận xét bổ sung"
          rows="3"
          disabled={loading}
        />
      </div>

      {/* Form Actions */}
      <div className="form-actions">
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
          disabled={loading || loadingPatients}
        >
          {loading
            ? t('loading.saving')
            : appointment
              ? 'Cập nhật lịch hẹn'
              : 'Tạo lịch hẹn'}
        </button>
      </div>
    </form>
  );
}

export default AppointmentForm;
