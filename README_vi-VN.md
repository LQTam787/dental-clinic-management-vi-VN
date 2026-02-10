# Hệ thống Quản lý Phòng khám Nha khoa
## Dental Clinic Management System - Vietnamese (vi-VN) Version

**Phiên bản bản địa hóa Tiếng Việt (Vietnam)**

---

## 📋 Tổng quan - Overview

Đây là phiên bản đã được bản địa hóa hoàn toàn sang Tiếng Việt (vi-VN) của Hệ thống Quản lý Phòng khám Nha khoa. Hệ thống được xây dựng với Spring Boot (Backend) và React (Frontend).

This is the fully localized Vietnamese (vi-VN) version of the Dental Clinic Management System. Built with Spring Boot (Backend) and React (Frontend).

---

## 🌏 Các tính năng Bản địa hóa - Localization Features

### 1. **Giao diện Tiếng Việt - Vietnamese Interface**
- ✅ Tất cả văn bản giao diện đã được dịch sang Tiếng Việt
- ✅ Thông báo lỗi và thành công bằng Tiếng Việt
- ✅ Nhãn form và placeholder bằng Tiếng Việt
- ✅ Nút bấm và menu bằng Tiếng Việt

### 2. **Định dạng Ngày tháng Việt Nam - Vietnamese Date Format**
- ✅ Định dạng: `dd/MM/yyyy` (31/12/2025)
- ✅ Hiển thị ngày theo chuẩn Việt Nam
- ✅ Input date với định dạng phù hợp

### 3. **Định dạng Tiền tệ Việt Nam - Vietnamese Currency**
- ✅ Đơn vị: Đồng Việt Nam (₫)
- ✅ Định dạng: `1.000.000₫` (sử dụng dấu chấm làm phân cách hàng nghìn)
- ✅ Hiển thị theo chuẩn Intl.NumberFormat('vi-VN')

### 4. **Số điện thoại Việt Nam - Vietnamese Phone Numbers**
- ✅ Xác thực số điện thoại Việt Nam (10-11 số)
- ✅ Hỗ trợ các đầu số: 09x, 08x, 07x, 05x, 03x, 02x
- ✅ Định dạng hiển thị: `0xxx xxx xxx`

### 5. **Backend Localization**
- ✅ Thông báo lỗi API bằng Tiếng Việt
- ✅ Validation messages bằng Tiếng Việt
- ✅ Sử dụng Spring MessageSource

---

## 📁 Cấu trúc Dự án - Project Structure

```
dental-clinic-vi-VN/
├── backend/
│   └── src/
│       └── main/
│           ├── java/com/dentalclinic/
│           │   ├── config/
│           │   │   └── GlobalExceptionHandler.java
│           │   ├── controller/
│           │   ├── model/
│           │   ├── repository/
│           │   └── service/
│           └── resources/
│               ├── application.properties
│               └── messages_vi.properties ← Thông báo Tiếng Việt
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── AppointmentForm.jsx
│       │   ├── AppointmentTable.jsx ← Đã bản địa hóa
│       │   ├── PatientForm.jsx
│       │   ├── SearchBar.jsx ← Đã bản địa hóa
│       │   └── TreatmentFilter.jsx ← Đã bản địa hóa
│       ├── locales/
│       │   └── vi-VN.js ← Tệp dịch Tiếng Việt
│       ├── utils/
│       │   ├── formatters.js ← Hàm định dạng Việt Nam
│       │   └── i18n.js ← Helper dịch thuật
│       ├── App.jsx ← Đã bản địa hóa
│       └── main.jsx
│
└── docs/
    └── README_vi-VN.md ← Tài liệu này
```

---

## 🚀 Cài đặt và Chạy - Installation & Running

### Yêu cầu - Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8.0+

### 1. Cài đặt Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Backend sẽ chạy tại: `http://localhost:8080`

### 2. Cấu hình Database

Cập nhật `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/dental_clinic_db
spring.datasource.username=your_username
spring.datasource.password=your_password

# Bản địa hóa
spring.messages.basename=messages
spring.messages.encoding=UTF-8
```

### 3. Cài đặt Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

---

## 💡 Hướng dẫn Sử dụng - Usage Guide

### Tính năng chính - Main Features

#### 1. **Quản lý Bệnh nhân - Patient Management**
- ➕ **Thêm bệnh nhân mới**: Nhấn "Bệnh nhân mới"
- ✏️ **Sửa bệnh nhân**: Nhấn "Sửa bệnh nhân" → Chọn bệnh nhân
- 🗑️ **Xóa bệnh nhân**: Chọn bệnh nhân → Nhấn "Xóa"

#### 2. **Quản lý Lịch hẹn - Appointment Management**
- 📅 **Tạo lịch hẹn**: Nhấn "Lịch hẹn mới"
- ✏️ **Sửa lịch hẹn**: Nhấn biểu tượng ✏️ trong bảng
- 🗑️ **Xóa lịch hẹn**: Nhấn biểu tượng 🗑️ trong bảng

#### 3. **Tìm kiếm và Lọc - Search & Filter**
- 🔍 **Tìm kiếm**: Nhập tên bệnh nhân, chẩn đoán hoặc điều trị
- 📋 **Lọc theo điều trị**: 
  - Implant (Cấy ghép)
  - Hàm giả
  - Chỉnh nha

---

## 🔧 Chi tiết Kỹ thuật - Technical Details

### Frontend Localization System

#### 1. Translation File (`src/locales/vi-VN.js`)
```javascript
export const viVN = {
  app: {
    title: 'Quản lý Phòng khám Nha khoa',
  },
  buttons: {
    newPatient: '➕ Bệnh nhân mới',
    save: 'Lưu',
    cancel: 'Hủy',
  },
  // ... more translations
};
```

#### 2. Translation Helper (`src/utils/i18n.js`)
```javascript
import { t } from './utils/i18n';

// Sử dụng trong component:
<button>{t('buttons.newPatient')}</button>
<h1>{t('app.title')}</h1>
```

#### 3. Formatting Utilities (`src/utils/formatters.js`)

**Ngày tháng - Date:**
```javascript
import { formatDate } from './utils/formatters';

formatDate('2025-12-31') // → "31/12/2025"
```

**Tiền tệ - Currency:**
```javascript
import { formatCurrency } from './utils/formatters';

formatCurrency(1000000) // → "1.000.000₫"
```

**Số điện thoại - Phone:**
```javascript
import { isValidVietnamesePhone } from './utils/formatters';

isValidVietnamesePhone('0912345678') // → true
```

### Backend Localization

#### Exception Messages
Các thông báo lỗi được định nghĩa trong `messages_vi.properties`:

```properties
patient.notFound=Không tìm thấy bệnh nhân với id: {0}
patient.duplicatePhone=Bệnh nhân với số điện thoại này đã tồn tại
```

---

## 📊 Ví dụ Dữ liệu - Sample Data

### Bệnh nhân mẫu - Sample Patients

```json
{
  "name": "Nguyễn Văn A",
  "birthYear": 1990,
  "gender": "Nam",
  "phone": "0912345678",
  "address": "123 Phố Huế, Hai Bà Trưng, Hà Nội"
}
```

### Lịch hẹn mẫu - Sample Appointment

```json
{
  "patientId": 1,
  "date": "2025-12-31",
  "diagnosis": "Sâu răng hàm dưới",
  "treatment": "Trám răng composite",
  "fee": 500000,
  "needsImplant": false,
  "needsDenture": false,
  "needsOrthodontics": false
}
```

---

## 🎨 Các Thành phần Đã Bản địa hóa - Localized Components

### ✅ Đã hoàn thành - Completed
1. **App.jsx** - Component chính
2. **SearchBar.jsx** - Thanh tìm kiếm
3. **TreatmentFilter.jsx** - Bộ lọc điều trị
4. **AppointmentTable.jsx** - Bảng lịch hẹn
5. **vi-VN.js** - Tệp dịch đầy đủ
6. **formatters.js** - Định dạng Việt Nam
7. **i18n.js** - Helper dịch thuật
8. **messages_vi.properties** - Backend messages

### 🔄 Cần bản địa hóa thêm - To be Localized
Các component sau cần áp dụng pattern tương tự:
1. **PatientForm.jsx** - Form bệnh nhân
2. **AppointmentForm.jsx** - Form lịch hẹn
3. **Modal.jsx** - Component modal
4. **LoadingSpinner.jsx** - Spinner tải

### Pattern để Bản địa hóa Components

```jsx
// Import translation utility
import { t } from '../utils/i18n';
import { formatDate, formatCurrency } from '../utils/formatters';

function MyComponent() {
  return (
    <div>
      {/* Thay text bằng t() function */}
      <h1>{t('component.title')}</h1>
      
      {/* Format ngày tháng */}
      <span>{formatDate(appointment.date)}</span>
      
      {/* Format tiền tệ */}
      <span>{formatCurrency(appointment.fee)}</span>
      
      {/* Placeholder */}
      <input placeholder={t('component.placeholder')} />
    </div>
  );
}
```

---

## 🔍 Testing - Kiểm thử

### Test Localization

1. **Date Format Test:**
   - Tạo lịch hẹn với ngày 31/12/2025
   - Kiểm tra hiển thị: "31/12/2025" (không phải "12/31/2025")

2. **Currency Format Test:**
   - Nhập chi phí: 1000000
   - Kiểm tra hiển thị: "1.000.000₫"

3. **Phone Validation Test:**
   - Số hợp lệ: 0912345678, 0987654321
   - Số không hợp lệ: 123456789, 01234567890

4. **UI Text Test:**
   - Kiểm tra tất cả buttons, labels, messages đều bằng Tiếng Việt

---

## 📝 Ghi chú - Notes

### Quy ước đặt tên - Naming Conventions
- **Biến**: camelCase (patientName, birthYear)
- **Component**: PascalCase (PatientForm, AppointmentTable)
- **Translation keys**: dot.notation (patient.title.new)
- **CSS classes**: kebab-case (patient-form, btn-primary)

### Encoding
- **Frontend**: UTF-8 (mặc định cho React/JavaScript)
- **Backend**: UTF-8 (cấu hình trong application.properties)
- **Database**: utf8mb4_unicode_ci

---

## 🤝 Đóng góp - Contributing

Để thêm dịch mới:

1. Cập nhật `frontend/src/locales/vi-VN.js`
2. Sử dụng `t('key.path')` trong components
3. Test kỹ lưỡng
4. Commit với message rõ ràng

---

## 📄 License

MIT License - Xem file LICENSE để biết thêm chi tiết

---

## 📞 Liên hệ - Contact

Nếu có câu hỏi hoặc vấn đề, vui lòng tạo issue trong repository.

---

**Phát triển bởi / Developed by:** [Your Name]  
**Ngày cập nhật / Last Updated:** 08/02/2026  
**Phiên bản / Version:** 1.0.0-vi-VN

---

## 🎯 Checklist Bản địa hóa Hoàn chỉnh

- [x] Tệp dịch Tiếng Việt (vi-VN.js)
- [x] Hàm định dạng ngày/tiền tệ Việt Nam
- [x] Helper dịch thuật (i18n.js)
- [x] App.jsx đã bản địa hóa
- [x] SearchBar đã bản địa hóa
- [x] TreatmentFilter đã bản địa hóa
- [x] AppointmentTable đã bản địa hóa
- [x] Backend messages (messages_vi.properties)
- [ ] PatientForm đã bản địa hóa (cần áp dụng pattern)
- [ ] AppointmentForm đã bản địa hóa (cần áp dụng pattern)
- [ ] Modal đã bản địa hóa (cần áp dụng pattern)
- [ ] Tài liệu đầy đủ bằng Tiếng Việt

---

**Chúc bạn sử dụng hệ thống hiệu quả!** 🦷✨
