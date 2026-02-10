# Hướng dẫn Bản địa hóa Components
## Component Localization Implementation Guide

Tài liệu này hướng dẫn cách bản địa hóa các components còn lại theo pattern đã được thiết lập.

---

## 📋 Pattern Chung - General Pattern

### 1. Import Dependencies

```jsx
import { t } from '../utils/i18n';
import { formatDate, formatCurrency, isValidVietnamesePhone } from '../utils/formatters';
```

### 2. Thay thế Text Strings

**Trước (Before):**
```jsx
<button>New Patient</button>
<input placeholder="Enter patient name" />
<label>Phone Number</label>
```

**Sau (After):**
```jsx
<button>{t('buttons.newPatient')}</button>
<input placeholder={t('patient.fields.namePlaceholder')} />
<label>{t('patient.fields.phone')}</label>
```

### 3. Format Dates

**Trước (Before):**
```jsx
const date = new Date(appointment.date).toLocaleDateString();
```

**Sau (After):**
```jsx
const date = formatDate(appointment.date);  // → "31/12/2025"
```

### 4. Format Currency

**Trước (Before):**
```jsx
<span>${appointment.fee.toFixed(2)}</span>
```

**Sau (After):**
```jsx
<span>{formatCurrency(appointment.fee)}</span>  // → "1.000.000₫"
```

---

## 🔧 PatientForm.jsx - Implementation

### Step 1: Add Imports

```jsx
import { t } from '../utils/i18n';
import { isValidVietnamesePhone } from '../utils/formatters';
```

### Step 2: Update Validation

```jsx
const validateForm = () => {
  const newErrors = {};

  // Name validation
  if (!formData.name.trim()) {
    newErrors.name = t('patient.validation.nameRequired');
  } else if (formData.name.trim().length < 2) {
    newErrors.name = t('patient.validation.nameMinLength');
  }

  // Birth year validation
  if (!formData.birthYear) {
    newErrors.birthYear = t('patient.validation.birthYearRequired');
  } else {
    const year = parseInt(formData.birthYear);
    const currentYear = new Date().getFullYear();
    if (isNaN(year)) {
      newErrors.birthYear = t('patient.validation.birthYearInvalid');
    } else if (year < 1900 || year > currentYear) {
      newErrors.birthYear = t('patient.validation.birthYearRange');
    }
  }

  // Gender validation
  if (!formData.gender) {
    newErrors.gender = t('patient.validation.genderRequired');
  }

  // Phone validation
  if (!formData.phone.trim()) {
    newErrors.phone = t('patient.validation.phoneRequired');
  } else if (!isValidVietnamesePhone(formData.phone)) {
    newErrors.phone = t('patient.validation.phoneInvalid');
  }

  // Address validation
  if (!formData.address.trim()) {
    newErrors.address = t('patient.validation.addressRequired');
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### Step 3: Update Form Fields

```jsx
<div className="form-group">
  <label htmlFor="name">{t('patient.fields.name')} *</label>
  <input
    type="text"
    id="name"
    name="name"
    value={formData.name}
    onChange={handleInputChange}
    placeholder={t('patient.fields.namePlaceholder')}
    className={errors.name ? 'error' : ''}
  />
  {errors.name && <span className="error-message">{errors.name}</span>}
</div>

<div className="form-group">
  <label htmlFor="birthYear">{t('patient.fields.birthYear')} *</label>
  <input
    type="number"
    id="birthYear"
    name="birthYear"
    value={formData.birthYear}
    onChange={handleInputChange}
    placeholder={t('patient.fields.birthYearPlaceholder')}
    className={errors.birthYear ? 'error' : ''}
  />
  {errors.birthYear && <span className="error-message">{errors.birthYear}</span>}
</div>

<div className="form-group">
  <label htmlFor="gender">{t('patient.fields.gender')} *</label>
  <select
    id="gender"
    name="gender"
    value={formData.gender}
    onChange={handleInputChange}
    className={errors.gender ? 'error' : ''}
  >
    <option value="">{t('patient.fields.genderPlaceholder')}</option>
    <option value="Male">{t('patient.fields.genderOptions.male')}</option>
    <option value="Female">{t('patient.fields.genderOptions.female')}</option>
    <option value="Other">{t('patient.fields.genderOptions.other')}</option>
  </select>
  {errors.gender && <span className="error-message">{errors.gender}</span>}
</div>

<div className="form-group">
  <label htmlFor="phone">{t('patient.fields.phone')} *</label>
  <input
    type="tel"
    id="phone"
    name="phone"
    value={formData.phone}
    onChange={handleInputChange}
    placeholder={t('patient.fields.phonePlaceholder')}
    className={errors.phone ? 'error' : ''}
  />
  {errors.phone && <span className="error-message">{errors.phone}</span>}
</div>

<div className="form-group">
  <label htmlFor="address">{t('patient.fields.address')} *</label>
  <textarea
    id="address"
    name="address"
    value={formData.address}
    onChange={handleInputChange}
    placeholder={t('patient.fields.addressPlaceholder')}
    className={errors.address ? 'error' : ''}
    rows="3"
  />
  {errors.address && <span className="error-message">{errors.address}</span>}
</div>
```

### Step 4: Update Buttons and Messages

```jsx
<div className="form-actions">
  <button type="button" onClick={onClose} className="btn btn-secondary">
    {t('buttons.cancel')}
  </button>
  <button type="submit" className="btn btn-primary" disabled={loading}>
    {loading ? t('loading.saving') : t('buttons.save')}
  </button>
  {patient && (
    <button
      type="button"
      onClick={handleDelete}
      className="btn btn-danger"
      disabled={loading}
    >
      {loading ? t('loading.deleting') : t('buttons.delete')}
    </button>
  )}
</div>
```

### Step 5: Update Delete Confirmation

```jsx
const handleDelete = async () => {
  const message = appointmentCount > 1
    ? t('patient.deleteConfirm.message', {
        name: patient.name,
        birthYear: patient.birthYear,
        phone: patient.phone,
        count: appointmentCount
      })
    : appointmentCount === 1
    ? t('patient.deleteConfirm.messageSingle', {
        name: patient.name,
        birthYear: patient.birthYear,
        phone: patient.phone,
        count: appointmentCount
      })
    : t('patient.deleteConfirm.messageNoAppointments', {
        name: patient.name,
        birthYear: patient.birthYear,
        phone: patient.phone
      });

  if (!window.confirm(message)) return;

  setLoading(true);
  try {
    await patientAPI.delete(patient.id);
    onDelete();
  } catch (err) {
    console.error('Lỗi khi xóa bệnh nhân:', err);
    setError(t('errors.generic', { operation: 'xóa bệnh nhân' }));
  } finally {
    setLoading(false);
  }
};
```

---

## 🔧 AppointmentForm.jsx - Implementation

### Step 1: Add Imports

```jsx
import { t } from '../utils/i18n';
import { formatDateForInput, formatCurrency, parseCurrency } from '../utils/formatters';
```

### Step 2: Update Form Fields

```jsx
<div className="form-group">
  <label htmlFor="patientId">{t('appointment.fields.patient')} *</label>
  <select
    id="patientId"
    name="patientId"
    value={formData.patientId}
    onChange={handleInputChange}
    className={errors.patientId ? 'error' : ''}
    disabled={loadingPatients}
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
  {errors.patientId && <span className="error-message">{errors.patientId}</span>}
</div>

<div className="form-group">
  <label htmlFor="date">{t('appointment.fields.date')} *</label>
  <input
    type="date"
    id="date"
    name="date"
    value={formData.date}
    onChange={handleInputChange}
    className={errors.date ? 'error' : ''}
  />
  {errors.date && <span className="error-message">{errors.date}</span>}
</div>

<div className="form-group">
  <label htmlFor="diagnosis">{t('appointment.fields.diagnosis')} *</label>
  <textarea
    id="diagnosis"
    name="diagnosis"
    value={formData.diagnosis}
    onChange={handleInputChange}
    placeholder={t('appointment.fields.diagnosisPlaceholder')}
    className={errors.diagnosis ? 'error' : ''}
    rows="3"
  />
  {errors.diagnosis && <span className="error-message">{errors.diagnosis}</span>}
</div>

<div className="form-group">
  <label htmlFor="treatment">{t('appointment.fields.treatment')} *</label>
  <textarea
    id="treatment"
    name="treatment"
    value={formData.treatment}
    onChange={handleInputChange}
    placeholder={t('appointment.fields.treatmentPlaceholder')}
    className={errors.treatment ? 'error' : ''}
    rows="3"
  />
  {errors.treatment && <span className="error-message">{errors.treatment}</span>}
</div>

<div className="form-group">
  <label htmlFor="fee">{t('appointment.fields.fee')} *</label>
  <input
    type="number"
    id="fee"
    name="fee"
    value={formData.fee}
    onChange={handleInputChange}
    placeholder={t('appointment.fields.feePlaceholder')}
    className={errors.fee ? 'error' : ''}
    min="0"
    step="1000"
  />
  {errors.fee && <span className="error-message">{errors.fee}</span>}
</div>

<div className="form-group">
  <label>{t('appointment.fields.treatmentNeeds')}</label>
  <div className="checkbox-group">
    <label className="checkbox-label">
      <input
        type="checkbox"
        name="needsImplant"
        checked={formData.needsImplant}
        onChange={handleCheckboxChange}
      />
      {t('appointment.fields.needsImplant')}
    </label>
    <label className="checkbox-label">
      <input
        type="checkbox"
        name="needsDenture"
        checked={formData.needsDenture}
        onChange={handleCheckboxChange}
      />
      {t('appointment.fields.needsDenture')}
    </label>
    <label className="checkbox-label">
      <input
        type="checkbox"
        name="needsOrthodontics"
        checked={formData.needsOrthodontics}
        onChange={handleCheckboxChange}
      />
      {t('appointment.fields.needsOrthodontics')}
    </label>
  </div>
</div>
```

### Step 3: Update Validation

```jsx
const validateForm = () => {
  const newErrors = {};

  if (!formData.patientId) {
    newErrors.patientId = t('appointment.validation.patientRequired');
  }

  if (!formData.date) {
    newErrors.date = t('appointment.validation.dateRequired');
  }

  if (!formData.diagnosis.trim()) {
    newErrors.diagnosis = t('appointment.validation.diagnosisRequired');
  }

  if (!formData.treatment.trim()) {
    newErrors.treatment = t('appointment.validation.treatmentRequired');
  }

  if (!formData.fee || formData.fee <= 0) {
    newErrors.fee = formData.fee === '' 
      ? t('appointment.validation.feeRequired')
      : t('appointment.validation.feeInvalid');
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

---

## 🔧 Modal.jsx - Implementation

```jsx
import { t } from '../utils/i18n';

function Modal({ isOpen, onClose, title, children, size = 'medium' }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className={`modal-content modal-${size}`} 
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{title}</h2>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label={t('buttons.close')}
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}
```

---

## 🔧 LoadingSpinner.jsx - Implementation

```jsx
import { t } from '../utils/i18n';

function LoadingSpinner({ message }) {
  return (
    <div className="loading-spinner-container">
      <div className="spinner"></div>
      <p>{message || t('loading.default')}</p>
    </div>
  );
}
```

---

## ✅ Checklist để Bản địa hóa Component

Khi bản địa hóa một component mới, hãy đảm bảo:

1. [ ] Import `t` từ `utils/i18n`
2. [ ] Import formatters cần thiết từ `utils/formatters`
3. [ ] Thay thế tất cả hard-coded strings bằng `t('key')`
4. [ ] Format dates với `formatDate()`
5. [ ] Format currency với `formatCurrency()`
6. [ ] Validate phone với `isValidVietnamesePhone()`
7. [ ] Update validation messages
8. [ ] Update button texts
9. [ ] Update placeholders
10. [ ] Update error messages
11. [ ] Update success messages
12. [ ] Test thoroughly

---

## 🧪 Testing Localized Components

### Test Cases

```jsx
// Test 1: Verify all texts are in Vietnamese
describe('Vietnamese Localization', () => {
  it('should display all UI text in Vietnamese', () => {
    const { getByText } = render(<PatientForm />);
    expect(getByText('Bệnh nhân mới')).toBeInTheDocument();
    expect(getByText('Họ và tên')).toBeInTheDocument();
  });
});

// Test 2: Verify date format
describe('Date Formatting', () => {
  it('should format dates as dd/MM/yyyy', () => {
    const date = formatDate('2025-12-31');
    expect(date).toBe('31/12/2025');
  });
});

// Test 3: Verify currency format
describe('Currency Formatting', () => {
  it('should format currency with ₫ symbol', () => {
    const amount = formatCurrency(1000000);
    expect(amount).toContain('₫');
    expect(amount).toContain('1.000.000');
  });
});

// Test 4: Verify phone validation
describe('Phone Validation', () => {
  it('should validate Vietnamese phone numbers', () => {
    expect(isValidVietnamesePhone('0912345678')).toBe(true);
    expect(isValidVietnamesePhone('123456')).toBe(false);
  });
});
```

---

## 📝 Best Practices

1. **Consistency**: Luôn sử dụng `t()` function cho tất cả UI text
2. **Performance**: Cache translation objects khi cần
3. **Error Handling**: Luôn có fallback cho missing translations
4. **Documentation**: Comment rõ ràng cho các translations phức tạp
5. **Testing**: Test kỹ lưỡng mọi localized component

---

**Happy Localizing!** 🌏✨
