/**
 * Vietnamese (Vietnam) - vi-VN Translations
 * Hệ thống Quản lý Phòng khám Nha khoa
 *
 * ✅ PROPERLY STRUCTURED - All keys match component usage
 */

export const viVN = {
  // Application
  app: {
    title: 'Quản lý Phòng khám Nha khoa',
    backendStatus: {
      checking: 'Đang kết nối...',
      online: '● Trực tuyến',
      offline: '● Ngoại tuyến',
    },
  },

  // Buttons
  buttons: {
    newPatient: '➕ Bệnh nhân mới',
    editPatients: '✏️ Sửa bệnh nhân',
    newAppointment: '📅 Lịch hẹn mới',
    save: 'Lưu',
    cancel: 'Hủy',
    delete: 'Xóa',
    edit: 'Sửa',
    close: 'Đóng',
    refresh: 'Làm mới',
    clear: 'Xóa',
    search: 'Tìm kiếm',
    addFirstPatient: '➕ Thêm bệnh nhân đầu tiên',
  },

  // Patient Form
  patient: {
    title: {
      new: 'Bệnh nhân mới',
      edit: 'Sửa bệnh nhân',
      editWithName: 'Sửa bệnh nhân — {name}',
      editPatients: 'Sửa bệnh nhân',
    },
    fields: {
      selectPatient: 'Chọn bệnh nhân',
      selectPlaceholder: 'Chọn một bệnh nhân để sửa hoặc xóa',
      name: 'Họ và tên',
      namePlaceholder: 'Nhập họ tên đầy đủ',
      birthYear: 'Năm sinh',
      birthYearPlaceholder: 'vd: 1990',
      gender: 'Giới tính',
      genderPlaceholder: 'Chọn giới tính',
      genderOptions: {
        male: 'Nam',
        female: 'Nữ',
        other: 'Khác',
      },
      phone: 'Số điện thoại',
      phonePlaceholder: 'vd: 0912345678',
      address: 'Địa chỉ',
      addressPlaceholder: 'Nhập địa chỉ đầy đủ',
    },
    validation: {
      nameRequired: 'Vui lòng nhập họ tên',
      nameMinLength: 'Họ tên phải có ít nhất 2 ký tự',
      birthYearRequired: 'Vui lòng nhập năm sinh',
      birthYearInvalid: 'Năm sinh không hợp lệ',
      birthYearRange: 'Năm sinh phải từ 1900 đến năm hiện tại',
      genderRequired: 'Vui lòng chọn giới tính',
      phoneRequired: 'Vui lòng nhập số điện thoại',
      phoneInvalid: 'Số điện thoại không hợp lệ (10-11 số)',
      addressRequired: 'Vui lòng nhập địa chỉ',
    },
    deleteConfirm: {
      title: 'Xóa bệnh nhân này?',
      message:
        'Bệnh nhân: {name}\nNăm sinh: {birthYear}\nSố điện thoại: {phone}\n\n⚠️ CẢNH BÁO: Thao tác này sẽ:\n• Xóa vĩnh viễn thông tin bệnh nhân\n• Xóa TẤT CẢ {count} lịch hẹn liên quan\n• KHÔNG THỂ KHÔI PHỤC\n\nBạn có chắc chắn muốn tiếp tục?',
      messageSingle:
        'Bệnh nhân: {name}\nNăm sinh: {birthYear}\nSố điện thoại: {phone}\n\n⚠️ CẢNH BÁO: Thao tác này sẽ:\n• Xóa vĩnh viễn thông tin bệnh nhân\n• Xóa {count} lịch hẹn liên quan\n• KHÔNG THỂ KHÔI PHỤC\n\nBạn có chắc chắn muốn tiếp tục?',
      messageNoAppointments:
        'Bệnh nhân: {name}\nNăm sinh: {birthYear}\nSố điện thoại: {phone}\n\nThao tác này không thể hoàn tác.\nBạn có chắc chắn muốn xóa bệnh nhân này?',
    },
    messages: {
      created: 'Đã tạo bệnh nhân thành công!',
      updated: 'Đã cập nhật bệnh nhân thành công!',
      deleted: 'Đã xóa bệnh nhân và các lịch hẹn liên quan thành công!',
      loadingPatients: 'Đang tải danh sách bệnh nhân...',
      noPatients: 'Chưa có bệnh nhân nào',
      selectToEdit: 'Chọn một bệnh nhân ở trên để sửa hoặc xóa',
    },
    appointmentCount: '{count} lịch hẹn',
    appointmentCountLoading: 'Đang kiểm tra lịch hẹn...',
  },

  // Appointment Form
  appointment: {
    title: {
      new: 'Lịch hẹn mới',
      edit: 'Sửa lịch hẹn',
    },
    fields: {
      patient: 'Bệnh nhân',
      patientPlaceholder: 'Chọn bệnh nhân',
      date: 'Ngày hẹn',
      diagnosis: 'Chẩn đoán',
      diagnosisPlaceholder: 'Nhập chẩn đoán',
      treatment: 'Điều trị',
      treatmentPlaceholder: 'Nhập phương pháp điều trị',
      fee: 'Chi phí (₫)',
      feePlaceholder: 'Nhập chi phí',
      treatmentNeeds: 'Nhu cầu điều trị',
      needsImplant: 'Cần Implant',
      needsDenture: 'Cần hàm giả',
      needsOrthodontics: 'Cần chỉnh nha',
    },
    validation: {
      patientRequired: 'Vui lòng chọn bệnh nhân',
      dateRequired: 'Vui lòng chọn ngày hẹn',
      diagnosisRequired: 'Vui lòng nhập chẩn đoán',
      treatmentRequired: 'Vui lòng nhập điều trị',
      feeRequired: 'Vui lòng nhập chi phí',
      feeInvalid: 'Chi phí phải là số dương',
    },
    deleteConfirm: {
      title: 'Xóa lịch hẹn này?\n\n',
      patient: 'Bệnh nhân: {name}\n',
      date: 'Ngày: {date}\n',
      diagnosis: 'Chẩn đoán: {diagnosis}\n',
      treatment: 'Điều trị: {treatment}\n',
      needs: 'Cần: {needs}\n',
      fee: 'Chi phí: {fee}\n',
      warning: '\nThao tác này không thể hoàn tác.',
    },
    messages: {
      created: 'Đã tạo lịch hẹn thành công!',
      updated: 'Đã cập nhật lịch hẹn thành công!',
      deleted: 'Đã xóa lịch hẹn thành công!',
      notFound: 'Không tìm thấy lịch hẹn. Có thể đã bị xóa.',
      deleteFailed: 'Không thể xóa lịch hẹn. Vui lòng thử lại.',
      loadingPatients: 'Đang tải danh sách bệnh nhân...',
      noPatients: 'Chưa có bệnh nhân. Vui lòng tạo bệnh nhân trước.',
    },
  },

  // Search - WITH ARIA LABELS
  search: {
    placeholder: 'Tìm theo tên bệnh nhân hoặc số điện thoại...',
    ariaLabel: 'Tìm kiếm lịch hẹn',
    clearAriaLabel: 'Xóa tìm kiếm',
    resultsCount: 'Tìm thấy {count} lịch hẹn',
    resultsSingle: 'Tìm thấy {count} lịch hẹn',
    filtered: '(Đã lọc',
    filteredBy: 'theo "{term}"',
    filteredAnd: 'và {count} điều trị',
    filteredAndSingle: 'và {count} điều trị',
  },

  // Treatment Filter - UPDATED FOR CHECKBOXES
  filter: {
    label: 'Lọc theo điều trị:',
    needsImplant: 'Cần Implant',
    needsDenture: 'Cần hàm giả',
    needsOrthodontics: 'Cần chỉnh nha',
    clearFilters: 'Xóa bộ lọc',
  },

  // Modal - WITH ARIA LABELS
  modal: {
    closeAriaLabel: 'Đóng cửa sổ',
  },

  // Appointment Table
  table: {
    headers: {
      date: 'Ngày hẹn',
      patient: 'Bệnh nhân',
      birthYear: 'Năm sinh',
      gender: 'Giới tính',
      phone: 'Số điện thoại',
      address: 'Địa chỉ',
      diagnosis: 'Chẩn đoán',
      treatment: 'Điều trị',
      needs: 'Cần',
      fee: 'Chi phí',
      note: 'Ghi chú',
      actions: 'Thao tác',
    },
    needs: {
      implant: 'Implant',
      denture: 'Hàm giả',
      orthodontics: 'Chỉnh nha',
      none: '—',
    },
    loading: 'Đang tải...',
    noData: 'Không tìm thấy lịch hẹn nào',
    noResults: 'Không có kết quả phù hợp với tìm kiếm của bạn.',
    tryDifferent: 'Hãy thử từ khóa hoặc bộ lọc khác.',
  },

  // Empty States
  empty: {
    welcome: 'Chào mừng đến với Quản lý Phòng khám Nha khoa!',
    getStarted: 'Bắt đầu bằng cách thêm bệnh nhân đầu tiên và đặt lịch hẹn.',
    noData: '🦷',
  },

  // Error Messages
  errors: {
    loading: 'Lỗi khi tải lịch hẹn',
    connection:
      'Không thể kết nối với máy chủ. Vui lòng kiểm tra kết nối internet và đảm bảo backend đang chạy.',
    invalidData:
      'Dữ liệu không hợp lệ. Vui lòng kiểm tra tất cả các trường và thử lại.',
    notFound: 'Không tìm thấy bản ghi. Có thể đã bị người dùng khác xóa.',
    conflict:
      'Dữ liệu này xung đột với bản ghi hiện có. Vui lòng kiểm tra trùng lặp.',
    server: 'Lỗi máy chủ. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.',
    generic: 'Không thể {operation}. Vui lòng thử lại.',
    duplicatePhone: 'Số điện thoại này đã được sử dụng bởi bệnh nhân khác',
  },

  // Loading
  loading: {
    default: 'Đang tải...',
    appointments: 'Đang tải lịch hẹn...',
    patients: 'Đang tải bệnh nhân...',
    saving: 'Đang lưu...',
    deleting: 'Đang xóa...',
  },

  // Common
  common: {
    yes: 'Có',
    no: 'Không',
    ok: 'OK',
    confirm: 'Xác nhận',
    male: 'Nam',
    female: 'Nữ',
    other: 'Khác',
  },
};

export default viVN;
