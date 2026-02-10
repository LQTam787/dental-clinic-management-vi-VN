import React from 'react';
import { t } from '../utils/i18n';

/**
 * LoadingSpinner Component - Vietnamese Localized
 * Biểu tượng đang tải
 *
 * Reusable loading indicator with optional message.
 *
 * ✅ PROPERLY LOCALIZED - Maintains original UI structure, translates text only
 *
 * @param {Object} props
 * @param {string} props.message - Loading message (optional, defaults to Vietnamese "Loading...")
 * @param {string} props.size   - 'small' | 'medium' | 'large'  (defaults to 'medium')
 */
function LoadingSpinner({ message = null, size = 'medium' }) {
  return (
    <div className={`loading-spinner loading-spinner-${size}`}>
      <div className="spinner"></div>
      {message && <p className="loading-message">{message}</p>}
      {!message && <p className="loading-message">{t('loading.default')}</p>}
    </div>
  );
}

export default LoadingSpinner;
