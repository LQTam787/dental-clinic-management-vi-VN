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
