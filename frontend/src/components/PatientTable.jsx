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
