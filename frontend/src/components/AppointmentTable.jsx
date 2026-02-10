import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import { t } from '../utils/i18n';
import { formatDate, formatCurrency } from '../utils/formatters';

/**
 * AppointmentTable Component - Vietnamese Localized
 * Bảng lịch hẹn
 *
 * Displays appointments with patient information in a table.
 * Enhanced with Edit and Delete action buttons.
 *
 * ✅ PROPERLY LOCALIZED - Maintains original UI structure, translates text only
 *
 * @param {Object} props
 * @param {Array} props.appointments - Array of appointment objects
 * @param {boolean} props.loading - Loading state
 * @param {Function} props.onEdit - Callback when edit button clicked
 * @param {Function} props.onDelete - Callback when delete button clicked
 */
function AppointmentTable({ appointments, loading, onEdit, onDelete }) {
  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  /**
   * Truncate long text with ellipsis
   */
  const truncateText = (text, maxLength = 30) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading) {
    return <LoadingSpinner message={t('loading.appointments')} />;
  }

  // ============================================
  // EMPTY STATE
  // ============================================
  if (!appointments || appointments.length === 0) {
    return (
      <div className="no-data">
        <div className="no-data-icon">📋</div>
        <h3>{t('table.noData')}</h3>
        <p>{t('table.noResults')}</p>
        <p className="no-data-hint">
          {t('table.tryDifferent')}
        </p>
      </div>
    );
  }

  // ============================================
  // TABLE RENDERING
  // ============================================
  return (
    <div className="appointment-table-container">
      <table className="appointment-table">
        {/* Table Header */}
        <thead>
          <tr>
            <th>{t('table.headers.date')}</th>
            <th>{t('table.headers.patient')}</th>
            <th>{t('table.headers.birthYear')}</th>
            <th>{t('table.headers.gender')}</th>
            <th>{t('table.headers.phone')}</th>
            <th>{t('table.headers.address')}</th>
            <th>{t('table.headers.diagnosis')}</th>
            <th>{t('table.headers.treatment')}</th>
            <th>{t('table.needs.implant')}</th>
            <th>{t('table.needs.denture')}</th>
            <th>{t('table.needs.orthodontics')}</th>
            <th>{t('table.headers.fee')}</th>
            <th>{t('table.headers.note')}</th>
            <th>{t('table.headers.actions')}</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {appointments.map(apt => (
            <tr key={apt.appointmentId}>
              {/* Date - Using Vietnamese formatter */}
              <td>{formatDate(apt.date)}</td>

              {/* Patient Information - WITH TRUNCATION */}
              <td title={apt.patientName} className="truncate-cell">
                {truncateText(apt.patientName, 25)}
              </td>
              <td>{apt.birthYear}</td>
              <td>{apt.gender}</td>
              <td>{apt.phone}</td>
              <td title={apt.address || ''} className="truncate-cell">
                {truncateText(apt.address || t('table.needs.none'), 20)}
              </td>

              {/* Appointment Details - WITH TRUNCATION */}
              <td title={apt.diagnosis || ''} className="truncate-cell">
                {truncateText(apt.diagnosis || t('table.needs.none'), 30)}
              </td>
              <td title={apt.treatment || ''} className="truncate-cell">
                {truncateText(apt.treatment || t('table.needs.none'), 25)}
              </td>

              {/* Treatment Needs */}
              <td className="text-center">{apt.needsImplant ? '✓' : t('table.needs.none')}</td>
              <td className="text-center">{apt.needsDenture ? '✓' : t('table.needs.none')}</td>
              <td className="text-center">
                {apt.needsOrthodontics ? '✓' : t('table.needs.none')}
              </td>

              {/* Fee - Using Vietnamese currency formatter */}
              <td className="fee-cell">
                {apt.fee ? formatCurrency(apt.fee) : t('table.needs.none')}
              </td>

              {/* Note - WITH TRUNCATION */}
              <td title={apt.note || ''} className="truncate-cell">
                {truncateText(apt.note || t('table.needs.none'), 25)}
              </td>

              {/* Actions */}
              <td className="actions-cell">
                <button
                  className="btn btn-small btn-edit"
                  onClick={() => onEdit(apt)}
                  title={t('buttons.edit')}
                >
                  ✏️ {t('buttons.edit')}
                </button>
                <button
                  className="btn btn-small btn-delete"
                  onClick={() => onDelete(apt)}
                  title={t('buttons.delete')}
                >
                  🗑️ {t('buttons.delete')}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AppointmentTable;
